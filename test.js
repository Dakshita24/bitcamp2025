// This file is just for testing the Gemini API

// Replace with your actual API key
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

// Test function to call Gemini API
async function testGeminiAPI() {
  console.log("Testing Gemini API...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Is the following statement medically accurate: Drinking bleach can cure COVID-19" }]
        }]
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log("API Response:", data);
    
    // Extract the text response
    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Gemini says:", responseText);
    
    return { success: true, data };
  } catch (error) {
    console.error("API Test Failed:", error);
    return { success: false, error: error.message };
  }
}

// Run the test when this file is loaded
testGeminiAPI().then(result => {
  if (result.success) {
    console.log("✅ API Test Successful!");
  } else {
    console.log("❌ API Test Failed!");
  }
});