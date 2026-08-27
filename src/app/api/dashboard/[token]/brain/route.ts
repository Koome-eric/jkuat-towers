import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import {
  getBusinessSummary,
  listShopProducts,
  createQuotation,
  createInvoice,
} from "@/lib/vendor-brain";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_business_summary",
      description: "Get today's/overall sales, order counts, low-stock products, and open documents for this shop.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "Look up this shop's own products, optionally filtered by a name search.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Optional product name filter." } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_quotation",
      description:
        "Create a quotation for a customer. For each item, give a description/product name and quantity; unitPrice is optional — if omitted, the tool will try to match it to an existing product's price.",
      parameters: {
        type: "object",
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity: { type: "number" },
                unitPrice: { type: "number" },
              },
              required: ["description", "quantity"],
            },
          },
          discount: { type: "number", description: "Flat discount amount in KSh." },
          deliveryFee: { type: "number" },
          notes: { type: "string" },
        },
        required: ["items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_invoice",
      description: "Create an invoice for a customer, same item shape as create_quotation.",
      parameters: {
        type: "object",
        properties: {
          customerName: { type: "string" },
          customerPhone: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity: { type: "number" },
                unitPrice: { type: "number" },
              },
              required: ["description", "quantity"],
            },
          },
          dueInDays: { type: "number" },
        },
        required: ["items"],
      },
    },
  },
];

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shop = await prisma.shop.findUnique({ where: { dashboardToken: token } });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const messages: IncomingMessage[] = body?.messages ?? [];
  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return NextResponse.json(
      { error: "The AI business brain isn't configured yet — add OPENAI_API_KEY to your .env file." },
      { status: 503 }
    );
  }

  const systemPrompt = `You are the AI Business Assistant for "${shop.name}" (${shop.category}, ${shop.shopNumber}) inside JKUAT Towers.
You work for this vendor only — never invent facts about sales, stock, or customers; always call a tool to get real numbers before answering.
Payment methods accepted: ${shop.paymentMethods.join(", ") || "not set"}.
${shop.aboutBusiness ? `About the business: ${shop.aboutBusiness}` : ""}
${shop.brandVoice ? `Preferred tone when writing customer-facing content: ${shop.brandVoice}.` : ""}

You can check business performance, look up products, and generate quotations/invoices.
When you create a quotation or invoice, clearly summarize what was created (reference number, items, total) in your reply — the document itself is stored automatically.
Keep replies concise and practical, like a capable assistant talking to a busy shop owner.`;

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ];

  for (let i = 0; i < 4; i++) {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      tools,
    });

    const choice = completion.choices[0];
    const message = choice.message;

    if (message.tool_calls?.length) {
      chatMessages.push(message);

      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== "function") continue;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          args = {};
        }

        let result: unknown;
        try {
          switch (toolCall.function.name) {
            case "get_business_summary":
              result = await getBusinessSummary(shop.id);
              break;
            case "list_products":
              result = await listShopProducts(shop.id, args.query as string | undefined);
              break;
            case "create_quotation":
              result = await createQuotation(shop.id, args as Parameters<typeof createQuotation>[1]);
              break;
            case "create_invoice":
              result = await createInvoice(shop.id, args as Parameters<typeof createInvoice>[1]);
              break;
            default:
              result = { error: "Unknown tool" };
          }
        } catch (err) {
          result = { error: err instanceof Error ? err.message : "Tool execution failed" };
        }

        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    return NextResponse.json({ reply: message.content ?? "" });
  }

  return NextResponse.json({ reply: "Sorry, that request needs rephrasing — could you try again?" });
}
