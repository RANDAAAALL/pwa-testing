// On-screen console helper to display logs dynamically
function logToScreen(message, type = 'info') {
  const consoleEl = document.getElementById('debug-console');
  if (consoleEl) {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    consoleEl.appendChild(logItem);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
  console.log(message);
}

// 1. Register the Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logToScreen('Service Worker registered successfully!', 'success');
        
        // Listen for updates to the service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                logToScreen('New PWA update available. Refresh to apply changes.', 'info');
              } else {
                logToScreen('App assets cached. App can now work offline!', 'success');
              }
            }
          };
        };
      })
      .catch((error) => {
        logToScreen(`Service Worker registration failed: ${error}`, 'error');
      });
  });
} else {
  logToScreen('Service Workers are not supported in this browser.', 'error');
}

// 2. Handle the "Before Install Prompt" (Custom Install Button)
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent browser's default bar prompt
  e.preventDefault();
  // Save the event so we can trigger it when the user clicks the button
  deferredPrompt = e;
  // Show the custom install button
  installBtn.classList.remove('hidden');
  logToScreen('App is installable! Click the "Install App" button to install.', 'info');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  // Show the browser install dialog
  deferredPrompt.prompt();
  // Check the user response
  const { outcome } = await deferredPrompt.userChoice;
  logToScreen(`User installation choice: ${outcome}`, 'info');
  // Reset the prompt variable (it can only be prompt once)
  deferredPrompt = null;
  // Hide the button
  installBtn.classList.add('hidden');
});

window.addEventListener('appinstalled', (evt) => {
  logToScreen('PWA installed successfully! You can find it on your home screen/desktop.', 'success');
});

// 3. Monitor Online / Offline connection status
function updateOnlineStatus() {
  const statusEl = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  
  if (navigator.onLine) {
    statusEl.className = 'status-dot online';
    statusText.textContent = 'Online';
    logToScreen('Network restored. Connected to internet.', 'success');
  } else {
    statusEl.className = 'status-dot offline';
    statusText.textContent = 'Offline';
    logToScreen('Network disconnected. Running fully offline!', 'warning');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Set initial state
updateOnlineStatus();

// 4. Client-side Interaction (Interactive Counter to test state)
const counterBtn = document.getElementById('counter-btn');
const counterVal = document.getElementById('counter-value');
let count = 0;

counterBtn.addEventListener('click', () => {
  count++;
  counterVal.textContent = count;
  logToScreen(`Button clicked. Count is now: ${count}`, 'info');
});
