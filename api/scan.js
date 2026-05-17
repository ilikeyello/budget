import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, categories } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is missing. Please configure it in your Vercel project settings.' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const catString = categories.map(c => `${c.id} (${c.name})`).join(', ');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a receipt scanning assistant. Analyze the receipt. Extract the final total amount spent (number), the merchant name (string), and determine the single most appropriate category ID from the provided list. Return EXACTLY a JSON object with keys: amount, merchant, categoryId."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Available categories: ${catString}` },
            { type: "image_url", image_url: { url: image, detail: "low" } }
          ]
        }
      ]
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Receipt parsing error:", error);
    return res.status(500).json({ error: error.message || 'Failed to parse receipt' });
  }
}
