import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;

    if (!audioBlob) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), { status: 400 });
    }

    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    const flaskResponse = await fetch("http://127.0.0.1:5000/transcribe", {
      method: "POST",
      body: buffer,
      headers: {
        "Content-Type": "audio/wav", // or 'audio/wav' based on your recorder
      },
    });

    const result = await flaskResponse.json();

    if (!flaskResponse.ok) {
      return new Response(JSON.stringify({ error: result.message || "Transcription failed" }), { status: 500 });
    }

    return new Response(JSON.stringify({ transcript: result.transcript }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}
