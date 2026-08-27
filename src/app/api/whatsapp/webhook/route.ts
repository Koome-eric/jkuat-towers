import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAssistantTurn, AssistantHistoryMessage } from "@/lib/assistant-core";
import { sendWhatsAppText, formatProductLinksForWhatsApp } from "@/lib/whatsapp";

// GET — Meta's one-time webhook verification handshake. Paste this route's
// URL into Meta App Dashboard -> WhatsApp -> Configuration -> Webhook, along
// with WHATSAPP_VERIFY_TOKEN as the verify token.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Minimal shape of the fields we actually read from Meta's webhook payload.
type WhatsAppWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          type: string;
          text?: { body: string };
        }>;
      };
    }>;
  }>;
};

// POST — incoming customer messages. Runs the same building-wide AI
// assistant used by the web chat, keeps per-customer history in
// AssistantSession/AssistantMessage (a phone has no browser tab to hold
// state in), and replies with product recommendations that link straight
// to each vendor's storefront (src/lib/whatsapp.ts#productDeepLink).
export async function POST(req: NextRequest) {
  const body: WhatsAppWebhookBody = await req.json().catch(() => ({}));
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Meta expects a fast 200 for delivery receipts / non-text events too.
  if (!message || message.type !== "text" || !message.text?.body?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const customerPhone = message.from;
  const userText = message.text.body.trim();

  try {
    const building = await prisma.building.findFirst();
    if (!building) return NextResponse.json({ ok: true }); // nothing configured yet

    const session = await prisma.assistantSession.upsert({
      where: { buildingId_customerPhone: { buildingId: building.id, customerPhone } },
      update: {},
      create: { buildingId: building.id, customerPhone },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });

    const history: AssistantHistoryMessage[] = [
      ...session.messages.map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.body,
      })),
      { role: "user", content: userText },
    ];

    const { reply, products } = await runAssistantTurn(history);

    const links = formatProductLinksForWhatsApp(products);
    const fullReply = links ? `${reply}\n\n${links}` : reply;

    await prisma.$transaction([
      prisma.assistantMessage.create({ data: { sessionId: session.id, role: "USER", body: userText } }),
      prisma.assistantMessage.create({ data: { sessionId: session.id, role: "ASSISTANT", body: fullReply } }),
    ]);

    await sendWhatsAppText(customerPhone, fullReply);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    // Best-effort apology so the customer isn't left hanging — swallow
    // failures here too so Meta still gets its 200 and doesn't retry-storm us.
    await sendWhatsAppText(
      customerPhone,
      "Sorry, I hit a snag looking that up. Please try again in a moment 🙏"
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
