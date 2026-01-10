// ========== STATE MANAGER ==========
class StateManager {
    constructor() {
        this.state = this.loadState();
        this.subscribers = [];
    }

    loadState() {
        const saved = localStorage.getItem('nexus_state');
        const defaultState = {
            user: { id: 0, name: 'Foydalanuvchi', username: '', tier: 'Standard', avatar: '👤' },
            xp: 0, gold: 0, level: 1, streak: 0, referrals: 0,
            energy: 100, maxEnergy: 100, clickPower: 1, autoTap: 0, critChance: 5,
            totalClicks: 0, totalGold: 0, darkMatter: 0, prestigeCount: 0,
            upgrades: { power: 0, energy: 0, auto: 0, crit: 0 },
            achievements: [], challenges: [], lastDaily: null, lastEnergy: Date.now(),
            settings: { sound: true, haptics: true, theme: 'default' },
            isPremium: false, premiumEnd: null
        };
        return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    }

    saveState() {
        localStorage.setItem('nexus_state', JSON.stringify(this.state));
    }

    subscribe(fn) { this.subscribers.push(fn); }
    notify() { this.subscribers.forEach(fn => fn(this.state)); this.saveState(); }
    
    update(changes) {
        Object.assign(this.state, changes);
        this.notify();
    }

    get(key) { return this.state[key]; }
}

const state = new StateManager();

// ========== TELEGRAM WEBAPP ==========
const tg = window.Telegram?.WebApp;
const ADMIN_IDS = [1087968824, 5765169612];
let isAdmin = false;

// ========== AUDIO ENGINE ==========
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    play(type) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch(type) {
            case 'click':
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
                osc.start(); osc.stop(this.ctx.currentTime + 0.1);
                break;
            case 'critical':
                osc.frequency.value = 1200;
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                osc.start(); osc.stop(this.ctx.currentTime + 0.2);
                break;
            case 'levelup':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, this.ctx.currentTime);
                osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
                osc.start(); osc.stop(this.ctx.currentTime + 0.4);
                break;
            case 'drop':
                osc.type = 'triangle';
                osc.frequency.value = 600;
                gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                osc.start(); osc.stop(this.ctx.currentTime + 0.3);
                break;
        }
    }
}

const audio = new AudioEngine();

// ========== HAPTIC FEEDBACK ==========
function haptic(type = 'light') {
    if (!state.get('settings').haptics) return;
    if (tg?.HapticFeedback) {
        if (type === 'success' || type === 'error' || type === 'warning') {
            tg.HapticFeedback.notificationOccurred(type);
        } else {
            tg.HapticFeedback.impactOccurred(type);
        }
    }
}

// ========== PARTICLE SYSTEM ==========
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
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 3 + Math.random() * 3
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.vx *= 0.98; // friction
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        requestAnimationFrame(() => this.update());
    }
}

// ========== WEBGL BACKGROUND ==========
class MeshGradient {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.colors = [
            { r: 10, g: 10, b: 30 },
            { r: 0, g: 100, b: 150 },
            { r: 100, g: 50, b: 150 },
            { r: 150, g: 100, b: 50 }
        ];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.time += 0.005;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        const gradient = this.ctx.createRadialGradient(
            w/2 + Math.sin(this.time) * 100, h/2 + Math.cos(this.time * 0.7) * 100, 0,
            w/2, h/2, Math.max(w, h)
        );
        
