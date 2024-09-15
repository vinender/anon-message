// utils/analyzeMessage.js
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

async function analyzeMessage(message) {
  try {
    // Prepare the system message
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant that helps with sentiment analysis for a given message. 
      Please analyze the following message and determine if it is negative or positive for a person: "${message}"`,
    };

    // Prepare the user message
    const userMessage = {
      role: "user",
      content: message,
    };

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use a valid model name
      messages: [systemMessage, userMessage],
    });

    console.log('OpenAI response:', response);

    // Extract the assistant's reply
    const assistantReply = response.choices[0].message.content.trim();

    // Implement your logic based on the assistant's reply
    // For example, you can check if the assistant indicates the message is appropriate

    // Example logic:
    if (
      assistantReply.toLowerCase().includes("appropriate") ||
      assistantReply.toLowerCase().includes("positive")
    ) {
      return true; // The message is appropriate to send
    } else {
      return false; // The message is not appropriate to send
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Handle the error as needed
    return false; // Default to false in case of error
  }
}

module.exports = analyzeMessage;
