import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, referenceImageUrl } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Step 1: Trigger image generation on Python backend
    const startRes = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!startRes.ok) {
      const errorText = await startRes.text();
      throw new Error(`Flask API error: ${errorText}`);
    }

    const { task_id } = await startRes.json();
    const pollUrl = `http://localhost:5000/status/${task_id}`;
    const maxRetries = 5400; // 30 mins
    const delay = 2000; // 2 sec

    let attempts = 0;

    while (attempts < maxRetries) {
      await new Promise((res) => setTimeout(res, delay));
      const pollRes = await fetch(pollUrl);

      if (!pollRes.ok) {
        const err = await pollRes.text();
        throw new Error(`Polling error: ${err}`);
      }

      const pollData = await pollRes.json();

      if (pollData.status === "completed") {
        // 🟢 Final response after generation and segmentation is done
        return NextResponse.json({
          task_id,
          prompt,
          referenceImageUrl: referenceImageUrl || null,
          imageUrl: pollData.imageUrl || pollData.image_url || pollData.generated_image_url,
          outfitElements: pollData.segmentedItems || [],
          detectedKeywords: extractKeywordsFromPrompt(prompt),
        });
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

// Optional: Very basic keyword extractor from the prompt
function extractKeywordsFromPrompt(prompt: string): string[] {
  const keywords = [
    "summer", "winter", "minimalist", "oversized", "casual",
    "luxury", "party", "formal", "bold", "vintage", "classic", "women", "men", "kids", "jacket", "tshirt", "pants"
  ];

  const promptLower = prompt.toLowerCase();
  return keywords.filter((kw) => promptLower.includes(kw));
}
