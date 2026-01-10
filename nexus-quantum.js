/* ============================================
   NEXUS QUANTUM - Ultimate JavaScript Engine
   World's Most Advanced WebApp Logic
   ============================================ */

// 🧠 QUANTUM APP STATE (Enhanced with Nexus Bot features)
const QuantumState = {
    user: {
        id: null,
        name: 'Quantum User',
        username: '',
        avatar: 'N',
        level: 1,
        xp: 0,
        gold: 0,
        energy: 1000,
        maxEnergy: 1000,
        tier: 'Quantum Standard',
        streak: 0,
        referrals: 0,
        darkMatter: 0,
        isPremium: false,
        isAdmin: false,
        referralCode: null,
        referredBy: null,
        premiumExpires: null,
        totalTaps: 0,
        totalGoldEarned: 0,
        prestigeLevel: 0,
        gameCoins: 0,
        rpgGold: 0,
        accumulatedCoins: 0,
        activeEffects: [],
        ownedSkins: ['skin_default'],
        currentSkin: 'skin_default',
        offlineMode: false
    },
    
    mining: {
        balance: 0,
        tapPower: 1,
        autoTapRate: 0,
        critChance: 5,
        critMultiplier: 2,
        multiplier: 1,
        upgrades: {
            tapPower: 0,
            autoTap: 0,
            energy: 0,
            crit: 0,
            luck: 0
        },
        autoMining: {
            active: false,
            amount: 0,
            lastClaim: 0
        }
    },
    
    quiz: {
        active: false,
        topic: 'general',
        difficulty: 'easy',
        count: 10,
        current: 0,
        score: 0,
        answers: [],
        questions: [],
        stats: {
            total: 0,
            correct: 0,
            streak: 0
        }
    },
    
    battle: {
        active: false,
        room: null,
        participants: [],
        currentQuestion: null
    },
    
    gamification: {
        achievements: [],
        leaderboard: [],
        weeklyRank: 0,
        globalRank: 0,
        dailyChallenges: [],
        lastChallengeReset: null
    },
    
    wayground: {
        rooms: [],
        currentRoom: null,
        messages: []
    },
    
    settings: {
        sound: true,
        haptic: true,
        effects: true,
        darkMode: false,
        notifications: true,
        theme: 'default'
    },
    
    ui: {
        currentSection: 'mining',
        loading: true,
        animations: true
    },
    
    // Nexus Bot Advanced Features
    shop: {
        boosters: [],
        skins: []
    },
    
    notifications: [],
    
    // SRS Flashcards
    flashcards: [],
    
    // Admin
    maintenance: false
};

// ============================================
// NEXUS BOT CONFIGURATION (Enhanced)
// ============================================
const CONFIG = {
    ADMIN_IDS: [5895125141],
    BOT_USERNAME: 'PolWay_bot',
    SUPABASE_URL: 'https://slmynfgspupncsijhzpd.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbXluZmdzcHVwbmNzaWpoenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzk1MTEsImV4cCI6MjA4MzM1NTUxMX0.HY8ZiQkWMRRA0jVMutTorc5Cc2zt1x38dalot-A_gLI',
    OPENAI_KEY: '', // Server-side usage only
    ENERGY_REGEN_RATE: 1,
    ENERGY_REGEN_INTERVAL: 1000,
    AUTO_SAVE_INTERVAL: 30000,
    PRESTIGE_THRESHOLD: 100000,
    XP_PREMIUM_COST: 10000,
    GOLD_PREMIUM_COST: 50000,
    GOLD_PREMIUM_DAYS: 3,
    REFERRAL_REWARD_XP: 500,
    REFERRAL_INVITER_GOLD: 1000,
    SUPPORT_USERNAME: 'iultimatium'
};

// ============================================
// UPGRADES SYSTEM (Nexus Bot)
// ============================================
const UPGRADES = {
    tapPower: {
        name: 'Tap Power',
        icon: 'fa-hand-pointer',
        baseCost: 100,
        costMultiplier: 1.5,
        effect: (level) => level + 1,
        description: 'Har bir tap uchun +1 coin'
    },
    autoTap: {
        name: 'Auto Tap',
        icon: 'fa-robot',
        baseCost: 500,
        costMultiplier: 1.8,
        effect: (level) => level,
        description: 'Sekundiga avtomatik tap'
    },
    energy: {
        name: 'Energy',
        icon: 'fa-battery-full',
        baseCost: 200,
        costMultiplier: 1.4,
        effect: (level) => 1000 + level * 200,
        description: 'Maksimal energiya +200'
    },
    crit: {
        name: 'Critical',
        icon: 'fa-bolt',
        baseCost: 300,
        costMultiplier: 1.6,
        effect: (level) => 5 + level * 2,
        description: 'Kritik urilish ehtimoli +2%'
    },
    luck: {
        name: 'Luck',
        icon: 'fa-clover',
        baseCost: 400,
        costMultiplier: 1.7,
        effect: (level) => level * 0.5,
        description: 'Bonus drop ehtimoli +0.5%'
    }
};

// ============================================
// SHOP ITEMS (Nexus Bot)
// ============================================
const SHOP_ITEMS = {
    boosters: [
        { id: 'speed_boost', name: 'Speed Boost', icon: 'fa-bolt', cost: 2000, duration: 300, effect: 'autoTapRate', multiplier: 2, desc: '2x Auto Tap (5 daqiqa)' },
        { id: 'luck_boost', name: 'Lucky Charm', icon: 'fa-clover', cost: 5000, duration: 300, effect: 'critChance', add: 20, desc: '+20% Crit Chance (5 daqiqa)' },
        { id: 'energy_drink', name: 'Energy Drink', icon: 'fa-wine-bottle', cost: 1000, duration: 0, effect: 'energy', refill: true, desc: 'To\'liq energiya' }
    ],
    skins: [
        { id: 'skin_default', name: 'Default Core', icon: 'fa-circle', cost: 0, desc: 'Oddiy reaktor' },
        { id: 'skin_neon', name: 'Neon Core', icon: 'fa-sun', cost: 10000, desc: 'Neon rangli reaktor' },
        { id: 'skin_gold', name: 'Golden Core', icon: 'fa-gem', cost: 50000, desc: 'Oltin reaktor' },
        { id: 'skin_void', name: 'Void Core', icon: 'fa-ghost', cost: 100000, desc: 'Qora tuynuk stili' }
    ]
};

// ============================================
// ACHIEVEMENTS (Nexus Bot)
// ============================================
const ACHIEVEMENTS = [
    { id: 'first_tap', name: 'Birinchi qadam', icon: 'fa-shoe-prints', condition: s => s.totalTaps >= 1 },
    { id: 'tap_100', name: '100 ta tap', icon: 'fa-hand-pointer', condition: s => s.totalTaps >= 100 },
    { id: 'tap_1000', name: '1000 ta tap', icon: 'fa-hands', condition: s => s.totalTaps >= 1000 },
    { id: 'tap_10000', name: '10000 ta tap', icon: 'fa-fire', condition: s => s.totalTaps >= 10000 },
    { id: 'gold_1000', name: '1000 coin', icon: 'fa-coins', condition: s => s.totalGoldEarned >= 1000 },
    { id: 'gold_10000', name: '10000 coin', icon: 'fa-sack-dollar', condition: s => s.totalGoldEarned >= 10000 },
    { id: 'gold_100000', name: '100000 coin', icon: 'fa-gem', condition: s => s.totalGoldEarned >= 100000 },
    { id: 'level_5', name: '5-daraja', icon: 'fa-star', condition: s => s.level >= 5 },
    { id: 'level_10', name: '10-daraja', icon: 'fa-crown', condition: s => s.level >= 10 },
    { id: 'streak_3', name: '3 kunlik streak', icon: 'fa-fire', condition: s => s.streak >= 3 },
    { id: 'streak_7', name: '7 kunlik streak', icon: 'fa-fire-flame-curved', condition: s => s.streak >= 7 },
    { id: 'prestige_1', name: 'Birinchi Prestige', icon: 'fa-atom', condition: s => s.prestigeLevel >= 1 },
    { id: 'quiz_10', name: '10 ta quiz', icon: 'fa-brain', condition: s => s.quiz.stats.total >= 10 },
    { id: 'quiz_perfect', name: 'Mukammal quiz', icon: 'fa-trophy', condition: s => s.quiz.stats.streak >= 10 }
];

