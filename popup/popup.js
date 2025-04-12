document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle');
    const postCountEl = document.getElementById('postCount');
    const biasCountEl = document.getElementById('biasCount');
    
    // Load saved settings
    chrome.storage.sync.get(['enabled', 'postCount', 'biasCount'], (data) => {
      toggleBtn.textContent = data.enabled ? 'Disable' : 'Enable';
      postCountEl.textContent = data.postCount || 0;
      biasCountEl.textContent = data.biasCount || 0;
    });
    
    toggleBtn.addEventListener('click', () => {
      chrome.storage.sync.get(['enabled'], (data) => {
        const newState = !data.enabled;
        chrome.storage.sync.set({ enabled: newState }, () => {
          toggleBtn.textContent = newState ? 'Disable' : 'Enable';
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: newState ? 'enable' : 'disable' });
          });
        });
      });
    });
  });