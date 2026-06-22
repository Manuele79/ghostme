import { NextResponse, after } from "next/server";
import { runChatPostProcessing } from "@/lib/ghostme/chat/chatPostProcessing";
import { runGhostChatFlow } from "@/lib/ghostme/chat/ghostChatOrchestrator";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message as string;
    const traits = body.traits;
    const messages = body.messages || [];
    const userId = await getAuthenticatedUserId(
      req,
      body.userId as string | undefined
    );

    const result = await runGhostChatFlow({
      message,
      traits,
      messages,
      userId,
    });

    if (result.type === "immediate_text") {
      const encoder = new TextEncoder();

      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(result.immediateTextResponse)
            );
            controller.close();
          },
        }),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
    }

    // Salvataggi dopo la risposta (after)
    if (result.postProcessingPayload) {
      const postProcessingPayload = result.postProcessingPayload;
      after(async () => {
        await runChatPostProcessing(postProcessingPayload);
      });
    }

    return new NextResponse(result.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log(err);
    return NextResponse.json({ error: "Errore GhostMe AI" }, { status: 500 });
  }
}
