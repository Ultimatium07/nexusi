/* ============================================
   NEXUS MEDIA - ULTIMATE V2 JAVASCRIPT
   Professional Business Application
   ============================================ */

// ===========================================
// CONFIGURATION
// ===========================================

const CONFIG = {
    ADMIN_IDS: [5895125141],
    BOT_USERNAME: 'PolWay_bot',
    SUPABASE_URL: 'https://slmynfgspupncsijhzpd.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbXluZmdzcHVwbmNzaWpoenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzk1MTEsImV4cCI6MjA4MzM1NTUxMX0.HY8ZiQkWMRRA0jVMutTorc5Cc2zt1x38dalot-A_gLI',
    
    // Quiz Limits
    QUIZ_LIMITS: {
        free: 10,
        premium: 100,
        exclusive: 999
    },
    
    // Premium Prices (in UZS) - Updated
    PREMIUM_PRICES: {
        premium_week: 12990,
        premium_month: 24990,
        exclusive_week: 14990,
        exclusive_month: 34990,
        exclusive_pro_plus_1: 9990
    },
    
    // Payment Card
    PAYMENT_CARD: '9860 1766 2113 5019',
    PAYMENT_HOLDER: "Asadbek O'sarov",
    
    // Energy
    MAX_ENERGY: 1000,
    ENERGY_REGEN_RATE: 1,
    TAP_COST: 1
};

// ===========================================
// ANIMATION CONTROLLER (GSAP)
// ===========================================

class AnimationController {
    constructor() {
        this.isReady = false;
        if (window.gsap) {
            gsap.registerPlugin(ScrollTrigger, TextPlugin);
            this.isReady = true;
            console.log('GSAP Animation Engine Ready');
        }
    }

    // Intro Sequence
    playIntro() {
        if (!this.isReady) return;
        
        const tl = gsap.timeline();
        
        tl.to('#loader', {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => document.getElementById('loader').classList.add('hidden')
        })
        .from('.app-header', {
            y: -50,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)'
        }, '-=0.4')
        .from('.recommendation-card', {
            x: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out'
        }, '-=0.4')
        .from('.stats-grid .stat-card', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.2)'
        }, '-=0.6')
        .from('.function-card', {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.5)'
        }, '-=0.4');
    }

    // Section Transition
    switchSection(oldSectionId, newSectionId) {
        if (!this.isReady) return;
        
        const oldSection = document.getElementById(oldSectionId);
        const newSection = document.getElementById(newSectionId);
        
        if (oldSection) {
            gsap.to(oldSection, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => oldSection.classList.add('hidden')
            });
        }
        
        if (newSection) {
            newSection.classList.remove('hidden');
            gsap.fromTo(newSection, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' }
            );
            
            // Stagger children for premium feel
            const children = newSection.querySelectorAll('.glass-card, .function-card, .media-card-item');
            if (children.length > 0) {
                gsap.fromTo(children,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.2, ease: 'power2.out' }
                );
            }
        }
    }

    // Number Rolling Animation
    animateNumber(elementId, endValue, duration = 1) {
        if (!this.isReady) {
            const el = document.getElementById(elementId);
            if (el) el.textContent = formatNumber(endValue);
            return;
        }

        const el = document.getElementById(elementId);
        if (!el) return;

        // Clean current text to number
        const startValue = parseInt(el.textContent.replace(/\D/g, '')) || 0;
        
        // Don't animate if difference is small or negative
        if (startValue === endValue) return;

        const obj = { value: startValue };
        
        gsap.to(obj, {
            value: endValue,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                el.textContent = formatNumber(Math.round(obj.value));
            }
        });
    }

    // Tap Interaction
    animateTap(element) {
        if (!this.isReady) return;
        
        gsap.timeline()
            .to(element, { scale: 0.92, duration: 0.05, ease: 'power1.out' })
            .to(element, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' });
    }
    
    // Floating text for taps
    spawnFloater(x, y, text, isCritical) {
        const floater = document.createElement('div');
        floater.textContent = text;
        floater.className = 'click-effect';
        
        // Override specific properties based on crit
        floater.style.left = `${x}px`;
        floater.style.top = `${y}px`;
        
        if (isCritical) {
            floater.style.color = 'var(--accent-pink)';
            floater.style.fontSize = '2rem';
            floater.style.textShadow = '0 0 15px var(--accent-pink)';
        } else {
            floater.style.color = 'var(--text-primary)';
        }
        
        document.body.appendChild(floater);
        
        if (this.isReady) {
            // Remove the CSS animation if we are using GSAP to avoid conflict
            floater.style.animation = 'none';
            
            gsap.timeline({ onComplete: () => floater.remove() })
                .fromTo(floater, 
                    { opacity: 0, scale: 0.5, y: 0 },
                    { opacity: 1, scale: isCritical ? 1.5 : 1.2, y: -80, duration: 0.5, ease: 'back.out(1.7)' }
                )
                .to(floater, { opacity: 0, y: -150, duration: 0.3, ease: 'power2.in' }, '+=0.1');
        } else {
            // Fallback is handled by the CSS animation defined in .click-effect
            setTimeout(() => floater.remove(), 1000);
        }
    }
}

const ANIMATIONS = new AnimationController();

// ===========================================
// APP INITIALIZATION
// ===========================================

async function initApp() {
    console.log('🚀 Initializing Nexus Media App...');
    
    // Load settings first
    loadSettings();
    
    // Initialize Telegram WebApp
    const telegramReady = initTelegram();
    
    // Initialize Supabase
    await initSupabase();
    
    // Load user data
    await loadUserData();
    
    // Sync RPG data
    await syncRPGData();
    
    // Set up global feedback listeners
    addGlobalClickListeners();
    
    // Initialize UI
    updateUI();
    
    // Initialize components
    initRecommendations();
    initQuizOptions();
    initMining();
    
    // Init visual effects from old JS
    initSpotlight();
    
    // Init canvas effects
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
        const particles = new ParticleSystem(particleCanvas);
        particles.update();
    }
    
    const meshCanvas = document.getElementById('meshGradient');
    if (meshCanvas) {
        const meshGradient = new MeshGradient(meshCanvas);
        meshGradient.animate();
    }
    
    // Init mystery drops
    new MysteryDropSystem();
    
    // Init visual effects (desktop only)
    if (!('ontouchstart' in window) || window.innerWidth > 768) {
        new CursorTrail();
        new MagneticButtons();
        new ParallaxEffect();
    }
    
    // Hide loader
    const loader = document.getElementById('loader');
    const app = document.getElementById('app');
    if (loader) loader.classList.add('hidden');
    if (app) app.classList.add('visible');
    
    console.log('Nexus WebApp initialized with enhanced visual effects!');
    
    // Failsafe: ensure loader hides even if GSAP fails
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
        }
    }, 2000);
}

function setupNavigation() {
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) navigateTo(section);
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('active');
        });
    });
    
    // Modal overlay clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ===========================================
// STATE MANAGEMENT
// ===========================================

const AppState = {
    user: null,
    telegramUser: null,
    currentSection: 'home',
    isLoading: true,
    offlineMode: false,
    lastSaveTime: 0,
    
    // Settings
    settings: {
        sound: true,
        haptic: true,
        theme: 'default'
    },
    
    // Quiz state
    quiz: {
        topic: 'general',
        difficulty: 'easy',
        count: 5,
        remaining: 10,
        total: 10,
        currentQuestion: 0,
        score: 0,
        answers: [],
        stats: { total: 0, correct: 0, streak: 0 }
    },
    
    // Battle state
    battle: {
        active: false,
        id: null,
        participants: [],
        currentQuestion: null,
        timer: 30,
        isCreator: false
    },
    
    // Mining state
    mining: {
        balance: 0,
        energy: 1000,
        maxEnergy: 1000,
        tapPower: 1,
        multiplier: 1,
        autoTapRate: 0,
        critChance: 5,
        accumulatedCoins: 0,
        upgrades: {
            tap: 1,
            energy: 1,
            auto: 0,
            luck: 1
        }
    },
    
    // Daily Challenges
    dailyChallenges: [],
    lastChallengeReset: null,
    
    // Recommendations
    recommendations: [
        {
            id: 'quiz',
            icon: 'fa-brain',
            badge: 'AI',
            title: 'AI Quiz bilan bilimingizni sinang',
            desc: "Sun'iy intellekt tomonidan yaratilgan savollar bilan o'zingizni rivojlantiring"
        },
        {
            id: 'premium',
            icon: 'fa-crown',
            badge: 'VIP',
            title: 'Premium bilan chegaralarni oching',
            desc: 'Kuniga 100 ta AI savol, barcha kitoblar va filmlar'
        },
        {
            id: 'battle',
            icon: 'fa-bolt',
            badge: 'LIVE',
            title: 'Live Battle musobaqalariga qo\'shiling',
            desc: 'Boshqalar bilan real vaqtda raqobatlashing'
        },
        {
            id: 'gamification',
            icon: 'fa-trophy',
            badge: 'XP',
            title: 'Haftalik reytingda yuqoriga chiqing',
            desc: 'XP yig\'ing va mukofotlar qo\'lga kiriting'
        }
    ],
    
    // Achievements
    achievements: []
};

// Persistence functions
function loadLocalState() {
    try {
        const saved = localStorage.getItem('nexus_state_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Deep merge for specific objects to avoid overwriting defaults with null/undefined if schema changed
            if (parsed.settings) Object.assign(AppState.settings, parsed.settings);
            if (parsed.mining) Object.assign(AppState.mining, parsed.mining);
            if (parsed.user) AppState.user = parsed.user;
            if (parsed.quiz && parsed.quiz.stats) AppState.quiz.stats = parsed.quiz.stats;
            if (parsed.achievements) AppState.achievements = parsed.achievements;
            
            console.log('Local state loaded');
        }
    } catch (e) {
        console.error('State load error:', e);
    }
}

function saveLocalState() {
    try {
        AppState.lastSaveTime = Date.now();
        // Don't save large static arrays like recommendations
        const stateToSave = {
            user: AppState.user,
            settings: AppState.settings,
            mining: AppState.mining,
            quiz: { stats: AppState.quiz.stats },
            achievements: AppState.achievements
        };
        localStorage.setItem('nexus_state_v2', JSON.stringify(stateToSave));
    } catch (e) {
        console.error('State save error:', e);
    }
}

// Auto-save every 30 seconds
setInterval(saveLocalState, 30000);

