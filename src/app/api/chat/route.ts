import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/claude";
import { getSession, addMessage, setContext } from "@/lib/memory";

export async function POST(request: NextRequest) {
  const { message, sessionId, userContext } = await request.json();

  if (!message || !sessionId) {
    return NextResponse.json(
      { error: "message and sessionId are required" },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);

  if (userContext) {
    setContext(sessionId, userContext);
  }

  addMessage(sessionId, "user", message);

  const reply = await chat(session.messages, session.context || userContext);

  addMessage(sessionId, "assistant", reply);

  return NextResponse.json({ reply, sessionId });
}
