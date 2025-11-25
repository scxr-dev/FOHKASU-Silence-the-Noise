// FOHKASU V6.0 - THE WARDEN & DETECTIVE UPDATE
// Features: Content Injection, Warden Anti-Cheat, Child Voice, Visceral Horror, Categorized Blocklist, Incognito Lockdown

let userProfile = { name: "You", age: 25, gender: "other", married: false, kids: false };
// Force settings ON. No mercy.
let settings = { hallucinations: true, childMode: true, audio: true };

// --- LISTENER FOR BACKGROUND MESSAGES (INCOGNITO LOCK) ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "LOCKDOWN_INCOGNITO") {
        enforceIncognitoLock();
    } else if (request.action === "UNLOCK_INCOGNITO") {
        removeIncognitoLock();
    }
});

let incognitoOverlay = null;

function enforceIncognitoLock() {
    if (document.getElementById('fohkasu-incognito-lock')) return; // Already locked

    incognitoOverlay = document.createElement('div');
    incognitoOverlay.id = "fohkasu-incognito-lock";
    
    // Style directly here to ensure it hits hard
    Object.assign(incognitoOverlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'black', zIndex: '2147483647',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: '#F43F5E', fontFamily: 'monospace', textAlign: 'center', padding: '20px'
    });

    incognitoOverlay.innerHTML = `
        <h1 style="font-size: 3rem; margin-bottom: 20px;">ACCESS DENIED</h1>
        <p style="font-size: 1.5rem; color: white; max-width: 600px;">
            I cannot protect you in the dark.
        </p>
        <p style="font-size: 1.2rem; color: #94A3B8; margin-top: 10px;">
            You have disabled Incognito Access. <br>
            I have locked your browser until you fix it.
        </p>
        <div style="margin-top: 40px; padding: 30px; border: 2px solid white; border-radius: 15px; background: rgba(255,255,255,0.1); text-align: left;">
            <p style="color: #2DD4BF; font-weight: bold; margin-bottom: 15px; font-size: 1.2rem;">HOW TO UNLOCK:</p>
            <p style="color: white; margin: 10px 0;">1. I have opened the <strong>Extensions</strong> tab for you.</p>
            <p style="color: white; margin: 10px 0;">2. Find the <strong>FOHKASU</strong> card.</p>
            <p style="color: white; margin: 10px 0;">3. Click the <strong>DETAILS</strong> button.</p>
            <p style="color: white; margin: 10px 0;">4. Scroll down and toggle <strong>"Allow in Incognito"</strong> ON.</p>
        </div>
    `;

    document.body.appendChild(incognitoOverlay);
    document.body.style.overflow = 'hidden'; // Stop scrolling
    summonWarden(incognitoOverlay); // The Warden protects this lock too
}

function removeIncognitoLock() {
    const el = document.getElementById('fohkasu-incognito-lock');
    if (el) {
        el.remove();
        document.body.style.overflow = '';
    }
}


// --- 1. GENERAL AMMUNITION ---
const MSG_GENERAL = [
    "The screen is not hugging you back. You are holding a cold piece of glass.",
    "Stop running away from the silence. The silence is where you live.",
    "If the house caught fire right now, would you notice in time? Or would you finish this video first?",
    "You are trading your life for pixels that do not know your name.",
    "Look at the time. You are bleeding hours from a life that is already short.",
    "You are bored? No. You are terrified of being alone with your own thoughts."
];

const MSG_MALE = [
    "A real man protects his time. You are letting strangers steal it.",
    "Your grandfather fought to survive. You are fighting to stay asleep.",
    "Do you feel powerful right now? Or do you feel like a slave to a glowing rectangle?",
    "Stop acting like a boy waiting for permission. Stand up.",
    "No one is coming to save you. The rescue boat is empty."
];

const MSG_FEMALE = [
    "She is not you. You will never be her. Stop punishing yourself for it.",
    "You look at these photos and feel ugly. Who taught you to hate yourself?",
    "They are selling you insecurity so you buy their trash. Don't let them win.",
    "You are enough. But you can't feel it while you are numbing yourself.",
    "Real confidence is quiet. This app is screaming at you."
];

