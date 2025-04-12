// Listen for new posts added to the page
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && isSocialMediaPost(node)) {
          analyzePost(node);
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  function isSocialMediaPost(node) {
    // Simple check for common social media post selectors
    return (
      node.matches('[data-testid="tweet"]') || // Twitter
      node.matches('[role="article"]') ||      // Facebook
      node.matches('[data-testid="post-container"]') // Reddit
    );
  }
  
  async function analyzePost(postNode) {
    const text = postNode.textContent;
    if (!text || text.length < 20) return;
  
    try {
      // In a real app, this would call the Gemini API
      const biasResult = await detectBias(text);
      
      // Add visual indicator
      addBiasIndicator(postNode, biasResult);
    } catch (error) {
      console.error("Bias detection failed:", error);
    }
  }
  
  // Simplified bias detection (in a real app, replace with Gemini API call)
  async function detectBias(text) {
    // This is a mock implementation - replace with actual API call
    const biases = [];
    
    // Check for gender bias
    const genderedWords = text.match(/\b(he|she|him|her|his|hers|man|woman|boy|girl)\b/gi);
    if (genderedWords && genderedWords.filter(w => w.toLowerCase().match(/he|him|his|man|boy/)).length > 
       genderedWords.filter(w => w.toLowerCase().match(/she|her|hers|woman|girl/)).length) {
      biases.push({ type: 'gender', direction: 'male' });
    }
    
    // Check for racial bias
    const racialTerms = ['black', 'white', 'asian', 'latino', 'african', 'caucasian'];
    if (racialTerms.some(term => text.toLowerCase().includes(term))) {
      biases.push({ type: 'racial' });
    }
    
    return {
      hasBias: biases.length > 0,
      biases,
      score: biases.length * 0.3 // Simple scoring
    };
  }
  
  function addBiasIndicator(postNode, result) {
    const indicator = document.createElement('div');
    indicator.className = 'fairnesslens-indicator';
    
    if (result.hasBias) {
      indicator.innerHTML = `
        <span style="color: orange">⚠️ Potential bias detected: 
        ${result.biases.map(b => b.type).join(', ')}</span>
      `;
      indicator.style.borderLeft = '3px solid orange';
      indicator.style.padding = '5px';
      indicator.style.margin = '5px 0';
    } else {
      indicator.innerHTML = '<span style="color: green">✓ Fair content</span>';
      indicator.style.borderLeft = '3px solid green';
      indicator.style.padding = '5px';
      indicator.style.margin = '5px 0';
    }
    
    postNode.prepend(indicator);
  }