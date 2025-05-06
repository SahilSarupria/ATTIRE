import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Step 1: Trigger image generation
    const startRes = await fetch("https://7cc7-35-247-147-106.ngrok-free.app/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!startRes.ok) {
      const errorText = await startRes.text();
      throw new Error(`Flask API error: ${errorText}`);
    }

    const { task_id } = await startRes.json();

    // Step 2: Poll /status/<task_id>
    const pollUrl = `https://7cc7-35-247-147-106.ngrok-free.app/status/${task_id}`;
    const maxRetries = 2700; // 30 minutes worth of polling
    const delay = 2000; // 2 seconds
    
    let attempts = 0;

    while (attempts < maxRetries) {
      await new Promise((res) => setTimeout(res, delay));
      const pollRes = await fetch(pollUrl);

      if (pollRes.status === 200) {
        const data = await pollRes.json();
        return NextResponse.json({ imageUrl: data.imageUrl });
      }

      if (pollRes.status === 500) {
        const errData = await pollRes.json();
        throw new Error(`Generation error: ${errData.message}`);
      }

      if (pollRes.status !== 202) {
        const err = await pollRes.text();
        throw new Error(`Unexpected polling error: ${err}`);
      }

      attempts++;
    }

    throw new Error("Image generation timed out");
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate design" },
      { status: 500 }
    );
  }
}