const MSG_PARENTS = [
    "Imagine the house is burning down. The smoke is filling their room. And you are here, scrolling.",
    "Your child is hungry for your attention. They are starving for it. And you are feeding this machine instead.",
    "They stopped calling your name because they learned you don't answer.",
    "You are their hero. But right now, you look like a zombie.",
    "Ten years from now, they will leave. And you will be left with this phone. Is it a fair trade?"
];

const MSG_MARRIED = [
    "Your partner is sleeping alone in a bed built for two.",
    "You promised to love them, but you are ignoring them for strangers.",
    "Put it down. Go touch their hand. Before they find someone who will.",
    "This screen is the third person in your marriage. Kick it out."
];

const MSG_YOUNG = [
    "You are young, but you are acting old and tired.",
    "Your brain is rotting. Stop feeding it garbage.",
    "Go outside. The world is burning and beautiful. This is fake.",
    "You have so much energy. Why are you pouring it into a drain?"
];

const MSG_OLDER = [
    "The sand is running out. Can you hear it falling?",
    "You thought you would be successful by now. This distraction is why you aren't.",
    "Do you want your life to end like this? Staring at a glass rectangle in the dark?",
    "It is not too late. But the door is closing."
];

// --- 2. PLATFORM SPECIFIC NIGHTMARES ---
const SITE_MESSAGES = {
    "tiktok.com": [
        "You have been here for hours. Your real life is gathering dust.",
        "Stop watching other people live. Your own life is dying of neglect.",
        "This app is chewing on your brain. Can't you feel the teeth?",
        "Swipe again. Maybe the next one will fix you. (It won't)."
    ],
    "youtube.com/shorts": [
        "Your attention span is broken. You broke it.",
        "Stop snacking on garbage. You are starving your mind.",
        "You can't focus on anything hard anymore. This is why.",
        "Turn it off. Read a book. Do something that hurts a little."
    ],
    "instagram.com": [
        "Everyone here is faking it. Including you.",
        "You are jealous of a life that doesn't exist.",
        "Validation from strangers is a drug. You are an addict.",
        "Post a photo. Get a like. Feel empty again. Repeat."
    ],
    "snapchat.com": [
        "Streaks are chains. You are a prisoner.",
        "Real friends don't need a score to prove they care.",
        "This disappears in ten seconds. Your regret stays forever."
    ],
    "gambling": [ 
        "You are going to lose. You know it.",
        "That money was for your family. Now it is gone.",
        "The house hates you. Stop giving them your blood.",
        "You think you can win it back? That is the addiction lying to you."
    ],
    "adult": [ 
        "This isn't love. It isn't even sex. It is loneliness.",
        "You are using people as objects. Stop it.",
        "Does this make you feel proud? Or dirty?",
        "Go find a real person. This is just pixels and regret."
    ],
    "social_generic": [
        "Why are you here again? Did you already forget your 14-day promise?",
        "This website is designed to keep you poor and distracted.",
        "You blocked this because you knew it was killing you.",
        "Another like, another scroll, another minute wasted."
    ],
    "custom": [
        "You added this to the list yourself. You knew it was poison.",
        "You are betraying your own promise.",
        "Why did you block this? Remember that reason.",
        "Step back. This is the custom hell you built to protect yourself."
    ]
};

// --- CONFIGURATION ---
const CORE_SITES = {
    "tiktok.com": "tiktok.com", "instagram.com": "instagram.com", "facebook.com": "instagram.com", 
    "snapchat.com": "snapchat.com", "youtube.com/shorts": "youtube.com/shorts", 
    "pornhub.com": "adult", "xvideos.com": "adult", "onlyfans.com": "adult", 
    "chaturbate.com": "adult", "xhamster.com": "adult", "xnxx.com": "adult", "thisvid.com": "adult_extreme", 
    "stake.com": "gambling", "roobet.com": "gambling", "1xbet": "gambling", 
    "bet365": "gambling", "draftkings": "gambling", "betway": "gambling"
};

let protocolActive = false;
let bgMusic = null;

const securityLoop = setInterval(() => { 
    if (!protocolActive) runSecurityCheck(); 
}, 1000);