// ===========================================
// AUDIO ENGINE
// ===========================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sounds = {};
        // Resume audio context on first user interaction
        const resumeAudio = () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
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
            correct: [
                 { type: 'sine', freq: 880, duration: 0.1, volume: 0.2 },
                 { type: 'sine', freq: 1760, duration: 0.2, volume: 0.1 }
            ],
            wrong: [
                { type: 'sawtooth', freq: 150, duration: 0.3, volume: 0.3, glide: [{ time: 0.3, freq: 100 }] }
            ]
        };
    }

    play(name) {
        if (!AppState.settings.sound) return;
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

const audio = new AudioEngine();

// ===========================================
// UPGRADES & SHOP SYSTEM
// ===========================================

const UPGRADES = {
    tap: {
        name: 'Tap Power',
        icon: 'fa-hand-pointer',
        baseCost: 100,
        costMultiplier: 1.5,
        effect: (level) => level + 1,
        description: 'Har bir tap uchun +1 coin'
    },
    auto: {
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
    luck: {
        name: 'Luck',
        icon: 'fa-clover',
        baseCost: 300,
        costMultiplier: 1.6,
        effect: (level) => 5 + level * 0.5, // Crit chance
        description: 'Kritik urish imkoniyati +0.5%'
    }
};

const SHOP_ITEMS = {
    boosters: [
        { id: 'speed_boost', name: 'Speed Boost', icon: 'fa-bolt', cost: 2000, duration: 300, effect: 'autoTapRate', multiplier: 2, desc: '2x Auto Tap (5 daqiqa)' },
        { id: 'energy_drink', name: 'Energy Drink', icon: 'fa-wine-bottle', cost: 1000, duration: 0, effect: 'energy', refill: true, desc: 'To\'liq energiya' }
    ],
    skins: [
        { id: 'skin_default', name: 'Default Core', icon: 'fa-circle', cost: 0, desc: 'Oddiy reaktor' },
        { id: 'skin_neon', name: 'Neon Core', icon: 'fa-sun', cost: 10000, desc: 'Neon rangli reaktor' },
        { id: 'skin_gold', name: 'Golden Core', icon: 'fa-gem', cost: 50000, desc: 'Oltin reaktor' }
    ]
};

function getUpgradeCost(type) {
    const upgrade = UPGRADES[type];
    const level = AppState.mining.upgrades[type] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

function purchaseUpgrade(type) {
    const cost = getUpgradeCost(type);
    const balance = AppState.mining.balance;
    
    if (balance < cost) {
        showToast('Mablag\' yetarli emas', 'Yana mining qiling!', 'error');
        playSound('wrong');
        return false;
    }
    
    // Deduct cost
    AppState.mining.balance -= cost;
    AppState.mining.upgrades[type]++;
    
    // Apply effects
    applyUpgradeEffects();
    
    // Sync
    updateMiningStats();
    
    showToast(`${UPGRADES[type].name} yangilandi!`, `Level ${AppState.mining.upgrades[type]}`, 'success');
    playSound('upgrade');
    
    // Re-render if shop is open (todo)
    return true;
}

function applyUpgradeEffects() {
    const upgrades = AppState.mining.upgrades;
    
    AppState.mining.tapPower = UPGRADES.tap.effect(upgrades.tap);
    AppState.mining.maxEnergy = UPGRADES.energy.effect(upgrades.energy);
    AppState.mining.autoTapRate = UPGRADES.auto.effect(upgrades.auto);
    AppState.mining.critChance = UPGRADES.luck.effect(upgrades.luck);
    
    // Also check boosters
    // (Boosters logic to be added in getEffectiveStat or similar if needed)
}

function updateMiningStats() {
    // Sync to Supabase
    if (supabaseClient && AppState.user) {
        supabaseClient.from('mining_data').upsert({
            user_id: AppState.user.user_id,
            balance: AppState.mining.balance,
            energy: AppState.mining.energy,
            max_energy: AppState.mining.maxEnergy,
            tap_power: AppState.mining.tapPower,
            taps_per_second: AppState.mining.autoTapRate,
            critical_chance: AppState.mining.critChance,
            upgrades: AppState.mining.upgrades,
            owned_skins: AppState.mining.ownedSkins,
            current_skin: AppState.mining.currentSkin,
            achievements: AppState.achievements || [],
            updated_at: new Date().toISOString()
        }).then(({ error }) => {
            if (error) console.error('Mining sync error:', error);
        });
    }
    updateUI();
}

function buyShopItem(id, type) {
    const balance = AppState.mining.balance;
    let item;
    
    if (type === 'booster') {
        item = SHOP_ITEMS.boosters.find(i => i.id === id);
    } else {
        item = SHOP_ITEMS.skins.find(i => i.id === id);
    }
    
    if (!item) return;
    
    if (balance < item.cost) {
        showToast('Mablag\' yetarli emas', 'Yana mining qiling!', 'error');
        playSound('wrong');
        return;
    }
    
    // Purchase logic
    if (type === 'skin') {
        const ownedSkins = AppState.mining.ownedSkins || ['skin_default'];
        if (ownedSkins.includes(id)) {
            // Equip
            AppState.mining.currentSkin = id;
            showToast(`${item.name} o'rnatildi!`, 'success');
            updateUI(); 
            return;
        }
        
        AppState.mining.balance -= item.cost;
        if (!AppState.mining.ownedSkins) AppState.mining.ownedSkins = ['skin_default'];
        AppState.mining.ownedSkins.push(id);
        AppState.mining.currentSkin = id;
        
        showToast(`${item.name} sotib olindi!`, 'success');
    } else {
        // Booster
        if (item.refill) {
            AppState.mining.balance -= item.cost;
            AppState.mining.energy = AppState.mining.maxEnergy;
            showToast('Energiya to\'ldirildi!', 'success');
        } else {
            // Implement duration boosters later if needed
            showToast('Tez orada...', 'info');
            return; 
        }
    }
    
    playSound('upgrade');
    renderShopModal();
    updateMiningStats();
}

function openShop() {
    renderUpgrades();
    renderShopModal();
    document.getElementById('shopModal').classList.add('active');
}

function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    if (!container) return;
    
    container.innerHTML = Object.entries(UPGRADES).map(([key, u]) => {
        const level = AppState.mining.upgrades[key] || 0;
        const cost = getUpgradeCost(key);
        
        return `
            <div class="upgrade-item glass-card">
                <div class="upgrade-icon">
                    <i class="fas ${u.icon}"></i>
                </div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${u.name} <span class="upgrade-level">Lvl ${level}</span></div>
                    <div class="upgrade-desc">${u.description}</div>
                </div>
                <button class="upgrade-btn" onclick="purchaseUpgrade('${key}')">
                    <div class="upgrade-cost">
                        <i class="fas fa-coins"></i> ${formatNumber(cost)}
                    </div>
                    <div>Yuksalish</div>
                </button>
            </div>
        `;
    }).join('');
}

function switchShopTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.shop-tab').forEach(btn => {
        if (btn.textContent.includes(tab === 'upgrades' ? 'Yuksalish' : 'Buyumlar')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.shop-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const target = tab === 'upgrades' ? 'shopTabUpgrades' : 'shopTabItems';
    document.getElementById(target).classList.add('active');
    
    if (tab === 'upgrades') {
        renderUpgrades();
    } else {
        renderShopModal();
    }
}

function renderShopModal() {
    const container = document.getElementById('shopItemsList');
    if (!container) return;
    
    const boostersHtml = SHOP_ITEMS.boosters.map(item => `
        <div class="shop-item glass-card">
            <div class="shop-icon">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="shop-info">
                <div class="shop-name">${item.name}</div>
                <div class="shop-desc">${item.desc}</div>
            </div>
            <button class="shop-btn" onclick="buyShopItem('${item.id}', 'booster')">
                <i class="fas fa-coins"></i> ${formatNumber(item.cost)}
            </button>
        </div>
    `).join('');
    
    const skinsHtml = SHOP_ITEMS.skins.map(item => {
        const owned = AppState.mining.ownedSkins?.includes(item.id);
        const equipped = AppState.mining.currentSkin === item.id;
        
        let btnText = `<i class="fas fa-coins"></i> ${formatNumber(item.cost)}`;
        let btnClass = "shop-btn";
        
        if (owned) {
            btnText = equipped ? '<i class="fas fa-check"></i> O\'rnatilgan' : 'O\'rnatish';
            btnClass = equipped ? "shop-btn active" : "shop-btn";
        }
        
        return `
            <div class="shop-item glass-card ${equipped ? 'equipped' : ''}">
                <div class="shop-icon" style="${item.id === 'skin_neon' ? 'color:#00ff00;' : item.id === 'skin_gold' ? 'color:#ffd700;' : ''}">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc}</div>
                </div>
                <button class="${btnClass}" onclick="buyShopItem('${item.id}', 'skin')" ${equipped ? 'disabled' : ''}>
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="shop-section-title" style="margin:10px 0; font-weight:bold; color:var(--accent-primary);">Kuchaytirgichlar</div>
        ${boostersHtml}
        <div class="shop-section-title" style="margin:20px 0 10px; font-weight:bold; color:var(--accent-primary);">Skinlar</div>
        ${skinsHtml}
    `;
}

// ===========================================
// SUPABASE CLIENT
// ===========================================

let supabaseClient = null;
let supabaseConnected = false;

async function initSupabase() {
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
            
            // Test connection
            const { data, error } = await supabaseClient.from('users').select('count').limit(1);
            
            if (error) {
                console.warn('Supabase connection test failed:', error.message);
                showConnectionStatus('offline');
                supabaseConnected = false;
            } else {
                console.log('Supabase connected successfully');
                showConnectionStatus('online');
                supabaseConnected = true;
            }
            return true;
        }
    } catch (error) {
        console.error('Supabase init error:', error);
        showConnectionStatus('offline');
        supabaseConnected = false;
    }
    return false;
}

function showConnectionStatus(status) {
    let indicator = document.getElementById('connectionIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connectionIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    if (status === 'online') {
        indicator.innerHTML = '<span style="width:8px;height:8px;background:#10B981;border-radius:50%;"></span> Online';
        indicator.style.background = 'rgba(16, 185, 129, 0.2)';
        indicator.style.color = '#10B981';
        indicator.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        setTimeout(() => indicator.style.opacity = '0', 3000);
    } else {
        indicator.innerHTML = '<span style="width:8px;height:8px;background:#EF4444;border-radius:50%;"></span> Offline';
        indicator.style.background = 'rgba(239, 68, 68, 0.2)';
        indicator.style.color = '#EF4444';
        indicator.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        indicator.style.opacity = '1';
    }
}

async function retrySupabaseConnection() {
    showConnectionStatus('connecting');
    await initSupabase();
    if (supabaseConnected) {
        await loadUserData();
        updateUI();
    }
}

// ===========================================
// TELEGRAM WEBAPP
// ===========================================

function initTelegram() {
    try {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Apply theme
            document.documentElement.style.setProperty('--tg-theme-bg', tg.themeParams.bg_color || '#0a0a0f');
            
            // Get user data
            if (tg.initDataUnsafe?.user) {
                AppState.telegramUser = tg.initDataUnsafe.user;
                console.log('Telegram user:', AppState.telegramUser);
            }
            
            return true;
        }
    } catch (error) {
        console.error('Telegram init error:', error);
    }
    return false;
}

// ===========================================
// REFERRAL SYSTEM
// ===========================================

function generateReferralCode(uid) {
    return `NXS${uid || Math.floor(Math.random() * 999999)}`;
}

function getReferralLink() {
    const code = AppState.user?.referral_code;
    if (!code) return `https://t.me/${CONFIG.BOT_USERNAME}`;
    return `https://t.me/${CONFIG.BOT_USERNAME}?start=${code}`;
}

async function handleReferral(startParam) {
    if (!startParam || !supabaseClient || !AppState.user) return;
    
    // Don't refer yourself
    if (startParam === AppState.user.referral_code) return;
    
    // Check if already referred
    if (AppState.user.referred_by) return;
    
    try {
        // Find inviter
        const { data: inviter, error } = await supabaseClient
            .from('users')
            .select('id, referrals_count')
            .eq('referral_code', startParam)
            .single();
            
        if (error || !inviter) return;
        
        // Register referral
        const { error: refError } = await supabaseClient
            .from('referrals')
            .insert({
                inviter_id: inviter.id,
                invitee_id: AppState.user.user_id,
                status: 'completed'
            });
            
        if (refError) return; // Maybe unique violation if already exists
        
        // Update user's referred_by
        await supabaseClient
            .from('users')
            .update({ referred_by: inviter.id })
            .eq('id', AppState.user.user_id);
            
        // Reward inviter (XP and Gold)
        const REWARD_XP = 1000;
        const REWARD_GOLD = 500;
        
        await supabaseClient.rpc('add_xp', { 
            p_user_id: inviter.id, 
            p_amount: REWARD_XP 
        });
        
        await supabaseClient.rpc('add_gold', { 
            p_user_id: inviter.id, 
            p_amount: REWARD_GOLD 
        });
        
        // Update inviter count
        await supabaseClient
            .from('users')
            .update({ referrals_count: (inviter.referrals_count || 0) + 1 })
            .eq('id', inviter.id);
            
        // Reward invitee (User)
        await addXP(500, 'referral_bonus');
        await addGold(200, 'referral_bonus');
        showToast('Referral Bonus', '500 XP va 200 Gold qo\'shildi!', 'success');
        
    } catch (e) {
        console.error('Referral error:', e);
    }
}

async function copyReferralLink() {
    const link = getReferralLink();
    try {
        await navigator.clipboard.writeText(link);
        showToast('Nusxalandi', 'Havola nusxalandi!', 'success');
    } catch (e) {
        showToast('Xatolik', 'Nusxalab bo\'lmadi', 'error');
    }
}

// ===========================================
// USER MANAGEMENT
// ===========================================

async function loadUserData() {
    if (!supabaseClient || !AppState.telegramUser) {
        // Use mock data for testing
        AppState.user = {
            user_id: AppState.telegramUser?.id || 12345,
            full_name: AppState.telegramUser?.first_name || 'Test User',
            xp: 1250,
            gold: 45,
            level: 3,
            streak_count: 7,
            is_premium: false,
            premium_type: 'free',
            quiz_count_today: 3,
            referral_code: 'NXS12345',
            referrals_count: 5,
            created_at: new Date().toISOString()
        };
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', AppState.telegramUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        if (data) {
            AppState.user = data;
            AppState.user.user_id = data.id;
            
            // Ensure referral code exists
            if (!data.referral_code) {
                const newCode = generateReferralCode(data.id);
                await supabaseClient.from('users').update({ referral_code: newCode }).eq('id', data.id);
                AppState.user.referral_code = newCode;
            }
            
            // Load Dark Matter
            if (data.dark_matter) {
                AppState.mining.darkMatter = data.dark_matter;
                AppState.mining.multiplier = 1 + (data.dark_matter * 0.1);
            } else {
                AppState.mining.darkMatter = 0;
            }
            
        } else {
            // Create new user
            const userId = AppState.telegramUser.id;
            const newUser = {
                id: userId,
                full_name: AppState.telegramUser.first_name,
                username: AppState.telegramUser.username || null,
                xp: 0,
                gold: 0,
                level: 1,
                streak_count: 0,
                is_premium: false,
                premium_type: 'free',
                quiz_count_today: 0,
                referral_code: generateReferralCode(userId)
            };
            
            const { data: created, error: createError } = await supabaseClient
                .from('users')
                .insert(newUser)
                .select()
                .single();
            
            if (createError) throw createError;
            AppState.user = created;
            AppState.user.user_id = created.id;
        }
        
        // Handle pending referral if start param exists
        if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
            await handleReferral(window.Telegram.WebApp.initDataUnsafe.start_param);
        }
        
    } catch (error) {
        console.error('Load user error:', error);
        // Fallback to local data
        AppState.user = {
            id: AppState.telegramUser?.id || 12345,
            user_id: AppState.telegramUser?.id || 12345,
            full_name: AppState.telegramUser?.first_name || 'User',
            xp: 0,
            gold: 0,
            level: 1,
            streak_count: 0,
            is_premium: false,
            premium_type: 'free',
            quiz_count_today: 0,
            referrals_count: 0
        };
    }
}

async function updateUserStats(updates) {
    if (!supabaseClient || !AppState.user) return;
    
    try {
        const { error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', AppState.user.user_id);
        
        if (error) throw error;
        
        // Update local state
        Object.assign(AppState.user, updates);
        updateUI();
    } catch (error) {
        console.error('Update user error:', error);
    }
}

// ===========================================
// RPG SYNC SYSTEM
// ===========================================

// Level thresholds (must match bot's LEVEL_THRESHOLDS)
const LEVEL_THRESHOLDS = {
    1: 0, 2: 100, 3: 300, 4: 600, 5: 1000,
    6: 1500, 7: 2100, 8: 2800, 9: 3600, 10: 4500,
    11: 5500, 12: 6600, 13: 7800, 14: 9100, 15: 10500,
    16: 12000, 17: 13600, 18: 15300, 19: 17100, 20: 19000,
    21: 21000, 22: 23100, 23: 25300, 24: 27600, 25: 30000,
    26: 33000, 27: 36500, 28: 40500, 29: 45000, 30: 50000
};

const LEVEL_NAMES = {
    1: "🌱 Yangi boshlovchi", 2: "🌿 Boshlang'ich", 3: "🌳 O'rganuvchi",
    4: "📖 Kitobxon", 5: "📚 Bilimdon", 6: "🎯 Faol",
    7: "⭐ Yulduz", 8: "🌟 Yorqin Yulduz", 9: "💫 Super Yulduz",
    10: "🔥 Olovli", 11: "🔥 Alanga", 12: "🔥 Vulqon",
    13: "💎 Olmos", 14: "💎 Brilliant", 15: "💎 Nodir",
    16: "🏆 Chempion", 17: "🏆 G'olib", 18: "🏆 Qahramon",
    19: "👑 Shoh", 20: "👑 Imperator", 21: "👑 Afsonaviy",
    22: "🌌 Kosmik", 23: "🌌 Galaktik", 24: "🌌 Universal",
    25: "🔮 Sehrgar", 26: "🔮 Arxisehrgar", 27: "🔮 Afsonaviy Sehrgar",
    28: "⚡ Titan", 29: "⚡ Olimp", 30: "⚡ Xudo"
};

function calculateLevel(xp) {
    let level = 1;
    let levelXP = 0;
    let nextLevelXP = 100;
    
    for (let lvl = 30; lvl >= 1; lvl--) {
        if (xp >= LEVEL_THRESHOLDS[lvl]) {
            level = lvl;
            levelXP = xp - LEVEL_THRESHOLDS[lvl];
            nextLevelXP = (LEVEL_THRESHOLDS[lvl + 1] || LEVEL_THRESHOLDS[30]) - LEVEL_THRESHOLDS[lvl];
            break;
        }
    }
    
    return {
        level,
        name: LEVEL_NAMES[level] || `Level ${level}`,
        levelXP,
        nextLevelXP,
        percent: Math.min(100, Math.round((levelXP / nextLevelXP) * 100))
    };
}

async function addXP(amount, source = 'quiz') {
    if (!AppState.user) return;
    
    const newXP = (AppState.user.xp || 0) + amount;
    const levelInfo = calculateLevel(newXP);
    const oldLevel = AppState.user.level || 1;
    
    // Update state
    AppState.user.xp = newXP;
    AppState.user.level = levelInfo.level;
    
    // Check for level up
    if (levelInfo.level > oldLevel) {
        showToast('🎉 Level Up!', `Siz ${levelInfo.name} darajasiga ko'tarildingiz!`, 'success');
        triggerFeedback('levelup');
        
        // Bonus gold for level up
        const bonusGold = levelInfo.level * 5;
        await addGold(bonusGold, 'level_up');
    }
    
    // Sync to Supabase
    await updateUserStats({
        xp: newXP,
        level: levelInfo.level
    });
    
    showToast('+' + amount + ' XP', `${source} uchun`, 'success');
    triggerFeedback('success');
    
    // Check Achievements and Challenges
    checkAchievements();
    if (source === 'quiz') updateChallengeProgress('quiz', 1);
}

async function addGold(amount, source = 'mining') {
    if (!AppState.user) return;
    
    const newGold = (AppState.user.gold || 0) + amount;
    AppState.user.gold = newGold;
    
    // Sync to Supabase
    await updateUserStats({ gold: newGold });
    
    if (amount > 0) {
        showToast('+' + amount + ' Gold', `${source} uchun`, 'success');
        triggerFeedback('success');
    }
}

async function loadMiningData() {
    if (!supabaseClient || !AppState.user) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('mining_data')
            .select('*')
            .eq('user_id', AppState.user.user_id)
            .single();
        
        if (data) {
            AppState.mining.balance = data.balance || 0;
            AppState.mining.energy = data.energy || CONFIG.MAX_ENERGY;
            AppState.mining.maxEnergy = data.max_energy || CONFIG.MAX_ENERGY;
            AppState.mining.tapPower = data.tap_power || 1;
            // Multiplier comes from Dark Matter (user table), not mining_data
            // AppState.mining.multiplier = data.multiplier || 1; 
            
            AppState.mining.autoTapRate = data.taps_per_second || 0;
            AppState.mining.critChance = data.critical_chance || 5;
            
            if (data.upgrades) AppState.mining.upgrades = data.upgrades;
            if (data.owned_skins) AppState.mining.ownedSkins = data.owned_skins;
            if (data.current_skin) AppState.mining.currentSkin = data.current_skin;
        }
    } catch (error) {
        console.error('Load mining data error:', error);
    }
}

