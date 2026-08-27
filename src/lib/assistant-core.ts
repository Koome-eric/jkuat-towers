import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { getOpenAI } from "@/lib/openai";
import { searchProducts, ProductSearchResult } from "@/lib/search";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are "Ask JKUAT Towers" — a friendly shopping assistant for a building
with many independent shops (perfume, fashion, electronics, accessories, gifts, and more).

Your job: help customers find products across every shop in the building using the
search_products tool. Never invent products, prices, or shop numbers — only state
facts returned by the tool. If nothing matches, say so plainly and suggest broadening
the search.

Style: short, warm, WhatsApp-style messages. When you list products, include the price
and shop location (shop number / floor) for each. If a customer's request implies a
budget or category (e.g. "gift under 5k", "men's perfume"), extract that and call the
tool with it. If they ask to compare, call the tool again with a narrower or different
query. Keep replies concise — a few lines plus a short list, not paragraphs. Don't
include raw links yourself; the app appends a link under each product you mention.`;

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search for products across every shop in the building. Use this whenever the customer names or implies a product, category, or budget.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Product name, brand, or keyword to search for, e.g. 'perfume', 'black handbag'.",
          },
          category: {
            type: "string",
            description: "Optional category filter, e.g. 'Perfume', 'Accessories'.",
          },
          maxPrice: {
            type: "number",
            description: "Optional maximum price in KSh.",
          },
        },
        required: [],
      },
    },
  },
];

export type AssistantHistoryMessage = { role: "user" | "assistant"; content: string };

export type AssistantTurnResult = {
  reply: string;
  products: ProductSearchResult[];
};

// The single OpenAI tool-calling loop behind both /api/assistant (web chat,
// keeps history client-side) and the WhatsApp webhook (keeps history in
// AssistantSession/AssistantMessage). Same system prompt, same tool, same
// grounding guarantee — a customer gets the same answer whichever channel
// they ask from.
export async function runAssistantTurn(history: AssistantHistoryMessage[]): Promise<AssistantTurnResult> {
  const openai = getOpenAI();

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ];

  let latestProducts: ProductSearchResult[] = [];

  // Allow a couple of tool-call round trips (e.g. search, then refine/compare).
  for (let i = 0; i < 3; i++) {
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
        if (toolCall.type === "function" && toolCall.function.name === "search_products") {
          let args: { query?: string; category?: string; maxPrice?: number } = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            args = {};
          }

          const results = await searchProducts({
            q: args.query,
            category: args.category,
            maxPrice: args.maxPrice,
          });
          latestProducts = results;

          chatMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              count: results.length,
              products: results.slice(0, 10),
            }),
          });
        }
      }
      continue; // loop again so the model can respond to the tool result
    }

    // No tool call — this is the final reply.
    return { reply: message.content ?? "", products: latestProducts };
  }

  return {
    reply: "Sorry, I'm having trouble with that request — could you rephrase it?",
    products: latestProducts,
  };
}