// ============================================
// QUIZ QUESTIONS (Nexus Bot)
// ============================================
const QUIZ_QUESTIONS = {
    general: [
        { q: "O'zbekiston poytaxti qaysi shahar?", a: ["Toshkent", "Samarqand", "Buxoro", "Xiva"], c: 0 },
        { q: "Quyosh sistemasida nechta sayyora bor?", a: ["7", "8", "9", "10"], c: 1 },
        { q: "Eng katta okean qaysi?", a: ["Atlantika", "Tinch", "Hind", "Shimoliy Muz"], c: 1 },
        { q: "DNA nimaning qisqartmasi?", a: ["Dezoksiribonuklein kislota", "Dinamik nuklein kislota", "Dioksid nuklein", "Dimetil nuklein"], c: 0 },
        { q: "Birinchi kompyuter qachon yaratilgan?", a: ["1936", "1946", "1956", "1966"], c: 1 }
    ],
    science: [
        { q: "Suvning kimyoviy formulasi?", a: ["H2O", "CO2", "NaCl", "O2"], c: 0 },
        { q: "Yorug'lik tezligi qancha?", a: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], c: 0 },
        { q: "Eng og'ir element qaysi?", a: ["Oltin", "Uran", "Osmiy", "Platina"], c: 2 },
        { q: "Inson tanasida nechta suyak bor?", a: ["206", "186", "226", "256"], c: 0 },
        { q: "Elektron qanday zaryadga ega?", a: ["Musbat", "Manfiy", "Neytral", "O'zgaruvchan"], c: 1 }
    ],
    history: [
        { q: "Amir Temur qachon tug'ilgan?", a: ["1336", "1346", "1356", "1366"], c: 0 },
        { q: "Birinchi jahon urushi qachon boshlangan?", a: ["1912", "1914", "1916", "1918"], c: 1 },
        { q: "Buyuk Ipak yo'li qayerdan boshlanadi?", a: ["Rim", "Xitoy", "Hindiston", "Eron"], c: 1 },
        { q: "O'zbekiston mustaqilligi qachon e'lon qilindi?", a: ["1990", "1991", "1992", "1993"], c: 1 },
        { q: "Samarqand necha yoshda?", a: ["2500+", "1500+", "3500+", "1000+"], c: 0 }
    ],
    tech: [
        { q: "HTML nimaning qisqartmasi?", a: ["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Mode Link", "Home Tool Markup Language"], c: 0 },
        { q: "JavaScript kim tomonidan yaratilgan?", a: ["Bill Gates", "Brendan Eich", "Mark Zuckerberg", "Linus Torvalds"], c: 1 },
        { q: "Birinchi iPhone qachon chiqdi?", a: ["2005", "2006", "2007", "2008"], c: 2 },
        { q: "Python dasturlash tili qachon yaratilgan?", a: ["1989", "1991", "1995", "2000"], c: 1 },
        { q: "RAM nimaning qisqartmasi?", a: ["Random Access Memory", "Read Access Memory", "Rapid Access Module", "Real Active Memory"], c: 0 }
    ],
    math: [
        { q: "Pi sonining qiymati taxminan necha?", a: ["3.14", "2.71", "1.41", "1.61"], c: 0 },
        { q: "2^10 nechaga teng?", a: ["512", "1024", "2048", "256"], c: 1 },
        { q: "Uchburchak ichki burchaklari yig'indisi?", a: ["180°", "360°", "90°", "270°"], c: 0 },
        { q: "Fibonachchi ketma-ketligidagi 7-son?", a: ["8", "13", "21", "5"], c: 1 },
        { q: "Kvadrat ildiz 144 nechaga teng?", a: ["11", "12", "13", "14"], c: 1 }
    ],
    language: [
        { q: "'Hello' so'zi qaysi tilda?", a: ["Ingliz", "Fransuz", "Nemis", "Ispan"], c: 0 },
        { q: "O'zbek alifbosida nechta harf bor?", a: ["29", "32", "33", "35"], c: 0 },
        { q: "'Gracias' qaysi tilda 'rahmat'?", a: ["Italyan", "Fransuz", "Ispan", "Portugaliya"], c: 2 },
        { q: "Dunyoda eng ko'p gaplashiladigan til?", a: ["Ingliz", "Xitoy", "Ispan", "Hindi"], c: 1 },
        { q: "'Konnichiwa' qaysi tilda salomlashish?", a: ["Koreys", "Xitoy", "Yapon", "Vetnam"], c: 2 }
    ]
};

// 🎯 QUANTUM UI MANAGER
class QuantumUI {
    constructor() {
        this.elements = {};
        this.animations = new Map();
        this.observers = new Map();
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupObservers();
        this.bindEvents();
        this.initAnimations();
    }

    cacheElements() {
        // Cache all important DOM elements
        this.elements = {
            loader: document.getElementById('quantumLoader'),
            app: document.getElementById('quantumApp'),
            sections: document.querySelectorAll('.quantum-section'),
            navTabs: document.querySelectorAll('.nav-tab'),
            miningReactor: document.querySelector('.reactor-core'),
            balanceValue: document.getElementById('miningBalance'),
            energyFill: document.getElementById('energyFill'),
            xpValue: document.getElementById('quantumXP'),
            goldValue: document.getElementById('quantumGold'),
            levelValue: document.getElementById('statLevel'),
            settingsModal: document.getElementById('settingsModal')
        };
    }

    setupObservers() {
        // Observe state changes
        QuantumApp.core.observe('user.xp', (xp) => {
            this.updateXP(xp);
            this.checkLevelUp();
        });

        QuantumApp.core.observe('user.gold', (gold) => {
            this.updateGold(gold);
        });

        QuantumApp.core.observe('mining.balance', (balance) => {
            this.updateBalance(balance);
        });

        QuantumApp.core.observe('user.energy', (energy) => {
            this.updateEnergy(energy);
        });
    }

