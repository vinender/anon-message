// utils/analyzeMessage.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

// OpenAI Sentiment Analysis
async function analyzeWithOpenAI(message) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a content moderator. Classify messages as 'NEGATIVE', 'NEUTRAL', or 'POSITIVE'. respond ONLY with the classification."
        },
        {
          role: "user",
          content: `Classify this message: "${message}"`
        }
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const text = response.choices[0].message.content.trim().toUpperCase();
    console.log('OpenAI response:', text);

    if (text.includes("NEGATIVE")) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // If OpenAI fails, we return null to signal the main function to try fallback
    return null;
  }
}

// Google Gemini Sentiment Analysis
async function analyzeWithGemini(message) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn("GOOGLE_GEMINI_API_KEY is missing.");
      return true;
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `CONTENT MODERATION TASK
Your job is to classify messages as "NEGATIVE" if they contain ANY profanity, insults, hate speech, or harassment.
Classify this message: "${message}"
IMPORTANT: Respond ONLY with "NEGATIVE", "NEUTRAL", or "POSITIVE".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();
    
    console.log('Gemini response:', text);
    
    if (text.includes("NEGATIVE")) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return true; // Default to true if AI fails
  }
}

async function analyzeMessage(message) {
  // Try OpenAI first if key is present
  if (process.env.OPENAI_API_KEY) {
    const openAIResult = await analyzeWithOpenAI(message);
    if (openAIResult !== null) {
      return openAIResult;
    }
  }

  // Fallback to Gemini
  return await analyzeWithGemini(message);
}

module.exports = analyzeMessage;