function runSecurityCheck() {
    if (!chrome.runtime?.id) {
        console.log("FOHKASU: Context invalidated. Stopping script.");
        clearInterval(securityLoop);
        return;
    }

    chrome.storage.sync.get(['fohkasuProfile', 'fohkasuPaused', 'customBlacklist'], (res) => {
        if (chrome.runtime.lastError) return;

        if (res.fohkasuPaused) return; 
        if (res.fohkasuProfile) userProfile = res.fohkasuProfile;
        
        const currentUrl = window.location.href.toLowerCase();
        let detectedCategory = null;

        // 1. Check Core Sites
        for (const key in CORE_SITES) {
            if (currentUrl.includes(key)) {
                if (key.includes("youtube.com") && !currentUrl.includes("/shorts")) return;
                detectedCategory = CORE_SITES[key];
                break;
            }
        }

        // 2. Check Custom Blacklist
        if (!detectedCategory && res.customBlacklist && Array.isArray(res.customBlacklist)) {
            for (const item of res.customBlacklist) {
                const url = item.url || item; 
                const category = item.category || 'custom';

                if (currentUrl.includes(url.toLowerCase())) {
                    if (category === 'gambling') detectedCategory = 'gambling';
                    else if (category === 'adult') detectedCategory = 'adult';
                    else if (category === 'social') detectedCategory = 'social_generic';
                    else detectedCategory = 'custom';
                    break;
                }
            }
        }

        if (detectedCategory) initiateProtocol(detectedCategory);
    });
}

function initiateProtocol(category) {
    if (!chrome.runtime?.id) return;

    console.log("FOHKASU: Engaging Target -> " + category);
    protocolActive = true;
    
    recordMurder();
    
    if (settings.hallucinations) {
        hallucinate(category);
    }

    const htmlEl = document.documentElement;
    htmlEl.style.transition = "filter 5s ease-in-out, brightness 5s ease-in-out";
    setTimeout(() => { htmlEl.style.filter = "grayscale(100%) brightness(0.2)"; }, 500);
    setTimeout(() => { enterTheVoid(category); }, 5000);
}

// --- HALLUCINATION LOGIC ---
function hallucinate(category) {
    const msg = getTailoredMessage(category);
    document.title = "RUN AWAY. " + msg;
    const headers = document.querySelectorAll('h1, h2, h3, ytd-rich-grid-media');
    headers.forEach(h => {
        h.innerText = msg;
        h.style.color = "red";
        h.style.fontFamily = "Courier New";
        h.style.textShadow = "0 0 5px red";
    });
}

function recordMurder() {
    if (!chrome.runtime?.id) return;
    const today = new Date().toDateString();
    chrome.storage.sync.get(['murderedDays'], (res) => {
        if (chrome.runtime.lastError) return;
        let list = res.murderedDays || [];
        if (!list.includes(today)) {
            list.push(today);
            chrome.storage.sync.set({ murderedDays: list });
        }
    });
}

function getTailoredMessage(category) {
    const useChildMode = userProfile.kids; 
    let parentTitle = (userProfile.gender === 'male') ? "Dad" : "Mama";

    if (useChildMode) {
        if (category === 'adult_extreme') return `"${parentTitle}, please save me from you."`;
        if (category === 'adult') {
            return (Math.random() > 0.5) 
                ? `"${parentTitle}, you wish me to be in that video like this? Please don't do. I scared."`
                : `"If your child came to your side when you watching this video, can you watch this video with them?"`;
        }
        if (category === 'gambling') {
            let formal = (userProfile.gender === 'male') ? "Father" : "Mother";
            return `"${formal}, I am starving, please give something me to eat - your child's future self"`;
        }
    }

    if (category === 'instagram.com' && userProfile.gender === 'female' && userProfile.kids) {
        return `"In your childhood time, you wish you have good parents, but now you are the parents and do you still feel that kid's pain?"`;
    }

    let pool = [];
    if (SITE_MESSAGES[category]) pool = pool.concat(SITE_MESSAGES[category]);
    else pool = pool.concat(MSG_GENERAL);

    if (category === 'custom' || category === 'social_generic') pool = pool.concat(MSG_GENERAL);

    if (userProfile.gender === 'male') pool = pool.concat(MSG_MALE);
    if (userProfile.gender === 'female') pool = pool.concat(MSG_FEMALE);
    if (userProfile.kids) pool = pool.concat(MSG_PARENTS);
    if (userProfile.married) pool = pool.concat(MSG_MARRIED);
    if (userProfile.age && userProfile.age < 20) pool = pool.concat(MSG_YOUNG);
    if (userProfile.age && userProfile.age > 30) pool = pool.concat(MSG_OLDER);

    const rawMsg = pool[Math.floor(Math.random() * pool.length)];
    return rawMsg.replace("{{name}}", userProfile.name || "You");
}

