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
                    question: "Dunyodagi eng daryo qaysi?",
                    options: ["Amudaryo", "Sirdaryo", "Nil", "Amazonka"],
                    correct: 3,
                    explanation: "Amazonka dunyodagi eng uzun daryodir."
                }
            ],
            science: [
                {
                    question: "Suvning kimyoviy formulasi nima?",
                    options: ["H2O", "CO2", "O2", "N2"],
                    correct: 0,
                    explanation: "Suv ikki vodorod va bir kisloroddan iborat."
                }
            ],
            tech: [
                {
                    question: "HTML qisqartmasi nima degani?",
                    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
                    correct: 0,
                    explanation: "HTML veb-sahifalarni yaratish uchun ishlatiladigan markup tilidir."
                }
            ]
        };

        const questions = mockQuestions[topic] || mockQuestions.general;
        const result = [];
        
        for (let i = 0; i < Math.min(count, questions.length); i++) {
            result.push(questions[i]);
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
