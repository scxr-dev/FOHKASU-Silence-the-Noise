document.addEventListener('DOMContentLoaded', () => {
    // State
    let userData = { name: "", age: null, gender: "male", kids: false };
    let isPaused = false;
    let customBlacklist = []; 
    let selectedCategory = 'social';
    let shameTimer = null; // Store timer ID

    // Navigation Views
    const views = {
        setup: document.getElementById('view-setup'),
        home: document.getElementById('view-home'),
        settings: document.getElementById('view-settings')
    };

    function showView(name) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[name].classList.remove('hidden');
        
        // Header Toggle
        if (name === 'settings') {
            document.getElementById('mainHeader').classList.add('hidden');
            document.getElementById('settingsHeader').classList.remove('hidden');
            renderBlacklist(); 
        } else {
            document.getElementById('mainHeader').classList.remove('hidden');
            document.getElementById('settingsHeader').classList.add('hidden');
        }
    }

    // INIT
    loadState();

    // --- SETUP LOGIC ---
    let tempGender = 'male';
    let tempParent = false;

    // Gender Selection
    const genderBtns = document.querySelectorAll('.gender-btn');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            tempGender = btn.getAttribute('data-value');
        });
    });
    if(genderBtns.length > 0) genderBtns[0].click();

    // Parent Selection
    const parentBtns = document.querySelectorAll('.parent-btn');
    parentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            parentBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            tempParent = (btn.getAttribute('data-value') === 'true');
        });
    });
    if(parentBtns.length > 0) parentBtns[0].click();

    // Steps Navigation
    document.getElementById('btnNext1').addEventListener('click', () => {
        const name = document.getElementById('inputName').value.trim();
        if(!name) return shake(document.getElementById('inputName'));
        userData.name = name;
        document.getElementById('setup-step-1').classList.add('hidden');
        document.getElementById('setup-step-2').classList.remove('hidden');
    });

    document.getElementById('btnNext2').addEventListener('click', () => {
        const age = document.getElementById('inputAge').value;
        if(!age || age < 5 || age > 100) return shake(document.getElementById('inputAge'));
        userData.age = age;
        userData.gender = tempGender;
        document.getElementById('setup-step-2').classList.add('hidden');
        document.getElementById('setup-step-3').classList.remove('hidden');
    });

    document.getElementById('btnFinishSetup').addEventListener('click', () => {
        userData.kids = tempParent;
        chrome.storage.sync.set({ fohkasuProfile: userData }, () => {
            loadState();
        });
    });

    // --- HOME LOGIC ---
    function loadState() {
        chrome.storage.sync.get(['fohkasuProfile', 'fohkasuPaused', 'murderedDays', 'customBlacklist'], (res) => {
            if (!res.fohkasuProfile) {
                showView('setup');
                return;
            }

            userData = res.fohkasuProfile;
            isPaused = res.fohkasuPaused || false;
            
            // Migrate old blacklist format
            let rawList = res.customBlacklist || [];
            customBlacklist = rawList.map(item => {
                if (typeof item === 'string') {
                    return { url: item, category: 'other', addedAt: Date.now() };
                }
                return item;
            });

            // Update UI
            document.getElementById('display-name').innerText = userData.name;
            let details = `${userData.gender.toUpperCase()} • ${userData.age}YO`;
            if(userData.kids) details += ` • PARENT`;
            document.getElementById('display-details').innerText = details;

            updateStatusUI();
            renderGraveyard(res.murderedDays || []);
            
            showView('home');
        });
    }

    function renderGraveyard(murderedDays) {
        const grid = document.getElementById('graveyardGrid');
        grid.innerHTML = '';
        for (let i = 27; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            if (murderedDays.includes(dateStr)) {
                cell.classList.add('skull');
                cell.innerText = "💀";
            } else {
                cell.classList.add('shield');
                cell.innerText = "🛡️";
            }
            grid.appendChild(cell);
        }
    }

    // --- SETTINGS: CUSTOM BLACKLIST ---
    const inputBlacklist = document.getElementById('inputBlacklist');
    const btnAddBlacklist = document.getElementById('btnAddBlacklist');
    const blacklistList = document.getElementById('blacklistList');
    const catPills = document.querySelectorAll('.cat-pill');

    catPills.forEach(pill => {
        pill.addEventListener('click', () => {
            catPills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            selectedCategory = pill.getAttribute('data-cat');
        });
    });

    btnAddBlacklist.addEventListener('click', () => {
        const rawSite = inputBlacklist.value.trim().toLowerCase();

        if(!rawSite) return shake(inputBlacklist);
        let domain = rawSite.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if(domain.length < 3 || !domain.includes('.')) return shake(inputBlacklist);

        if(!customBlacklist.some(item => item.url === domain)) {
            if(!confirm(`WARNING: Adding ${domain} to the permanent blocklist. You can never remove this. Proceed?`)) {
                return;
            }
            customBlacklist.push({ url: domain, category: selectedCategory, addedAt: Date.now() });
            saveBlacklist();
        }
        inputBlacklist.value = '';
    });

    function saveBlacklist() {
        chrome.storage.sync.set({ customBlacklist: customBlacklist }, () => renderBlacklist());
    }

    function renderBlacklist() {
        blacklistList.innerHTML = '';
        [...customBlacklist].reverse().forEach(item => {
            const el = document.createElement('div');
            el.className = 'blacklist-item';
            el.innerHTML = `
                <div class="item-info">
                    <span class="item-domain">${item.url}</span>
                    <span class="tag-cat">${item.category}</span>
                </div>
                <div><span class="blacklist-locked" title="Permanent Block">🔒</span></div>
            `;
            blacklistList.appendChild(el);
        });
    }

    // --- NAVIGATION ---
    document.getElementById('btnSettings').addEventListener('click', () => showView('settings'));
    document.getElementById('btnBack').addEventListener('click', () => showView('home'));

    // --- TOGGLE & SHAME TIMER LOGIC ---
    const confessionOverlay = document.getElementById('confession-overlay');
    const confessionInput = document.getElementById('confessionInput');
    const btnAdmitDefeat = document.getElementById('btnAdmitDefeat');

    document.getElementById('systemToggle').addEventListener('click', () => {
        if(isPaused) {
            // Unpausing is instant
            isPaused = false;
            chrome.storage.sync.set({ fohkasuPaused: false });
            updateStatusUI();
        } else {
            // PAUSING REQUIRES PENANCE
            confessionOverlay.style.display = 'flex';
            confessionInput.value = "";
            
            // LOCK THE BUTTON INITIALLY
            btnAdmitDefeat.style.opacity = "0.3";
            btnAdmitDefeat.style.cursor = "not-allowed";
            btnAdmitDefeat.disabled = true;

            // START THE SHAME TIMER (30 Seconds)
            let cooldown = 30;
            btnAdmitDefeat.innerText = `WAIT (${cooldown}s)`;
            
            if(shameTimer) clearInterval(shameTimer);
            
            shameTimer = setInterval(() => {
                cooldown--;
                if(cooldown > 0) {
                    btnAdmitDefeat.innerText = `WAIT (${cooldown}s)`;
                } else {
                    clearInterval(shameTimer);
                    // CHECK CONFESSION LENGTH
                    if(confessionInput.value.length >= 50) {
                        enableDefeatButton();
                    } else {
                        btnAdmitDefeat.innerText = "WRITE MORE (50 CHARS)";
                    }
                }
            }, 1000);
        }
    });

    confessionInput.addEventListener('input', () => {
        // Only enable if timer is done AND text is sufficient
        if(btnAdmitDefeat.innerText.includes("WAIT")) return; // Still waiting
        
        if(confessionInput.value.length >= 50) {
            enableDefeatButton();
        } else {
            btnAdmitDefeat.innerText = "WRITE MORE (50 CHARS)";
            btnAdmitDefeat.style.opacity = "0.3";
            btnAdmitDefeat.disabled = true;
        }
    });

    function enableDefeatButton() {
        btnAdmitDefeat.innerText = "I AM WEAK (DISABLE)";
        btnAdmitDefeat.style.opacity = "1";
        btnAdmitDefeat.style.cursor = "pointer";
        btnAdmitDefeat.disabled = false;
    }

    document.getElementById('btnStayStrong').addEventListener('click', () => {
        confessionOverlay.style.display = 'none';
        if(shameTimer) clearInterval(shameTimer);
    });

    btnAdmitDefeat.addEventListener('click', () => {
        isPaused = true;
        chrome.storage.sync.set({ fohkasuPaused: true });
        updateStatusUI();
        confessionOverlay.style.display = 'none';
    });

    function updateStatusUI() {
        const root = document.getElementById('systemToggle');
        const pill = document.getElementById('statusPill');
        const sub = document.getElementById('statusSubtext');

        if(isPaused) {
            root.classList.add('paused');
            pill.innerText = "PAUSED";
            sub.innerText = "You are vulnerable";
        } else {
            root.classList.remove('paused');
            pill.innerText = "ACTIVE";
            sub.innerText = "Protecting your mind";
        }
    }

    // --- RESET ---
    document.getElementById('btnReset').addEventListener('click', () => {
        if(confirm("Are you sure you want to erase your identity? This cannot be undone.")) {
            chrome.storage.sync.clear(() => location.reload());
        }
    });

    function shake(el) {
        el.style.borderColor = "#F43F5E";
        el.classList.add('shake');
        setTimeout(() => el.style.borderColor = "var(--glass-border)", 500);
    }
});
