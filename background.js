// Track warnings and medical content
let medicalCount = 0;
let warningCount = 0;
let recentWarnings = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'medicalContentAnalyzed') {
    medicalCount++;
    
    if (request.hasWarning) {
      warningCount++;
      
      // Keep last 5 warnings
      recentWarnings.unshift(request.textSnippet);
      if (recentWarnings.length > 5) recentWarnings.pop();
      
      // Store in sync storage for popup
      chrome.storage.sync.set({ 
        medicalCount, 
        warningCount,
        recentWarnings 
      });
    }
  }
  
  if (request.type === 'showEducationalContent') {
    // In a full implementation, this would open an educational page
    chrome.tabs.create({
      url: `https://www.cdc.gov/vaccines/vac-gen/common-misconceptions.html`
    });
  }
});