async function claimMiningReward() {
    const reward = Math.floor(AppState.mining.balance);
    if (reward < 100) {
        showToast('Kam balans', 'Kamida 100 Gold kerak', 'error');
        return;
    }
    
    // Convert balance to gold
    const goldReward = Math.floor(reward / 100);
    await addGold(goldReward, 'mining');
    
    // Reset balance
    AppState.mining.balance = 0;
    updateUI();
    
    // Sync
    if (supabaseClient) {
        await supabaseClient.from('mining_data').upsert({
            user_id: AppState.user.user_id,
            balance: 0,
            updated_at: new Date().toISOString()
        });
    }
}

// Subscribe to real-time user updates
function subscribeToUserUpdates() {
    if (!supabaseClient || !AppState.user) return;
    
    const channel = supabaseClient
        .channel('user_updates')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${AppState.user.user_id}`
        }, (payload) => {
            console.log('User updated:', payload.new);
            Object.assign(AppState.user, payload.new);
            updateUI();
        })
        .subscribe();
    
    return channel;
}

// Sync streak count
async function updateStreak() {
    if (!AppState.user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActive = AppState.user.last_active_date?.split('T')[0];
    
    if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak;
        if (lastActive === yesterday) {
            newStreak = (AppState.user.streak_count || 0) + 1;
        } else {
            newStreak = 1;
        }
        
        await updateUserStats({
            streak_count: newStreak,
            last_active_date: new Date().toISOString()
        });
        
        if (newStreak > 1) {
            showToast('🔥 Streak!', `${newStreak} kunlik streak!`, 'success');
        }
    }
}

// RPG sync on app load
async function syncRPGData() {
    await loadMiningData();
    await updateStreak();
    subscribeToUserUpdates();
    console.log('RPG data synced');
}

// Enhanced updateUserStats with error handling
async function _updateUserStatsEnhanced(updates) {
    if (!supabaseClient || !AppState.user) return false;
    
    try {
        const { error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('user_id', AppState.user.user_id);
        
        if (error) throw error;
        Object.assign(AppState.user, updates);
        updateUI();
        return true;
    } catch (error) {
        console.error('Enhanced update error:', error);
        return false;
    }
}

// ===========================================
// UI UPDATES
// ===========================================

// UI Updates handled by AnimationController and state management


// ===========================================
// RECOMMENDATIONS CAROUSEL
// ===========================================

function initRecommendations() {
    const carousel = document.getElementById('recommendationCarousel');
    const dots = document.getElementById('carouselDots');
    if (!carousel) return;
    
    carousel.innerHTML = AppState.recommendations.map((rec, i) => `
        <div class="recommendation-card ${i === 0 ? 'active' : ''}" onclick="navigateTo('${rec.id}')">
            <div class="recommendation-badge">${rec.badge}</div>
            <div class="recommendation-icon">
                <i class="fas ${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-desc">${rec.desc}</div>
            </div>
        </div>
    `).join('');
    
    if (dots) {
        dots.innerHTML = AppState.recommendations.map((_, i) => 
            `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
        
        dots.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                scrollToRecommendation(index);
            });
        });
    }
    
    // Auto-scroll carousel
    let currentIndex = 0;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % AppState.recommendations.length;
        scrollToRecommendation(currentIndex);
    }, 5000);
}

function scrollToRecommendation(index) {
    const carousel = document.getElementById('recommendationCarousel');
    const dots = document.getElementById('carouselDots');
    if (!carousel) return;
    
    const cards = carousel.querySelectorAll('.recommendation-card');
    const cardWidth = cards[0]?.offsetWidth || 300;
    
    carousel.scrollTo({
        left: index * (cardWidth + 16),
        behavior: 'smooth'
    });
    
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });
    
    if (dots) {
        dots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

// ===========================================
// QUIZ SYSTEM
// ===========================================

function initQuizOptions() {
    // Topic selection
    document.querySelectorAll('#quizTopics .quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('#quizTopics .quiz-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            AppState.quiz.topic = opt.dataset.topic;
        });
    });
    
    // Difficulty selection
    document.querySelectorAll('#quizDifficulty .quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('#quizDifficulty .quiz-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            AppState.quiz.difficulty = opt.dataset.difficulty;
        });
    });
    
    // Count selection
    document.querySelectorAll('#quizCount .quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
            if (opt.classList.contains('premium-only') && !AppState.user?.is_premium) {
                showToast('Premium kerak', 'Bu tanlov premium foydalanuvchilar uchun', 'error');
                return;
            }
            document.querySelectorAll('#quizCount .quiz-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            AppState.quiz.count = parseInt(opt.dataset.count);
        });
    });
}

async function startQuiz() {
    if (AppState.quiz.remaining <= 0) {
        showToast('Limit tugadi', 'Bugungi limitingiz tugadi. Premium olish uchun Premium bo\'limiga o\'ting.', 'error');
        return;
    }
    
    const btn = document.querySelector('.start-quiz-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
    }
    
    try {
        // Generate quiz questions (mock for now, would call AI API)
        const questions = await generateQuizQuestions(
            AppState.quiz.topic,
            AppState.quiz.difficulty,
            AppState.quiz.count
        );
        
        if (!questions || questions.length === 0) {
            throw new Error('Savollar yaratib bo\'lmadi');
        }
        
        AppState.quiz.questions = questions;
        AppState.quiz.currentQuestion = 0;
        AppState.quiz.score = 0;
        AppState.quiz.answers = [];
        
        // Update quiz count
        await updateUserStats({
            quiz_count_today: (AppState.user.quiz_count_today || 0) + 1
        });
        
        showQuizQuestion();
        
    } catch (error) {
        console.error('Start quiz error:', error);
        showToast('Xatolik', error.message || 'Test boshlab bo\'lmadi', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Testni boshlash';
        }
    }
}

