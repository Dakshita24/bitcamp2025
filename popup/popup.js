document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle');
    const settingsBtn = document.getElementById('settings');
    const medicalCountEl = document.getElementById('medicalCount');
    const warningCountEl = document.getElementById('warningCount');
    const warningListEl = document.getElementById('warningList');
    const latestWarningsEl = document.getElementById('latestWarnings');
    
    // Load saved data
    chrome.storage.sync.get(
      ['enabled', 'medicalCount', 'warningCount', 'recentWarnings'], 
      (data) => {
        toggleBtn.textContent = data.enabled !== false ? 'Disable' : 'Enable';
        medicalCountEl.textContent = data.medicalCount || 0;
        warningCountEl.textContent = data.warningCount || 0;
        
        if (data.recentWarnings && data.recentWarnings.length > 0) {
          latestWarningsEl.style.display = 'block';
          warningListEl.innerHTML = data.recentWarnings.map(warning => 
            `<li>${warning}</li>`
          ).join('');
        }
      }
    );
    
    toggleBtn.addEventListener('click', () => {
      chrome.storage.sync.get(['enabled'], (data) => {
        const newState = data.enabled !== false ? false : true;
        chrome.storage.sync.set({ enabled: newState }, () => {
          toggleBtn.textContent = newState ? 'Disable' : 'Enable';
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: newState ? 'enable' : 'disable' 
            });
          });
        });
      });
    });
    
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  });