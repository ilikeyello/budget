const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, categories } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing. Please configure it in your Vercel project settings.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const catString = (categories || []).map(c => `${c.id} (${c.name})`).join(', ');

    // Extract base64 and mime type from the data URL
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

    const prompt = `You are a receipt scanning assistant. Analyze the receipt. Extract the final total amount spent (number), the merchant name (string), and determine the single most appropriate category ID from the provided list. 
Available categories: ${catString}
Return EXACTLY a JSON object with keys: amount, merchant, categoryId.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Receipt parsing error:", error);
    return res.status(500).json({ error: error.message || 'Failed to parse receipt' });
  }
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