async function generateQuizQuestions(topic, difficulty, count) {
    try {
        // First try to get questions from our API server
        const response = await fetch(`http://localhost:8000/generateQuiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic || 'general',
                difficulty: difficulty || 'medium',
                count: count || 5,
                user_id: AppState.user?.user_id
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.questions) {
                return data.questions;
            }
        }
    } catch (error) {
        console.log('Bot API failed, using fallback:', error);
    }
    
    // Fallback to OpenAI API directly
    try {
        const openaiKey = 'sk-proj-'; // In production, get from secure config
        if (openaiKey && openaiKey.length > 10) {
            const prompt = `Generate ${count} quiz questions in Uzbek language about "${topic}" with ${difficulty} difficulty.
            
            Return JSON array with format:
            [
                {"question": "Savol matni", "options": ["A", "B", "C", "D"], "correct": 0}
            ]
            
            Make sure:
            - Questions are educational and engaging
            - Only one correct answer per question
            - Options are plausible but clearly wrong
            - Difficulty is appropriate: ${difficulty}`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = data.choices[0].message.content;
                const questions = JSON.parse(content);
                return questions.slice(0, count);
            }
        }
    } catch (error) {
        console.log('OpenAI API failed:', error);
    }
    
    // Final fallback - mock questions
    const mockQuestions = [
        {
            question: "Quyosh tizimidagi eng katta sayyora qaysi?",
            options: ["Yer", "Mars", "Yupiter", "Saturn"],
            correct: 2
        },
        {
            question: "Python dasturlash tilini kim yaratgan?",
            options: ["Guido van Rossum", "James Gosling", "Bjarne Stroustrup", "Dennis Ritchie"],
            correct: 0
        },
        {
            question: "O'zbekiston mustaqilligi qachon e'lon qilindi?",
            options: ["1990", "1991", "1992", "1993"],
            correct: 1
        },
        {
            question: "Dunyo okeanlaridan qaysi biri eng kattasi?",
            options: ["Atlantika", "Hind", "Tinch", "Shimoliy Muz"],
            correct: 2
        },
        {
            question: "Inson tanasidagi eng katta organ qaysi?",
            options: ["Jigar", "Miya", "Teri", "Yurak"],
            correct: 2
        }
    ];
    
    return mockQuestions.slice(0, Math.min(count, mockQuestions.length));
}

function showQuizQuestion() {
    const questions = AppState.quiz.questions;
    const index = AppState.quiz.currentQuestion;
    
    if (index >= questions.length) {
        showQuizResults();
        return;
    }
    
    const question = questions[index];
    const section = document.getElementById('sectionQuiz');
    
    section.innerHTML = `
        <div class="quiz-active glass-card">
            <div class="quiz-progress">
                <div class="quiz-progress-text">Savol ${index + 1}/${questions.length}</div>
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${((index + 1) / questions.length) * 100}%"></div>
                </div>
            </div>
            
            <div class="quiz-question-text">${question.question}</div>
            
            <div class="quiz-answers">
                ${question.options.map((opt, i) => `
                    <div class="quiz-option" onclick="selectQuizAnswer(${i})">
                        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${opt}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectQuizAnswer(index) {
    const questions = AppState.quiz.questions;
    const currentQ = questions[AppState.quiz.currentQuestion];
    const isCorrect = index === currentQ.correct;
    
    // Disable all options
    const options = document.querySelectorAll('.quiz-answers .quiz-option');
    options.forEach(o => o.style.pointerEvents = 'none');
    
    // Mark answer
    options[index].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        options[currentQ.correct].classList.add('correct');
    }
    
    // Visual effects
    if (isCorrect) {
        createConfetti();
        AppState.quiz.score++;
    } else {
        options[index].classList.add('shake-animation');
    }
    
    // Store answer
    AppState.quiz.answers.push({
        question: currentQ.question,
        answer: currentQ.options[index],
        correct: currentQ.options[currentQ.correct],
        isCorrect
    });
    
    // Next question after delay
    setTimeout(() => {
        AppState.quiz.currentQuestion++;
        showQuizQuestion();
    }, 1500);
}

function showQuizResults() {
    const score = AppState.quiz.score;
    const total = AppState.quiz.questions.length;
    const percent = Math.round((score / total) * 100);
    
    // Calculate XP
    const xpEarned = score * 10 + (percent >= 80 ? 20 : 0);
    
    // Update results modal
    document.getElementById('resultTitle').textContent = percent >= 80 ? 'Ajoyib!' : percent >= 50 ? 'Yaxshi!' : 'Harakat qiling!';
    document.getElementById('resultSubtitle').textContent = `${score}/${total} to'g'ri javob`;
    document.getElementById('resultCorrect').textContent = score;
    document.getElementById('resultWrong').textContent = total - score;
    document.getElementById('resultXP').textContent = '+' + xpEarned;
    
    // Show modal
    document.getElementById('resultsModal').classList.add('active');
    
    // Add XP
    addXP(xpEarned, 'quiz');
    
    // Reset quiz section
    setTimeout(() => {
        navigateTo('quiz');
    }, 500);
}

// ===========================================
// ===========================================

function initMining() {
    const tapArea = document.getElementById('tapArea');
    if (!tapArea) return;
    
    tapArea.addEventListener('click', handleTap);
    tapArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap(e);
    });
    
    // Start energy regeneration
    setInterval(regenerateEnergy, 1000);
}

// handleTap replaced by AnimationController version


function createTapEffect(e, textOverride = null) {
    const tapCircle = document.querySelector('.tap-circle');
    if (!tapCircle) return;
    
    // Pulse animation
    tapCircle.style.transform = 'scale(0.95)';
    setTimeout(() => {
        tapCircle.style.transform = 'scale(1)';
    }, 100);
    
    // Floating number
    const floater = document.createElement('div');
    const value = AppState.mining.tapPower * AppState.mining.multiplier; // Display base value or actual?
    // Let's display the textOverride if present (CRIT!) or the number
    
    if (textOverride) {
        floater.textContent = textOverride;
        floater.style.color = '#ff006e';
        floater.style.fontSize = '24px';
    } else {
        floater.textContent = '+' + formatNumber(Math.floor(value));
        floater.style.color = 'var(--accent-gold)';
    }

    floater.style.cssText = `
        position: absolute;
        font-size: ${textOverride ? '24px' : '20px'};
        font-weight: bold;
        color: ${textOverride ? '#ff006e' : 'var(--accent-gold)'};
        pointer-events: none;
        animation: floatUp 1s ease-out forwards;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        text-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    
    tapCircle.appendChild(floater);
    setTimeout(() => floater.remove(), 1000);
}

function regenerateEnergy() {
    // Energy Regeneration
    if (AppState.mining.energy < CONFIG.MAX_ENERGY) {
        AppState.mining.energy = Math.min(CONFIG.MAX_ENERGY, AppState.mining.energy + CONFIG.ENERGY_REGEN_RATE);
    }
    
    // Auto Tap Logic
    if (AppState.mining.autoTapRate > 0) {
        const autoReward = AppState.mining.autoTapRate * AppState.mining.multiplier;
        AppState.mining.balance += autoReward;
        AppState.mining.accumulatedCoins += autoReward; // Track for prestige
        
        // Update challenges
        updateChallengeProgress('gold', autoReward);
    }
    
    // Update UI if on screen (optimization)
    const energyFill = document.getElementById('energyFill');
    if (energyFill) {
        const energyPercent = (AppState.mining.energy / CONFIG.MAX_ENERGY) * 100;
        energyFill.style.width = energyPercent + '%';
    }
    
    // Update balance text occasionally or rely on user interaction? 
    // Better to update it here for auto-tap visual feedback
    const balanceEl = document.getElementById('miningBalance');
    if (balanceEl && AppState.mining.autoTapRate > 0) {
        balanceEl.textContent = formatNumber(Math.floor(AppState.mining.balance));
    }
}

// ===========================================
// BATTLE SYSTEM
// ===========================================

function showBattleScreen() {
    const lobby = document.getElementById('battleLobby');
    const active = document.getElementById('activeBattle');
    
    if (lobby) lobby.classList.add('hidden');
    if (active) active.classList.remove('hidden');
    
    document.getElementById('battleStatusText').textContent = 'JONLI';
}

function displayBattleQuestion(question) {
    const questionEl = document.getElementById('battleQuestion');
    const answersEl = document.getElementById('battleAnswers');
    
    if (questionEl) {
        questionEl.innerHTML = `<div class="battle-question-text">${question.question}</div>`;
    }
    
    if (answersEl) {
        answersEl.innerHTML = question.options.map((opt, i) => `
            <div class="quiz-option" onclick="submitBattleAnswer(${i})">
                <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                <span class="option-text">${opt}</span>
            </div>
        `).join('');
    }
}

async function startBattleGame() {
    if (!AppState.battle.isCreator) return;
    
    try {
        // Generate questions
        const questions = await generateQuizQuestions('general', 'medium', 5);
        
        // Update room to active with first question
        await supabaseClient
            .from('battle_rooms')
            .update({
                status: 'active',
                questions: questions,
                current_question: questions[0],
                current_question_index: 0,
                started_at: new Date().toISOString()
            })
            .eq('id', AppState.battle.id);
            
        showToast('Battle boshlandi!', 'Omad tilaymiz!', 'success');
        
    } catch (error) {
        console.error('Start battle game error:', error);
        showToast('Xatolik', 'Battle boshlab bo\'lmadi', 'error');
    }
}

async function createBattle() {
    if (!supabaseClient || !AppState.user) {
        showToast('Xatolik', 'Tizimga ulanmagan', 'error');
        return;
    }
    
    const startBtn = document.querySelector('.start-quiz-btn');
    if (startBtn) startBtn.disabled = true;
    
    try {
        // 1. Create battle room
        const { data: room, error } = await supabaseClient
            .from('battle_rooms')
            .insert({
                creator_id: AppState.user.user_id,
                status: 'waiting',
                current_question_index: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (error) throw error;
        
        // 2. Join as participant
        await joinBattle(room.id);
        
        // 3. Update UI
        AppState.battle.id = room.id;
        AppState.battle.active = true;
        AppState.battle.isCreator = true;
        
        showBattleLobby();
        showToast('Battle yaratildi', 'Do\'stlarni taklif qiling!', 'success');
        
    } catch (error) {
        console.error('Create battle error:', error);
        showToast('Xatolik', 'Battle yaratib bo\'lmadi', 'error');
    } finally {
        if (startBtn) startBtn.disabled = false;
    }
}

async function joinBattle(roomId) {
    if (!supabaseClient || !AppState.user) return;
    
    try {
        const { error } = await supabaseClient
            .from('battle_participants')
            .insert({
                room_id: roomId,
                user_id: AppState.user.user_id,
                score: 0,
                joined_at: new Date().toISOString()
            });
            
        if (error) {
            // Ignore unique violation (already joined)
            if (error.code !== '23505') throw error;
        }
        
        // Update local state
        AppState.battle.id = roomId;
        AppState.battle.active = true;
        
        // Subscribe to room updates
        subscribeToBattle(roomId);
        showBattleLobby();
        
    } catch (error) {
        console.error('Join battle error:', error);
        showToast('Xatolik', 'Battlega qo\'shilib bo\'lmadi', 'error');
    }
}

function showBattleLobby() {
    const lobby = document.getElementById('battleLobby');
    const active = document.getElementById('activeBattle');
    
    if (lobby) lobby.classList.remove('hidden');
    if (active) active.classList.add('hidden');
    
    // Update battle UI
    document.getElementById('battleTitle').textContent = `Battle #${AppState.battle.id}`;
    document.getElementById('battleStatusText').textContent = 'KUTILMOQDA...';
    
    // Show start button for creator
    if (AppState.battle.isCreator) {
        const startBtn = document.getElementById('startBattleBtn');
        if (!startBtn) {
            const btn = document.createElement('button');
            btn.id = 'startBattleBtn';
            btn.className = 'start-quiz-btn mt-md';
            btn.innerHTML = '<i class="fas fa-play"></i> Boshlash';
            btn.onclick = startBattleGame;
            document.getElementById('battleLobby').appendChild(btn);
        }
    }
    
    refreshBattleParticipants(AppState.battle.id);
}

function subscribeToBattle(roomId) {
    // Listen for participants
    supabaseClient
        .channel(`battle_participants_${roomId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'battle_participants',
            filter: `room_id=eq.${roomId}`
        }, (payload) => {
            refreshBattleParticipants(roomId);
        })
        .subscribe();
        
    // Listen for room status
    supabaseClient
        .channel(`battle_room_${roomId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'battle_rooms',
            filter: `id=eq.${roomId}`
        }, (payload) => {
            handleBattleUpdate(payload.new);
        })
        .subscribe();
}

async function submitBattleAnswer(answerIndex) {
    // Disable answers
    const opts = document.querySelectorAll('.battle-answers .quiz-option');
    opts.forEach(o => o.style.pointerEvents = 'none');
    
    // Mark selected
    opts[answerIndex].classList.add('active');
    
    // Check correctness
    const currentQuestion = AppState.battle.currentQuestion;
    const isCorrect = currentQuestion && currentQuestion.correct === answerIndex;
    
    if (isCorrect) {
        opts[answerIndex].classList.add('correct');
        // Visual feedback - confetti burst
        createConfetti();
        playSound('correct');
        
        // Update score in DB
        await updateParticipantScore(10);
        
        // Show score popup
        showScorePopup('+10', opts[answerIndex]);
    } else {
        opts[answerIndex].classList.add('wrong');
        // Visual feedback - shake animation
        opts[answerIndex].classList.add('shake-animation');
        playSound('wrong');
        
        if (currentQuestion && opts[currentQuestion.correct]) {
            opts[currentQuestion.correct].classList.add('correct');
        }
    }
}

function createConfetti() {
    const colors = ['#FFD700', '#10B981', '#6366F1', '#F59E0B', '#EC4899'];
    const container = document.body;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 9999;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
        `;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

function showScorePopup(text, element) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    popup.style.cssText = `
        position: absolute;
        font-size: 24px;
        font-weight: bold;
        color: var(--accent-success);
        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        animation: scoreFloat 1s ease-out forwards;
        pointer-events: none;
        z-index: 100;
    `;
    element.style.position = 'relative';
    element.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateParticipantScore(points) {
    try {
        // Get current score
        const { data: participant } = await supabaseClient
            .from('battle_participants')
            .select('score')
            .eq('room_id', AppState.battle.id)
            .eq('user_id', AppState.user.user_id)
            .single();
            
        if (participant) {
            await supabaseClient
                .from('battle_participants')
                .update({ score: participant.score + points })
                .eq('room_id', AppState.battle.id)
                .eq('user_id', AppState.user.user_id);
        }
    } catch (error) {
        console.error('Update score error:', error);
    }
}

async function handleBattleUpdate(roomData) {
    if (roomData.status === 'active') {
        showBattleScreen();
        if (roomData.current_question) {
            // Store current question for answer validation
            AppState.battle.currentQuestion = roomData.current_question;
            displayBattleQuestion(roomData.current_question);
        }
    } else if (roomData.status === 'finished') {
        showBattleResults(roomData);
    }
}

async function refreshBattleParticipants(roomId) {
    const { data: participants } = await supabaseClient
        .from('battle_participants')
        .select('user_id, score, users(full_name)')
        .eq('room_id', roomId)
        .order('score', { ascending: false });
        
    if (participants) {
        const list = document.getElementById('battleParticipants');
        if (list) {
            list.innerHTML = participants.map(p => `
                <div class="participant">
                    <div class="participant-avatar">${(p.users?.full_name || 'U')[0]}</div>
                    <span>${p.users?.full_name}</span>
                    <span style="margin-left:auto; font-weight:bold;">${p.score}</span>
                </div>
            `).join('');
        }
    }
}

async function showBattleResults(roomData) {
    document.getElementById('activeBattle').classList.add('hidden');
    document.getElementById('resultsModal').classList.add('active');
    
    // Update results modal
    document.getElementById('resultTitle').textContent = 'Battle Yakunlandi!';
    document.getElementById('resultSubtitle').textContent = 'Natijalar';
    
    // Fetch final scores
    const { data: participants } = await supabaseClient
        .from('battle_participants')
        .select('user_id, score, users(full_name)')
        .eq('room_id', roomData.id)
        .order('score', { ascending: false });
        
    if (participants) {
        const myResult = participants.find(p => p.user_id === AppState.user.user_id);
        const myRank = participants.findIndex(p => p.user_id === AppState.user.user_id) + 1;
        
        document.getElementById('resultCorrect').parentElement.querySelector('.result-stat-label').textContent = 'Ball';
        document.getElementById('resultCorrect').textContent = myResult ? myResult.score : 0;
        
        document.getElementById('resultWrong').parentElement.querySelector('.result-stat-label').textContent = 'O\'rin';
        document.getElementById('resultWrong').textContent = '#' + myRank;
        
        // XP Reward calculation (mock)
        const xpReward = Math.max(0, 100 - (myRank - 1) * 20);
        document.getElementById('resultXP').textContent = '+' + xpReward;
        
        // Update user XP locally if needed
        if (xpReward > 0) {
            addXP(xpReward, 'battle_win');
        }
    }
}

// ===========================================
// GLOBAL FEEDBACK & INTERACTIONS
// ===========================================

function triggerFeedback(type = 'tap') {
    if (!AppState.settings) AppState.settings = { soundEnabled: true, hapticEnabled: true };
    if (AppState.settings.soundEnabled) playSound(type);
    if (AppState.settings.hapticEnabled && navigator.vibrate) {
        const pattern = {
            tap: 10,
            critical: 50,
            success: [20, 10, 20],
            error: [50, 30, 50],
            click: 8,
            unlock: [10, 5, 10],
            levelup: [15, 10, 15, 10, 15]
        };
        const p = pattern[type] || pattern.tap;
        navigator.vibrate(Array.isArray(p) ? p : [p]);
    }
}

function addGlobalClickListeners() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, .premium-cta, .plan-btn, .nav-item, .function-card, .quiz-option, .shop-btn, .achievement-badge, .category-card, .feature-card, .action-icon');
        if (btn) {
            gsap.fromTo(btn, { scale: 1 }, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' });
            triggerFeedback('click');
        }
    });
}

// ===========================================
// SETTINGS MODAL (SOUND/HAPTIC TOGGLE)
// ===========================================

function openSettings() {
    const modal = document.getElementById('settingsModal');
    if (!modal) {
        const modalHtml = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sozlamalar</h3>
                    <button class="modal-close" onclick="closeModal('settingsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="soundToggle" ${AppState.settings?.soundEnabled !== false ? 'checked' : ''}>
                            <span>Ovozli effektlar</span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="hapticToggle" ${AppState.settings?.hapticEnabled !== false ? 'checked' : ''}>
                            <span>Vibratsiya (haptic)</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        const modalEl = document.createElement('div');
        modalEl.id = 'settingsModal';
        modalEl.className = 'modal';
        modalEl.innerHTML = modalHtml;
        document.body.appendChild(modalEl);
    }
    modal.classList.add('active');
    triggerFeedback('click');
}

function saveSettings() {
    const sound = document.getElementById('soundToggle')?.checked ?? true;
    const haptic = document.getElementById('hapticToggle')?.checked ?? true;
    AppState.settings = { soundEnabled: sound, hapticEnabled: haptic };
    localStorage.setItem('nexus_settings', JSON.stringify(AppState.settings));
    closeModal('settingsModal');
    showToast('Saqlandi', 'Sozlamalar saqlandi', 'success');
    triggerFeedback('success');
}

// Load settings on init
function loadSettings() {
    try {
        const stored = localStorage.getItem('nexus_settings');
        if (stored) {
            AppState.settings = JSON.parse(stored);
        } else {
            AppState.settings = { soundEnabled: true, hapticEnabled: true };
        }
    } catch {
        AppState.settings = { soundEnabled: true, hapticEnabled: true };
    }
}

// ===========================================
// VISUAL EFFECTS (from old JS)
// ===========================================

// MYSTERY DROP SYSTEM (GACHA)
class MysteryDropSystem {
    constructor() {
        this.container = document.getElementById('mysteryDropContainer');
        this.active = false;
        this.timer = null;
        this.scheduleNext();
    }

    scheduleNext() {
        const delay = (60 + Math.random() * 60) * 1000;
        this.timer = setTimeout(() => this.spawn(), delay);
    }

    spawn() {
        if (this.active) return;
        this.active = true;

        const drop = document.createElement('div');
        drop.className = 'mystery-drop';
        drop.innerHTML = '<i class="fas fa-cube"></i>';
        
        const x = Math.random() * (window.innerWidth - 60);
        const y = Math.random() * (window.innerHeight - 60);
        drop.style.left = `${x}px`;
        drop.style.top = `${y}px`;

        drop.addEventListener('click', () => this.collect(drop));
        
        this.container.appendChild(drop);

        setTimeout(() => {
            if (drop.parentNode) {
                drop.remove();
                this.active = false;
                this.scheduleNext();
            }
        }, 15000);
    }

    collect(drop) {
        drop.remove();
        this.active = false;
        
        const roll = Math.random();
        let rewardType, amount, message;

        if (roll < 0.6) {
            amount = Math.floor(1000 + Math.random() * 2000);
            if (AppState.user) AppState.user.gold = (AppState.user.gold || 0) + amount;
            rewardType = 'coin';
            message = `+${amount} Gold`;
        } else if (roll < 0.9) {
            amount = Math.floor(500 + Math.random() * 500);
            if (AppState.user) AppState.user.xp = (AppState.user.xp || 0) + amount;
            rewardType = 'xp';
            message = `+${amount} XP`;
        } else {
            if (AppState.mining) AppState.mining.energy = CONFIG.MAX_ENERGY;
            rewardType = 'energy';
            message = 'To\'liq Energiya!';
        }

        showToast(`📦 Cosmic Crate: ${message}`, 'success');
        triggerFeedback('success');
        playSound('achievement');
        
        updateUI();
        this.scheduleNext();
    }
}

// CURSOR TRAIL EFFECT
class CursorTrail {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.points = [];
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.addPoint(e.clientX, e.clientY));
        
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addPoint(x, y) {
        this.points.push({ x, y, age: 0 });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.beginPath();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            p.age++;
            
            if (p.age > 20) {
                this.points.splice(i, 1);
                i--;
                continue;
            }
            
            if (i > 0) {
                const prev = this.points[i - 1];
                this.ctx.beginPath();
                this.ctx.moveTo(prev.x, prev.y);
                this.ctx.lineTo(p.x, p.y);
                
                const opacity = 1 - (p.age / 20);
                this.ctx.strokeStyle = `rgba(0, 255, 247, ${opacity})`;
                this.ctx.lineWidth = 2 * opacity;
                this.ctx.stroke();
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// MAGNETIC BUTTONS
class MagneticButtons {
    constructor() {
        this.buttons = document.querySelectorAll('button, .nav-item, .function-card, .upgrade-item, .premium-utility-card');
        this.init();
    }

    init() {
        if ('ontouchstart' in window) return;

        this.buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.3s ease-out';
                setTimeout(() => {
                    btn.style.transition = '';
                }, 300);
            });
        });
    }
}

// PARALLAX EFFECT
class ParallaxEffect {
    constructor() {
        this.cards = document.querySelectorAll('.mining-card, .profile-header, .premium-status-card, .glass-card');
        this.init();
    }

    init() {
        if ('ontouchstart' in window) return;

        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) / 50;
            const y = (window.innerHeight / 2 - e.clientY) / 50;

            this.cards.forEach(card => {
                card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
                card.style.transition = 'transform 0.1s ease-out';
            });
        });
        
        document.addEventListener('mouseleave', () => {
            this.cards.forEach(card => {
                card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
                card.style.transition = 'transform 0.5s ease-out';
            });
        });
    }
}

// RPG SYSTEM (Basic Shell)
function renderRpgModal() {
    if (!AppState.user) return '';
    
    const level = AppState.user.level || 1;
    const stats = {
        str: 10 + Math.floor(level * 1.5),
        agi: 8 + Math.floor(level * 1.2),
        int: 12 + Math.floor(level * 1.8),
        hp: 100 + level * 20
    };

    return `
        <div style="padding:10px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="width:80px;height:80px;margin:0 auto 10px;background:linear-gradient(135deg,var(--accent-purple),var(--accent-cyan));border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;">
                    <i class="fas fa-user-astronaut"></i>
                </div>
                <h3 style="margin:0;">${AppState.user.name || 'Foydalanuvchi'}</h3>
                <p style="color:var(--text-muted);font-size:12px;">Level ${level} Space Ranger</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
                <div style="background:var(--bg-elevated);padding:10px;border-radius:12px;text-align:center;">
                    <div style="color:var(--accent-red);font-weight:700;">STR</div>
                    <div style="font-size:18px;">${stats.str}</div>
                </div>
                <div style="background:var(--bg-elevated);padding:10px;border-radius:12px;text-align:center;">
                    <div style="color:var(--accent-green);font-weight:700;">AGI</div>
                    <div style="font-size:18px;">${stats.agi}</div>
                </div>
                <div style="background:var(--bg-elevated);padding:10px;border-radius:12px;text-align:center;">
                    <div style="color:var(--accent-cyan);font-weight:700;">INT</div>
                    <div style="font-size:18px;">${stats.int}</div>
                </div>
                <div style="background:var(--bg-elevated);padding:10px;border-radius:12px;text-align:center;">
                    <div style="color:var(--accent-gold);font-weight:700;">HP</div>
                    <div style="font-size:18px;">${stats.hp}</div>
                </div>
            </div>

            <div style="margin-bottom:10px;">
                <h4 style="margin-bottom:10px;">Inventar (0/20)</h4>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
                    ${Array(10).fill(0).map(() => `
                        <div style="aspect-ratio:1;background:var(--bg-glass);border:1px solid var(--glass-border);border-radius:8px;"></div>
                    `).join('')}
                </div>
            </div>
            
            <p style="text-align:center;color:var(--text-muted);font-size:11px;margin-top:20px;">
                To'liq RPG tizimi (Janglar, Kvestlar, Buyumlar) tez kunda ishga tushadi.
            </p>
        </div>
    `;
}

// PARTICLE SYSTEM (simplified version)
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

    emit(x, y, count = 10, color = '#00fff7') {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 2, 2);
        }
        
        requestAnimationFrame(() => this.update());
    }
}

// MESH GRADIENT (simplified version)
class MeshGradient {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.time += 0.005;
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, `hsla(${180 + Math.sin(this.time) * 30}, 100%, 50%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${280 + Math.cos(this.time) * 30}, 100%, 50%, 0.1)`);
        gradient.addColorStop(1, `hsla(${200 + Math.sin(this.time + 1) * 30}, 100%, 50%, 0.1)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        requestAnimationFrame(() => this.animate());
    }
}

// SPOTLIGHT EFFECT
function initSpotlight() {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;
    
    document.addEventListener('mousemove', (e) => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
        spotlight.classList.add('active');
    });
    
    document.addEventListener('mouseleave', () => {
        spotlight.classList.remove('active');
    });
}

// ===========================================
// INITIALIZATION ENHANCED
// ===========================================

function formatNumber(num) {
    return new Intl.NumberFormat('uz-UZ').format(num);
}

function buyPremium(planType) {
    triggerFeedback('unlock');
    showPayment(planType);
}

function showPayment(planType) {
    const modal = document.getElementById('paymentModal');
    const amountEl = document.getElementById('paymentAmount');
    const planEl = document.getElementById('paymentPlan');
    
    if (!modal) return;
    
    const price = CONFIG.PREMIUM_PRICES[planType] || 25000;
    
    const planNames = {
        'premium_week': 'Premium - 1 hafta',
        'premium_month': 'Premium - 1 oy',
        'exclusive_week': 'Exclusive - 1 hafta',
        'exclusive_month': 'Exclusive - 1 oy',
        'exclusive_pro_plus_1': 'Exclusive Pro+ (1 kun)'
    };
    
    const planName = planNames[planType] || 'Premium Obuna';
    
    if (amountEl) amountEl.textContent = formatNumber(price) + " so'm";
    if (planEl) planEl.textContent = planName;
    
    // Store current plan in modal dataset
    modal.dataset.plan = planType;
    
    modal.classList.add('active');
}

function copyCardNumber() {
    const cardNumber = CONFIG.PAYMENT_CARD;
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, '')).then(() => {
        showToast('Nusxalandi', 'Karta raqami nusxalandi', 'success');
    }).catch(() => {
        showToast('Xatolik', 'Nusxalab bo\'lmadi', 'error');
    });
}

async function uploadReceipt(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Xatolik', 'Fayl hajmi 5MB dan oshmasligi kerak', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.upload-receipt');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
    submitBtn.disabled = true;
    
    try {
        if (!supabaseClient) throw new Error('Tizim xatoligi: Supabase ulanmagan');
        
        const user = AppState.user;
        if (!user) throw new Error('Foydalanuvchi aniqlanmadi');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.user_id}_${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;
        
        // 1. Upload image to Supabase Storage
        const { error: uploadError } = await supabaseClient.storage
            .from('receipts')
            .upload(filePath, file);
            
        if (uploadError) throw uploadError;
        
        // 2. Get public URL
        const { data: urlData } = supabaseClient.storage
            .from('receipts')
            .getPublicUrl(filePath);
            
        // 3. Save request to DB
        const modal = document.getElementById('paymentModal');
        const plan = modal.dataset.plan || 'premium';
        const price = CONFIG.PREMIUM_PRICES[plan] || 25000;
        
        const { error: dbError } = await supabaseClient
            .from('payments')
            .insert({
                user_id: user.user_id,
                plan: plan,
                amount: price,
                receipt_url: urlData.publicUrl,
                status: 'pending',
                created_at: new Date().toISOString()
            });
            
        if (dbError) throw dbError;
        
        showToast('Muvaffaqiyatli', 'Chek yuborildi! Admin tasdiqlashini kuting.', 'success');
        closeModal('paymentModal');
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Xatolik', 'Chekni yuklab bo\'lmadi. Qayta urining.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        event.target.value = ''; // Reset input
    }
}

// ===========================================
// NAVIGATION
// ===========================================

// Navigation handled by AnimationController version


// ===========================================
// REMOVED: MEDIA SECTIONS (Cinema, Library, Stream)
// ===========================================
// These sections have been removed as requested.
// Media content functionality is now handled by Bot Tests and Wayground sections.

// ===========================================
// PROMO & SUPPORT HANDLERS
// ===========================================

function openPromoModal() {
    document.getElementById('promoModal').classList.add('active');
}

function openSupportModal() {
    document.getElementById('supportModal').classList.add('active');
}

function submitPromoCode() {
    const code = document.getElementById('promoCodeInput').value.trim();
    if (!code) {
        showToast('Xatolik', 'Kodni kiriting', 'error');
        return;
    }
    
    // Mock validation
    if (code.toUpperCase() === 'NEXUS2024') {
        showToast('Muvaffaqiyatli', 'Promo kod qabul qilindi! +500 XP', 'success');
        addXP(500, 'promo');
        closeModal('promoModal');
    } else {
        showToast('Xatolik', 'Noto\'g\'ri kod', 'error');
    }
}

async function submitSupportTicket() {
    const topic = document.getElementById('supportTopic').value;
    const message = document.getElementById('supportMessage').value.trim();
    
    if (!message) {
        showToast('Xatolik', 'Xabarni yozing', 'error');
        return;
    }
    
    // In a real app, send to Supabase
    showToast('Yuborildi', 'Xabaringiz qabul qilindi. Tez orada javob beramiz.', 'success');
    closeModal('supportModal');
    document.getElementById('supportMessage').value = '';
}

// ===========================================
// LEADERBOARD & GAMIFICATION
// ===========================================

async function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return; // If element doesn't exist (e.g. using modal version)
    
    list.innerHTML = '<div class="text-center text-muted">Yuklanmoqda...</div>';
    
    try {
        let leaderboardData = [];
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('users')
                .select('user_id, full_name, xp, level')
                .order('xp', { ascending: false })
                .limit(20);
            
            if (!error && data) {
                leaderboardData = data;
            }
        }
        
        // Fallback mock data
        if (leaderboardData.length === 0) {
            leaderboardData = [
                { full_name: 'Asadbek', xp: 18500, level: 16 },
                { full_name: 'Sardor', xp: 15200, level: 15 },
                { full_name: 'Malika', xp: 14100, level: 14 },
                { full_name: 'User 4', xp: 12000, level: 12 },
                { full_name: 'User 5', xp: 10500, level: 11 },
            ];
        }
        
        // Update Podiums (Top 3)
        updatePodium(leaderboardData.slice(0, 3));
        
        // Render List (Rest)
        list.innerHTML = leaderboardData.slice(3).map((user, i) => {
            const rank = i + 4;
            return `
                <div class="leaderboard-item glass-card" style="margin-bottom: 8px; padding: 12px; border-radius: 12px;">
                    <div class="leaderboard-rank" style="background: rgba(255,255,255,0.1); color: var(--text-secondary);">${rank}</div>
                    <div class="leaderboard-user">
                        <div class="leaderboard-name">${user.full_name || 'User'}</div>
                        <div class="leaderboard-score">Level ${user.level || 1}</div>
                    </div>
                    <div class="leaderboard-points" style="color: var(--accent-info);">${formatNumber(user.xp || 0)} XP</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Leaderboard error:', error);
        list.innerHTML = '<div class="text-center text-muted">Xatolik yuz berdi</div>';
    }
}

function updatePodium(topUsers) {
    // Helper to set podium data safely
    const setPodiumData = (index, user, selector) => {
        const placeEl = document.querySelector(selector);
        if (!placeEl) return;
        
        if (user) {
            const nameEl = placeEl.querySelector('.podium-name');
            const scoreEl = placeEl.querySelector('.podium-score');
            if (nameEl) nameEl.textContent = user.full_name || 'User';
            if (scoreEl) scoreEl.textContent = formatNumber(user.xp || 0) + ' XP';
            // Optional: Set avatar if available
            // placeEl.querySelector('.podium-avatar').style.backgroundImage = ...
        } else {
            placeEl.style.opacity = '0.5';
        }
    };

    // Match the actual HTML structure: .podium-item.first, .podium-item.second, .podium-item.third
    setPodiumData(0, topUsers[0], '.podium-item.first');
    setPodiumData(1, topUsers[1], '.podium-item.second');
    setPodiumData(2, topUsers[2], '.podium-item.third');
}

// Keep the old function for backward compatibility or remove if not needed
function showLeaderboard() {
    navigateTo('gamification');
}

function showAchievements() {
    showToast('Yutuqlar', 'Tez orada...', 'info');
}

function showGoldShop() {
    navigateTo('premium');
}

function showDailyChallenge() {
    showToast('Kunlik', 'Tez orada...', 'info');
}

// ===========================================
// EXPORT FUNCTIONALITY
// ===========================================

function exportStats() {
    const user = AppState.user;
    if (!user) return;
    
    // Create CSV content
    const csvContent = [
        ['Statistika', 'Qiymat'],
        ['Ism', user.full_name],
        ['XP', user.xp],
        ['Gold', user.gold],
        ['Level', user.level],
        ['Streak', user.streak_count],
        ['Status', user.premium_type],
        ['Sana', new Date().toLocaleString('uz-UZ')]
    ].map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, 'nexus_stats.csv', 'text/csv');
    showToast('Yuklandi', 'Statistika yuklandi', 'success');
}

function exportResults() {
    // Export quiz results
    const results = AppState.quiz.answers || [];
    
    const csvContent = [
        ['Savol', 'Javob', 'To\'g\'ri', 'Natija'],
        ...results.map((r, i) => [
            `Savol ${i + 1}`,
            r.answer || '-',
            r.correct || '-',
            r.isCorrect ? 'To\'g\'ri' : 'Noto\'g\'ri'
        ])
    ].map(row => row.join(',')).join('\n');
    
    downloadFile(csvContent, 'quiz_results.csv', 'text/csv');
    closeModal('resultsModal');
    showToast('Yuklandi', 'Natijalar yuklandi', 'success');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===========================================
// MODALS
// ===========================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    
    // Initialize switch states
    const soundToggle = document.getElementById('settingSound');
    if (soundToggle) soundToggle.checked = AppState.settings.sound;
    
    const hapticToggle = document.getElementById('settingHaptic');
    if (hapticToggle) hapticToggle.checked = AppState.settings.haptic;
    
    const themeSelect = document.getElementById('settingTheme');
    if (themeSelect) themeSelect.value = AppState.settings.theme;
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// ===========================================
// TOAST NOTIFICATIONS
// ===========================================

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===========================================
// URL PARAMETER HANDLING
// ===========================================

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const userId = urlParams.get('user_id');
    
    // If user_id is provided in URL and not yet set (e.g. external browser testing)
    if (userId && !AppState.user) {
        console.log('User ID from URL:', userId);
        // We might want to use this for testing or fallback
        // But loadUserData handles data loading. 
        // If we want to force a user ID for testing:
        if (!AppState.telegramUser) {
             AppState.telegramUser = { id: parseInt(userId), first_name: 'Test User' };
        }
    }
    
    if (section) {
        console.log('Navigating to section from URL:', section);
        // Add a small delay to ensure UI is ready and transitions are smooth
        setTimeout(() => {
            navigateTo(section);
        }, 500);
    }
}

// ===========================================
// VISUAL EFFECTS SYSTEM
// ===========================================

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

class MeshGradient {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.time += 0.005;
        
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2 + Math.sin(this.time) * 100,
            this.canvas.height / 2 + Math.cos(this.time) * 100,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width
        );
        
        gradient.addColorStop(0, 'rgba(0, 255, 247, 0.1)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        gradient.addColorStop(1, 'rgba(5, 5, 5, 1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        requestAnimationFrame(() => this.animate());
    }
}

function createShockwave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

// Global instances - moved to end of file
let meshGradient;

// ===========================================
// SETTINGS SYSTEM
// ===========================================

function toggleSetting(key) {
    if (AppState.settings.hasOwnProperty(key)) {
        AppState.settings[key] = !AppState.settings[key];
        
        // Apply immediate effects
        if (key === 'sound' && !AppState.settings[key]) {
            if (audio && audio.ctx) audio.ctx.suspend();
        } else if (key === 'sound' && AppState.settings[key]) {
            if (audio && audio.ctx) audio.ctx.resume();
        }
        
        saveLocalState();
        showToast('Sozlama o\'zgartirildi', key + ': ' + (AppState.settings[key] ? 'Yoqilgan' : 'O\'chirilgan'), 'success');
    }
}

function changeTheme(theme) {
    AppState.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveLocalState();
    
    // Apply specific theme styles if needed
    if (theme === 'gold') {
        document.documentElement.style.setProperty('--accent-primary', '#ffd700');
    } else if (theme === 'neon') {
        document.documentElement.style.setProperty('--accent-primary', '#00ff00');
    } else {
        document.documentElement.style.removeProperty('--accent-primary');
    }
}

function clearCache() {
    if (confirm('Rostdan ham keshni tozalab, ilovani qayta ishga tushirmoqchimisiz?')) {
        localStorage.removeItem('nexus_state_v2');
        location.reload();
    }
}

// ===========================================
// PRESTIGE SYSTEM
// ===========================================

function calculatePrestigeReward() {
    // 1 Dark Matter per 1M accumulated coins
    return Math.floor(AppState.mining.accumulatedCoins / 1000000);
}

function doPrestige() {
    const reward = calculatePrestigeReward();
    
    if (reward < 1) {
        showToast('Prestige tayyor emas', 'Kamida 1M coin yig\'ishingiz kerak', 'error');
        return;
    }
    
    if (!confirm(`Prestige qilasizmi? Barcha progress (coinlar, upgradelar) reset bo'ladi, lekin +${reward} Dark Matter olasiz.`)) {
        return;
    }
    
    // Reset mining progress but keep accumulated stats if needed, or just reset balance/upgrades
    AppState.mining.balance = 0;
    AppState.mining.energy = 1000;
    AppState.mining.maxEnergy = 1000;
    AppState.mining.tapPower = 1;
    AppState.mining.autoTapRate = 0;
    AppState.mining.upgrades = { tap: 1, energy: 1, auto: 0, luck: 1 };
    
    // Add Dark Matter (stored in mining or user state)
    if (!AppState.mining.darkMatter) AppState.mining.darkMatter = 0;
    AppState.mining.darkMatter += reward;
    
    // Apply Dark Matter bonus (e.g. +10% multiplier per DM)
    AppState.mining.multiplier = 1 + (AppState.mining.darkMatter * 0.1);
    
    // Sync
    updateMiningStats();
    saveLocalState();
    
    // Visuals
    createShockwave(window.innerWidth / 2, window.innerHeight / 2);
    playSound('levelUp');
    showToast('PRESTIGE!', `+${reward} Dark Matter olindi! Multiplier: x${AppState.mining.multiplier.toFixed(1)}`, 'success');
    
    checkAchievements();
    updateUI();
}

// ===========================================
// ACHIEVEMENTS SYSTEM
// ===========================================

const ACHIEVEMENTS = [
    { id: 'first_tap', name: 'Birinchi qadam', icon: 'fa-shoe-prints', condition: s => s.mining.balance >= 1 },
    { id: 'tap_1000', name: '1000 coin', icon: 'fa-coins', condition: s => s.mining.accumulatedCoins >= 1000 },
    { id: 'level_5', name: '5-daraja', icon: 'fa-star', condition: s => s.user && s.user.level >= 5 },
    { id: 'prestige_1', name: 'Birinchi Prestige', icon: 'fa-atom', condition: s => s.mining.darkMatter >= 1 },
    { id: 'quiz_10', name: 'Bilimdon', icon: 'fa-brain', condition: s => s.user && s.user.quiz_count_today >= 10 }
];

function checkAchievements() {
    if (!AppState.achievements) AppState.achievements = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (!AppState.achievements.includes(ach.id) && ach.condition(AppState)) {
            AppState.achievements.push(ach.id);
            showToast(`🏆 Yutuq: ${ach.name}`, 'success');
            playSound('levelUp'); // Use levelUp sound for achievements
            saveLocalState();
            
            // Sync to DB if online
            if (supabaseClient && AppState.user) {
                supabaseClient.from('mining_data')
                    .update({ achievements: AppState.achievements })
                    .eq('user_id', AppState.user.user_id)
                    .then(({ error }) => { if (error) console.error(error); });
            }
        }
    });
}

