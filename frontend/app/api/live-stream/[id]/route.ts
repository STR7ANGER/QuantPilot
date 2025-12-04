import { NextResponse } from "next/server";

async function streamById(id: string): Promise<ReadableStream> {
  // Build your upstream streaming URL
  const streamUrl = `${process.env.LIVE_STREAM_URL}?ids[]=${id}`;

  const upstream = await fetch(streamUrl);

  if (!upstream.ok || !upstream.body) {
    throw new Error("Failed to fetch upstream stream");
  }

  // Proxy streaming data to client
  const readable = new ReadableStream({
    start(controller) {
      const reader = upstream.body!.getReader();

      async function pump() {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          controller.enqueue(value); // send directly to the client
        }
        controller.close();
      }

      pump();
    },
  });

  return readable;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const stream = await streamById(id);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Stream error" },
      { status: 500 }
    );
  }
}
