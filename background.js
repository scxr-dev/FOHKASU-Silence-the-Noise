// FOHKASU BACKGROUND SERVICE
// The Watchdog & The Uninstall Handler

const UNINSTALL_URL = "https://fohkasu-goodbye.vercel.app"; 

// 1. Set Uninstall URL
chrome.runtime.setUninstallURL(UNINSTALL_URL, () => {
    console.log("FOHKASU: Uninstall URL set.");
});

// 2. On Install - Initialize
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install" || details.reason === "update") {
        console.log("FOHKASU: System Installed. Waking up existing tabs...");
        
        // WAKE UP PROTOCOL
        try {
            const tabs = await chrome.tabs.query({url: ["http://*/*", "https://*/*"]});
            for (const tab of tabs) {
                try {
                    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["style.css"] });
                    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
                } catch (err) {}
            }
        } catch (e) {}
    }
    
    // Check IMMEDIATELY upon install
    checkIncognitoStatus();
    // Backup alarm
    chrome.alarms.create("incognitoCheck", { periodInMinutes: 0.2 }); // Slower check (12s)
});

// 3. The Watchdog Alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "incognitoCheck") {
        checkIncognitoStatus();
    }
});

// 3.5. EVENT LISTENERS (THROTTLED HARD)
let lastCheckTime = 0;
const CHECK_COOLDOWN = 2000; // Increase to 2 seconds

function triggerThrottledCheck() {
    const now = Date.now();
    if (now - lastCheckTime > CHECK_COOLDOWN) {
        lastCheckTime = now;
        checkIncognitoStatus();
    }
}

chrome.tabs.onActivated.addListener(() => triggerThrottledCheck());
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        triggerThrottledCheck();
    }
});
chrome.windows.onFocusChanged.addListener(() => triggerThrottledCheck());

// GLOBAL SAFETY VARIABLES
let isOpeningSettings = false;
let lastOpenTime = 0;
const OPEN_COOLDOWN = 5000; // 5 seconds wait before opening another tab

// 4. The Logic (Safer Trap)
function checkIncognitoStatus() {
    // 1. SAFETY CHECK: If we just opened a tab, STOP.
    if (isOpeningSettings) return;
    if (Date.now() - lastOpenTime < OPEN_COOLDOWN) return;

    chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
        if (!isAllowed) {
            console.log("FOHKASU: INCOGNITO ACCESS MISSING.");
            
            const extensionId = chrome.runtime.id;

            chrome.tabs.query({}, (tabs) => {
                let settingsTab = null;

                for (let tab of tabs) {
                    // Check URL and Pending URL to find existing tab
                    const url = tab.url || tab.pendingUrl || "";
                    if (url.includes("chrome://extensions") && url.includes(extensionId)) {
                        settingsTab = tab;
                        break;
                    }

                    // Lock down other tabs
                    if (tab.id && url && !url.startsWith("chrome://") && !url.startsWith("chrome-extension://")) {
                        chrome.tabs.sendMessage(tab.id, { action: "LOCKDOWN_INCOGNITO" }).catch(() => {});
                    }
                }

                if (!settingsTab) {
                    // 2. OPEN NEW TAB (With Safety Flags)
                    isOpeningSettings = true;
                    lastOpenTime = Date.now(); // Mark the time
                    
                    chrome.tabs.create({ 
                        url: "chrome://extensions/?id=" + extensionId, 
                        active: true 
                    }, () => {
                        // Reset flag after delay
                        setTimeout(() => { isOpeningSettings = false; }, 2000);
                    });
                } else {
                    // Tab exists, do nothing. Don't force focus repeatedly.
                }
            });

        } else {
            // IF ALLOWED: RELEASE
            chrome.tabs.query({}, (tabs) => {
                for (let tab of tabs) {
                    if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
                        chrome.tabs.sendMessage(tab.id, { action: "UNLOCK_INCOGNITO" }).catch(() => {});
                    }
                }
            });
        }
    });
}