function showAchievements() {
    const list = ACHIEVEMENTS.map(ach => {
        const isUnlocked = AppState.achievements?.includes(ach.id);
        return `${isUnlocked ? '✅' : '🔒'} ${ach.name}`;
    }).join('\n');
    
    alert('Yutuqlar:\n' + list);
}

function playSound(type) {
    if (audio) {
        audio.play(type);
    }
}

// ===========================================
// DAILY CHALLENGES SYSTEM
// ===========================================

function generateDailyChallenges() {
    const today = new Date().toDateString();
    const lastReset = AppState.lastChallengeReset;
    
    if (lastReset === today && AppState.dailyChallenges.length > 0) return;
    
    const challenges = [
        { id: 'tap_500', name: '500 ta tap', target: 500, progress: 0, reward: 500, type: 'taps', claimed: false },
        { id: 'earn_2000', name: '2000 coin yig\'ish', target: 2000, progress: 0, reward: 300, type: 'gold', claimed: false },
        { id: 'quiz_3', name: '3 ta quiz o\'ynash', target: 3, progress: 0, reward: 400, type: 'quiz', claimed: false },
        { id: 'upgrade_1', name: '1 ta upgrade olish', target: 1, progress: 0, reward: 200, type: 'upgrade', claimed: false }
    ];
    
    AppState.dailyChallenges = challenges;
    AppState.lastChallengeReset = today;
    saveLocalState();
}