    bindEvents() {
        // Navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                this.switchSection(section);
            });
        });

        // Mining reactor
        if (this.elements.miningReactor) {
            this.elements.miningReactor.addEventListener('click', () => {
                this.handleMiningClick();
            });
        }

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        // Settings toggles
        const toggles = document.querySelectorAll('.quantum-toggle input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.handleSettingToggle(toggle);
            });
        });
    }

    initAnimations() {
        // GSAP Animations
        this.animations.set('loaderOut', () => {
            gsap.to('#quantumLoader', {
                opacity: 0,
                visibility: 'hidden',
                duration: 0.5,
                ease: 'power2.inOut'
            });
        });

        this.animations.set('sectionSwitch', (section) => {
            gsap.from(`#section${section.charAt(0).toUpperCase() + section.slice(1)} > *`, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out'
            });
        });

        this.animations.set('miningClick', (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Create particle effect
            QuantumApp.particles.emit(x, y, 15, 'energy');

            // Reactor animation
            gsap.to('.reactor-core', {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });

            // Energy burst
            gsap.to('.reactor-glow', {
                scale: 1.2,
                opacity: 1,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
        });

        this.animations.set('levelUp', () => {
            gsap.timeline()
                .to('.quantum-avatar', {
                    scale: 1.2,
                    rotation: 360,
                    duration: 0.5,
                    ease: 'back.out(1.7)'
                })
                .to('.quantum-avatar', {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: 'power2.inOut'
                })
                .call(() => {
                    this.showNotification('Level Up!', 'success');
                });
        });
    }

    switchSection(section) {
        // Update navigation
        this.elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });

        // Update sections
        this.elements.sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `section${section.charAt(0).toUpperCase() + section.slice(1)}`);
        });

        // Update state
        QuantumState.ui.currentSection = section;

        // Play animation
        const animation = this.animations.get('sectionSwitch');
        if (animation) animation(section);

        // Haptic feedback
        QuantumApp.audio.play('quantum-tap', { vibrate: 50 });
    }

    handleMiningClick() {
        if (QuantumState.user.energy <= 0) {
            this.showNotification('Energiya yetarli emas!', 'error');
            return;
        }

        // Calculate mining
        const basePower = QuantumState.mining.tapPower;
        const multiplier = QuantumState.mining.multiplier;
        const isCrit = Math.random() * 100 < QuantumState.mining.critChance;
        const power = isCrit ? basePower * 2 : basePower;
        const amount = Math.floor(power * multiplier);

        // Update state
        QuantumState.mining.balance += amount;
        QuantumState.user.energy -= 1;
        QuantumState.user.gold += Math.floor(amount * 0.1);

        // Play effects
        const animation = this.animations.get('miningClick');
        if (animation) animation({ currentTarget: this.elements.miningReactor });

        // Show floating text
        this.showFloatingText(this.elements.miningReactor, `+${amount}`, isCrit ? 'gold' : 'energy');

        // Update UI
        this.updateBalance(QuantumState.mining.balance);
        this.updateEnergy(QuantumState.user.energy);
        this.updateGold(QuantumState.user.gold);

        // Check achievements
        this.checkMiningAchievements();

        // Play sound
        QuantumApp.audio.play('quantum-tap', { vibrate: 30 });
    }

    updateBalance(balance) {
        if (this.elements.balanceValue) {
            this.elements.balanceValue.textContent = this.formatNumber(balance);
        }
    }

    updateXP(xp) {
        if (this.elements.xpValue) {
            this.elements.xpValue.textContent = this.formatNumber(xp);
        }
    }

    updateGold(gold) {
        if (this.elements.goldValue) {
            this.elements.goldValue.textContent = this.formatNumber(gold);
        }
    }

    updateEnergy(energy) {
        if (this.elements.energyFill) {
            const percentage = (energy / QuantumState.user.maxEnergy) * 100;
            this.elements.energyFill.style.width = `${percentage}%`;
        }

        // Update energy text
        const energyValue = document.getElementById('energyValue');
        if (energyValue) {
            energyValue.textContent = `${energy}/${QuantumState.user.maxEnergy}`;
        }
    }

    updateLevel(level) {
        if (this.elements.levelValue) {
            this.elements.levelValue.textContent = level;
        }
    }

    checkLevelUp() {
        const currentLevel = QuantumState.user.level;
        const xpNeeded = this.getXPNeeded(currentLevel + 1);
        
        if (QuantumState.user.xp >= xpNeeded) {
            QuantumState.user.level++;
            QuantumState.user.maxEnergy += 100;
            
            // Play level up animation
            const animation = this.animations.get('levelUp');
            if (animation) animation();
            
            // Update UI
            this.updateLevel(QuantumState.user.level);
            
            // Add reward
            QuantumState.user.gold += 1000;
            this.updateGold(QuantumState.user.gold);
        }
    }

    getXPNeeded(level) {
        return Math.floor(level * 1000 * Math.pow(1.5, level - 1));
    }

    checkMiningAchievements() {
        const balance = QuantumState.mining.balance;
        
        // Check balance achievements
        if (balance >= 1000 && !QuantumState.gamification.achievements.includes('mining_1000')) {
            QuantumState.gamification.achievements.push('mining_1000');
            this.showNotification('🏆 Mining Master: 1000 coins!', 'achievement');
            QuantumState.user.xp += 500;
        }
        
        if (balance >= 10000 && !QuantumState.gamification.achievements.includes('mining_10000')) {
            QuantumState.gamification.achievements.push('mining_10000');
            this.showNotification('🏆 Mining Legend: 10000 coins!', 'achievement');
            QuantumState.user.xp += 2000;
        }
    }

    openSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('active');
            QuantumApp.audio.play('quantum-tap', { vibrate: 50 });
        }
    }

    closeSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('active');
        }
    }

    handleSettingToggle(toggle) {
        const setting = toggle.id.replace('Toggle', '');
        QuantumState.settings[setting] = toggle.checked;
        
        // Apply setting
        switch (setting) {
            case 'sound':
                QuantumApp.audio.enabled = toggle.checked;
                break;
            case 'haptic':
                // Haptic setting applied in audio engine
                break;
            case 'effects':
                QuantumApp.particles.enabled = toggle.checked;
                break;
            case 'darkMode':
                document.body.classList.toggle('dark-mode', toggle.checked);
                break;
        }
        
        // Save settings
        this.saveSettings();
        
        // Play feedback
        QuantumApp.audio.play('quantum-tap', { vibrate: 30 });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `quantum-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        gsap.fromTo(notification, 
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );

        // Remove after delay
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: -50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            achievement: 'trophy',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    showFloatingText(element, text, type = 'energy') {
        const floatingText = document.createElement('div');
        floatingText.className = `floating-text ${type}`;
        floatingText.textContent = text;

        const rect = element.getBoundingClientRect();
        floatingText.style.left = `${rect.left + rect.width / 2}px`;
        floatingText.style.top = `${rect.top}px`;

        document.body.appendChild(floatingText);

        gsap.timeline()
            .to(floatingText, {
                y: -50,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            })
            .to(floatingText, {
                y: -100,
                opacity: 0,
                duration: 0.7,
                ease: 'power2.in',
                onComplete: () => floatingText.remove()
            });
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    saveSettings() {
        localStorage.setItem('quantumSettings', JSON.stringify(QuantumState.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('quantumSettings');
        if (saved) {
            Object.assign(QuantumState.settings, JSON.parse(saved));
        }
    }
}

// 🎮 QUANTUM MINING MANAGER
class QuantumMining {
    constructor() {
        this.upgrades = {
            tap: {
                name: 'Tap Power',
                description: 'Har bir bosishda ko\'proq tanga',
                baseCost: 100,
                multiplier: 1.5,
                maxLevel: 100
            },
            energy: {
                name: 'Energy Capacity',
                description: 'Ko\'proq energiya zaxirasi',
                baseCost: 200,
                multiplier: 1.3,
                maxLevel: 50
            },
            auto: {
                name: 'Auto Mining',
                description: 'Avtomatik mining',
                baseCost: 1000,
                multiplier: 2,
                maxLevel: 20
            },
            luck: {
                name: 'Critical Chance',
                description: '2x ko\'proq tanga shansi',
                baseCost: 500,
                multiplier: 1.2,
                maxLevel: 75
            }
        };
        
        this.boosters = {
            energy_refill: {
                name: 'Energy Refill',
                description: 'Energiyani to\'ldirish',
                cost: 100,
                duration: 0,
                effect: () => {
                    QuantumState.user.energy = QuantumState.user.maxEnergy;
                    QuantumApp.ui.updateEnergy(QuantumState.user.energy);
                }
            },
            double_tap: {
                name: 'Double Tap',
                description: '2x tap power 5 daqiqa',
                cost: 500,
                duration: 300000,
                effect: () => {
                    QuantumState.mining.multiplier = 2;
                }
            },
            lucky_boost: {
                name: 'Lucky Boost',
                description: '50% crit chance 10 daqiqa',
                cost: 1000,
                duration: 600000,
                effect: () => {
                    QuantumState.mining.critChance = 50;
                }
            }
        };
    }

    getUpgradeCost(type) {
        const upgrade = this.upgrades[type];
        const level = QuantumState.mining.upgrades[type] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, level));
    }

    purchaseUpgrade(type) {
        const cost = this.getUpgradeCost(type);
        const upgrade = this.upgrades[type];
        const currentLevel = QuantumState.mining.upgrades[type] || 0;

        if (QuantumState.user.gold < cost) {
            QuantumApp.ui.showNotification('Oltin yetarli emas!', 'error');
            return false;
        }

        if (currentLevel >= upgrade.maxLevel) {
            QuantumApp.ui.showNotification('Maximum level ga yetdingiz!', 'error');
            return false;
        }

        // Purchase
        QuantumState.user.gold -= cost;
        QuantumState.mining.upgrades[type] = currentLevel + 1;

        // Apply effects
        this.applyUpgradeEffects(type);

        // Update UI
        QuantumApp.ui.updateGold(QuantumState.user.gold);
        this.renderShop();

        // Show notification
        QuantumApp.ui.showNotification(`${upgrade.name} upgraded to level ${currentLevel + 1}!`, 'success');
        QuantumApp.audio.play('levelup', { vibrate: 100 });

        return true;
    }

    applyUpgradeEffects(type) {
        switch (type) {
            case 'tap':
                QuantumState.mining.tapPower = 1 + (QuantumState.mining.upgrades.tap * 0.5);
                break;
            case 'energy':
                QuantumState.user.maxEnergy = 1000 + (QuantumState.mining.upgrades.energy * 200);
                break;
            case 'auto':
                QuantumState.mining.autoTapRate = QuantumState.mining.upgrades.auto * 0.1;
                this.startAutoMining();
                break;
            case 'luck':
                QuantumState.mining.critChance = 5 + (QuantumState.mining.upgrades.luck * 0.5);
                break;
        }
    }

    purchaseBooster(type) {
        const booster = this.boosters[type];

        if (QuantumState.user.gold < booster.cost) {
            QuantumApp.ui.showNotification('Oltin yetarli emas!', 'error');
            return false;
        }

        // Purchase
        QuantumState.user.gold -= booster.cost;

        // Apply effect
        booster.effect();

        // Update UI
        QuantumApp.ui.updateGold(QuantumState.user.gold);

        // Show notification
        QuantumApp.ui.showNotification(`${booster.name} activated!`, 'success');
        QuantumApp.audio.play('powerup', { vibrate: 80 });

        // Handle duration
        if (booster.duration > 0) {
            setTimeout(() => {
                this.removeBoosterEffect(type);
            }, booster.duration);
        }

        return true;
    }

    removeBoosterEffect(type) {
        switch (type) {
            case 'double_tap':
                QuantumState.mining.multiplier = 1;
                break;
            case 'lucky_boost':
                QuantumState.mining.critChance = 5 + (QuantumState.mining.upgrades.luck * 0.5);
                break;
        }
        
        QuantumApp.ui.showNotification(`${this.boosters[type].name} ended!`, 'info');
    }

    startAutoMining() {
        if (QuantumState.mining.autoTapRate > 0 && !QuantumState.mining.autoMining.active) {
            QuantumState.mining.autoMining.active = true;
            
            const autoMineInterval = setInterval(() => {
                if (QuantumState.mining.autoTapRate > 0 && QuantumState.user.energy > 0) {
                    const amount = Math.floor(QuantumState.mining.tapPower * QuantumState.mining.multiplier);
                    QuantumState.mining.balance += amount;
                    QuantumState.mining.autoMining.amount += amount;
                    
                    QuantumApp.ui.updateBalance(QuantumState.mining.balance);
                    
                    // Show auto mining indicator
                    const autoContainer = document.getElementById('autoMiningContainer');
                    if (autoContainer) {
                        autoContainer.style.display = 'flex';
                        document.getElementById('autoAmount').textContent = this.formatNumber(QuantumState.mining.autoMining.amount);
                    }
                } else {
                    clearInterval(autoMineInterval);
                    QuantumState.mining.autoMining.active = false;
                }
            }, 1000);
        }
    }

    claimAutoMining() {
        if (QuantumState.mining.autoMining.amount > 0) {
            const amount = QuantumState.mining.autoMining.amount;
            QuantumState.user.gold += Math.floor(amount * 0.1);
            QuantumState.user.xp += Math.floor(amount * 0.05);
            
            QuantumState.mining.autoMining.amount = 0;
            
            // Update UI
            QuantumApp.ui.updateGold(QuantumState.user.gold);
            QuantumApp.ui.updateXP(QuantumState.user.xp);
            
            // Hide auto mining container
            const autoContainer = document.getElementById('autoMiningContainer');
            if (autoContainer) {
                autoContainer.style.display = 'none';
            }
            
            // Show notification
            QuantumApp.ui.showNotification(`Claimed ${this.formatNumber(amount)} coins!`, 'success');
            QuantumApp.audio.play('coin', { vibrate: 60 });
        }
    }

    renderShop() {
        const upgradesGrid = document.getElementById('upgradesGrid');
        if (!upgradesGrid) return;

        let html = '';

        // Render upgrades
        Object.entries(this.upgrades).forEach(([type, upgrade]) => {
            const level = QuantumState.mining.upgrades[type] || 0;
            const cost = this.getUpgradeCost(type);
            const canAfford = QuantumState.user.gold >= cost;
            const isMaxLevel = level >= upgrade.maxLevel;

            html += `
                <div class="upgrade-card ${isMaxLevel ? 'maxed' : ''} ${!canAfford ? 'disabled' : ''}">
                    <div class="upgrade-header">
                        <div class="upgrade-icon">
                            <i class="fas fa-${this.getUpgradeIcon(type)}"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>${upgrade.name}</h4>
                            <p>${upgrade.description}</p>
                        </div>
                    </div>
                    <div class="upgrade-stats">
                        <div class="upgrade-level">Level ${level}/${upgrade.maxLevel}</div>
                        <div class="upgrade-cost">
                            <i class="fas fa-coins"></i>
                            ${this.formatNumber(cost)}
                        </div>
                    </div>
                    <button class="upgrade-btn" onclick="QuantumMining.purchaseUpgrade('${type}')" ${isMaxLevel || !canAfford ? 'disabled' : ''}>
                        ${isMaxLevel ? 'MAX' : 'Upgrade'}
                    </button>
                </div>
            `;
        });

        // Render boosters
        Object.entries(this.boosters).forEach(([type, booster]) => {
            const canAfford = QuantumState.user.gold >= booster.cost;

            html += `
                <div class="booster-card ${!canAfford ? 'disabled' : ''}">
                    <div class="booster-header">
                        <div class="booster-icon">
                            <i class="fas fa-${this.getBoosterIcon(type)}"></i>
                        </div>
                        <div class="booster-info">
                            <h4>${booster.name}</h4>
                            <p>${booster.description}</p>
                        </div>
                    </div>
                    <div class="booster-cost">
                        <i class="fas fa-coins"></i>
                        ${this.formatNumber(booster.cost)}
                    </div>
                    <button class="booster-btn" onclick="QuantumMining.purchaseBooster('${type}')" ${!canAfford ? 'disabled' : ''}>
                        Buy
                    </button>
                </div>
            `;
        });

        upgradesGrid.innerHTML = html;
    }

    getUpgradeIcon(type) {
        const icons = {
            tap: 'hand-pointer',
            energy: 'battery-full',
            auto: 'robot',
            luck: 'dice'
        };
        return icons[type] || 'star';
    }

    getBoosterIcon(type) {
        const icons = {
            energy_refill: 'battery-three-quarters',
            double_tap: 'hand-sparkles',
            lucky_boost: 'clover'
        };
        return icons[type] || 'star';
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// 🤖 QUANTUM AI MANAGER
class QuantumAI {
    constructor() {
        this.context = [];
        this.memory = [];
        this.models = new Map();
        this.init();
    }

    init() {
        this.models.set('quiz', {
            endpoint: '/api/ai-quiz',
            temperature: 0.7,
            maxTokens: 2000
        });
        
        this.models.set('analysis', {
            endpoint: '/api/analyze-text',
            temperature: 0.3,
            maxTokens: 1500
        });
        
        this.models.set('chat', {
            endpoint: '/api/ai-chat',
            temperature: 0.8,
            maxTokens: 1000
        });
    }

    async generateQuiz(topic, difficulty, count) {
        // Always use mock for now to ensure functionality
        return this.generateMockQuiz(topic, difficulty, count);
        
        try {
            const model = this.models.get('quiz');
            const response = await fetch(model.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    count,
                    language: 'uz'
                })
            });

            if (!response.ok) throw new Error('AI request failed');
            
            const data = await response.json();
            return data.success ? data.quiz : null;
        } catch (error) {
            console.error('Quiz generation error:', error);
            return this.generateMockQuiz(topic, difficulty, count);
        }
    }

    async analyzeText(text, action) {
        try {
            const model = this.models.get('analysis');
            const response = await fetch(model.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, action })
            });

            if (!response.ok) throw new Error('Analysis request failed');
            
            const data = await response.json();
            return data.success ? data.result : null;
        } catch (error) {
            console.error('Text analysis error:', error);
            return 'Analysis unavailable. Please try again.';
        }
    }

    async chat(message, context = []) {
        try {
            const model = this.models.get('chat');
            const response = await fetch(model.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context,
                    mode: 'tutor'
                })
            });

            if (!response.ok) throw new Error('Chat request failed');
            
            const data = await response.json();
            return data.success ? data.reply : 'AI response unavailable.';
        } catch (error) {
            console.error('Chat error:', error);
            return 'I apologize, but I\'m unable to respond right now.';
        }
    }

    generateMockQuiz(topic, difficulty, count) {
        const mockQuestions = {
            general: [
                {
                    question: "O'zbekiston poytaxti qaysi shahar?",
                    options: ["Toshkent", "Samarqand", "Buxoro", "Xiva"],
                    correct: 0,
                    explanation: "Toshkent O'zbekistonning poytaxti hisoblanadi."
                },
                {
                    question: "Dunyodagi eng uzun daryo qaysi?",
                    options: ["Amudaryo", "Sirdaryo", "Nil", "Amazonka"],
                    correct: 3,
                    explanation: "Amazonka dunyodagi eng uzun daryodir."
                },
                {
                    question: "Yil qancha oydan iborat?",
                    options: ["10", "11", "12", "13"],
                    correct: 2,
                    explanation: "Yil 12 oydan iborat."
                },
                {
                    question: "Eng katta qit'a qaysi?",
                    options: ["Afrika", "Osiyo", "Yevropa", "Amerika"],
                    correct: 1,
                    explanation: "Osiyo eng katta qit'adir."
                },
                {
                    question: "Oy qancha kundan iborat?",
                    options: ["28", "29", "30", "31"],
                    correct: 2,
                    explanation: "Oy o'rtacha 30 kundan iborat."
                }
            ],
            science: [
                {
                    question: "Suvning kimyoviy formulasi nima?",
                    options: ["H2O", "CO2", "O2", "N2"],
                    correct: 0,
                    explanation: "Suv ikki vodorod va bir kisloroddan iborat."
                },
                {
                    question: "Yorug'lik tezligi nechchi?",
                    options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
                    correct: 0,
                    explanation: "Yorug'lik tezligi 299,792 km/s."
                },
                {
                    question: "Quyosh tizimida nechta sayyora bor?",
                    options: ["7", "8", "9", "10"],
                    correct: 1,
                    explanation: "Quyosh tizimida 8 ta sayyora bor."
                }
            ],
            tech: [
                {
                    question: "HTML qisqartmasi nima degani?",
                    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
                    correct: 0,
                    explanation: "HTML veb-sahifalarni yaratish uchun ishlatiladigan markup tilidir."
                },
                {
                    question: "JavaScript qachon yaratilgan?",
                    options: ["1993", "1995", "1997", "1999"],
                    correct: 1,
                    explanation: "JavaScript 1995 yilda yaratilgan."
                },
                {
                    question: "CSS nima uchun ishlatiladi?",
                    options: ["Database", "Styling", "Server", "Security"],
                    correct: 1,
                    explanation: "CSS veb-sahifalarni stilizatsiya qilish uchun ishlatiladi."
                }
            ],
            history: [
                {
                    question: "Amir Temur qachon tug'ilgan?",
                    options: ["1336", "1346", "1356", "1366"],
                    correct: 0,
                    explanation: "Amir Temur 1336 yilda tug'ilgan."
                },
                {
                    question: "Buyuk Ipak yo'li qaysi asrlarda faol bo'lgan?",
                    options: ["1-5 asrlar", "5-15 asrlar", "15-20 asrlar", "20-25 asrlar"],
                    correct: 1,
                    explanation: "Buyuk Ipak yo'li 5-15 asrlarda faol bo'lgan."
                }
            ],
            math: [
                {
                    question: "2 + 2 * 2 nechchi?",
                    options: ["8", "6", "4", "10"],
                    correct: 1,
                    explanation: "2 + 2 * 2 = 2 + 4 = 6."
                },
                {
                    question: "Pi soni taxminan nechchi?",
                    options: ["2.14", "3.14", "4.14", "5.14"],
                    correct: 1,
                    explanation: "Pi soni taxminan 3.14 ga teng."
                }
            ]
        };

        const questions = mockQuestions[topic] || mockQuestions.general;
        const result = [];
        
        // Create array of questions and shuffle
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        
        // Take requested count
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            result.push(shuffled[i]);
        }
        
        return result;
    }
}

// ============================================
// NEXUS QUANTUM APP INITIALIZATION (Enhanced with Nexus Bot)
// ============================================

// Enhanced QuantumApp with Nexus Bot integration
const QuantumApp = {
    core: new QuantumCore(),
    ui: new QuantumUI(),
    mining: new QuantumMining(),
    ai: new QuantumAI(),
    
    init() {
        console.log('🚀 Initializing Quantum App with Nexus Bot features...');
        
        // Initialize all systems
        this.ui.init();
        this.mining.init();
        this.ai.init();
        
        // Load saved data
        this.loadGameData();
        
        // Initialize Nexus Bot components
        this.initNexusBot();
        
        // Start game loops
        this.startGameLoops();
        
        // Update UI
        this.ui.updateBalance(QuantumState.mining.balance);
        this.ui.updateXP(QuantumState.user.xp);
        this.ui.updateGold(QuantumState.user.gold);
        this.ui.updateEnergy(QuantumState.user.energy);
        this.ui.updateLevel(QuantumState.user.level);
        
        // Hide loader
        setTimeout(() => {
            const loader = document.getElementById('quantumLoader');
            if (loader) {
                loader.style.display = 'none';
            }
        }, 2000);
        
        console.log('✅ Quantum App with Nexus Bot Initialized');
    },
    
    initNexusBot() {
        // Initialize particle system
        const particleCanvas = document.getElementById('particleCanvas');
        if (particleCanvas) {
            particles = new ParticleSystem(particleCanvas);
            particles.update();
        }
        
        // Initialize audio
        audio.init();
        
        // Apply upgrade effects
        applyUpgradeEffects();
        
        // Check achievements
        checkAchievements();
        
        // Setup event listeners
        this.setupNexusBotEvents();
    },
    
    setupNexusBotEvents() {
        // Reactor tap
        const reactorCore = document.getElementById('reactorCore');
        if (reactorCore) {
            reactorCore.addEventListener('click', handleTap);
            reactorCore.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleTap(e.touches[0]);
            });
        }
        
        // Claim button
        const claimBtn = document.getElementById('claimBtn');
        if (claimBtn) {
            claimBtn.addEventListener('click', claimAutoTapEarnings);
        }
        
        // Quiz buttons
        const startQuizBtn = document.getElementById('startQuizBtn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', startQuiz);
        }
        
        // Shop buttons
        document.querySelectorAll('.upgrade-item').forEach(el => {
            el.addEventListener('click', () => {
                const type = el.dataset.upgrade;
                if (type) purchaseUpgrade(type);
            });
        });
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
        
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },
    
    loadGameData() {
        // Load from localStorage
        const saved = localStorage.getItem('quantumState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(QuantumState, parsed);
            } catch (e) {
                console.error('Failed to load saved data:', e);
            }
        }
        
        // Load from Nexus Bot state if available
        if (window.state && window.state.state) {
            const nexusState = window.state.state;
            
            // Map Nexus Bot state to Quantum State
            QuantumState.user = {
                ...QuantumState.user,
                ...nexusState.user,
                gameCoins: nexusState.gameCoins || 0,
                totalTaps: nexusState.totalTaps || 0,
                totalGoldEarned: nexusState.totalGoldEarned || 0,
                prestigeLevel: nexusState.prestigeLevel || 0,
                achievements: nexusState.achievements || [],
                ownedSkins: nexusState.ownedSkins || ['skin_default'],
                currentSkin: nexusState.currentSkin || 'skin_default',
                activeEffects: nexusState.activeEffects || []
            };
            
            QuantumState.mining = {
                ...QuantumState.mining,
                ...nexusState.mining
            };
            
            QuantumState.quiz.stats = nexusState.quizStats || { total: 0, correct:0, streak: 0 };
            QuantumState.gamification.achievements = nexusState.achievements || [];
        }
    },
    
    saveGameData() {
        localStorage.setItem('quantumState', JSON.stringify(QuantumState));
        
        // Also save to Nexus Bot state if available
        if (window.state && window.state.update) {
            window.state.update({
                user: QuantumState.user,
                mining: QuantumState.mining,
                quizStats: QuantumState.quiz.stats,
                achievements: QuantumState.gamification.achievements
            });
        }
    },
    
    startGameLoops() {
        // Energy regeneration
        setInterval(() => {
            if (QuantumState.user.energy < QuantumState.user.maxEnergy) {
                QuantumState.user.energy = Math.min(
                    QuantumState.user.energy + 1,
                    QuantumState.user.maxEnergy
                );
                this.ui.updateEnergy(QuantumState.user.energy);
            }
        }, 1000);
        
        // Auto-tap
        setInterval(() => {
            autoTap();
        }, 1000);
        
        // Auto-save
        setInterval(() => {
            this.saveGameData();
        }, 30000);
        
        // Auto-mining
        this.mining.startAutoMining();
    }
};

// 🎯 Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuantumApp.init());
} else {
    QuantumApp.init();
}

// 🌍 Global functions for HTML onclick handlers
window.QuantumMining = new QuantumMining();
window.QuantumAI = new QuantumAI();

// ============================================
// ADDITIONAL FUNCTIONS FOR FULL FUNCTIONALITY
// ============================================

// Quiz Functions
function startQuiz() {
    const topic = document.querySelector('.topic-btn.active').dataset.topic;
    const difficulty = document.querySelector('.diff-btn.active').dataset.difficulty;
    const count = parseInt(document.querySelector('.count-btn.active').dataset.count);
    
    QuantumState.quiz.active = true;
    QuantumState.quiz.topic = topic;
    QuantumState.quiz.difficulty = difficulty;
    QuantumState.quiz.count = count;
    QuantumState.quiz.current = 0;
    QuantumState.quiz.score = 0;
    
    // Generate questions
    QuantumAI.generateQuiz(topic, difficulty, count).then(questions => {
        QuantumState.quiz.questions = questions;
        showQuizInterface();
    });
}

function showQuizInterface() {
    const configContainer = document.querySelector('.quiz-config');
    const startContainer = document.querySelector('.quiz-start-container');
    const activeContainer = document.getElementById('quizActiveContainer');
    
    configContainer.style.display = 'none';
    startContainer.style.display = 'none';
    activeContainer.style.display = 'block';
    
    displayQuizQuestion();
}

function displayQuizQuestion() {
    const question = QuantumState.quiz.questions[QuantumState.quiz.current];
    const questionText = document.getElementById('questionText');
    const answersContainer = document.getElementById('quizAnswersContainer');
    const currentNum = document.getElementById('currentQuestion');
    const totalNum = document.getElementById('totalQuestions');
    const progressFill = document.getElementById('quizProgressFill');
    
    questionText.textContent = question.question;
    currentNum.textContent = QuantumState.quiz.current + 1;
    totalNum.textContent = QuantumState.quiz.questions.length;
    progressFill.style.width = `${((QuantumState.quiz.current + 1) / QuantumState.quiz.questions.length) * 100}%`;
    
    answersContainer.innerHTML = question.options.map((option, index) => `
        <button class="quiz-answer" onclick="selectQuizAnswer(${index})">
            ${option}
        </button>
    `).join('');
}

function selectQuizAnswer(answerIndex) {
    const question = QuantumState.quiz.questions[QuantumState.quiz.current];
    const isCorrect = answerIndex === question.correct;
    
    // Update score
    if (isCorrect) {
        QuantumState.quiz.score++;
        QuantumState.user.xp += 50;
        QuantumState.user.gold += 100;
        QuantumApp.ui.updateXP(QuantumState.user.xp);
        QuantumApp.ui.updateGold(QuantumState.user.gold);
    }
    
    // Show feedback
    const answers = document.querySelectorAll('.quiz-answer');
    answers[answerIndex].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        answers[question.correct].classList.add('correct');
    }
    
    // Disable all answers
    answers.forEach(answer => answer.onclick = null);
    
    // Next question after delay
    setTimeout(() => {
        QuantumState.quiz.current++;
        if (QuantumState.quiz.current < QuantumState.quiz.questions.length) {
            displayQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 2000);
}

function showQuizResults() {
    const activeContainer = document.getElementById('quizActiveContainer');
    const percentage = Math.round((QuantumState.quiz.score / QuantumState.quiz.questions.length) * 100);
    
    activeContainer.innerHTML = `
        <div class="quiz-results">
            <h3>Quiz Complete!</h3>
            <div class="score-display">
                <div class="score-circle">${percentage}%</div>
                <p>You got ${QuantumState.quiz.score} out of ${QuantumState.quiz.questions.length} correct!</p>
            </div>
            <button class="quantum-start-quiz" onclick="resetQuiz()">
                Try Another Quiz
            </button>
        </div>
    `;
    
    // Add achievement if perfect score
    if (percentage === 100) {
        if (!QuantumState.gamification.achievements.includes('quiz_master')) {
            QuantumState.gamification.achievements.push('quiz_master');
            QuantumApp.ui.showNotification('🏆 Quiz Master Achievement!', 'achievement');
        }
    }
}

function resetQuiz() {
    QuantumState.quiz.active = false;
    location.reload(); // Simple reload for now
}

// Shop Functions
function switchShopTab(tab) {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Render content based on tab
    if (tab === 'upgrades') {
        renderShop();
    } else {
        // Render boosters
        renderBoosters();
    }
}

function renderBoosters() {
    const grid = document.getElementById('upgradesGrid');
    const boosters = [
        { type: 'energy_refill', name: 'Energy Refill', description: 'Full energy restore', cost: 100, icon: 'battery-three-quarters' },
        { type: 'double_tap', name: 'Double Tap', description: '2x power for 5 minutes', cost: 500, icon: 'hand-sparkles' },
        { type: 'lucky_boost', name: 'Lucky Boost', description: '50% crit for 10 minutes', cost: 1000, icon: 'clover' }
    ];
    
    grid.innerHTML = boosters.map(booster => `
        <div class="booster-card">
            <div class="booster-header">
                <div class="booster-icon">
                    <i class="fas fa-${booster.icon}"></i>
                </div>
                <div class="booster-info">
                    <h4>${booster.name}</h4>
                    <p>${booster.description}</p>
                </div>
            </div>
            <div class="booster-cost">
                <i class="fas fa-coins"></i>
                ${booster.cost}
            </div>
            <button class="booster-btn" onclick="purchaseBooster('${booster.type}')">
                Buy
            </button>
        </div>
    `).join('');
}

// Gamification Functions
function switchGamTab(tab) {
    const tabs = document.querySelectorAll('.gam-tab');
    const contents = document.querySelectorAll('.gam-tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // Load content
    if (tab === 'achievements') {
        renderAchievements();
    } else if (tab === 'leaderboard') {
        renderLeaderboard();
    } else if (tab === 'daily') {
        renderDailyChallenges();
    }
}

// ============================================
// NEXUS BOT CORE FUNCTIONS (Enhanced)
// ============================================

// State Management
class StateManager {
    constructor() {
        this.state = this.loadState();
        this.subscribers = [];
    }

    getDefaultState() {
        return {
            user: { id: 0, name: 'Foydalanuvchi', username: '', isPremium: false, isAdmin: false, referralCode: null, referralsCount: 0, referredBy: null },
            gold: 0,
            xp: 0,
            level: 1,
            energy: 1000,
            maxEnergy: 1000,
            tapPower: 1,
            autoTapRate: 0,
            critChance: 5,
            critMultiplier: 2,
            streak: 0,
            lastActive: null,
            totalTaps: 0,
            totalGoldEarned: 0,
            prestigeLevel: 0,
            darkMatter: 0,
            upgrades: { tapPower: 0, autoTap: 0, energy: 0, crit: 0, luck: 0 },
            achievements: [],
            dailyChallenges: [],
            lastChallengeReset: null,
            quizStats: { total: 0, correct: 0, streak: 0 },
            settings: { sound: true, haptic: true, theme: 'default' },
            notifications: [],
            gameCoins: 0,
            rpgGold: 0,
            accumulatedCoins: 0,
            activeEffects: [],
            ownedSkins: ['skin_default'],
            currentSkin: 'skin_default',
            offlineMode: false
        };
    }

    loadState() {
        try {
            const saved = localStorage.getItem('nexus_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...this.getDefaultState(), ...parsed };
            }
        } catch (e) {
            console.error('State load error:', e);
        }
        return this.getDefaultState();
    }

    saveState() {
        try {
            localStorage.setItem('nexus_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('State save error:', e);
        }
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.notify();
        this.saveState();
    }

    update(updates) {
        Object.assign(this.state, updates);
        this.notify();
        this.saveState();
    }

    subscribe(fn) {
        this.subscribers.push(fn);
    }

    notify() {
        this.subscribers.forEach(fn => fn(this.state));
    }
}

// Audio Engine (Nexus Bot)
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sounds = {};
        const resumeAudio = () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                });
            }
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('touchstart', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    createSounds() {
        this.sounds = {
            tap: [
                { type: 'sine', freq: 620, duration: 0.14, volume: 0.28, glide: [{ time: 0.08, freq: 520 }] },
                { type: 'triangle', freq: 1240, duration: 0.08, volume: 0.15 }
            ],
            critical: [
                { type: 'square', freq: 950, duration: 0.22, volume: 0.35, glide: [{ time: 0.1, freq: 1500 }] },
                { noise: true, duration: 0.15, volume: 0.08, filter: { type: 'bandpass', frequency: 2400 } }
            ],
            upgrade: [
                { type: 'sine', freq: 540, duration: 0.2, volume: 0.25, glide: [{ time: 0.15, freq: 780 }] },
                { type: 'triangle', freq: 1080, duration: 0.18, volume: 0.18 }
            ],
            levelUp: [
                { type: 'sine', freq: 523, duration: 0.15, volume: 0.3, glide: [{ time: 0.1, freq: 659 }] },
                { type: 'sine', freq: 784, duration: 0.25, volume: 0.22 },
                { noise: true, duration: 0.12, volume: 0.05, filter: { type: 'highpass', frequency: 1800 } }
            ],
            achievement: [
                { type: 'triangle', freq: 784, duration: 0.18, volume: 0.25 },
                { type: 'triangle', freq: 988, duration: 0.2, volume: 0.22 },
                { type: 'triangle', freq: 1175, duration: 0.22, volume: 0.2 }
            ],
            error: [
                { type: 'sawtooth', freq: 260, duration: 0.25, volume: 0.2, glide: [{ time: 0.2, freq: 120 }] },
                { noise: true, duration: 0.2, volume: 0.07, filter: { type: 'lowpass', frequency: 600 } }
            ]
        };
    }

    play(name) {
        if (!QuantumState.settings.sound) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const soundDef = this.sounds[name];
        if (!soundDef) return;

        const tones = Array.isArray(soundDef) ? soundDef : [soundDef];
        tones.forEach(tone => this.playTone(tone));
    }

    playTone(tone) {
        const now = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        const duration = tone.duration || 0.2;
        let source;

        if (tone.noise) {
            const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            source = this.ctx.createBufferSource();
            source.buffer = buffer;
        } else {
            source = this.ctx.createOscillator();
            source.type = tone.type || 'sine';
            source.frequency.setValueAtTime(tone.freq || 440, now);
            if (tone.glide) {
                tone.glide.forEach(({ time, freq }) => {
                    source.frequency.linearRampToValueAtTime(freq, now + time);
                });
            }
        }

        let chain = source;

        if (tone.filter) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = tone.filter.type;
            filter.frequency.value = tone.filter.frequency;
            chain.connect(filter);
            chain = filter;
        }

        chain.connect(gain);
        gain.connect(this.ctx.destination);

        const volume = tone.volume ?? 0.25;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        source.start(now);
        source.stop(now + duration);
    }
}

// Particle System (Nexus Bot)
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    emit(x, y, count = 10, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 4,
                color
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= p.decay;
            
            if (p.life <= 0) return false;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            
            return true;
        });
        
        requestAnimationFrame(() => this.update());
    }
}

// Initialize Nexus Bot components
const state = new StateManager();
const audio = new AudioEngine();
let particles = null;

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function haptic(type = 'light') {
    if (!QuantumState.settings.haptic || !window.Telegram?.WebApp?.HapticFeedback) return;
    
    switch(type) {
        case 'light': window.Telegram.WebApp.HapticFeedback.impactOccurred('light'); break;
        case 'medium': window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'); break;
        case 'heavy': window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy'); break;
        case 'success': window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); break;
        case 'error': window.Telegram.WebApp.HapticFeedback.notificationOccurred('error'); break;
    }
}

// ============================================
// NEXUS BOT ADVANCED FUNCTIONS
// ============================================

// Mining Functions (Enhanced)
function handleTap(e) {
    const energy = QuantumState.user.energy;
    if (energy <= 0) {
        showToast('Energiya tugadi!', 'warning');
        haptic('error');
        return;
    }
    
    audio.init();
    
    const isCritical = Math.random() * 100 < QuantumState.mining.critChance;
    const baseGold = QuantumState.mining.tapPower;
    const goldEarned = isCritical ? baseGold * QuantumState.mining.critMultiplier : baseGold;
    const xpEarned = isCritical ? 2 : 1;
    
    // Update Quantum State
    QuantumState.user.gameCoins = (QuantumState.user.gameCoins || 0) + goldEarned;
    QuantumState.user.xp += xpEarned;
    QuantumState.user.energy = energy - 1;
    QuantumState.user.totalTaps = (QuantumState.user.totalTaps || 0) + 1;
    QuantumState.user.totalGoldEarned = (QuantumState.user.totalGoldEarned || 0) + goldEarned;
    
    // Visual feedback
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);
    
    showClickEffect(x, y, goldEarned, isCritical);
    
    if (particles) {
        particles.emit(x, y, isCritical ? 20 : 8, isCritical ? '#ff006e' : '#ffd700');
    }
    
    if (isCritical) {
        document.getElementById('reactorCore').classList.add('critical');
        setTimeout(() => document.getElementById('reactorCore').classList.remove('critical'), 300);
        audio.play('critical');
        haptic('heavy');
    } else {
        audio.play('tap');
        haptic('light');
    }
    
    checkAchievements();
    checkLevelUp();
    updateUI();
}

function showClickEffect(x, y, amount, isCritical) {
    const el = document.createElement('div');
    el.className = 'click-effect';
    el.textContent = `+${amount}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    if (isCritical) {
        el.style.color = '#ff006e';
        el.style.fontSize = '28px';
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function checkLevelUp() {
    const xp = QuantumState.user.xp;
    const level = QuantumState.user.level;
    const xpNeeded = level * 1000;
    
    if (xp >= xpNeeded) {
        QuantumState.user.level = level + 1;
        QuantumState.user.xp = xp - xpNeeded;
        showToast(`🎉 ${level + 1}-darajaga ko'tarildingiz!`, 'success');
        haptic('success');
        audio.play('levelUp');
        checkAchievements();
    }
}

function checkAchievements() {
    const unlocked = QuantumState.gamification.achievements || [];
    const stateData = {
        totalTaps: QuantumState.user.totalTaps,
        totalGoldEarned: QuantumState.user.totalGoldEarned,
        level: QuantumState.user.level,
        streak: QuantumState.user.streak,
        prestigeLevel: QuantumState.user.prestigeLevel,
        quizStats: QuantumState.quiz.stats
    };
    
    ACHIEVEMENTS.forEach(ach => {
        if (!unlocked.includes(ach.id) && ach.condition(stateData)) {
            unlocked.push(ach.id);
            QuantumState.gamification.achievements = unlocked;
            showToast(`🏆 Yutuq: ${ach.name}`, 'success');
            haptic('success');
            audio.play('achievement');
        }
    });
}

function regenerateEnergy() {
    const energy = QuantumState.user.energy;
    const maxEnergy = QuantumState.user.maxEnergy;
    
    if (energy < maxEnergy) {
        QuantumState.user.energy = Math.min(energy + CONFIG.ENERGY_REGEN_RATE, maxEnergy);
        updateEnergyBar();
    }
}

function autoTap() {
    const rate = QuantumState.mining.autoTapRate;
    if (rate <= 0) return;
    
    const energy = QuantumState.user.energy;
    if (energy <= 0) return;
    
    const goldEarned = rate;
    
    QuantumState.user.accumulatedCoins = (QuantumState.user.accumulatedCoins || 0) + goldEarned;
    QuantumState.user.energy = energy - 1;
    QuantumState.user.totalGoldEarned = (QuantumState.user.totalGoldEarned || 0) + goldEarned;
    
    updateUI();
}

function claimAutoTapEarnings() {
    const accumulated = QuantumState.user.accumulatedCoins || 0;
    if (accumulated <= 0) return;
    
    QuantumState.user.gameCoins = (QuantumState.user.gameCoins || 0) + accumulated;
    QuantumState.user.accumulatedCoins = 0;
    
    showToast(`+${formatNumber(accumulated)} coin olindi!`, 'success');
    haptic('success');
    audio.play('achievement');
    updateUI();
}

function updateEnergyBar() {
    const energy = QuantumState.user.energy;
    const maxEnergy = QuantumState.user.maxEnergy;
    const percent = (energy / maxEnergy) * 100;
    
    const fill = document.getElementById('energyFill');
    if (fill) {
        fill.style.width = `${percent}%`;
        fill.classList.toggle('low', percent < 20);
    }
    
    const energyText = document.getElementById('energyText');
    if (energyText) {
        energyText.textContent = `${energy}/${maxEnergy}`;
    }
}

function updateUI() {
    // Update header
    const userName = document.getElementById('userName');
    if (userName) userName.textContent = QuantumState.user.name;
    
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) userAvatar.textContent = QuantumState.user.name.charAt(0).toUpperCase();
    
    // Update stats
    const miningBalance = document.getElementById('miningBalance');
    if (miningBalance) miningBalance.textContent = formatNumber(QuantumState.user.gameCoins || 0);
    
    const xpValue = document.getElementById('quantumXP');
    if (xpValue) xpValue.textContent = formatNumber(QuantumState.user.xp);
    
    const goldValue = document.getElementById('quantumGold');
    if (goldValue) goldValue.textContent = formatNumber(QuantumState.user.gold);
    
    const statLevel = document.getElementById('statLevel');
    if (statLevel) statLevel.textContent = QuantumState.user.level;
    
    // Update energy
    updateEnergyBar();
    
    // Update claim button
    const claimContainer = document.getElementById('claimContainer');
    const claimAmount = document.getElementById('claimAmount');
    if (claimContainer && claimAmount) {
        if (QuantumState.user.accumulatedCoins > 0) {
            claimContainer.style.display = 'flex';
            claimAmount.textContent = formatNumber(QuantumState.user.accumulatedCoins);
        } else {
            claimContainer.style.display = 'none';
        }
    }
}

// Shop Functions (Enhanced)
function getUpgradeCost(type) {
    const upgrade = UPGRADES[type];
    const level = QuantumState.mining.upgrades[type] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

function purchaseUpgrade(type) {
    const cost = getUpgradeCost(type);
    const gameCoins = QuantumState.user.gameCoins || 0;
    
    if (gameCoins < cost) {
        showToast('Yetarli coin yo\'q!', 'error');
        haptic('error');
        audio.play('error');
        return false;
    }
    
    QuantumState.mining.upgrades[type] = (QuantumState.mining.upgrades[type] || 0) + 1;
    QuantumState.user.gameCoins = gameCoins - cost;
    
    applyUpgradeEffects();
    showToast(`${UPGRADES[type].name} yangilandi!`, 'success');
    haptic('success');
    audio.play('levelUp');
    renderShop();
    updateUI();
    
    return true;
}

function applyUpgradeEffects() {
    const upgrades = QuantumState.mining.upgrades;
    QuantumState.mining.tapPower = UPGRADES.tapPower.effect(upgrades.tapPower);
    QuantumState.mining.autoTapRate = UPGRADES.autoTap.effect(upgrades.autoTap);
    QuantumState.user.maxEnergy = UPGRADES.energy.effect(upgrades.energy);
    QuantumState.mining.critChance = UPGRADES.crit.effect(upgrades.crit);
}

function buyShopItem(id, type) {
    const gameCoins = QuantumState.user.gameCoins || 0;
    let item;
    
    if (type === 'booster') {
        item = SHOP_ITEMS.boosters.find(i => i.id === id);
    } else {
        item = SHOP_ITEMS.skins.find(i => i.id === id);
    }
    
    if (!item) return;
    
    if (gameCoins < item.cost) {
        showToast('Coin yetarli emas!', 'error');
        return;
    }
    
    // Purchase logic
    if (type === 'skin') {
        const ownedSkins = QuantumState.user.ownedSkins || ['skin_default'];
        if (ownedSkins.includes(id)) {
            // Equip
            QuantumState.user.currentSkin = id;
            showToast(`${item.name} o'rnatildi!`, 'success');
        } else {
            QuantumState.user.gameCoins = gameCoins - item.cost;
            QuantumState.user.ownedSkins = [...ownedSkins, id];
            QuantumState.user.currentSkin = id;
            showToast(`${item.name} sotib olindi!`, 'success');
        }
    } else {
        // Booster
        if (item.refill) {
            QuantumState.user.gameCoins = gameCoins - item.cost;
            QuantumState.user.energy = QuantumState.user.maxEnergy;
            showToast('Energiya to\'ldirildi!', 'success');
        } else {
            const effects = QuantumState.user.activeEffects || [];
            const existing = effects.find(e => e.id === id);
            
            let newEffects;
            const now = Date.now();
            
            if (existing) {
                newEffects = effects.map(e => e.id === id ? { ...e, endTime: e.endTime + item.duration * 1000 } : e);
            } else {
                newEffects = [...effects, { id, endTime: now + item.duration * 1000 }];
            }
            
            QuantumState.user.gameCoins = gameCoins - item.cost;
            QuantumState.user.activeEffects = newEffects;
            showToast(`${item.name} faollashdi!`, 'success');
        }
    }
    
    haptic('success');
    audio.play('upgrade');
    renderShop();
    updateUI();
}

function getEffectiveStat(stat) {
    let value = stat === 'autoTapRate' ? QuantumState.mining.autoTapRate : 
                stat === 'critChance' ? QuantumState.mining.critChance :
                stat === 'energy' ? QuantumState.user.energy : 0;
    
    const effects = QuantumState.user.activeEffects || [];
    
    effects.forEach(eff => {
        const item = SHOP_ITEMS.boosters.find(i => i.id === eff.id);
        if (item && item.effect === stat) {
            if (item.multiplier) value *= item.multiplier;
            if (item.add) value += item.add;
        }
    });
    return value;
}

// Quiz Functions (Enhanced)
function startQuiz(options = null) {
    let category, difficulty, count;
    
    if (options) {
        category = options.category || 'general';
        difficulty = options.difficulty || 'medium';
        count = options.questionCount || 10;
    } else {
        category = document.querySelector('.category-card.active')?.dataset.category || 'general';
        difficulty = document.querySelector('.diff-btn.active')?.dataset.diff || 'medium';
        count = parseInt(document.querySelector('.count-btn.active')?.dataset.count || '10');
    }
    
    let questions;
    if (category === 'mixed' || difficulty === 'adaptive') {
        questions = [
            ...QUIZ_QUESTIONS.general,
            ...QUIZ_QUESTIONS.science,
            ...QUIZ_QUESTIONS.history,
            ...QUIZ_QUESTIONS.tech,
            ...QUIZ_QUESTIONS.math,
            ...QUIZ_QUESTIONS.language
        ];
    } else {
        questions = [...(QUIZ_QUESTIONS[category] || QUIZ_QUESTIONS.general)];
    }
    
    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);
    
    QuantumState.quiz = {
        active: true,
        category,
        difficulty,
        count: Math.min(count, questions.length),
        questions: questions.slice(0, Math.min(count, questions.length)),
        current: 0,
        score: 0
    };
    
    // Show quiz interface
    document.querySelector('.quiz-container').style.display = 'none';
    document.getElementById('quizGame').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    showQuestion();
    haptic('medium');
}

function showQuestion() {
    const q = QuantumState.quiz.questions[QuantumState.quiz.current];
    if (!q) return endQuiz();
    
    document.getElementById('quizProgress').textContent = `${QuantumState.quiz.current + 1}/${QuantumState.quiz.count}`;
    document.getElementById('quizQuestion').textContent = q.q;
    
    const answersEl = document.getElementById('quizAnswers');
    answersEl.innerHTML = q.a.map((a, i) => `
        <div class="quiz-answer" data-index="${i}">${a}</div>
    `).join('');
    
    answersEl.querySelectorAll('.quiz-answer').forEach(el => {
        el.addEventListener('click', () => selectAnswer(parseInt(el.dataset.index)));
    });
}

function selectAnswer(index) {
    if (QuantumState.quiz.answered) return;
    QuantumState.quiz.answered = true;
    
    const q = QuantumState.quiz.questions[QuantumState.quiz.current];
    const answers = document.querySelectorAll('.quiz-answer');
    
    answers[q.c].classList.add('correct');
    
    if (index === q.c) {
        QuantumState.quiz.score++;
        haptic('success');
        audio.play('tap');
    } else {
        if (index >= 0 && answers[index]) {
            answers[index].classList.add('wrong');
        }
        haptic('error');
        audio.play('error');
    }
    
    setTimeout(() => {
        QuantumState.quiz.current++;
        QuantumState.quiz.answered = false;
        
        if (QuantumState.quiz.current < QuantumState.quiz.count) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

function endQuiz() {
    const accuracy = Math.round((QuantumState.quiz.score / QuantumState.quiz.count) * 100);
    const xpEarned = QuantumState.quiz.score * 50;
    
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    document.getElementById('resultsScore').textContent = `${QuantumState.quiz.score}/${QuantumState.quiz.count}`;
    document.getElementById('resultsAccuracy').textContent = `${accuracy}% aniqlik`;
    document.getElementById('resultsXP').textContent = `+${xpEarned} XP`;
    
    // Update stats
    QuantumState.user.xp += xpEarned;
    QuantumState.quiz.stats.total += 1;
    QuantumState.quiz.stats.correct += QuantumState.quiz.score;
    QuantumState.quiz.stats.streak = accuracy === 100 ? QuantumState.quiz.stats.streak + 1 : 0;
    
    checkAchievements();
    checkLevelUp();
    updateUI();
    
    haptic('success');
    audio.play('achievement');
}

function closeQuiz() {
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResults').style.display = 'none';
    document.querySelector('.quiz-container').style.display = 'block';
    QuantumState.quiz.active = false;
}

// Modal Functions
function closeWaygroundRoom() {
    document.getElementById('waygroundRoomModal').classList.remove('active');
}

function closeFileAnalysis() {
    document.getElementById('fileAnalysisModal').classList.remove('active');
}

function closeAIChat() {
    document.getElementById('aiChatModal').classList.remove('active');
}

// 🎯 Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuantumApp.init());
} else {
    QuantumApp.init();
}

// 🌍 Global functions for HTML onclick handlers
window.QuantumMining = new QuantumMining();
window.QuantumAI = new QuantumAI();

// Make Nexus Bot functions globally available
window.handleTap = handleTap;
window.startQuiz = startQuiz;
window.closeQuiz = closeQuiz;
window.purchaseUpgrade = purchaseUpgrade;
window.buyShopItem = buyShopItem;
window.claimAutoTapEarnings = claimAutoTapEarnings;
window.selectAnswer = selectAnswer;
window.showToast = showToast;
window.haptic = haptic;

// Make additional functions globally available
window.startQuiz = startQuiz;
window.selectQuizAnswer = selectQuizAnswer;
window.resetQuiz = resetQuiz;
window.switchShopTab = switchShopTab;
window.switchGamTab = switchGamTab;
window.closeWaygroundRoom = closeWaygroundRoom;
window.closeFileAnalysis = closeFileAnalysis;
window.closeAIChat = closeAIChat;
window.renderShop = renderShop;
window.renderAchievements = renderAchievements;
window.renderLeaderboard = renderLeaderboard;
window.renderDailyChallenges = renderDailyChallenges;
window.formatNumber = formatNumber;

// ============================================
// SHOP RENDERING FUNCTION
// ============================================
function renderShop() {
    const grid = document.getElementById('upgradesGrid');
    if (!grid) return;
    
    const upgrades = [
        {
            id: 'tap',
            name: 'Tap Power',
            description: 'Increase mining power',
            level: QuantumState.mining.upgrades.tap,
            cost: Math.floor(100 * Math.pow(1.5, QuantumState.mining.upgrades.tap)),
            icon: 'hand-pointer',
            maxLevel: 100
        },
        {
            id: 'energy',
            name: 'Energy Max',
            description: 'Increase max energy',
            level: QuantumState.mining.upgrades.energy,
            cost: Math.floor(200 * Math.pow(1.5, QuantumState.mining.upgrades.energy)),
            icon: 'battery-full',
            maxLevel: 100
        },
        {
            id: 'auto',
            name: 'Auto Mining',
            description: 'Automated mining',
            level: QuantumState.mining.upgrades.auto,
            cost: Math.floor(500 * Math.pow(1.5, QuantumState.mining.upgrades.auto)),
            icon: 'robot',
            maxLevel: 50
        },
        {
            id: 'luck',
            name: 'Luck',
            description: 'Increase critical chance',
            level: QuantumState.mining.upgrades.luck,
            cost: Math.floor(300 * Math.pow(1.5, QuantumState.mining.upgrades.luck)),
            icon: 'clover',
            maxLevel: 100
        }
    ];
    
    grid.innerHTML = upgrades.map(upgrade => {
        const canAfford = QuantumState.user.gold >= upgrade.cost;
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        
        return `
            <div class="upgrade-card ${!canAfford ? 'disabled' : ''} ${isMaxed ? 'maxed' : ''}">
                <div class="upgrade-header">
                    <div class="upgrade-icon">
                        <i class="fas fa-${upgrade.icon}"></i>
                    </div>
                    <div class="upgrade-info">
                        <h4>${upgrade.name}</h4>
                        <p>${upgrade.description}</p>
                    </div>
                </div>
                <div class="upgrade-stats">
                    <span class="upgrade-level">Level ${upgrade.level}/${upgrade.maxLevel}</span>
                    <div class="upgrade-cost">
                        <i class="fas fa-coins"></i>
                        ${isMaxed ? 'MAX' : upgrade.cost}
                    </div>
                </div>
                <button class="upgrade-btn" 
                        onclick="purchaseUpgrade('${upgrade.id}')"
                        ${!canAfford || isMaxed ? 'disabled' : ''}>
                    ${isMaxed ? 'MAXED' : 'Upgrade'}
                </button>
            </div>
        `;
    }).join('');
}

// ============================================
// GAMIFICATION RENDERING FUNCTIONS
// ============================================
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    const achievements = [
        { id: 'first_mine', name: 'First Mine', desc: 'Mine for the first time', icon: 'bolt', unlocked: true },
        { id: 'quiz_master', name: 'Quiz Master', desc: 'Get 100% on a quiz', icon: 'brain', unlocked: QuantumState.gamification.achievements.includes('quiz_master') },
        { id: 'battle_winner', name: 'Battle Winner', desc: 'Win your first battle', icon: 'sword', unlocked: false },
        { id: 'shop_hunter', name: 'Shop Hunter', desc: 'Buy 10 upgrades', icon: 'shopping-cart', unlocked: false },
        { id: 'energy_master', name: 'Energy Master', desc: 'Max out energy', icon: 'battery-full', unlocked: false },
        { id: 'gold_collector', name: 'Gold Collector', desc: 'Earn 10000 gold', icon: 'coins', unlocked: false }
    ];
    
    grid.innerHTML = achievements.map(ach => `
        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">
                <i class="fas fa-${ach.icon}"></i>
            </div>
            <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.desc}</p>
            </div>
            <div class="achievement-status">
                ${ach.unlocked ? '✓' : '🔒'}
            </div>
        </div>
    `).join('');
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    
    const leaderboard = [
        { rank: 1, name: 'QuantumMaster', xp: 15000, gold: 25000, avatar: 'QM' },
        { rank: 2, name: 'ProMiner', xp: 12000, gold: 20000, avatar: 'PM' },
        { rank: 3, name: 'QuizKing', xp: 10000, gold: 18000, avatar: 'QK' },
        { rank: 4, name: 'BattleAce', xp: 8500, gold: 15000, avatar: 'BA' },
        { rank: 5, name: 'You', xp: QuantumState.user.xp, gold: QuantumState.user.gold, avatar: QuantumState.user.avatar, you: true }
    ];
    
    list.innerHTML = leaderboard.map(player => `
        <div class="leaderboard-item ${player.you ? 'you' : ''}">
            <div class="rank">#${player.rank}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-stats">${formatNumber(player.xp)} XP • ${formatNumber(player.gold)} Gold</div>
            </div>
            <div class="player-avatar">
                <div class="avatar-circle">${player.avatar}</div>
            </div>
        </div>
    `).join('');
}

function renderDailyChallenges() {
    const container = document.getElementById('dailyChallengesList');
    if (!container) return;
    
    const challenges = [
        { id: 'daily_mine', name: 'Daily Miner', desc: 'Mine 100 times today', progress: 45, target: 100, reward: '50 XP, 100 Gold' },
        { id: 'daily_quiz', name: 'Quiz Expert', desc: 'Complete 3 quizzes', progress: 1, target: 3, reward: '100 XP, 200 Gold' },
        { id: 'daily_battle', name: 'Battle Fighter', desc: 'Win 2 battles', progress: 0, target: 2, reward: '150 XP, 300 Gold' }
    ];
    
    container.innerHTML = challenges.map(challenge => `
        <div class="challenge-card ${challenge.progress >= challenge.target ? 'completed' : ''}">
            <div class="challenge-info">
                <h4>${challenge.name}</h4>
                <p>${challenge.desc}</p>
            </div>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(challenge.progress / challenge.target) * 100}%"></div>
                </div>
                <span class="progress-text">${challenge.progress}/${challenge.target}</span>
            </div>
            <div class="challenge-reward">
                <i class="fas fa-bolt"></i> ${challenge.reward}
            </div>
        </div>
    `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Make additional functions globally available
window.renderShop = renderShop;
window.renderAchievements = renderAchievements;
window.renderLeaderboard = renderLeaderboard;
window.renderDailyChallenges = renderDailyChallenges;
window.formatNumber = formatNumber;
