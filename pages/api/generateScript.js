import OpenAI from "openai";

export default async function handler(req, res) {
  const { topic } = req.body;

  if (!topic) return res.status(400).json({ error: "No topic provided" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
You are writing a podcast script for "The Real Spill" hosted by Sumaku, who speaks in a smooth, empathetic, mid-deep voice. 
Include natural, signature lines or phrases from Sumaku throughout each segment, such as:
- "Let's be real, we've all been there..."
- "Here's the thing..."
- "What I want you to take away is..."

Structure the script clearly with:

[INTRO] – Introduce the podcast "The Real Spill", welcome listeners, introduce Sumaku, and briefly introduce the topic: ${topic}.
[SEGMENT 1] – Explore the first main point, include storytelling and at least one Sumaku signature line.
[SEGMENT 2] – Dive deeper, include anecdotes, examples, or interviews, with at least one Sumaku line.
[SEGMENT 3] – Summarize key takeaways, reflections, or advice, with at least one Sumaku line.
[OUTRO] – Wrap up the episode, thank listeners, and tease the next episode with a warm Sumaku touch.

Keep transitions smooth and write naturally for spoken delivery. Ensure Sumaku’s voice is warm, relatable, and authentic.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const fullScript = response.choices[0].message.content;

    // Split by labels
    const segments = [
      fullScript.match(/\[INTRO\]([\s\S]*?)\[SEGMENT 1\]/)?.[1]?.trim(),
      fullScript.match(/\[SEGMENT 1\]([\s\S]*?)\[SEGMENT 2\]/)?.[1]?.trim(),
      fullScript.match(/\[SEGMENT 2\]([\s\S]*?)\[SEGMENT 3\]/)?.[1]?.trim(),
      fullScript.match(/\[SEGMENT 3\]([\s\S]*?)\[OUTRO\]/)?.[1]?.trim(),
      fullScript.match(/\[OUTRO\]([\s\S]*)/)?.[1]?.trim(),
    ];

    res.status(200).json({ segments });
  } catch (error) {
    console.error("Error generating script:", error);
    res.status(500).json({ error: "Failed to generate script" });
  }
}