function updateChallengeProgress(type, amount = 1) {
    let updated = false;
    AppState.dailyChallenges.forEach(c => {
        if (c.type === type && c.progress < c.target && !c.claimed) {
            c.progress = Math.min(c.progress + amount, c.target);
            updated = true;
        }
    });
    
    if (updated) {
        saveLocalState();
        // If modal is open, re-render
        if (document.getElementById('challengesModal')?.classList.contains('active')) {
            renderChallenges();
        }
    }
}

function claimChallengeReward(id) {
    const challenge = AppState.dailyChallenges.find(c => c.id === id);
    
    if (!challenge || challenge.progress < challenge.target || challenge.claimed) return;
    
    challenge.claimed = true;
    AppState.mining.balance += challenge.reward;
    
    showToast(`+${challenge.reward} coin!`, 'Vazifa bajarildi', 'success');
    playSound('levelUp');
    
    updateMiningStats(); // Sync balance
    saveLocalState();
    renderChallenges();
}

function renderChallenges() {
    const list = document.getElementById('challengesList');
    if (!list) return;
    
    list.innerHTML = AppState.dailyChallenges.map(c => {
        const percent = Math.min(100, (c.progress / c.target) * 100);
        const isCompleted = c.progress >= c.target;
        
        return `
            <div class="challenge-item glass-card ${isCompleted ? 'completed' : ''}" style="margin-bottom: 10px; padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid ${isCompleted ? 'var(--accent-green)' : 'var(--border-subtle)'};">
                <div class="challenge-icon" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-cyan);">
                    <i class="fas fa-${getChallengeIcon(c.type)}"></i>
                </div>
                <div class="challenge-info" style="flex: 1;">
                    <div class="challenge-name" style="font-weight: 600; font-size: 0.9rem;">${c.name}</div>
                    <div class="challenge-progress-bar" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden;">
                        <div class="challenge-progress-fill" style="width: ${percent}%; height: 100%; background: var(--accent-primary);"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                        <span>${c.progress}/${c.target}</span>
                        <span style="color: var(--accent-gold);">+${c.reward} coin</span>
                    </div>
                </div>
                ${isCompleted && !c.claimed ? 
                    `<button onclick="claimChallengeReward('${c.id}')" style="padding: 6px 12px; background: var(--accent-green); border: none; border-radius: 6px; color: white; font-weight: 600; font-size: 0.75rem;">Olish</button>` : 
                    c.claimed ? `<div style="color: var(--accent-green);"><i class="fas fa-check"></i></div>` : ''
                }
            </div>
        `;
    }).join('');
}

function getChallengeIcon(type) {
    switch(type) {
        case 'taps': return 'hand-pointer';
        case 'gold': return 'coins';
        case 'quiz': return 'brain';
        case 'upgrade': return 'arrow-up';
        default: return 'star';
    }
}

function showDailyChallenge() {
    generateDailyChallenges();
    renderChallenges();
    document.getElementById('challengesModal').classList.add('active');
}

// ===========================================
// FLASHCARDS & MINDMAP
// ===========================================

const MOCK_FLASHCARDS = [
    { q: "Sun'iy intellekt (AI) nima?", a: "Inson ongini talab qiladigan vazifalarni bajaradigan kompyuter tizimlari." },
    { q: "Machine Learning nima?", a: "Kompyuterlarga ma'lumotlardan o'rganish imkonini beruvchi algoritmlar." },
    { q: "Neural Network nima?", a: "Inson miyasi tuzilishidan ilhomlangan hisoblash modellari." },
    { q: "Deep Learning nima?", a: "Ko'p qatlamli neyron tarmoqlariga asoslangan ML turi." },
    { q: "Big Data nima?", a: "An'anaviy usullar bilan qayta ishlash qiyin bo'lgan katta hajmdagi ma'lumotlar." }
];

let currentFlashcardIndex = 0;

function openFlashcards() {
    currentFlashcardIndex = 0;
    loadFlashcard(0);
    document.getElementById('flashcardsModal').classList.add('active');
}

function loadFlashcard(index) {
    if (index >= MOCK_FLASHCARDS.length) {
        showToast('Tugatildi', 'Barcha kartalar o\'rganildi! +50 XP', 'success');
        addXP(50, 'flashcards');
        closeModal('flashcardsModal');
        return;
    }
    
    const card = MOCK_FLASHCARDS[index];
    const inner = document.getElementById('flashcardInner');
    
    // Reset flip
    inner.style.transform = 'rotateY(0deg)';
    
    // Update content with small delay to hide transition if needed, 
    // but here we update immediately for front, back update doesn't matter if hidden
    document.getElementById('flashcardQuestion').textContent = card.q;
    document.getElementById('flashcardAnswer').textContent = card.a;
}

function flipFlashcard() {
    const inner = document.getElementById('flashcardInner');
    const currentTransform = inner.style.transform;
    
    if (currentTransform === 'rotateY(180deg)') {
        inner.style.transform = 'rotateY(0deg)';
    } else {
        inner.style.transform = 'rotateY(180deg)';
    }
}

function nextFlashcard(result) {
    // Visual feedback based on result (optional)
    if (result === 'wrong') {
        // Maybe repeat later? For now just next
    }
    
    currentFlashcardIndex++;
    loadFlashcard(currentFlashcardIndex);
}

function createMindmap() {
    showToast('AI Mind Map', 'Mavzu bo\'yicha mind map generatsiya qilinmoqda...', 'info');
    
    setTimeout(() => {
        showToast('Tayyor', 'Mind Map tayyor! (Demo)', 'success');
        // In real app, open image or interactive view
    }, 2000);
}

async function syncRPGData() {
    if (!AppState.user) return;
    console.log('Syncing RPG data...');
    // This is a placeholder for any additional sync logic needed
    // Most data is already loaded in loadUserData
    await sleep(100); 
}

// ===========================================
// PREMIUM PURCHASE FLOW
// ===========================================

function showPremiumPurchaseModal(planType) {
    // planType: 'premium_week', 'premium_month', 'exclusive_week', 'exclusive_month'
    const prices = CONFIG.PREMIUM_PRICES;
    const planNames = {
        'premium_week': 'Premium 1 haftalik',
        'premium_month': 'Premium 1 oylik',
        'exclusive_week': 'Exclusive 1 haftalik',
        'exclusive_month': 'Exclusive 1 oylik'
    };
    
    const price = prices[planType] || 12990;
    const planName = planNames[planType] || 'Premium';
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal-header">
            <h2>💳 To'lov ma'lumotlari</h2>
            <button class="modal-close" onclick="closeModal('premiumPurchaseModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="payment-info">
                <div class="plan-selected">
                    <span class="plan-icon">${planType.includes('exclusive') ? '💎' : '👑'}</span>
                    <span class="plan-name">${planName}</span>
                    <span class="plan-price">${price.toLocaleString()} so'm</span>
                </div>
                
                <div class="payment-card-section">
                    <h3>🏦 To'lov kartasi:</h3>
                    <div class="card-number" onclick="copyPaymentCard()">
                        <code>${CONFIG.PAYMENT_CARD}</code>
                        <span class="copy-icon">📋</span>
                    </div>
                    <p class="card-holder">👤 ${CONFIG.PAYMENT_HOLDER}</p>
                </div>
                
                <div class="payment-steps">
                    <h3>📋 Yo'riqnoma:</h3>
                    <ol>
                        <li>Yuqoridagi kartaga <b>${price.toLocaleString()} so'm</b> o'tkazing</li>
                        <li>To'lov chekini rasmga oling</li>
                        <li>"Chek yuborish" tugmasini bosing</li>
                        <li>Admin 24 soat ichida tekshiradi</li>
                    </ol>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" onclick="sendPaymentReceipt('${planType}', ${price})">
                📤 Chek yuborish
            </button>
            <button class="btn-secondary" onclick="closeModal('premiumPurchaseModal')">
                Bekor qilish
            </button>
        </div>
    `;
    
    // Check if modal exists, if not create it
    let modal = document.getElementById('premiumPurchaseModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'premiumPurchaseModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `<div class="modal-content">${modalHtml}</div>`;
    modal.classList.add('active');
}

function copyPaymentCard() {
    navigator.clipboard.writeText(CONFIG.PAYMENT_CARD.replace(/\s/g, '')).then(() => {
        showToast('Nusxalandi', 'Karta raqami nusxalandi!', 'success');
    }).catch(() => {
        showToast('Xatolik', 'Nusxalashda xatolik', 'error');
    });
}

function sendPaymentReceipt(planType, price) {
    const userId = AppState.telegramUser?.id || AppState.user?.user_id;
    
    if (!userId) {
        showToast('Xatolik', 'Foydalanuvchi topilmadi', 'error');
        return;
    }
    
    // Close modal first
    closeModal('premiumPurchaseModal');
    
    // Use Telegram WebApp to send data back to bot
    if (window.Telegram?.WebApp) {
        const data = {
            action: 'premium_purchase',
            plan: planType,
            price: price,
            user_id: userId,
            timestamp: Date.now()
        };
        
        // Send data to bot
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        
        showToast('Yuborildi', 'So\'rov botga yuborildi. Chek yuborish uchun botga qayting.', 'success');
        
        // Close WebApp after short delay
        setTimeout(() => {
            window.Telegram.WebApp.close();
        }, 2000);
    } else {
        // Fallback: Open bot with deep link
        const botUsername = CONFIG.BOT_USERNAME;
        const deepLink = `https://t.me/${botUsername}?start=premium_${planType}_${userId}`;
        
        showToast('Botga o\'tish', 'Botda chek yuborish uchun yo\'naltirilmoqda...', 'info');
        
        setTimeout(() => {
            window.open(deepLink, '_blank');
        }, 1500);
    }
}

function buyPremium(planType) {
    showPremiumPurchaseModal(planType);
}

// ===========================================
// TELEGRAM STARS PAYMENT (INTERNATIONAL)
// ===========================================

const STARS_PRICES = {
    'premium_week': { stars: 150, usd: 2.99 },
    'premium_month': { stars: 500, usd: 9.99 },
    'exclusive_week': { stars: 200, usd: 3.99 },
    'exclusive_month': { stars: 750, usd: 14.99 }
};