function calculateWeeksLeft() {
    const age = userProfile.age || 25;
    return (80 * 52) - (age * 52);
}

// --- THE WARDEN: ANTI-CHEAT SYSTEM ---
// The Warden watches the DOM. If you delete the overlay, it bites.
function summonWarden(overlayElement) {
    const warden = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // 1. If overlay is removed from body
            if (!document.body.contains(overlayElement)) {
                console.log("%cFOHKASU: CHEAT ATTEMPT DETECTED. RESTORING...", "color: red; font-size: 20px; font-weight: bold;");
                document.body.appendChild(overlayElement);
                // Punishment: Reset volume max
                if(bgMusic) { bgMusic.volume = 1.0; bgMusic.currentTime = 0; }
            }
            
            // 2. If user tries to hide it via styles (display: none, opacity: 0, z-index manipulation)
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
                const s = overlayElement.style;
                if (s.display === "none" || s.opacity === "0" || s.visibility === "hidden" || parseInt(s.zIndex) < 2147483647) {
                    console.log("FOHKASU: Nice try.");
                    s.display = "flex";
                    s.opacity = "1";
                    s.visibility = "visible";
                    s.zIndex = "2147483647";
                }
            }
        });
    });

    // Watch the body for child list changes (deletions)
    warden.observe(document.body, { childList: true });
    // Watch the overlay itself for attribute hacks
    warden.observe(overlayElement, { attributes: true });

    // Block right-click on overlay to prevent easy "Inspect Element" access
    overlayElement.addEventListener('contextmenu', (e) => e.preventDefault());
}

function enterTheVoid(category) {
    document.body.classList.add('fohkasu-locked');
    document.querySelectorAll('video, audio').forEach(m => m.pause());

    const overlay = document.createElement('div');
    overlay.id = "fohkasu-void";

    const finalMsg = getTailoredMessage(category);
    const weeksLeft = calculateWeeksLeft();

    overlay.innerHTML = `
        <div class="fohkasu-content-wrapper">
            <div class="fohkasu-text glitch" data-text="${finalMsg}">"${finalMsg}"</div>
            <div class="fohkasu-memento">
                YOU HAVE APPROXIMATELY <span style="color:#EF4444; font-size:1.4rem;">${weeksLeft}</span> WEEKS LEFT TO LIVE.
                <br>DO NOT WASTE THIS ONE.
            </div>
            <div class="fohkasu-timer">Time spent in reality: <span id="reality-timer-count">0</span>s</div>
            <div style="margin-top:20px; font-size: 0.8rem; opacity: 0.5;">(Click anywhere to enable audio)</div>
        </div>
    `;

    document.body.appendChild(overlay);
    
    // SUMMON THE WARDEN
    summonWarden(overlay);

    requestAnimationFrame(() => { setTimeout(() => { overlay.style.opacity = "1"; }, 100); });
    
    // CHECK SETTING: Audio
    if (settings.audio) {
        setupAudio();
    }

    let seconds = 0;
    setInterval(() => {
        seconds++;
        const t = document.getElementById('reality-timer-count');
        if(t) t.innerText = seconds;
    }, 1000);
}

function setupAudio() {
    if (!chrome.runtime?.id) return;
    const audioUrl = chrome.runtime.getURL("audio/aria_math.mp3");
    bgMusic = new Audio(audioUrl);
    bgMusic.volume = 0; bgMusic.loop = true;
    bgMusic.play().then(() => fadeInAudio()).catch(() => {
        document.addEventListener('click', forcePlayAudio, { once: true });
        document.addEventListener('keydown', forcePlayAudio, { once: true });
    });
}
function forcePlayAudio() { if(bgMusic) bgMusic.play().then(() => fadeInAudio()); }
function fadeInAudio() {
    let vol = 0;
    const fade = setInterval(() => { if (vol < 0.6) { vol += 0.02; bgMusic.volume = vol; } else clearInterval(fade); }, 200);
}
