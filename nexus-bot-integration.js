/* ============================================
   NEXUS QUANTUM 2.0 - Complete Bot Integration
   Advanced WebApp with Full Telegram Bot Support
   ============================================ */

// 🤖 TELEGRAM BOT INTEGRATION
class NexusBot {
    constructor() {
        this.telegram = window.Telegram?.WebApp;
        this.user = null;
        this.initBot();
    }

    initBot() {
        if (this.telegram) {
            this.telegram.ready();
            this.telegram.expand();
            this.user = this.telegram.initDataUnsafe?.user;
            
            // Set user data from Telegram
            if (this.user) {
                QuantumState.user.id = this.user.id;
                QuantumState.user.name = this.user.first_name;
                QuantumState.user.avatar = this.user.first_name[0].toUpperCase();
            }
            
            // Setup bot buttons
            this.setupBotButtons();
            
            // Handle theme
            this.handleTheme();
        }
    }

    setupBotButtons() {
        // Main Menu Button
        this.telegram.MainButton.text = '🚀 NEXUS MENU';
        this.telegram.MainButton.color = '#00ffff';
        this.telegram.MainButton.onClick(() => {
            this.showBotMenu();
        });
        this.telegram.MainButton.show();

        // Back Button
        this.telegram.BackButton.onClick(() => {
            this.goBack();
        });

        // Settings Button
        this.telegram.SettingsButton?.show();
    }

    handleTheme() {
        const colorScheme = this.telegram.colorScheme;
        if (colorScheme === 'dark') {
            document.body.classList.add('telegram-dark');
        }
    }

    showBotMenu() {
        const menuData = {
            text: '🎯 NEXUS QUANTUM MENU',
            buttons: [
                [{ text: '⚡ Mining', callback_data: 'mining' }],
                [{ text: '🤖 AI Quiz', callback_data: 'quiz' }],
                [{ text: '⚔️ Battle', callback_data: 'battle' }],
                [{ text: '🏆 Gamification', callback_data: 'gamification' }],
                [{ text: '👥 Wayground', callback_data: 'wayground' }],
                [{ text: '📊 Profile', callback_data: 'profile' }],
                [{ text: '⚙️ Settings', callback_data: 'settings' }]
            ]
        };
        
        // Send to bot
        this.sendToBot('show_menu', menuData);
    }

    sendToBot(action, data) {
        // Send data to Telegram bot
        if (this.telegram) {
            this.telegram.sendData(JSON.stringify({
                action: action,
                data: data,
                user: this.user,
                timestamp: Date.now()
            }));
        }
    }

    goBack() {
        // Handle navigation back
        const currentSection = QuantumState.ui.currentSection;
        if (currentSection !== 'mining') {
            QuantumApp.ui.switchSection('mining');
        } else {
            this.telegram.close();
        }
    }

    // Bot notification system
    showNotification(title, message, type = 'info') {
        this.telegram.HapticFeedback.notificationOccurred(type === 'error' ? 'error' : 'success');
        
        // Also show in-app notification
        QuantumApp.ui.showNotification(message, type);
        
        // Send to bot for persistent notification
        this.sendToBot('notification', {
            title: title,
            message: message,
            type: type
        });
    }

    // Bot share functionality
    shareResult(type, data) {
        const shareText = this.generateShareText(type, data);
        
        if (this.telegram) {
            this.telegram.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`);
        }
    }

    generateShareText(type, data) {
        const texts = {
            mining: `⚡ Men NEXUS da ${data.balance} coin topdim! Siz ham urinib ko'ring!`,
            quiz: `🤖 Quizda ${data.score}/${data.total} ball oldim! Siz ham sinab ko'ring!`,
            battle: `⚔️ Battle da g'alaba qozondim! Siz ham qatnashing!`,
            achievement: `🏆 "${data.name}" yutug'ini oldim! Siz ham yuting!`
        };
        
        return texts[type] || `🚀 NEXUS QUANTUM da o'ynayapman! Siz ham qo'shiling!`;
    }
}

// 🌐 ADVANCED URL MANAGER
class URLManager {
    constructor() {
        this.routes = {
            '': 'mining',
            'mining': 'mining',
            'quiz': 'quiz',
            'battle': 'battle',
            'gamification': 'gamification',
            'wayground': 'wayground',
            'profile': 'profile',
            'settings': 'settings',
            'room/:id': 'wayground',
            'battle/:id': 'battle',
            'user/:id': 'profile'
        };
        this.initRouter();
    }

    initRouter() {
        // Handle initial URL
        this.handleRoute();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Handle navigation
        this.setupNavigation();
    }

