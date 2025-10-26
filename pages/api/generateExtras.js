import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  const { script } = req.body;

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  const prompt = `
You are Sumaku, an empathetic AI podcast host.
Take the script below and generate:
1) Show notes (1-2 paragraphs)
2) Social media snippets (3-5 short catchy quotes, each <140 characters)

Script:
${script}
`;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const text = response.data.choices[0].message.content;
    const [showNotes, snippetsText] = text.split('Snippets:');
    const snippets = snippetsText ? snippetsText.split('\n').filter(Boolean) : [];

    res.status(200).json({ showNotes: showNotes.trim(), snippets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate extras' });
  }
}