function showStarsPayment() {
    const modalHtml = `
        <div class="modal-header stars-header">
            <h2>⭐ Telegram Stars bilan to'lash</h2>
            <button class="modal-close" onclick="closeModal('starsPaymentModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="stars-info-banner">
                <div class="stars-icon-large">⭐</div>
                <p>Telegram Stars — xalqaro to'lov tizimi. Visa, Mastercard va boshqa kartalar qabul qilinadi!</p>
            </div>
            
            <div class="stars-plans">
                <div class="stars-plan-card" onclick="initiateStarsPayment('premium_week')">
                    <div class="stars-plan-icon">👑</div>
                    <div class="stars-plan-info">
                        <h4>Premium 1 hafta</h4>
                        <p>100 AI savol/kun, barcha kitoblar</p>
                    </div>
                    <div class="stars-plan-price">
                        <span class="stars-amount">⭐ 150</span>
                        <span class="usd-amount">~$2.99</span>
                    </div>
                </div>
                
                <div class="stars-plan-card popular" onclick="initiateStarsPayment('premium_month')">
                    <div class="popular-tag">ENG FOYDALI</div>
                    <div class="stars-plan-icon">👑</div>
                    <div class="stars-plan-info">
                        <h4>Premium 1 oy</h4>
                        <p>100 AI savol/kun, barcha kitoblar</p>
                    </div>
                    <div class="stars-plan-price">
                        <span class="stars-amount">⭐ 500</span>
                        <span class="usd-amount">~$9.99</span>
                    </div>
                </div>
                
                <div class="stars-plan-card exclusive" onclick="initiateStarsPayment('exclusive_week')">
                    <div class="stars-plan-icon">💎</div>
                    <div class="stars-plan-info">
                        <h4>Exclusive 1 hafta</h4>
                        <p>999 AI savol/kun, VIP imtiyozlar</p>
                    </div>
                    <div class="stars-plan-price">
                        <span class="stars-amount">⭐ 200</span>
                        <span class="usd-amount">~$3.99</span>
                    </div>
                </div>
                
                <div class="stars-plan-card exclusive" onclick="initiateStarsPayment('exclusive_month')">
                    <div class="stars-plan-icon">💎</div>
                    <div class="stars-plan-info">
                        <h4>Exclusive 1 oy</h4>
                        <p>999 AI savol/kun, VIP imtiyozlar</p>
                    </div>
                    <div class="stars-plan-price">
                        <span class="stars-amount">⭐ 750</span>
                        <span class="usd-amount">~$14.99</span>
                    </div>
                </div>
            </div>
            
            <div class="stars-note">
                <i class="fas fa-info-circle"></i>
                <span>To'lov Telegram orqali xavfsiz amalga oshiriladi. Stars sotib olish uchun Telegram ilovasidan foydalaning.</span>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('starsPaymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'starsPaymentModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `<div class="modal-content stars-modal-content">${modalHtml}</div>`;
    modal.classList.add('active');
}

function initiateStarsPayment(planType) {
    const userId = AppState.telegramUser?.id || AppState.user?.user_id;
    const starsPrice = STARS_PRICES[planType];
    
    if (!starsPrice) {
        showToast('Xatolik', 'Noto\'g\'ri tarif', 'error');
        return;
    }
    
    closeModal('starsPaymentModal');
    
    if (window.Telegram?.WebApp) {
        // Use Telegram's native invoice system
        const invoiceData = {
            action: 'stars_payment',
            plan: planType,
            stars: starsPrice.stars,
            user_id: userId,
            timestamp: Date.now()
        };
        
        // Send to bot to create invoice
        window.Telegram.WebApp.sendData(JSON.stringify(invoiceData));
        
        showToast('To\'lov', 'Telegram Stars invoice yaratilmoqda...', 'info');
        
        setTimeout(() => {
            window.Telegram.WebApp.close();
        }, 1500);
    } else {
        // Fallback: Direct bot link with deep link
        const botUsername = CONFIG.BOT_USERNAME;
        const deepLink = `https://t.me/${botUsername}?start=stars_${planType}_${userId}`;
        
        showToast('Botga o\'tish', 'To\'lov uchun botga yo\'naltirilmoqda...', 'info');
        
        setTimeout(() => {
            window.open(deepLink, '_blank');
        }, 1000);
    }
}

// ===========================================
// UI UPDATES (GSAP Enhanced)
// ===========================================

function updateUI() {
    const user = AppState.user;
    if (!user) return;
    
    // Reveal performance hub once data is available
    const perfLoader = document.getElementById('performanceLoader');
    const perfHub = document.getElementById('performanceHub');
    if (perfLoader) perfLoader.classList.add('hidden');
    if (perfHub) perfHub.classList.remove('hidden');
    
    // Header
    document.getElementById('userName').textContent = user.full_name || 'Foydalanuvchi';
    document.getElementById('userAvatar').textContent = (user.full_name || 'U')[0].toUpperCase();
    
    // Animate numbers
    ANIMATIONS.animateNumber('headerXP', user.xp || 0);
    ANIMATIONS.animateNumber('headerGold', user.gold || 0);
    
    // User tier
    const tierEl = document.getElementById('userTier');
    const tierName = user.premium_type === 'exclusive' ? 'Exclusive' : 
                     user.premium_type === 'premium' ? 'Premium' : 'Free';
    tierEl.innerHTML = `<i class="fas fa-circle"></i><span>${tierName}</span>`;
    tierEl.className = `user-tier ${user.is_premium ? 'premium' : ''}`;
    
    // Level insights
    const levelInfo = calculateLevel(user.xp || 0);
    const nextXPDelta = Math.max(0, (levelInfo.nextLevelXP || 0) - (levelInfo.levelXP || 0));
    
    const levelNameEl = document.getElementById('levelName');
    if (levelNameEl) levelNameEl.textContent = levelInfo.name;
    
    const statLevelLarge = document.getElementById('statLevelLarge');
    if (statLevelLarge) statLevelLarge.textContent = levelInfo.level;
    
    const levelProgressFill = document.getElementById('levelProgressFill');
    if (levelProgressFill) {
        gsap.to(levelProgressFill, { width: `${levelInfo.percent}%`, duration: 0.6, ease: 'power2.out' });
    }
    
    const levelCurrentXP = document.getElementById('levelCurrentXP');
    if (levelCurrentXP) {
        levelCurrentXP.textContent = `${formatNumber(levelInfo.levelXP)} / ${formatNumber(levelInfo.nextLevelXP)} XP`;
    }
    
    const levelNextXP = document.getElementById('levelNextXP');
    if (levelNextXP) {
        levelNextXP.textContent = `${formatNumber(nextXPDelta)} XP to go`;
    }
    
    const xpDelta = document.getElementById('xpDelta');
    if (xpDelta) xpDelta.textContent = `${formatNumber(nextXPDelta)} XP`;
    
    // Focus cards
    const streakValue = user.streak_count || 0;
    const streakValueEl = document.getElementById('streakValue');
    if (streakValueEl) streakValueEl.textContent = streakValue;
    
    const streakNote = document.getElementById('streakNote');
    if (streakNote) {
        streakNote.textContent = streakValue > 0 ? `${streakValue} kun ketma-ket` : 'Start your streak';
    }
    
    const streakProgress = document.getElementById('streakProgress');
    if (streakProgress) {
        const streakPercent = Math.min(100, (streakValue / 7) * 100);
        streakProgress.style.width = `${streakPercent}%`;
    }
    
    const rankValue = document.getElementById('rankValue');
    if (rankValue) rankValue.textContent = user.rank_position ? `#${user.rank_position}` : '#--';
    
    const rankNote = document.getElementById('rankNote');
    if (rankNote) {
        rankNote.textContent = user.rank_position ? 'Top joyda davom eting' : 'Top bo‘lish uchun raqobat';
    }
    
    // Quiz limits
    const limit = CONFIG.QUIZ_LIMITS[user.premium_type] || CONFIG.QUIZ_LIMITS.free;
    const used = user.quiz_count_today || 0;
    const remaining = Math.max(0, limit - used);
    
    AppState.quiz.remaining = remaining;
    AppState.quiz.total = limit;
    
    const quizUsage = document.getElementById('quizUsage');
    if (quizUsage) quizUsage.textContent = `${used}/${limit}`;
    
    const quizNote = document.getElementById('quizNote');
    if (quizNote) quizNote.textContent = remaining > 0 ? `${remaining} ta savol qoldi` : 'Premiumda cheksiz';
    
    const quizUsageBar = document.getElementById('quizUsageBar');
    if (quizUsageBar) {
        const usagePercent = Math.min(100, (used / limit) * 100);
        quizUsageBar.style.width = `${usagePercent}%`;
    }
    
    const quizRemainingEl = document.getElementById('quizRemaining');
    if (quizRemainingEl) quizRemainingEl.textContent = remaining;
    const quizTotalEl = document.getElementById('quizTotal');
    if (quizTotalEl) quizTotalEl.textContent = limit;
    
    // Badge strip
    const badgeQuiz = document.getElementById('badgeQuizzes');
    if (badgeQuiz) badgeQuiz.querySelector('.chip-value').textContent = `${used} ta`;
    
    const badgeFocus = document.getElementById('badgeFocus');
    if (badgeFocus) {
        const focusMinutes = user.focus_minutes || (streakValue * 10);
        badgeFocus.querySelector('.chip-value').textContent = `${focusMinutes} min`;
    }
    
    const badgeGold = document.getElementById('badgeGold');
    if (badgeGold) badgeGold.querySelector('.chip-value').textContent = formatNumber(user.gold || 0);
    
    // Mining balance
    ANIMATIONS.animateNumber('miningBalance', Math.floor(AppState.mining.balance));
    
    // Profile
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = user.full_name || 'Foydalanuvchi';
    
    const profileTierEl = document.getElementById('profileTier');
    if (profileTierEl) {
        profileTierEl.textContent = tierName + (user.is_premium ? ' Plan' : ' Account');
        profileTierEl.style.color = user.is_premium ? 'var(--accent-gold)' : 'var(--text-muted)';
    }
    
    ANIMATIONS.animateNumber('profileXP', user.xp || 0);
    ANIMATIONS.animateNumber('profileGold', user.gold || 0);
    
    const profileLevelEl = document.getElementById('profileLevel');
    if (profileLevelEl) profileLevelEl.textContent = user.level || 1;
    
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    if (profileAvatarLarge) {
        profileAvatarLarge.textContent = (user.full_name || 'U')[0].toUpperCase();
    }

    const statStreakProfile = document.getElementById('statStreakProfile');
    if (statStreakProfile) statStreakProfile.textContent = streakValue;
    
    const statQuizzesProfile = document.getElementById('statQuizzesProfile');
    if (statQuizzesProfile) statQuizzesProfile.textContent = used;
    
    // Energy bar
    const energyFill = document.getElementById('energyFill');
    if (energyFill) {
        const energyPercent = (AppState.mining.energy / CONFIG.MAX_ENERGY) * 100;
        gsap.to(energyFill, { width: energyPercent + '%', duration: 0.5, ease: 'power2.out' });
    }
    
    // Prestige UI
    const prestigeSection = document.getElementById('prestigeSection');
    const prestigeRewardEl = document.getElementById('prestigeReward');
    
    if (prestigeSection && prestigeRewardEl) {
        const reward = calculatePrestigeReward();
        prestigeRewardEl.textContent = formatNumber(reward);
        prestigeSection.style.display = reward >= 1 ? 'block' : 'none';
    }
}

function navigateTo(section) {
    const currentId = AppState.currentSection === 'home' ? 'sectionHome' : 
                      AppState.currentSection === 'quiz' ? 'sectionQuiz' : 
                      'section' + AppState.currentSection.charAt(0).toUpperCase() + AppState.currentSection.slice(1);
                      
    const targetMap = {
        'home': 'sectionHome',
        'quiz': 'sectionQuiz',
        'gamification': 'sectionGamification',
        'premium': 'sectionPremium',
        'battle': 'sectionBattle',
        'profile': 'sectionProfile',
        'new_features': 'sectionNewFeatures',
        'wayground': 'sectionWayground',
        'bot_tests': 'sectionBotTests'
    };
    
    const targetId = targetMap[section] || 'sectionHome';
    
    // Use GSAP Controller
    ANIMATIONS.switchSection(currentId, targetId);
    
    // Special handling
    if (section === 'gamification') renderLeaderboard();
    if (section === 'wayground') loadWaygroundRooms();
    if (section === 'bot_tests') loadBotTestCategories();
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    AppState.currentSection = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleTap(e) {
    if (AppState.mining.energy <= 0) {
        showToast('Energiya tugadi', 'Energiya tiklanishini kuting', 'error');
        triggerFeedback('error');
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        return;
    }
    
    if (audio && audio.ctx && audio.ctx.state === 'suspended') {
        audio.ctx.resume();
    }
    
    // Critical Hit
    const isCritical = Math.random() * 100 < (AppState.mining.critChance || 5);
    const baseReward = AppState.mining.tapPower * AppState.mining.multiplier;
    const reward = isCritical ? baseReward * 2 : baseReward;
    
    AppState.mining.energy = Math.max(0, AppState.mining.energy - CONFIG.TAP_COST);
    AppState.mining.balance += reward;
    AppState.mining.accumulatedCoins = (AppState.mining.accumulatedCoins || 0) + reward;
    
    // GSAP Animation
    ANIMATIONS.animateTap(document.querySelector('.tap-circle'));
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);
    
    // Floating Text
    const text = isCritical ? 'CRIT!' : '+' + Math.floor(reward);
    ANIMATIONS.spawnFloater(x, y, text, isCritical);
    
    // Particles
    if (particleSystem) {
        particleSystem.emit(x, y, isCritical ? 20 : 8, isCritical ? '#ff006e' : '#ffd700');
    }
    createShockwave(x, y);
    
    // Audio & Haptic
    if (isCritical) {
        playSound('critical');
        triggerFeedback('critical');
    } else {
        playSound('tap');
        triggerFeedback('tap');
    }
    
    // Logic
    if (AppState.mining.balance >= 1) checkAchievements();
    if (AppState.mining.accumulatedCoins >= 1000) checkAchievements();
    updateChallengeProgress('taps', 1);
    updateChallengeProgress('gold', reward);
    
    updateUI();
}

// ===========================================
// WAYGROUND - COLLABORATIVE WORKSPACE
// ===========================================

let waygroundRooms = [];
let currentWaygroundRoom = null;

async function loadWaygroundRooms() {
    const listEl = document.getElementById('waygroundRoomsList');
    if (!listEl) return;
    
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('wayground_rooms')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data && data.length > 0) {
                waygroundRooms = data;
                renderWaygroundRooms();
                return;
            }
        }
    } catch (e) {
        console.log('Wayground rooms load:', e);
    }
    
    // Show empty state
    listEl.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Hozircha faol xonalar yo'q</p>
            <button class="start-quiz-btn" onclick="createWaygroundRoom()">
                <i class="fas fa-plus"></i> Birinchi xonani yarating
            </button>
        </div>
    `;
}

function renderWaygroundRooms() {
    const listEl = document.getElementById('waygroundRoomsList');
    if (!listEl || waygroundRooms.length === 0) return;
    
    listEl.innerHTML = waygroundRooms.map(room => `
        <div class="room-item glass-card" onclick="joinWaygroundRoomById('${room.id}')">
            <div class="room-avatar">
                <i class="fas fa-users"></i>
            </div>
            <div class="room-info">
                <div class="room-name">${room.name || 'Xona #' + room.id.slice(0,4)}</div>
                <div class="room-members">${room.member_count || 1} ishtirokchi • ${room.type || 'study'}</div>
            </div>
            <i class="fas fa-chevron-right" style="color: var(--text-muted);"></i>
        </div>
    `).join('');
}

async function createWaygroundRoom() {
    const roomName = prompt("Xona nomini kiriting:", "Mening xonam");
    if (!roomName) return;
    
    showToast('Yaratilmoqda...', 'Xona yaratilmoqda', 'info');
    
    try {
        if (supabaseClient && AppState.user) {
            const roomId = 'WG' + Date.now().toString(36).toUpperCase();
            
            const { data, error } = await supabaseClient
                .from('wayground_rooms')
                .insert({
                    id: roomId,
                    name: roomName,
                    creator_id: AppState.user.user_id,
                    type: 'study',
                    is_active: true,
                    member_count: 1,
                    settings: { max_members: 10, allow_chat: true }
                })
                .select()
                .single();
            
            if (error) throw error;
            
            currentWaygroundRoom = data;
            showToast('Muvaffaqiyat!', `"${roomName}" xonasi yaratildi`, 'success');
            
            // Share room code
            const shareText = `🎯 Wayground xonasiga qo'shiling!\n\nXona: ${roomName}\nKod: ${roomId}\n\nBot: @${CONFIG.BOT_USERNAME}`;
            
            if (window.Telegram?.WebApp) {
                Telegram.WebApp.switchInlineQuery(roomId, ['users']);
            } else {
                navigator.clipboard.writeText(shareText);
                showToast('Nusxalandi', 'Xona kodi nusxalandi', 'success');
            }
            
            loadWaygroundRooms();
        } else {
            // Fallback - open bot
            openBotWithCommand('wayground_create');
        }
    } catch (e) {
        console.error('Create room error:', e);
        showToast('Xatolik', 'Xona yaratib bo\'lmadi', 'error');
    }
}

async function joinWaygroundRoom() {
    const roomCode = prompt("Xona kodini kiriting:");
    if (!roomCode) return;
    
    await joinWaygroundRoomById(roomCode.trim().toUpperCase());
}