    handleRoute() {
        const path = window.location.pathname.replace('/', '');
        const section = this.matchRoute(path);
        
        if (section && section !== QuantumState.ui.currentSection) {
            QuantumApp.ui.switchSection(section);
        }
        
        // Update URL without reload
        this.updateURL(section);
    }

    matchRoute(path) {
        // Direct match
        if (this.routes[path]) {
            return this.routes[path];
        }
        
        // Pattern match
        for (const [pattern, section] of Object.entries(this.routes)) {
            if (pattern.includes(':')) {
                const regex = new RegExp(pattern.replace(/:[^/]+/g, '([^/]+)'));
                if (regex.test(path)) {
                    return section;
                }
            }
        }
        
        return 'mining'; // Default
    }

    updateURL(section) {
        const url = `/${section}`;
        if (window.location.pathname !== url) {
            history.pushState({ section }, '', url);
        }
    }

    setupNavigation() {
        // Override section switching to update URL
        const originalSwitch = QuantumApp.ui.switchSection;
        QuantumApp.ui.switchSection = (section) => {
            originalSwitch.call(QuantumApp.ui, section);
            this.updateURL(section);
        };
    }

    navigateTo(section, params = {}) {
        let url = `/${section}`;
        
        // Add parameters
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            url += '?' + searchParams.toString();
        }
        
        history.pushState({ section }, '', url);
        this.handleRoute();
    }
}

// 🗄️ ADVANCED DATA MANAGER
class DataManager {
    constructor() {
        this.supabase = null;
        this.offlineMode = true;
        this.initSupabase();
    }

    async initSupabase() {
        try {
            // Initialize Supabase
            this.supabase = window.supabase.createClient(
                'https://your-project.supabase.co',
                'your-anon-key'
            );
            
            // Test connection
            const { data, error } = await this.supabase.from('users').select('count');
            if (!error) {
                this.offlineMode = false;
                console.log('✅ Supabase connected');
            }
        } catch (error) {
            console.log('📱 Offline mode - using local storage');
            this.offlineMode = true;
        }
    }

    async saveUserProgress() {
        const userData = {
            id: QuantumState.user.id,
            ...QuantumState.user,
            mining: QuantumState.mining,
            gamification: QuantumState.gamification,
            lastUpdated: Date.now()
        };

        if (this.offlineMode) {
            localStorage.setItem('nexus_user_data', JSON.stringify(userData));
            return true;
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .upsert(userData)
                .select();
            
            return !error;
        } catch (error) {
            console.error('Save failed:', error);
            // Fallback to local storage
            localStorage.setItem('nexus_user_data', JSON.stringify(userData));
            return false;
        }
    }

    async loadUserProgress() {
        if (this.offlineMode) {
            const saved = localStorage.getItem('nexus_user_data');
            return saved ? JSON.parse(saved) : null;
        }

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', QuantumState.user.id)
                .single();
            
            return data || null;
        } catch (error) {
            console.error('Load failed:', error);
            // Fallback to local storage
            const saved = localStorage.getItem('nexus_user_data');
            return saved ? JSON.parse(saved) : null;
        }
    }

    async syncWithServer() {
        if (this.offlineMode) return false;

        try {
            // Get local data
            const localData = localStorage.getItem('nexus_user_data');
            if (localData) {
                const parsed = JSON.parse(localData);
                
                // Sync to server
                await this.saveUserProgress();
                
                // Clear local after successful sync
                localStorage.removeItem('nexus_user_data');
            }
            
            return true;
        } catch (error) {
            console.error('Sync failed:', error);
            return false;
        }
    }
}

// 🔄 REAL-TIME MANAGER
class RealTimeManager {
    constructor() {
        this.connections = new Map();
        this.initWebSocket();
    }

    initWebSocket() {
        // WebSocket connection for real-time features
        this.ws = new WebSocket('wss://nexus-webapp.onrender.com');
        
        this.ws.onopen = () => {
            console.log('🔌 WebSocket connected');
            this.authenticate();
        };
        
        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            // Reconnect after 3 seconds
            setTimeout(() => this.initWebSocket(), 3000);
        };
    }

    authenticate() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'auth',
                user: QuantumState.user
            }));
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'battle_update':
                this.handleBattleUpdate(message.data);
                break;
            case 'wayground_message':
                this.handleWaygroundMessage(message.data);
                break;
            case 'leaderboard_update':
                this.handleLeaderboardUpdate(message.data);
                break;
            case 'achievement_unlocked':
                this.handleAchievement(message.data);
                break;
        }
    }

    handleBattleUpdate(data) {
        // Update battle state
        if (QuantumState.battle.active) {
            QuantumState.battle = { ...QuantumState.battle, ...data };
            QuantumApp.ui.updateBattleUI();
        }
    }

    handleWaygroundMessage(data) {
        // Add message to current room
        if (QuantumState.wayground.currentRoom === data.roomId) {
            QuantumState.wayground.messages.push(data);
            QuantumApp.ui.addWaygroundMessage(data);
        }
    }

    handleLeaderboardUpdate(data) {
        // Update leaderboard
        QuantumState.gamification.leaderboard = data;
        QuantumApp.ui.updateLeaderboard();
    }

    handleAchievement(data) {
        // Show achievement notification
        if (data.userId === QuantumState.user.id) {
            QuantumApp.ui.showAchievementNotification(data);
        }
    }

    sendBattleAction(action, data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'battle_action',
                action: action,
                data: data,
                user: QuantumState.user
            }));
        }
    }

    sendWaygroundMessage(roomId, message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'wayground_message',
                roomId: roomId,
                message: message,
                user: QuantumState.user
            }));
        }
    }
}

