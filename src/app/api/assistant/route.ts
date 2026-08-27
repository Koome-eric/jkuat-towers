import { NextRequest, NextResponse } from "next/server";
import { runAssistantTurn, AssistantHistoryMessage } from "@/lib/assistant-core";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages: AssistantHistoryMessage[] = body?.messages ?? [];

  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    const result = await runAssistantTurn(messages);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "The assistant isn't configured yet — add OPENAI_API_KEY to your .env file." },
        { status: 503 }
      );
    }
    throw err;
  }
}
