import "server-only";

import { NextResponse } from "next/server";
import {
  createConversation,
  serializeArticlesToContext,
  type Article,
} from "@feel-good/tavus";
import { serverEnv } from "@/lib/env/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { articles: Article[] };
    const { articles } = body;

    const conversationalContext = serializeArticlesToContext(articles);

    const response = await createConversation(serverEnv.TAVUS_API_KEY, {
      persona_id: serverEnv.TAVUS_PERSONA_ID,
      conversational_context: conversationalContext,
      properties: {
        max_duration: 600,
      },
    });

    return NextResponse.json({
      conversation_url: response.conversation_url,
      conversation_id: response.conversation_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
