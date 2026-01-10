/* ============================================
   NEXUS QUANTUM - Ultimate JavaScript Engine
   World's Most Advanced WebApp Logic
   ============================================ */

// 🧠 QUANTUM APP STATE
const QuantumState = {
    user: {
        id: null,
        name: 'Quantum User',
        avatar: 'N',
        level: 1,
        xp: 0,
        gold: 0,
        energy: 1000,
        maxEnergy: 1000,
        tier: 'Quantum Standard',
        streak: 0,
        referrals: 0,
        darkMatter: 0
    },
    
    mining: {
        balance: 0,
        tapPower: 1,
        autoTapRate: 0,
        critChance: 5,
        multiplier: 1,
        upgrades: {
            tap: 1,
            energy: 1,
            auto: 0,
            luck: 1
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
        questions: []
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
        globalRank: 0
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
        notifications: true
    },
    
    ui: {
        currentSection: 'mining',
        loading: true,
        animations: true
    }
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

    bindMiningEvents() {
        const reactorCore = document.querySelector('.reactor-core');
        if (reactorCore) {
            reactorCore.addEventListener('click', (e) => {
                this.handleMiningClick(e);
            });
        }
        
        // Also bind to reactor-center for better click area
        const reactorCenter = document.querySelector('.reactor-center');
        if (reactorCenter) {
            reactorCenter.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMiningClick(e);
            });
        }
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
        
        // Update energy percentage in header
        const energyPercent = document.getElementById('quantumEnergy');
        if (energyPercent) {
            const percentage = Math.round((energy / QuantumState.user.maxEnergy) * 100);
            energyPercent.textContent = `${percentage}%`;
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
        // Always use mock data for now (no API key needed)
        console.log('🤖 Using mock quiz data for:', topic, difficulty, count);
        return this.generateMockQuiz(topic, difficulty, count);
        
        // Real API call (when OPENAI_API_KEY is set in Vercel)
        /*
        try {
            const response = await fetch('/api/ai-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic,
                    difficulty: difficulty,
                    count: count
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.questions;
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.log('API error, using mock data:', error);
            return this.generateMockQuiz(topic, difficulty, count);
        }
        */
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

// 🚀 MAIN QUANTUM APP
const QuantumApp = {
    core: null,
    particles: null,
    audio: null,
    ui: null,
    mining: null,
    ai: null,
    
    async init() {
        console.log('🚀 Initializing Quantum App...');
        
        // Initialize core systems
        this.core = new QuantumCore();
        this.particles = new QuantumParticleEngine(document.getElementById('quantumCanvas'));
        this.audio = new QuantumAudioEngine();
        this.ui = new QuantumUI();
        this.mining = new QuantumMining();
        this.ai = new QuantumAI();
        
        // Load saved data
        this.loadGameData();
        
        // Start game loops
        this.startGameLoops();
        
        // Hide loader
        setTimeout(() => {
            const animation = this.ui.animations.get('loaderOut');
            if (animation) animation();
        }, 2000);
        
        console.log('✅ Quantum App Initialized');
    },
    
    loadGameData() {
        // Load user data
        const savedUser = localStorage.getItem('quantumUser');
        if (savedUser) {
            Object.assign(QuantumState.user, JSON.parse(savedUser));
        }
        
        // Load mining data
        const savedMining = localStorage.getItem('quantumMining');
        if (savedMining) {
            Object.assign(QuantumState.mining, JSON.parse(savedMining));
        }
        
        // Load settings
        this.ui.loadSettings();
        
        // Update UI
        this.ui.updateBalance(QuantumState.mining.balance);
        this.ui.updateXP(QuantumState.user.xp);
        this.ui.updateGold(QuantumState.user.gold);
        this.ui.updateEnergy(QuantumState.user.energy);
        this.ui.updateLevel(QuantumState.user.level);
    },
    
    saveGameData() {
        localStorage.setItem('quantumUser', JSON.stringify(QuantumState.user));
        localStorage.setItem('quantumMining', JSON.stringify(QuantumState.mining));
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

function renderShop() {
    const grid = document.getElementById('upgradesGrid');
    if (!grid) return;
    
    const upgrades = [
        { type: 'tap', name: 'Tap Power', description: '+1 power per tap', cost: 100, level: QuantumState.mining.upgrades.tap, icon: 'hand-pointer' },
        { type: 'energy', name: 'Energy Capacity', description: '+100 max energy', cost: 200, level: QuantumState.mining.upgrades.energy, icon: 'battery-full' },
        { type: 'auto', name: 'Auto Mining', description: '+1 auto tap per second', cost: 500, level: QuantumState.mining.upgrades.auto, icon: 'robot' },
        { type: 'luck', name: 'Critical Chance', description: '+5% critical chance', cost: 1000, level: QuantumState.mining.upgrades.luck, icon: 'clover' }
    ];
    
    grid.innerHTML = upgrades.map(upgrade => {
        const isMaxed = upgrade.level >= 50;
        const canAfford = QuantumState.user.gold >= upgrade.cost;
        
        return `
            <div class="upgrade-card ${isMaxed ? 'maxed' : ''} ${!canAfford ? 'disabled' : ''}">
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
                    <span class="upgrade-level">Level ${upgrade.level}/50</span>
                    <div class="upgrade-cost">
                        <i class="fas fa-coins"></i>
                        ${upgrade.cost}
                    </div>
                </div>
                <button class="upgrade-btn" onclick="purchaseUpgrade('${upgrade.type}')" ${isMaxed || !canAfford ? 'disabled' : ''}>
                    ${isMaxed ? 'MAXED' : 'Buy'}
                </button>
            </div>
        `;
    }).join('');
}

function purchaseUpgrade(type) {
    const upgrades = {
        tap: { cost: 100, effect: () => QuantumState.mining.tapPower++ },
        energy: { cost: 200, effect: () => { QuantumState.user.maxEnergy += 100; } },
        auto: { cost: 500, effect: () => QuantumState.mining.autoTapRate++ },
        luck: { cost: 1000, effect: () => QuantumState.mining.critChance += 5 }
    };
    
    const upgrade = upgrades[type];
    if (QuantumState.user.gold >= upgrade.cost) {
        QuantumState.user.gold -= upgrade.cost;
        QuantumState.mining.upgrades[type]++;
        upgrade.effect();
        
        // Update UI
        QuantumApp.ui.updateGold(QuantumState.user.gold);
        QuantumApp.ui.updateEnergy(QuantumState.user.energy);
        renderShop();
        
        // Show notification
        QuantumApp.ui.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} upgraded!`, 'success');
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

// Quiz topic/difficulty/count selectors
document.addEventListener('DOMContentLoaded', () => {
    // Topic buttons
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Count buttons
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Start quiz button
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    // Claim auto mining button
    const claimBtn = document.getElementById('claimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            QuantumMining.claimAutoMining();
        });
    }
    
    // Initialize shop
    renderShop();
});

// Make functions globally available
window.startQuiz = startQuiz;
window.selectQuizAnswer = selectQuizAnswer;
window.resetQuiz = resetQuiz;
window.switchShopTab = switchShopTab;
window.switchGamTab = switchGamTab;
window.closeWaygroundRoom = closeWaygroundRoom;
window.closeFileAnalysis = closeFileAnalysis;
window.closeAIChat = closeAIChat;

// 🚀 CRITICAL FIX - Add missing functions
window.renderShop = renderShop;
window.renderBoosters = renderBoosters;
window.renderAchievements = renderAchievements;
window.renderLeaderboard = renderLeaderboard;
window.renderDailyChallenges = renderDailyChallenges;
window.purchaseBooster = purchaseBooster;
window.purchaseUpgrade = purchaseUpgrade;
window.createBattleRoom = createBattleRoom;
window.joinBattleRoom = joinBattleRoom;
window.createWaygroundRoom = createWaygroundRoom;
window.joinWaygroundRoom = joinWaygroundRoom;
window.sendWaygroundMessage = sendWaygroundMessage;
window.handleFileUpload = handleFileUpload;
window.openAIChat = openAIChat;
window.sendAIMessage = sendAIMessage;
window.copyReferralLink = copyReferralLink;
window.endBattle = endBattle;
