require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }).listModels(); // This is just to test connectivity
    // Actually the SDK doesn't have a direct listModels on the instance, 
    // let's use the REST API approach via the genAI object if possible,
    // but a simpler way is to just try the fetch directly via REST.
    
    console.log("List models feature is not directly exposed this way in the SDK.");
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

// Since SDK v1 doesn't have a clean listModels, I'll use a direct fetch to the API
async function checkAvailableModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available models:", data.models.map(m => m.name));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

checkAvailableModels();
