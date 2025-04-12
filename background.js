// Keep track of analyzed posts
let postCount = 0;
let biasCount = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'biasDetected') {
    postCount++;
    if (request.hasBias) biasCount++;
    
    chrome.storage.sync.set({ postCount, biasCount });
  }
});