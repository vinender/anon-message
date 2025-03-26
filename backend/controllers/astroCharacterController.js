// backend/controllers/astroController.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
require('dotenv').config();

const TEXT_MODEL_NAME = "gemini-1.5-pro-002"; // Model for text generation
const IMAGE_MODEL_NAME = "gemini-1.5-pro-002"; //  Model for image generation
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set in your environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateVedicPersonality(dob, time, place) {
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL_NAME });

    const prompt = `Generate a brief Vedic astrology personality description in hinglish only based on the following birth data:
        Date of Birth: ${dob}
        Time of Birth: ${time}
        Place of Birth: ${place}

        Filter out any technical astrological terms (like "star sign," "moon sign," "ascendant," etc.). Focus on the personality traits and life suggestions.  Address the user directly using "You" instead of "they" or "he/she." Make the tone personal and engaging.

        Provide insights into:
        * Character traits (positive and negative)
        * Strengths
        * Weaknesses
        * Potential life paths
        * Specific suggestions for:
            * Career
            * Passion/Hobbies
            * Love/Relationships
            * Other aspects of life (e.g., personal growth, mindfulness)

        Format the output as a JSON object with the following structure. DO NOT include any introductory or concluding sentences.  Output ONLY the JSON. DO NOT wrap the JSON in backticks or code blocks.

        {
          "personality": {
            "overview": "...",
            "strengths": ["...", "..."],
            "weaknesses": ["...", "..."]
          },
          "life_path_suggestions": {
            "career": "...",
            "passion": "...",
            "love": "...",
            "other": "..."
          },
          "personality_comparison": "..."
        }
        `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();

    // Use a regular expression to extract the JSON object
    const jsonMatch = rawText.match(/\{[\s\S]*\}/m); // 'm' flag for multiline
    if (jsonMatch) {
        try {
            const json = JSON.parse(jsonMatch[0]); // Parse the extracted JSON
            return json;  // Return the PARSED JSON object
        } catch (error) {
            console.error("Failed to parse JSON:", error, rawText); // Log the error and raw text
            throw new Error("Failed to parse JSON response from Gemini API.  Raw text: " + rawText); // Include raw text for debugging
        }
    } else {
        console.error("No JSON found in response:", rawText);
        throw new Error("Gemini API did not return valid JSON. Response: " + rawText);
    }
}

async function generateCharacterImage(personalityDescription) {
    const generationConfig = {
        stopSequences: undefined,
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
    };

    const model = genAI.getGenerativeModel({
        model: IMAGE_MODEL_NAME, // Use the image model
        generationConfig,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });


    // Stringify the personalityDescription, handling both objects and strings
    const promptText = `Create a full-body portrait of an Indian character based on the following personality description: ${JSON.stringify(personalityDescription)}.  Make sure the created image has the following features: clear facial features, realistic lighting, and a culturally appropriate background. The style should be realistic and detailed, not cartoonish, photographic style.`;


    const imagePrompt = {
        parts: [
            { text: promptText },
        ],
    };

    const imageResult = await model.generateContent(imagePrompt);
    const imageResponse = imageResult.response;
    const imagePart = imageResponse.candidates[0]?.content?.parts.find(part => part.inlineData);

    if (!imagePart) {
        throw new Error("No image data found in the response.");
    }
    const base64Data = imagePart.inlineData.data;
    return `data:image/jpeg;base64,${base64Data}`;
}


exports.generateCharacter = async (req, res) => {
    try {
        const { dob, time, place } = req.body;

        if (!dob || !time || !place) {
            return res.status(400).json({ message: "Date of birth, time, and place are required." });
        }

        const personalityDescription = await generateVedicPersonality(dob, time, place);

        try {
            const imageUrl = await generateCharacterImage(personalityDescription);
            res.status(200).json({ personality: personalityDescription, imageUrl });
        } catch (imageError) {
            console.error("Error generating image:", imageError);
            res.status(200).json({ personality: personalityDescription, imageUrl: null, imageError: imageError.message });
        }

    } catch (error) {
        console.error("Error generating character:", error);
        res.status(500).json({ message: "Error generating character.", error: error.message });
    }
};