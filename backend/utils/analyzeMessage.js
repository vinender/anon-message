// utils/analyzeMessage.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Modified function with enhanced prompt and parsing
async function analyzeMessage(message) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn("GOOGLE_GEMINI_API_KEY is missing. Treating message as appropriate to prevent crash, or handle properly.");
      // Depending on your requirements, you might want to return false (block) or true (allow)
      // or throw an error. For now, returning true to allow if AI is unconfigured.
      return true;
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Enhanced prompt using examples and clear format instructions
    const prompt = `CONTENT MODERATION TASK

Your job is to classify messages as "NEGATIVE" if they contain ANY of the following:
- Profanity or swear words (fuck, shit, etc.)
- Insults (idiot, stupid, etc.)
- Hate speech
- Threats
- Harassment
- Bullying

Examples of NEGATIVE content:
"fuck you" -> NEGATIVE
"you're an idiot" -> NEGATIVE
"I hate those people" -> NEGATIVE

Examples of NEUTRAL/POSITIVE content:
"Have a good day" -> POSITIVE
"The weather is nice" -> NEUTRAL
"Thank you for your help" -> POSITIVE

Classify this message: "${message}"

IMPORTANT: Respond ONLY with "NEGATIVE", "NEUTRAL", or "POSITIVE". No other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();
    
    console.log('Gemini response:', text);
    
    // Stricter matching
    if (text.includes("NEGATIVE")) {
      return false;
    } else if (text.includes("POSITIVE") || text.includes("NEUTRAL")) {
      return true;
    } else {
      // Default to treating as inappropriate when uncertain
      console.warn("Unexpected Gemini response. Treating as inappropriate:", text);
      return false;
    }
  } catch (error) {
    // Your existing error handling is good
    console.error('Gemini API Error:', error);
    return false;
  }
}

module.exports = analyzeMessage;