// 🎯 PERFORMANCE MONITOR
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 60,
            memory: 0,
            latency: 0,
            errors: []
        };
        this.initMonitoring();
    }

    initMonitoring() {
        // FPS monitoring
        this.monitorFPS();
        
        // Memory monitoring
        this.monitorMemory();
        
        // Network latency
        this.monitorLatency();
        
        // Error tracking
        this.trackErrors();
    }

    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const checkFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // Optimize if FPS is low
                if (this.metrics.fps < 30) {
                    this.optimizePerformance();
                }
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        checkFPS();
    }

    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
                
                // Clear memory if too high
                if (this.metrics.memory > 100) {
                    this.clearMemory();
                }
            }, 5000);
        }
    }

    monitorLatency() {
        const measureLatency = async () => {
            const start = performance.now();
            try {
                await fetch('https://api.github.com', { method: 'HEAD' });
                this.metrics.latency = Math.round(performance.now() - start);
            } catch (error) {
                this.metrics.latency = 999;
            }
        };
        
        setInterval(measureLatency, 30000);
    }

    trackErrors() {
        window.addEventListener('error', (event) => {
            this.metrics.errors.push({
                message: event.message,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
            
            // Send to monitoring service
            this.sendErrorReport(event);
        });
    }

    optimizePerformance() {
        // Reduce particle effects
        if (QuantumApp.particles) {
            QuantumApp.particles.maxParticles = 50;
        }
        
        // Disable heavy animations
        document.body.classList.add('performance-mode');
    }

    clearMemory() {
        // Clear caches
        if (QuantumApp.core) {
            QuantumApp.core.clearCache();
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    sendErrorReport(error) {
        // Send error to monitoring service
        fetch('/api/error-report', {
            method: 'POST',
            body: JSON.stringify({
                error: error.message,
                stack: error.error?.stack,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            })
        }).catch(() => {}); // Ignore errors in error reporting
    }
}

// 🚀 INITIALIZATION
class NexusQuantumApp {
    constructor() {
        this.bot = null;
        this.urlManager = null;
        this.dataManager = null;
        this.realTime = null;
        this.performance = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing NEXUS QUANTUM 2.0...');
        
        // Initialize managers
        this.bot = new NexusBot();
        this.urlManager = new URLManager();
        this.dataManager = new DataManager();
        this.realTime = new RealTimeManager();
        this.performance = new PerformanceMonitor();
        
        // Load user data
        await this.loadUserData();
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup sync
        this.setupSync();
        
        console.log('✅ NEXUS QUANTUM 2.0 Ready!');
    }

    async loadUserData() {
        const userData = await this.dataManager.loadUserProgress();
        if (userData) {
            // Merge with current state
            Object.assign(QuantumState.user, userData);
            Object.assign(QuantumState.mining, userData.mining || {});
            Object.assign(QuantumState.gamification, userData.gamification || {});
            
            // Update UI
            this.updateUI();
        }
    }

    updateUI() {
        // Update all UI elements
        QuantumApp.ui.updateXP(QuantumState.user.xp);
        QuantumApp.ui.updateGold(QuantumState.user.gold);
        QuantumApp.ui.updateEnergy(QuantumState.user.energy);
        QuantumApp.ui.updateLevel(QuantumState.user.level);
        QuantumApp.ui.updateBalance(QuantumState.mining.balance);
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.dataManager.saveUserProgress();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.dataManager.saveUserProgress();
        });
    }

    setupSync() {
        // Sync with server every 5 minutes
        setInterval(() => {
            this.dataManager.syncWithServer();
        }, 300000);
        
        // Sync when coming online
        window.addEventListener('online', () => {
            this.dataManager.syncWithServer();
        });
    }
}

// 🌍 Global instance
window.NexusQuantum = new NexusQuantumApp();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NexusQuantum;
}