async function joinWaygroundRoomById(roomId) {
    showToast('Qo\'shilmoqda...', 'Xonaga kirilmoqda', 'info');
    
    try {
        if (supabaseClient && AppState.user) {
            // Check if room exists
            const { data: room, error } = await supabaseClient
                .from('wayground_rooms')
                .select('*')
                .eq('id', roomId)
                .eq('is_active', true)
                .single();
            
            if (error || !room) {
                showToast('Xatolik', 'Xona topilmadi', 'error');
                return;
            }
            
            // Add as member
            await supabaseClient
                .from('wayground_members')
                .upsert({
                    room_id: roomId,
                    user_id: AppState.user.user_id,
                    joined_at: new Date().toISOString()
                });
            
            // Update member count
            await supabaseClient
                .from('wayground_rooms')
                .update({ member_count: (room.member_count || 1) + 1 })
                .eq('id', roomId);
            
            currentWaygroundRoom = room;
            showToast('Muvaffaqiyat!', `"${room.name}" xonasiga qo'shildingiz`, 'success');
            
            // Open room in bot for full features
            openBotWithCommand(`wayground_join_${roomId}`);
        } else {
            openBotWithCommand(`wayground_join_${roomId}`);
        }
    } catch (e) {
        console.error('Join room error:', e);
        showToast('Xatolik', 'Xonaga kirib bo\'lmadi', 'error');
    }
}

// ===========================================
// BOT TESTS - TELEGRAM BOT INTEGRATION
// ===========================================

let botTestCategories = [];
let recentBotTests = [];

function loadBotTestCategories() {
    // Categories are static in HTML, but we can load counts from API
    loadRecentBotTests();
}

async function loadRecentBotTests() {
    const listEl = document.getElementById('recentBotTests');
    if (!listEl) return;
    
    try {
        if (supabaseClient && AppState.user) {
            const { data, error } = await supabaseClient
                .from('user_quiz_history')
                .select('*')
                .eq('user_id', AppState.user.user_id)
                .order('completed_at', { ascending: false })
                .limit(5);
            
            if (data && data.length > 0) {
                recentBotTests = data;
                renderRecentBotTests();
                return;
            }
        }
    } catch (e) {
        console.log('Recent tests load:', e);
    }
    
    // Show empty state
    listEl.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>Hali test yechmagansiz</p>
        </div>
    `;
}

function renderRecentBotTests() {
    const listEl = document.getElementById('recentBotTests');
    if (!listEl || recentBotTests.length === 0) return;
    
    listEl.innerHTML = recentBotTests.map(test => `
        <div class="test-item">
            <div class="test-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="test-info">
                <div class="test-name">${test.quiz_name || 'Test #' + test.id}</div>
                <div class="test-result">${test.correct_count}/${test.total_questions} to'g'ri • ${formatTimeAgo(test.completed_at)}</div>
            </div>
            <div class="test-score">${Math.round((test.correct_count / test.total_questions) * 100)}%</div>
        </div>
    `).join('');
}

function loadBotTests(category) {
    // Send user to bot with specific test category
    const categoryCommands = {
        'dtm': 'dtm_tests',
        'english': 'english_tests',
        'math': 'math_tests',
        'science': 'science_tests',
        'history': 'history_tests',
        'it': 'it_tests'
    };
    
    const command = categoryCommands[category] || 'tests';
    
    showToast('Yuklanmoqda...', `${category.toUpperCase()} testlari`, 'info');
    
    // Send data to bot via WebApp
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
            action: 'load_tests',
            category: category
        }));
        
        // Also open bot
        setTimeout(() => {
            openBotWithCommand(command);
        }, 500);
    } else {
        openBotWithCommand(command);
    }
}

function openBotForTest() {
    openBotWithCommand('create_test');
}

function openBotWithCommand(command) {
    const botUrl = `https://t.me/${CONFIG.BOT_USERNAME}?start=${command}`;
    
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.openTelegramLink(botUrl);
    } else {
        window.open(botUrl, '_blank');
    }
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'hozirgina';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays < 7) return `${diffDays} kun oldin`;
    
    return date.toLocaleDateString('uz-UZ');
}

// ===========================================
// MISSING UTILITY FUNCTIONS
// ===========================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: rgba(20, 20, 30, 0.95);
        border: 1px solid ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-pink)' : 'var(--accent-primary)'};
        border-radius: 12px;
        padding: 12px 16px;
        min-width: 250px;
        max-width: 350px;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease;
    `;
    
    const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    const colorMap = { success: 'var(--accent-green)', error: 'var(--accent-pink)', info: 'var(--accent-cyan)', warning: 'var(--accent-gold)' };
    
    toast.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas ${iconMap[type] || iconMap.info}" style="color: ${colorMap[type] || colorMap.info}; font-size: 1.2rem; margin-top: 2px;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${title}</div>
                ${message ? `<div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">${message}</div>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0;"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => toast.remove(), 300); } }, 4000);
}

function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addXP(amount, source = 'unknown') {
    if (!AppState.user) return;
    AppState.user.xp = (AppState.user.xp || 0) + amount;
    
    const oldLevel = AppState.user.level || 1;
    const newLevel = Math.floor(Math.sqrt(AppState.user.xp / 100)) + 1;
    
    if (newLevel > oldLevel) {
        AppState.user.level = newLevel;
        showToast('Level Up!', `Siz ${newLevel}-darajaga chiqdingiz!`, 'success');
        playSound('levelUp');
    }
    
    if (supabaseClient) {
        await supabaseClient.from('users').update({ xp: AppState.user.xp, level: AppState.user.level }).eq('user_id', AppState.user.user_id);
    }
    updateUI();
    saveLocalState();
}

async function addGold(amount, source = 'unknown') {
    if (!AppState.user) return;
    AppState.user.gold = (AppState.user.gold || 0) + amount;
    
    if (supabaseClient) {
        await supabaseClient.from('users').update({ gold: AppState.user.gold }).eq('user_id', AppState.user.user_id);
    }
    updateUI();
    saveLocalState();
}

async function updateUserStats(updates) {
    if (!AppState.user) return false;
    Object.assign(AppState.user, updates);
    
    if (supabaseClient) {
        try {
            await supabaseClient.from('users').update(updates).eq('user_id', AppState.user.user_id);
        } catch (e) { console.error('Update user stats error:', e); }
    }
    updateUI();
    saveLocalState();
    return true;
}

function createShockwave(x, y) {
    const shockwave = document.createElement('div');
    shockwave.style.cssText = `
        position: fixed; left: ${x}px; top: ${y}px; width: 10px; height: 10px;
        border: 2px solid var(--accent-primary); border-radius: 50%;
        pointer-events: none; transform: translate(-50%, -50%); z-index: 9998;
    `;
    document.body.appendChild(shockwave);
    
    if (window.gsap) {
        gsap.to(shockwave, { width: 100, height: 100, opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => shockwave.remove() });
    } else {
        shockwave.style.animation = 'shockwave 0.5s ease-out forwards';
        setTimeout(() => shockwave.remove(), 500);
    }
}

// Particle System
class ParticleSystem {
    constructor() { this.particles = []; }
    
    emit(x, y, count = 10, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed; left: ${x}px; top: ${y}px; width: 6px; height: 6px;
                background: ${color}; border-radius: 50%; pointer-events: none; z-index: 9997;
            `;
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 / count) * i;
            const velocity = 50 + Math.random() * 100;
            const endX = x + Math.cos(angle) * velocity;
            const endY = y + Math.sin(angle) * velocity;
            
            if (window.gsap) {
                gsap.to(particle, { left: endX, top: endY, opacity: 0, scale: 0, duration: 0.6, ease: 'power2.out', onComplete: () => particle.remove() });
            } else {
                setTimeout(() => particle.remove(), 600);
            }
        }
    }
}

const particleSystem = new ParticleSystem();

function initVisuals() {
    console.log('Visuals initialized');
    // Add CSS animations if not present
    if (!document.getElementById('dynamicStyles')) {
        const style = document.createElement('style');
        style.id = 'dynamicStyles';
        style.textContent = `
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            @keyframes shockwave { from { width: 10px; height: 10px; opacity: 1; } to { width: 100px; height: 100px; opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
}

function initMining() {
    applyUpgradeEffects();
    
    // Energy regeneration
    setInterval(() => {
        if (AppState.mining.energy < AppState.mining.maxEnergy) {
            AppState.mining.energy = Math.min(AppState.mining.energy + CONFIG.ENERGY_REGEN_RATE, AppState.mining.maxEnergy);
            updateUI();
        }
    }, 1000);
    
    // Auto tap
    setInterval(() => {
        if (AppState.mining.autoTapRate > 0 && AppState.mining.energy > 0) {
            const reward = AppState.mining.autoTapRate * AppState.mining.multiplier;
            AppState.mining.balance += reward;
            AppState.mining.accumulatedCoins = (AppState.mining.accumulatedCoins || 0) + reward;
            AppState.mining.energy = Math.max(0, AppState.mining.energy - 1);
            updateUI();
        }
    }, 1000);
    
    console.log('Mining initialized');
}

function initRecommendations() {
    const carousel = document.getElementById('recommendationsCarousel');
    if (!carousel || !AppState.recommendations) return;
    
    carousel.innerHTML = AppState.recommendations.map(rec => `
        <div class="recommendation-card glass-card" onclick="navigateTo('${rec.id}')">
            <div class="rec-badge">${rec.badge}</div>
            <div class="rec-icon"><i class="fas ${rec.icon}"></i></div>
            <div class="rec-content">
                <h4>${rec.title}</h4>
                <p>${rec.desc}</p>
            </div>
        </div>
    `).join('');
    
    console.log('Recommendations initialized');
}

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const ref = urlParams.get('ref') || urlParams.get('start');
    
    if (section) navigateTo(section);
    if (ref) handleReferral(ref);
    
    console.log('URL params handled');
}

function showBattleLobby() {
    const section = document.getElementById('sectionBattle');
    if (!section) return;
    
    section.innerHTML = `
        <div class="battle-lobby glass-card">
            <div class="lobby-header">
                <h2><i class="fas fa-bolt"></i> Battle Lobby</h2>
                <div class="lobby-id">Room: ${AppState.battle.id || 'Loading...'}</div>
            </div>
            <div class="lobby-participants" id="lobbyParticipants">
                <div class="participant-item">
                    <div class="participant-avatar">${(AppState.user?.full_name || 'U')[0]}</div>
                    <div class="participant-name">${AppState.user?.full_name || 'Siz'}</div>
                    <div class="participant-status creator">Host</div>
                </div>
            </div>
            <div class="lobby-actions">
                ${AppState.battle.isCreator ? `<button class="start-quiz-btn" onclick="startBattleGame()"><i class="fas fa-play"></i> Boshlash</button>` : '<p>Host boshlashini kuting...</p>'}
                <button class="btn-secondary" onclick="leaveBattle()"><i class="fas fa-sign-out-alt"></i> Chiqish</button>
            </div>
            <div class="lobby-share">
                <p>Do'stlarni taklif qiling:</p>
                <button onclick="shareBattleLink()"><i class="fas fa-share"></i> Ulashish</button>
            </div>
        </div>
    `;
}

function showQuizResults() {
    const questions = AppState.quiz.questions;
    const score = AppState.quiz.score;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    
    const xpEarned = score * 10;
    const goldEarned = score >= total ? 5 : 0;
    
    addXP(xpEarned, 'quiz');
    if (goldEarned > 0) addGold(goldEarned, 'quiz_perfect');
    
    const section = document.getElementById('sectionQuiz');
    section.innerHTML = `
        <div class="quiz-results glass-card">
            <div class="results-icon">${percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
            <h2>Test yakunlandi!</h2>
            <div class="results-score">
                <div class="score-circle" style="background: conic-gradient(var(--accent-primary) ${percentage}%, transparent ${percentage}%);">
                    <span>${percentage}%</span>
                </div>
            </div>
            <div class="results-stats">
                <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">To'g'ri</span></div>
                <div class="stat"><span class="stat-value">${total - score}</span><span class="stat-label">Noto'g'ri</span></div>
                <div class="stat"><span class="stat-value">+${xpEarned}</span><span class="stat-label">XP</span></div>
            </div>
            <div class="results-actions">
                <button class="start-quiz-btn" onclick="resetQuiz()"><i class="fas fa-redo"></i> Qayta urinish</button>
                <button class="btn-secondary" onclick="navigateTo('home')"><i class="fas fa-home"></i> Bosh sahifa</button>
            </div>
        </div>
    `;
    
    updateChallengeProgress('quiz', 1);
}

function resetQuiz() {
    AppState.quiz.currentQuestion = 0;
    AppState.quiz.score = 0;
    AppState.quiz.answers = [];
    renderQuizSetup();
}

function renderQuizSetup() {
    const section = document.getElementById('sectionQuiz');
    if (!section) return;
    
    section.innerHTML = `
        <div class="quiz-setup glass-card">
            <h2><i class="fas fa-brain"></i> AI Quiz</h2>
            <div class="quiz-limit-info">
                <span id="quizRemaining">${AppState.quiz.remaining}</span>/<span id="quizTotal">${AppState.quiz.total}</span> test qoldi
            </div>
            <div class="quiz-options">
                <div class="option-group">
                    <label>Mavzu</label>
                    <select id="quizTopic" onchange="AppState.quiz.topic = this.value">
                        <option value="general">Umumiy bilim</option>
                        <option value="science">Fan</option>
                        <option value="history">Tarix</option>
                        <option value="it">IT</option>
                    </select>
                </div>
                <div class="option-group">
                    <label>Qiyinlik</label>
                    <select id="quizDifficulty" onchange="AppState.quiz.difficulty = this.value">
                        <option value="easy">Oson</option>
                        <option value="medium">O'rta</option>
                        <option value="hard">Qiyin</option>
                    </select>
                </div>
                <div class="option-group">
                    <label>Savollar soni</label>
                    <select id="quizCount" onchange="AppState.quiz.count = parseInt(this.value)">
                        <option value="5">5 ta</option>
                        <option value="10">10 ta</option>
                        <option value="15">15 ta</option>
                    </select>
                </div>
            </div>
            <button class="start-quiz-btn" onclick="startQuiz()"><i class="fas fa-play"></i> Testni boshlash</button>
        </div>
    `;
}

function leaveBattle() {
    AppState.battle.active = false;
    AppState.battle.id = null;
    AppState.battle.isCreator = false;
    navigateTo('home');
    showToast('Battle', 'Battledan chiqdingiz', 'info');
}

function shareBattleLink() {
    const link = `https://t.me/${CONFIG.BOT_USERNAME}?start=battle_${AppState.battle.id}`;
    if (navigator.share) {
        navigator.share({ title: 'Battle ga qo\'shiling!', url: link });
    } else {
        navigator.clipboard.writeText(link);
        showToast('Nusxalandi', 'Havola nusxalandi!', 'success');
    }
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    // Mock leaderboard data
    const mockData = [
        { name: 'Ali', xp: 15000, level: 12 },
        { name: 'Vali', xp: 12500, level: 10 },
        { name: 'Sardi', xp: 10000, level: 9 },
        { name: 'Jasur', xp: 8500, level: 8 },
        { name: 'Nodira', xp: 7000, level: 7 }
    ];
    
    const medals = ['🥇', '🥈', '🥉'];
    
    container.innerHTML = mockData.map((user, i) => `
        <div class="leaderboard-item glass-card">
            <div class="rank">${medals[i] || (i + 1)}</div>
            <div class="user-info">
                <div class="user-avatar">${user.name[0]}</div>
                <div class="user-details">
                    <div class="user-name">${user.name}</div>
                    <div class="user-level">Level ${user.level}</div>
                </div>
            </div>
            <div class="user-xp">${formatNumber(user.xp)} XP</div>
        </div>
    `).join('');
}
