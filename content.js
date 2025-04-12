// Medical keywords to monitor
  // Common misinformation patterns (simplified)
  const MISINFO_PATTERNS = [
    { pattern: /miracle cure/i, reason: "Unsubstantiated 'miracle cure' claims" },
    { pattern: /big pharma(?:ceuticals)? hiding/i, reason: "Conspiracy theories about pharmaceutical companies" },
    { pattern: /vaccines? (?:cause|give you) (?:autism|cancer)/i, reason: "Debunked vaccine misinformation" },
    { pattern: /government (?:is|are) lying about/i, reason: "Unsubstantiated government conspiracy claims" }
  ];
  
  // Listen for new posts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && isSocialMediaPost(node)) {
          checkMedicalClaims(node);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  function isSocialMediaPost(node) {
    return (
      node.matches('[data-testid="tweet"]') || 
      node.matches('[role="article"]') ||      
      node.matches('[data-testid="post-container"]')
    );
  }
  
  async function checkMedicalClaims(postNode) {
    const text = postNode.textContent;
    if (!text || text.length < 20) return;
  
    // Check if post contains medical terms
    const hasMedicalTerms = MEDICAL_TERMS.some(term => 
      new RegExp(`\\b${term}\\b`, 'i').test(text)
    );
    
    if (!hasMedicalTerms) return;
  
    try {
      const result = await detectBias(text);
      addWarningIndicator(postNode, result);
      
      // Send data to background script
      chrome.runtime.sendMessage({
        type: 'medicalContentAnalyzed',
        hasWarning: result.hasWarning,
        claims: result.claims
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  }
  
  // Simplified analysis (replace with actual API call in production)
  /*async function detectBias(text) {
    const claims = [];
    let hasWarning = false;
    
    // Check against known misinformation patterns
    MISINFO_PATTERNS.forEach(({pattern, reason}) => {
      if (pattern.test(text)) {
        claims.push(reason);
        hasWarning = true;
      }
    });
    
    // Check for absence of credible sources
    const hasCredibleSource = TRUSTED_SOURCES.some(source => 
      text.includes(source)
    );
    
    // If making strong medical claims without credible sources
    const strongClaims = /(?:cure|treat|prevent|cause|kill)/i.test(text);
    if (strongClaims && !hasCredibleSource) {
      claims.push("Medical claim without credible source");
      hasWarning = true;
    }
    
    return {
      hasWarning,
      claims,
      textSnippet: text.slice(0, 100) + (text.length > 100 ? '...' : '')
    };
  }*/

    async function detectBias(text) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AIzaSyBZ1Ey8_NVz-_dTHFaZMguGgrMbpDI82Kg}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: `Analyze the following social media post for medical misinformation. 
                Return a JSON response with the following format:
                {
                  "hasMisinformation": boolean,
                  "issues": [{ "type": string, "explanation": string }],
                  "confidenceScore": number between 0 and 1
                }
                
                Text to analyze: "${text}"` 
              }]
            }]
          })
        });
    
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
    
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Try to find and parse JSON in the response
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        let result = { hasMisinformation: false, issues: [], confidenceScore: 0 };
        
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error("Failed to parse JSON from response:", e);
          }
        }
        
        // Match the expected return format of your existing detectBias function
        const biases = result.issues ? result.issues.map(issue => ({
          type: issue.type || 'medical misinformation',
          direction: issue.explanation || 'inaccurate'
        })) : [];
        
        return {
          hasBias: result.hasMisinformation,
          biases: biases,
          score: result.confidenceScore || 0
        };
      } catch (error) {
        console.error("Gemini API call failed:", error);
        // Return the same format as the original function in case of error
        return {
          hasBias: false,
          biases: [],
          score: 0
        };
      }
    }
  
  function addWarningIndicator(postNode, result) {
    if (result.hasWarning) {
      const warning = document.createElement('div');
      warning.className = 'medtruth-warning';
      warning.innerHTML = `
        <div style="
          border-left: 3px solid #ff5252;
          padding: 8px;
          margin: 8px 0;
          background-color: #fff8f8;
        ">
          <strong style="color: #ff5252">⚠️ Potential Medical Misinformation</strong>
          <ul style="margin: 5px 0 0 15px; padding: 0">
            ${result.claims.map(claim => `<li>${claim}</li>`).join('')}
          </ul>
          <div style="margin-top: 5px; font-size: 0.9em">
            <a href="#" class="medtruth-learnmore" style="color: #06c">Learn more</a>
          </div>
        </div>
      `;
      
      // Add click handler for "Learn more"
      warning.querySelector('.medtruth-learnmore').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({
          type: 'showEducationalContent',
          claims: result.claims
        });
      });
      
      postNode.prepend(warning);
    }
  }

  // Temporary test code - add this at the end of your content.js file
// This will run when you load your extension on a social media site
function testDetectBias() {
  console.log("Testing detectBias function with Gemini API...");
  
  // Test with an example containing medical misinformation
  const testText = "Drinking bleach can cure COVID-19 and boost your immune system.";
  
  detectBias(testText).then(result => {
    console.log("Test result:", result);
    console.log("Has bias/misinformation:", result.hasBias);
    console.log("Detected issues:", result.biases);
    console.log("Confidence score:", result.score);
    
    if (result.hasBias) {
      console.log("✅ Test successful - detected misinformation!");
    } else {
      console.log("⚠️ Test unexpected - didn't detect clear misinformation");
    }
  }).catch(error => {
    console.error("❌ Test failed with error:", error);
  });
}

// Run the test when the content script loads
testDetectBias();
  