        gradient.addColorStop(0, `rgba(0, 240, 255, 0.1)`);
        gradient.addColorStop(0.3, `rgba(168, 85, 247, 0.08)`);
        gradient.addColorStop(0.6, `rgba(10, 10, 30, 0.9)`);
        gradient.addColorStop(1, `rgba(3, 3, 8, 1)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Floating orbs
        for (let i = 0; i < 3; i++) {
            const x = w/2 + Math.sin(this.time + i * 2) * (w * 0.3);
            const y = h/2 + Math.cos(this.time * 0.8 + i * 2) * (h * 0.3);
            const grad = this.ctx.createRadialGradient(x, y, 0, x, y, 150);
            grad.addColorStop(0, i === 0 ? 'rgba(0,240,255,0.15)' : i === 1 ? 'rgba(168,85,247,0.15)' : 'rgba(255,215,0,0.1)');
            grad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, w, h);
        }

        requestAnimationFrame(() => this.render());
    }
}

// ========== LEADERBOARD DATA ==========
const FAKE_USERS = [
    { name: 'Elon_Mars', xp: 99999, level: 50 },
    { name: 'CryptoKing', xp: 85000, level: 45 },
    { name: 'NotCoiner', xp: 72000, level: 40 },
    { name: 'TechWizard', xp: 65000, level: 38 },
    { name: 'AImaster', xp: 58000, level: 35 },
    { name: 'CodeNinja', xp: 52000, level: 33 },
    { name: 'DataDragon', xp: 48000, level: 31 },
    { name: 'QuantumX', xp: 45000, level: 29 },
    { name: 'NeuralNet', xp: 42000, level: 28 },
    { name: 'ByteKing', xp: 39000, level: 27 },
    { name: 'PixelPro', xp: 36000, level: 26 },
    { name: 'CloudMaster', xp: 33000, level: 25 },
    { name: 'DevOpsGuru', xp: 30000, level: 24 },
    { name: 'StackOverflow', xp: 28000, level: 23 },
    { name: 'GitHubStar', xp: 26000, level: 22 },
    { name: 'ReactPro', xp: 24000, level: 21 },
    { name: 'PythonMaster', xp: 22000, level: 20 },
    { name: 'JSWizard', xp: 20000, level: 19 },
    { name: 'SQLKing', xp: 18000, level: 18 },
    { name: 'APIexpert', xp: 16000, level: 17 }
];

// ========== ACHIEVEMENTS ==========
const ACHIEVEMENTS = [
    { id: 'first_click', name: 'Birinchi qadam', icon: '👆', desc: 'Birinchi marta bosish', condition: s => s.totalClicks >= 1 },
    { id: 'click_100', name: 'Bosuvchi', icon: '🖱️', desc: '100 marta bosish', condition: s => s.totalClicks >= 100 },
    { id: 'click_1000', name: 'Klik ustasi', icon: '⚡', desc: '1000 marta bosish', condition: s => s.totalClicks >= 1000 },
    { id: 'gold_100', name: 'Oltin yig\'uvchi', icon: '🪙', desc: '100 oltin yig\'ish', condition: s => s.totalGold >= 100 },
    { id: 'gold_1000', name: 'Boylik', icon: '💰', desc: '1000 oltin yig\'ish', condition: s => s.totalGold >= 1000 },
    { id: 'gold_10000', name: 'Millioner', icon: '🤑', desc: '10000 oltin yig\'ish', condition: s => s.totalGold >= 10000 },
    { id: 'level_5', name: 'O\'sish', icon: '📈', desc: '5-darajaga yetish', condition: s => s.level >= 5 },
    { id: 'level_10', name: 'Tajribali', icon: '🎖️', desc: '10-darajaga yetish', condition: s => s.level >= 10 },
    { id: 'level_20', name: 'Ekspert', icon: '🏆', desc: '20-darajaga yetish', condition: s => s.level >= 20 },
    { id: 'streak_3', name: 'Doimiy', icon: '🔥', desc: '3 kunlik streak', condition: s => s.streak >= 3 },
    { id: 'streak_7', name: 'Haftalik', icon: '🌟', desc: '7 kunlik streak', condition: s => s.streak >= 7 },
    { id: 'prestige_1', name: 'Qayta tug\'ilish', icon: '🌀', desc: 'Birinchi prestige', condition: s => s.prestigeCount >= 1 }
];

// ========== CHALLENGES ==========
function getDailyChallenges() {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    
    return [
        { id: 'clicks', name: '100 marta bosish', target: 100, current: 0, reward: 50, icon: '👆' },
        { id: 'gold', name: '500 oltin yig\'ish', target: 500, current: 0, reward: 100, icon: '🪙' },
        { id: 'energy', name: '50 energiya sarflash', target: 50, current: 0, reward: 75, icon: '⚡' }
    ];
}

// ========== MYSTERY DROP ==========
let mysteryDropTimeout = null;

function spawnMysteryDrop() {
    if (document.querySelector('.mystery-drop')) return;
    
    const drop = document.createElement('div');
    drop.className = 'mystery-drop';
    drop.innerHTML = '🎁';
    drop.style.top = Math.random() * 60 + 10 + '%';
    drop.style.left = '-80px';
    
    drop.onclick = () => collectDrop(drop);
    document.body.appendChild(drop);
    
    // Animate across screen
    let pos = -80;
    const speed = 0.5 + Math.random() * 0.5;
    const moveInterval = setInterval(() => {
        pos += speed;
        drop.style.left = pos + 'px';
        if (pos > window.innerWidth + 80) {
            clearInterval(moveInterval);
            drop.remove();
        }
    }, 16);
    
    drop.dataset.interval = moveInterval;
    
    // Schedule next drop
    mysteryDropTimeout = setTimeout(spawnMysteryDrop, (60 + Math.random() * 60) * 1000);
}

function collectDrop(drop) {
    clearInterval(parseInt(drop.dataset.interval));
    drop.remove();
    
    audio.play('drop');
    haptic('success');
    
    const rewards = [
        { type: 'gold', amount: 50 + Math.floor(Math.random() * 100), rarity: 'common' },
        { type: 'gold', amount: 200 + Math.floor(Math.random() * 300), rarity: 'rare' },
        { type: 'boost', duration: 30, multiplier: 2, rarity: 'rare' },
        { type: 'energy', amount: 50, rarity: 'common' }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (reward.type === 'gold') {
        state.update({ gold: state.get('gold') + reward.amount, totalGold: state.get('totalGold') + reward.amount });
        showToast(`🎁 +${reward.amount} Oltin!`, 'success');
    } else if (reward.type === 'energy') {
        const newEnergy = Math.min(state.get('energy') + reward.amount, state.get('maxEnergy'));
        state.update({ energy: newEnergy });
        showToast(`🎁 +${reward.amount} Energiya!`, 'success');
    } else if (reward.type === 'boost') {
        activateBoost(reward.multiplier, reward.duration);
        showToast(`🚀 ${reward.multiplier}x Boost ${reward.duration}s!`, 'success');
    }
    
    particles?.emit(window.innerWidth / 2, window.innerHeight / 2, 20, '#ffd700');
}

let activeBoost = null;

function activateBoost(multiplier, duration) {
    activeBoost = { multiplier, endTime: Date.now() + duration * 1000 };
    setTimeout(() => {
        activeBoost = null;
        showToast('Boost tugadi', 'warning');
    }, duration * 1000);
}

// ========== PRESTIGE SYSTEM ==========
function canPrestige() {
    return state.get('level') >= 10;
}

function doPrestige() {
    if (!canPrestige()) return;
    
    const darkMatterGain = Math.floor(state.get('totalGold') / 10000) + state.get('level');
    
    haptic('heavy');
    audio.play('levelup');
    
    // Big Bang animation
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:white;z-index:99999;animation:flashOut 1s forwards';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
        
        state.update({
            gold: 0,
            xp: 0,
            level: 1,
            energy: 100,
            maxEnergy: 100,
            clickPower: 1,
            autoTap: 0,
            critChance: 5,
            upgrades: { power: 0, energy: 0, auto: 0, crit: 0 },
            darkMatter: state.get('darkMatter') + darkMatterGain,
            prestigeCount: state.get('prestigeCount') + 1,
            totalGold: 0
        });
        
        showToast(`🌀 Prestige! +${darkMatterGain} Dark Matter`, 'success');
        renderAll();
    }, 500);
}

// ========== CORE GAME LOGIC ==========
let particles = null;
let meshGradient = null;

function handleClick(e) {
    audio.init();
    
    const currentEnergy = state.get('energy');
    if (currentEnergy <= 0) {
        haptic('error');
        showToast('Energiya tugadi!', 'error');
        return;
    }
    
    haptic('light');
    
    // Calculate gold
    let power = state.get('clickPower');
    const darkMatterBonus = 1 + (state.get('darkMatter') * 0.1);
    power *= darkMatterBonus;
    
    if (activeBoost) power *= activeBoost.multiplier;
    
    // Critical hit
    const isCritical = Math.random() * 100 < state.get('critChance');
    if (isCritical) {
        power *= 3;
        haptic('heavy');
        audio.play('critical');
        document.querySelector('.reactor-core')?.classList.add('critical');
        setTimeout(() => document.querySelector('.reactor-core')?.classList.remove('critical'), 300);
    } else {
        audio.play('click');
        document.querySelector('.reactor-core')?.classList.add('clicked');
        setTimeout(() => document.querySelector('.reactor-core')?.classList.remove('clicked'), 150);
    }
    
    const goldGain = Math.floor(power);
    
    // Update state
    const newGold = state.get('gold') + goldGain;
    const newTotalGold = state.get('totalGold') + goldGain;
    const newXP = state.get('xp') + Math.ceil(goldGain / 2);
    const newClicks = state.get('totalClicks') + 1;
    const newEnergy = currentEnergy - 1;
    
    // Check level up
    const xpNeeded = state.get('level') * 100;
    let newLevel = state.get('level');
    let remainingXP = newXP;
    
    while (remainingXP >= newLevel * 100) {
        remainingXP -= newLevel * 100;
        newLevel++;
        audio.play('levelup');
        haptic('success');
        showToast(`🎉 Level ${newLevel}!`, 'success');
    }
    
    state.update({
        gold: newGold,
        totalGold: newTotalGold,
        xp: remainingXP,
        level: newLevel,
        totalClicks: newClicks,
        energy: newEnergy
    });
    
    // Visual effects
    showClickEffect(e, goldGain, isCritical);
    particles?.emit(e.clientX, e.clientY, isCritical ? 15 : 8, isCritical ? '#ffd700' : '#00f0ff');
    
    // Check achievements
    checkAchievements();
    updateChallenges('clicks', 1);
    updateChallenges('gold', goldGain);
    updateChallenges('energy', 1);
}

function showClickEffect(e, amount, isCritical) {
    const el = document.createElement('div');
    el.className = 'click-effect';
    el.textContent = `+${amount}${isCritical ? ' CRIT!' : ''}`;
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    if (isCritical) el.style.color = '#ff6b9d';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ========== ENERGY REGENERATION ==========
function regenerateEnergy() {
    const now = Date.now();
    const lastEnergy = state.get('lastEnergy');
    const elapsed = (now - lastEnergy) / 1000;
    const regenRate = 1; // 1 energy per second
    const regenAmount = Math.floor(elapsed * regenRate);
    
    if (regenAmount > 0) {
        const newEnergy = Math.min(state.get('energy') + regenAmount, state.get('maxEnergy'));
        state.update({ energy: newEnergy, lastEnergy: now });
    }
}

// ========== AUTO TAP ==========
function autoTapTick() {
    const autoTap = state.get('autoTap');
    if (autoTap <= 0) return;
    
    const energy = state.get('energy');
    if (energy <= 0) return;
    
    let power = autoTap;
    const darkMatterBonus = 1 + (state.get('darkMatter') * 0.1);
    power *= darkMatterBonus;
    if (activeBoost) power *= activeBoost.multiplier;
    
    const goldGain = Math.floor(power);
    
    state.update({
        gold: state.get('gold') + goldGain,
        totalGold: state.get('totalGold') + goldGain,
        xp: state.get('xp') + Math.ceil(goldGain / 4),
        energy: energy - 0.1
    });
}

// ========== UPGRADES ==========
const UPGRADES = {
    power: { name: 'Kuch', icon: '💪', baseCost: 50, effect: 1 },
    energy: { name: 'Energiya', icon: '🔋', baseCost: 100, effect: 20 },
    auto: { name: 'Auto Tap', icon: '🤖', baseCost: 200, effect: 0.5 },
    crit: { name: 'Kritik', icon: '⚡', baseCost: 150, effect: 2 }
};

function getUpgradeCost(type) {
    const level = state.get('upgrades')[type];
    return Math.floor(UPGRADES[type].baseCost * Math.pow(1.5, level));
}

function buyUpgrade(type) {
    const cost = getUpgradeCost(type);
    if (state.get('gold') < cost) {
        haptic('error');
        showToast('Oltin yetarli emas!', 'error');
        return;
    }
    
    haptic('medium');
    audio.play('click');
    
    const upgrades = { ...state.get('upgrades') };
    upgrades[type]++;
    
    const changes = { gold: state.get('gold') - cost, upgrades };
    
    switch(type) {
        case 'power':
            changes.clickPower = state.get('clickPower') + UPGRADES.power.effect;
            break;
        case 'energy':
            changes.maxEnergy = state.get('maxEnergy') + UPGRADES.energy.effect;
            changes.energy = state.get('energy') + UPGRADES.energy.effect;
            break;
        case 'auto':
            changes.autoTap = state.get('autoTap') + UPGRADES.auto.effect;
            break;
        case 'crit':
            changes.critChance = Math.min(state.get('critChance') + UPGRADES.crit.effect, 50);
            break;
    }
    
    state.update(changes);
    showToast(`${UPGRADES[type].icon} ${UPGRADES[type].name} +1!`, 'success');
    renderGame();
}

// ========== ACHIEVEMENTS ==========
function checkAchievements() {
    const current = state.get('achievements');
    const s = state.state;
    
    ACHIEVEMENTS.forEach(a => {
        if (!current.includes(a.id) && a.condition(s)) {
            current.push(a.id);
            state.update({ achievements: current });
            haptic('success');
            audio.play('levelup');
            showToast(`🏆 ${a.name}!`, 'success');
        }
    });
}

// ========== CHALLENGES ==========
function updateChallenges(type, amount) {
    const challenges = state.get('challenges');
    if (!challenges.length) return;
    
    challenges.forEach(c => {
        if (c.id === type && c.current < c.target) {
            c.current = Math.min(c.current + amount, c.target);
            if (c.current >= c.target && !c.claimed) {
                c.completed = true;
            }
        }
    });
    
    state.update({ challenges });
}

function claimChallenge(id) {
    const challenges = state.get('challenges');
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge || !challenge.completed || challenge.claimed) return;
    
    challenge.claimed = true;
    state.update({ 
        challenges,
        gold: state.get('gold') + challenge.reward,
        totalGold: state.get('totalGold') + challenge.reward
    });
    
    haptic('success');
    audio.play('levelup');
    showToast(`+${challenge.reward} Oltin!`, 'success');
    renderGame();
}

// ========== DAILY STREAK ==========
function checkDailyStreak() {
    const today = new Date().toDateString();
    const lastDaily = state.get('lastDaily');
    
    if (lastDaily !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = lastDaily === yesterday ? state.get('streak') + 1 : 1;
        
        state.update({
            lastDaily: today,
            streak: newStreak,
            challenges: getDailyChallenges()
        });
        
        if (newStreak > 1) {
            showToast(`🔥 ${newStreak} kunlik streak!`, 'success');
        }
    }
}

// ========== UI RENDERING ==========
function renderAll() {
    renderHeader();
    renderHome();
    renderGame();
    renderEducation();
    renderPremium();
    if (isAdmin) renderAdmin();
}

function renderHeader() {
    const s = state.state;
    document.getElementById('userName').textContent = s.user.name;
    document.getElementById('userTier').textContent = s.isPremium ? '💎 Premium' : s.user.tier;
    document.getElementById('userAvatar').textContent = s.user.avatar;
    document.getElementById('headerXP').textContent = formatNumber(s.xp);
    document.getElementById('headerGold').textContent = formatNumber(s.gold);
    document.getElementById('statLevel').textContent = s.level;
    document.getElementById('statStreak').textContent = s.streak;
    document.getElementById('statReferrals').textContent = s.referrals;
    
    if (s.darkMatter > 0) {
        document.getElementById('darkMatterStat').style.display = 'flex';
        document.getElementById('statDarkMatter').textContent = s.darkMatter;
    }
}

function renderHome() {
    const s = state.state;
    const xpProgress = (s.xp / (s.level * 100)) * 100;
    
    document.getElementById('homeContent').innerHTML = `
        <div class="card">
            <div class="card-title">📊 Statistika</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
                <div class="stat-box"><div class="stat-value">${formatNumber(s.totalClicks)}</div><div class="stat-label">Jami bosishlar</div></div>
                <div class="stat-box"><div class="stat-value">${formatNumber(s.totalGold)}</div><div class="stat-label">Jami oltin</div></div>
                <div class="stat-box"><div class="stat-value">${s.achievements.length}/${ACHIEVEMENTS.length}</div><div class="stat-label">Yutuqlar</div></div>
                <div class="stat-box"><div class="stat-value">${s.prestigeCount}</div><div class="stat-label">Prestige</div></div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">📈 Daraja ${s.level}</div>
            <div class="energy-bar"><div class="energy-fill" style="width:${xpProgress}%"></div></div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-muted)">
                <span>${s.xp} XP</span>
                <span>${s.level * 100} XP kerak</span>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">🏆 Yutuqlar</div>
            <div class="achievement-grid">
                ${ACHIEVEMENTS.slice(0, 6).map(a => `
                    <div class="achievement ${s.achievements.includes(a.id) ? 'unlocked' : 'locked'}">
                        <div class="icon">${a.icon}</div>
                        <div class="name">${a.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">📋 Kunlik vazifalar</div>
            ${(s.challenges.length ? s.challenges : getDailyChallenges()).map(c => `
                <div class="challenge ${c.completed ? 'completed' : ''}">
                    <div class="challenge-header">
                        <span class="challenge-name">${c.icon} ${c.name}</span>
                        <span class="challenge-reward">+${c.reward} 🪙</span>
                    </div>
                    <div class="challenge-progress"><div class="challenge-fill" style="width:${(c.current/c.target)*100}%"></div></div>
                    <div class="challenge-text">${c.current}/${c.target}</div>
                    ${c.completed && !c.claimed ? `<button class="admin-btn" style="margin-top:8px" onclick="claimChallenge('${c.id}')">Olish</button>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderGame() {
    const s = state.state;
    const energyPercent = (s.energy / s.maxEnergy) * 100;
    
    document.getElementById('gameContent').innerHTML = `
        <div class="mining-container">
            <div class="reactor-container">
                <div class="reactor-ring"></div>
                <div class="reactor-core" onclick="handleClick(event)">⚡</div>
            </div>
            
            <div class="mining-stats">
                <div class="mining-stat">
                    <div class="mining-stat-value">${formatNumber(s.gold)}</div>
                    <div class="mining-stat-label">Oltin</div>
                </div>
                <div class="mining-stat">
                    <div class="mining-stat-value">${s.clickPower}${activeBoost ? `x${activeBoost.multiplier}` : ''}</div>
                    <div class="mining-stat-label">Kuch</div>
                </div>
                <div class="mining-stat">
                    <div class="mining-stat-value">${s.autoTap.toFixed(1)}/s</div>
                    <div class="mining-stat-label">Auto</div>
                </div>
            </div>
            
            <div class="energy-container">
                <div class="energy-bar">
                    <div class="energy-fill" style="width:${energyPercent}%;background:linear-gradient(90deg,${energyPercent < 20 ? 'var(--neon-red)' : 'var(--neon-green)'},var(--neon-cyan))"></div>
                    <div class="energy-text">⚡ ${Math.floor(s.energy)}/${s.maxEnergy}</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">⬆️ Yaxshilashlar</div>
            <div class="upgrade-grid">
                ${Object.entries(UPGRADES).map(([key, u]) => `
                    <div class="upgrade-btn" onclick="buyUpgrade('${key}')" ${s.gold < getUpgradeCost(key) ? 'disabled' : ''}>
                        <div class="icon">${u.icon}</div>
                        <div class="name">${u.name} (${s.upgrades[key]})</div>
                        <div class="cost">${formatNumber(getUpgradeCost(key))} 🪙</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${canPrestige() ? `
        <div class="card prestige-card">
            <div class="card-title">🌀 Kvant Sakrash</div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
                Hamma narsani nollang va ${Math.floor(s.totalGold / 10000) + s.level} Dark Matter oling!
                Har bir DM +10% doimiy bonus beradi.
            </p>
            <button class="prestige-btn" onclick="doPrestige()">🌀 Prestige (${s.darkMatter} DM)</button>
        </div>
        ` : ''}
        
        <div class="card">
            <div class="card-title">🏆 Galaktik Reyting</div>
            <div class="podium">
                ${FAKE_USERS.slice(0, 3).map((u, i) => `
                    <div class="podium-item ${['second', 'first', 'third'][i]}">
                        <div class="podium-avatar">${i === 0 ? '<span class="crown">👑</span>' : ''}${u.name.charAt(0)}</div>
                        <div class="podium-name">${u.name}</div>
                        <div class="podium-xp">${formatNumber(u.xp)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="lb-list">
                ${getLeaderboardWithUser().slice(3, 15).map((u, i) => `
                    <div class="lb-item ${u.isUser ? 'current' : ''}">
                        <div class="lb-rank">${i + 4}</div>
                        <div class="lb-avatar">${u.name.charAt(0)}</div>
                        <div class="lb-info">
                            <div class="lb-name">${u.name}</div>
                            <div class="lb-level">Level ${u.level}</div>
                        </div>
                        <div class="lb-xp">${formatNumber(u.xp)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getLeaderboardWithUser() {
    const s = state.state;
    const userEntry = { name: s.user.name, xp: s.totalGold, level: s.level, isUser: true };
    const all = [...FAKE_USERS, userEntry].sort((a, b) => b.xp - a.xp);
    return all;
}

function renderEducation() {
    document.getElementById('eduContent').innerHTML = `
        <div class="card">
            <div class="card-title">📚 Ta'lim resurslari</div>
            <div class="edu-grid">
                <div class="edu-item" onclick="openEduModal('quiz')">
                    <div class="icon">🧠</div>
                    <div class="name">AI Quiz</div>
                    <div class="desc">Sun'iy intellekt testlari</div>
                </div>
                <div class="edu-item" onclick="openEduModal('flashcards')">
                    <div class="icon">🃏</div>
                    <div class="name">Flashcards</div>
                    <div class="desc">Kartochkalar bilan o'rganish</div>
                </div>
                <div class="edu-item" onclick="openEduModal('mindmap')">
                    <div class="icon">🗺️</div>
                    <div class="name">Mind Map</div>
                    <div class="desc">Fikrlar xaritasi</div>
                </div>
                <div class="edu-item" onclick="openEduModal('courses')">
                    <div class="icon">📖</div>
                    <div class="name">Kurslar</div>
                    <div class="desc">Video darsliklar</div>
                </div>
                <div class="edu-item" onclick="openEduModal('podcasts')">
                    <div class="icon">🎧</div>
                    <div class="name">Podcastlar</div>
                    <div class="desc">Audio kontentlar</div>
                </div>
                <div class="edu-item" onclick="openEduModal('books')">
                    <div class="icon">📚</div>
                    <div class="name">Kitoblar</div>
                    <div class="desc">E-kutubxona</div>
                </div>
                <div class="edu-item" onclick="openEduModal('rpg')">
                    <div class="icon">⚔️</div>
                    <div class="name">RPG Mode</div>
                    <div class="desc">O'yin orqali o'rganish</div>
                </div>
                <div class="edu-item" onclick="openEduModal('duel')">
                    <div class="icon">🎯</div>
                    <div class="name">Live Duel</div>
                    <div class="desc">Jonli musobaqa</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">🤖 AI Mentor</div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
                Shaxsiy AI ustozingiz bilan suhbatlashing va savollaringizga javob oling.
            </p>
            <button class="admin-btn" onclick="openAIMentor()">💬 Suhbat boshlash</button>
        </div>
    `;
}

function renderPremium() {
    const s = state.state;
    
    document.getElementById('premiumContent').innerHTML = `
        <div class="card premium-card">
            <div class="card-title">💎 Premium obuna</div>
            <div class="premium-features">
                <div class="premium-feature"><span class="icon">♾️</span> Cheksiz AI so'rovlar</div>
                <div class="premium-feature"><span class="icon">⚡</span> 2x XP va Gold</div>
                <div class="premium-feature"><span class="icon">🎨</span> Maxsus temalar</div>
                <div class="premium-feature"><span class="icon">🚀</span> Tezkor javoblar</div>
                <div class="premium-feature"><span class="icon">📊</span> Kengaytirilgan statistika</div>
                <div class="premium-feature"><span class="icon">🎁</span> Eksklyuziv bonuslar</div>
            </div>
            <button class="premium-btn" onclick="buyPremium('monthly')">💎 Oylik - 29,000 so'm</button>
            <button class="premium-btn" style="margin-top:12px;background:linear-gradient(135deg,var(--neon-purple),var(--neon-pink))" onclick="buyPremium('yearly')">👑 Yillik - 249,000 so'm</button>
        </div>
        
        <div class="card">
            <div class="card-title">💱 XP evaziga Premium</div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
                10,000 XP evaziga 1 kunlik Premium olish mumkin.
            </p>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px">
                <span>Sizning XP:</span>
                <span style="color:var(--neon-gold);font-weight:700">${formatNumber(s.xp)}</span>
            </div>
            <button class="admin-btn" onclick="exchangeXP()" ${s.xp < 10000 ? 'disabled style="opacity:0.5"' : ''}>
                🔄 10,000 XP → 1 kun Premium
            </button>
        </div>
        
        <div class="card">
            <div class="card-title">👥 Referral dasturi</div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
                Do'stlaringizni taklif qiling va har biri uchun 500 oltin oling!
            </p>
            <div style="background:var(--glass-bg);padding:12px;border-radius:12px;text-align:center;margin-bottom:12px">
                <code style="color:var(--neon-cyan)">t.me/nexus_media_bot?start=${s.user.id}</code>
            </div>
            <button class="admin-btn" onclick="shareReferral()">📤 Ulashish</button>
        </div>
    `;
}

function renderAdmin() {
    document.getElementById('adminContent').innerHTML = `
        <div class="card admin-section">
            <div class="admin-title">👑 Admin Panel</div>
            <div class="admin-stat"><span>Jami foydalanuvchilar:</span><span>1,234</span></div>
            <div class="admin-stat"><span>Bugungi faol:</span><span>156</span></div>
            <div class="admin-stat"><span>Premium:</span><span>89</span></div>
        </div>
        
        <div class="card admin-section">
            <div class="admin-title">🔍 Foydalanuvchi qidirish</div>
            <input type="text" class="admin-input" placeholder="User ID yoki username" id="adminSearchInput">
            <button class="admin-btn" onclick="adminSearch()">🔍 Qidirish</button>
        </div>
        
        <div class="card admin-section">
            <div class="admin-title">📢 Broadcast</div>
            <textarea class="admin-input" style="height:80px;resize:none" placeholder="Xabar matni..." id="broadcastText"></textarea>
            <button class="admin-btn" onclick="adminBroadcast()">📤 Yuborish</button>
        </div>
        
        <div class="card admin-section">
            <div class="admin-title">⚙️ Tizim</div>
            <button class="admin-btn" onclick="adminExport()">📥 Ma'lumotlarni eksport</button>
            <button class="admin-btn danger" onclick="adminClearCache()">🗑️ Keshni tozalash</button>
        </div>
    `;
}

// ========== MODALS ==========
function openEduModal(type) {
    haptic('light');
    const titles = {
        quiz: '🧠 AI Quiz',
        flashcards: '🃏 Flashcards',
        mindmap: '🗺️ Mind Map',
        courses: '📖 Kurslar',
        podcasts: '🎧 Podcastlar',
        books: '📚 Kitoblar',
        rpg: '⚔️ RPG Mode',
        duel: '🎯 Live Duel'
    };
    
    showModal(titles[type], `
        <p style="text-align:center;color:var(--text-secondary);margin-bottom:20px">
            Bu funksiya tez orada qo'shiladi!
        </p>
        <button class="admin-btn" onclick="sendToBot('${type}')">📱 Botda ochish</button>
    `);
}

function openAIMentor() {
    haptic('light');
    showModal('🤖 AI Mentor', `
        <p style="text-align:center;color:var(--text-secondary);margin-bottom:20px">
            AI Mentor bilan suhbat boshlash uchun botga o'ting.
        </p>
        <button class="admin-btn" onclick="sendToBot('ai_mentor')">💬 Suhbat boshlash</button>
    `);
}

function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ========== HELPERS ==========
function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.floor(n).toString();
}

function sendToBot(action) {
    if (tg) {
        tg.sendData(JSON.stringify({ action }));
    }
    closeModal();
}

function buyPremium(plan) {
    haptic('medium');
    if (tg) {
        tg.sendData(JSON.stringify({ action: 'buy_premium', plan }));
    }
    showToast('To\'lov sahifasiga yo\'naltirilmoqda...', 'info');
}

function exchangeXP() {
    if (state.get('xp') < 10000) return;
    
    haptic('success');
    state.update({ xp: state.get('xp') - 10000, isPremium: true });
    showToast('🎉 1 kunlik Premium aktivlashtirildi!', 'success');
    renderPremium();
}

function shareReferral() {
    haptic('light');
    const link = `https://t.me/nexus_media_bot?start=${state.get('user').id}`;
    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Nexus Media Bot - eng zo\'r ta\'lim boti!')}`);
    }
}

// Admin functions
function adminSearch() {
    const query = document.getElementById('adminSearchInput').value;
    if (!query) return;
    haptic('light');
    showToast(`Qidirilmoqda: ${query}`, 'info');
}

function adminBroadcast() {
    const text = document.getElementById('broadcastText').value;
    if (!text) return;
    haptic('medium');
    if (tg) {
        tg.sendData(JSON.stringify({ action: 'broadcast', text }));
    }
    showToast('Xabar yuborildi!', 'success');
}

function adminExport() {
    haptic('light');
    const data = JSON.stringify(state.state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_data.json';
    a.click();
    showToast('Ma\'lumotlar yuklab olindi!', 'success');
}

function adminClearCache() {
    haptic('heavy');
    localStorage.clear();
    showToast('Kesh tozalandi!', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ========== TAB SWITCHING ==========
function switchTab(tabName) {
    haptic('light');
    
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}Content`)?.classList.add('active');
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
}

// ========== SPOTLIGHT EFFECT ==========
function initSpotlight() {
    const spotlight = document.getElementById('spotlight');
    let isActive = false;
    
    document.addEventListener('mousemove', (e) => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
        if (!isActive) {
            spotlight.classList.add('active');
            isActive = true;
        }
    });
    
    document.addEventListener('mouseleave', () => {
        spotlight.classList.remove('active');
        isActive = false;
    });
    
    // Card hover effect
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram
    if (tg) {
        tg.ready();
        tg.expand();
        
        const user = tg.initDataUnsafe?.user;
        if (user) {
            state.update({
                user: {
                    id: user.id,
                    name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi',
                    username: user.username || '',
                    tier: 'Telegram User',
                    avatar: user.first_name?.charAt(0) || '👤'
                }
            });
            
            isAdmin = ADMIN_IDS.includes(user.id);
        }
    }
    
    // Show admin tab if admin
    if (isAdmin) {
        document.getElementById('adminTab').style.display = 'flex';
    }
    
    // Initialize systems
    const bgCanvas = document.getElementById('bgCanvas');
    const particleCanvas = document.getElementById('particleCanvas');
    
    meshGradient = new MeshGradient(bgCanvas);
    meshGradient.render();
    
    particles = new ParticleSystem(particleCanvas);
    particles.update();
    
    initSpotlight();
    checkDailyStreak();
    regenerateEnergy();
    
    // Tab click handlers
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', () => switchTab(nav.dataset.tab));
    });
    
    // State subscriber
    state.subscribe(() => renderAll());
    
    // Game loops
    setInterval(regenerateEnergy, 1000);
    setInterval(autoTapTick, 1000);
    
    // Mystery drops
    setTimeout(spawnMysteryDrop, 30000);
    
    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
        renderAll();
    }, 2000);
    
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) switchTab(tab);
});

// Add flash animation style
const style = document.createElement('style');
style.textContent = '@keyframes flashOut{0%{opacity:1}100%{opacity:0}}';
document.head.appendChild(style);
