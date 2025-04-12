// Medical keywords to monitor
const MEDICAL_TERMS = [
    'cancer', 'vaccine', 'covid', 'virus', 'treatment', 'cure', 
    'medicine', 'drug', 'pharma', 'health', 'disease', 'immune',
    'doctor', 'hospital', 'cdc', 'who', 'fda'
  ];
  
  // Trusted sources for verification
  const TRUSTED_SOURCES = [
    'cdc.gov', 'who.int', 'nih.gov', 'mayoclinic.org',
    'webmd.com', 'healthline.com', 'medicalnewstoday.com'
  ];
  
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
      const result = await analyzeMedicalContent(text);
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
  async function analyzeMedicalContent(text) {
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

  