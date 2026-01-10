/* ============================================
   NEXUS MEDIA - ULTIMATE WEBAPP JS
   Full Functional Implementation
   ============================================ */

// ============================================
// CONFIGURATION
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
// INTERACTIVITY MANAGER
// ============================================
function handleButtonClick(action, element) {
    // 1. Haptic Feedback
    haptic('light');

    // 2. Visual Feedback
    if (element) {
        element.classList.add('active-click');
        setTimeout(() => element.classList.remove('active-click'), 150);
    }

    // 3. Log Action
    console.log(`User clicked: ${action}`);
}

// Initialize Visual Effects
function initVisualEffects() {
    // 1. Vanilla Tilt (3D Cards)
    if (window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll(".mining-card, .profile-header, .premium-status-card"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            gyroscope: true
        });
    }

    // 2. Glitch Effect on Title
    const title = document.querySelector('.loader-text');
    if (title) {
        title.classList.add('glitch-text');
        title.setAttribute('data-text', title.textContent);
    }
}

// Rolling Number Animation
function animateNumber(elementId, endValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (window.CountUp) {
        const countUp = new CountUp(elementId, endValue, {
            duration: 1.5,
            separator: ' ',
        });
        if (!countUp.error) {
            countUp.start();
        } else {
            element.textContent = formatNumber(endValue);
        }
    } else {
        element.textContent = formatNumber(endValue);
    }
}

// Reactor Shockwave
function createShockwave(x, y) {
    const wave = document.createElement('div');
    wave.className = 'shockwave';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    document.querySelector('.mining-card').appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

// ============================================
// STATE MANAGER
// ============================================
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
            offlineMode: false // Added Offline Mode Flag
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

async function incrementInviterRewards(inviterId, xpGain, goldGain) {
    if (state.get('offlineMode')) return; // Skip if offline

    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('xp,gold,referrals_count')
            .eq('id', inviterId)
            .maybeSingle();
        if (error) throw error;
        const currentXp = data?.xp ?? 0;
        const currentGold = data?.gold ?? 0;
        const currentReferrals = data?.referrals_count ?? 0;
        const updatePayload = {
            xp: currentXp + xpGain,
            gold: currentGold + goldGain,
            referrals_count: currentReferrals + 1
        };
        await supabaseClient.from('users')
            .update(updatePayload)
            .eq('id', inviterId);
        if (inviterId === supabaseUserId) {
            state.update({
                xp: updatePayload.xp,
                gold: updatePayload.gold,
                user: { ...state.get('user'), referralsCount: updatePayload.referrals_count }
            });
        }
    } catch (err) {
        console.error('incrementInviterRewards error', err);
    }
}

const state = new StateManager();

// ============================================
// SUPABASE INTEGRATION
// ============================================
let supabaseClient = null;
let supabaseUserId = null;
let supabaseSyncEnabled = false;
let supabaseSyncTimer = null;
let supabaseLatestState = null;
let suppressSupabaseSync = false;
let premiumSyncInFlight = false;
let pendingReferralCode = null;
let referralRewarded = false;

function generateReferralCode(uid) {
    return `NXS${uid || Math.floor(Math.random() * 999999)}`;
}

function getReferralLink(code) {
    // Bot expects 'ref_' prefix followed by user ID for referrals
    const ref = code || state.get('user')?.id;
    if (!ref) return `https://t.me/${CONFIG.BOT_USERNAME}`;
    return `https://t.me/${CONFIG.BOT_USERNAME}?start=ref_${ref}`;
}

async function bootstrapSupabase() {
    // 1. Check if Supabase SDK is loaded
    if (!window.supabase) {
        console.warn('Supabase SDK not loaded. Enable Offline Mode.');
        enableOfflineMode();
        return;
    }

    // 2. Check Configuration
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY || CONFIG.SUPABASE_URL.includes('YOUR_SUPABASE')) {
        console.warn('Supabase config missing. Enable Offline Mode.');
        enableOfflineMode();
        return;
    }

    // 3. Initialize Client
    try {
        if (!supabaseClient) {
            supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
            console.log('Supabase client initialized');
        }
    } catch (err) {
        console.error('Supabase client init failed', err);
        enableOfflineMode();
        return;
    }

    // 4. Check User ID
    const uid = state.get('user')?.id;
    if (!uid) {
        console.warn('User ID missing (0). Enable Offline Mode until login.');
        // Don't fully enable offline mode here, just don't sync yet.
        // Wait for Telegram params to provide ID.
        return;
    }

    supabaseUserId = uid;

    // 5. Start Sync
    try {
        await ensureSupabaseRecords(uid);
        await loadSupabaseState(uid);
        supabaseSyncEnabled = true;
        state.subscribe(scheduleSupabaseSync);
        scheduleSupabaseSync(state.state);
        await handlePendingReferral();
        console.log('Supabase sync enabled for user', uid);
        updateConnectionStatus(true);
    } catch (err) {
        console.error('Failed to bootstrap Supabase sync', err);
        enableOfflineMode();
    }
}

function enableOfflineMode() {
    console.log('Switching to Offline Mode');
    state.update({ offlineMode: true });
    updateConnectionStatus(false);
}

function updateConnectionStatus(online) {
    const indicator = document.getElementById('connectionStatus');
    if (indicator) {
        indicator.className = online ? 'status-online' : 'status-offline';
        indicator.title = online ? 'Online: Data Synced' : 'Offline: Local Storage Only';
    }
}

// Function to manually sync with Bot (Secure Proxy)
function syncWithBot() {
    if (window.Telegram?.WebApp) {
        const data = {
            action: 'sync_state',
            state: state.state
        };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
    } else {
        showToast('Telegram WebApp not detected', 'error');
    }
}

async function ensureSupabaseRecords(uid) {
    if (!supabaseClient) return;
    let referralCode = state.get('user')?.referralCode || null;
    try {
        const { data: existing } = await supabaseClient
            .from('users')
            .select('referral_code')
            .eq('id', uid)
            .maybeSingle();
        if (existing?.referral_code) {
            referralCode = existing.referral_code;
        }
    } catch (err) {
        console.warn('Referral lookup failed', err);
    }
    if (!referralCode) {
        referralCode = generateReferralCode(uid);
    }

    const profilePayload = {
        id: uid,
        username: state.get('user')?.username || null,
        full_name: state.get('user')?.name || null,
        referral_code: referralCode
    };

    const { error: userError } = await supabaseClient
        .from('users')
        .upsert(profilePayload, { onConflict: 'id' });

    if (userError) {
        throw userError;
    }

    const { error: miningError } = await supabaseClient
        .from('mining_data')
        .upsert({ user_id: uid }, { onConflict: 'user_id' });

    if (miningError) {
        throw miningError;
    }

    state.update({
        user: { ...state.get('user'), referralCode }
    });
}

async function loadSupabaseState(uid) {
    if (!supabaseClient) return;
    suppressSupabaseSync = true;

    try {
        const [{ data: userRow, error: userError }, { data: miningRow, error: miningError }] = await Promise.all([
            supabaseClient.from('users').select('*').eq('id', uid).single(),
            supabaseClient.from('mining_data').select('*').eq('user_id', uid).maybeSingle()
        ]);

        if (userError && userError.code !== 'PGRST116') {
            console.warn('Supabase user fetch error', userError);
        }
        if (miningError && miningError.code !== 'PGRST116') {
            console.warn('Supabase mining fetch error', miningError);
        }

        if (userRow) {
            const currentUser = state.get('user');
            state.update({
                xp: userRow.xp ?? state.get('xp'),
                gold: userRow.gold ?? state.get('gold'),
                rpgGold: userRow.rpg_gold ?? state.get('rpgGold') ?? 0,
                level: userRow.level ?? state.get('level'),
                streak: userRow.streak ?? state.get('streak'),
                darkMatter: userRow.dark_matter ?? state.get('darkMatter') ?? 0,
                quizStats: {
                    ...state.get('quizStats'),
                    total: userRow.quizzes_completed ?? state.get('quizStats').total
                },
                user: {
                    ...currentUser,
                    id: userRow.id,
                    name: userRow.full_name || currentUser.name,
                    username: userRow.username || currentUser.username,
                    isPremium: (userRow.subscription_type ?? 0) > 0,
                    premiumExpires: userRow.premium_expires || currentUser.premiumExpires,
                    referralCode: userRow.referral_code || currentUser.referralCode,
                    referralsCount: userRow.referrals_count ?? currentUser.referralsCount ?? 0,
                    referredBy: userRow.referred_by || currentUser.referredBy
                }
            });
        }

        if (miningRow) {
            state.update({
                energy: miningRow.energy ?? state.get('energy'),
                maxEnergy: miningRow.max_energy ?? state.get('maxEnergy'),
                totalTaps: miningRow.total_taps ?? state.get('totalTaps'),
                tapPower: miningRow.coins_per_tap ?? state.get('tapPower'),
                autoTapRate: Number(miningRow.taps_per_second ?? state.get('autoTapRate')),
                critChance: miningRow.critical_chance ?? state.get('critChance'),
                upgrades: miningRow.upgrades ?? state.get('upgrades'),
                gameCoins: miningRow.game_coins ?? state.get('gameCoins') ?? 0,
                accumulatedCoins: miningRow.accumulated_coins ?? state.get('accumulatedCoins') ?? 0,
                activeEffects: miningRow.active_effects ?? state.get('activeEffects') ?? [],
                ownedSkins: miningRow.owned_skins ?? state.get('ownedSkins') ?? ['skin_default'],
                currentSkin: miningRow.current_skin ?? state.get('currentSkin') ?? 'skin_default'
            });
        }
    } finally {
        suppressSupabaseSync = false;
    }
}

async function handlePendingReferral() {
    if (!pendingReferralCode || referralRewarded || !supabaseClient || !supabaseUserId) return;
    try {
        const code = pendingReferralCode.trim();
        if (!code || code.length < 4) return;
        const { data: inviter, error } = await supabaseClient
            .from('users')
            .select('id')
            .eq('referral_code', code)
            .maybeSingle();
        if (error) {
            console.warn('Referral query failed', error);
            return;
        }
        if (!inviter || inviter.id === supabaseUserId) {
            return;
        }

        referralRewarded = true;
        pendingReferralCode = null;

        const payload = {
            inviter_id: inviter.id,
            invitee_id: supabaseUserId,
            reward_type: 'xp',
            rewarded: false
        };
        const { error: refError } = await supabaseClient.from('referrals').insert(payload);
        if (refError && refError.code !== '23505') {
            console.warn('Referral insert error', refError);
        } else {
            await rewardReferral(inviter.id);
        }
    } catch (err) {
        console.error('handlePendingReferral error', err);
    }
}

async function rewardReferral(inviterId) {
    if (!supabaseClient) return;
    const xpGain = CONFIG.REFERRAL_REWARD_XP || 500;
    const inviterGold = CONFIG.REFERRAL_INVITER_GOLD || 1000;
    try {
        const newXp = state.get('xp') + xpGain;
        state.update({
            xp: newXp,
            user: { ...state.get('user'), referredBy: inviterId }
        });
        await supabaseClient.from('users')
            .update({ xp: newXp })
            .eq('id', supabaseUserId);

        await incrementInviterRewards(inviterId, xpGain, inviterGold);
        await supabaseClient.from('referrals')
            .update({ rewarded: true })
            .eq('invitee_id', supabaseUserId);

        showToast('Referral bonusi qo\'shildi!', 'success');
    } catch (err) {
        console.error('rewardReferral error', err);
    }
}

function scheduleSupabaseSync(snapshot) {
    if (!supabaseSyncEnabled || suppressSupabaseSync) return;
    if (!supabaseClient || !supabaseUserId) return;

    supabaseLatestState = {
        user: { ...snapshot.user },
        xp: snapshot.xp,
        gold: snapshot.gold,
        rpgGold: snapshot.rpgGold || 0,
        level: snapshot.level,
        streak: snapshot.streak,
        darkMatter: snapshot.darkMatter || 0,
        energy: snapshot.energy,
        maxEnergy: snapshot.maxEnergy,
        totalTaps: snapshot.totalTaps,
        autoTapRate: snapshot.autoTapRate,
        tapPower: snapshot.tapPower,
        critChance: snapshot.critChance,
        upgrades: snapshot.upgrades,
        totalGoldEarned: snapshot.totalGoldEarned,
        gameCoins: snapshot.gameCoins || 0,
        accumulatedCoins: snapshot.accumulatedCoins || 0,
        active_effects: snapshot.activeEffects || [],
        owned_skins: snapshot.ownedSkins || ['skin_default'],
        current_skin: snapshot.currentSkin || 'skin_default'
    };

    clearTimeout(supabaseSyncTimer);
    supabaseSyncTimer = setTimeout(flushSupabaseSync, 1500);
}

async function flushSupabaseSync() {
    if (!supabaseLatestState || !supabaseClient) return;

    const s = supabaseLatestState;
    const nowIso = new Date().toISOString();

    const userPayload = {
        id: supabaseUserId,
        username: s.user.username || null,
        full_name: s.user.name || null,
        xp: s.xp,
        gold: s.gold,
        rpg_gold: s.rpgGold || 0,
        level: s.level,
        streak: s.streak,
        dark_matter: s.darkMatter,
        subscription_type: s.user.isPremium ? 1 : 0,
        premium_expires: s.user.premiumExpires || null,
        last_active: nowIso,
        quizzes_completed: state.get('quizStats')?.total ?? null,
        referral_code: s.user.referralCode || null,
        referrals_count: s.user.referralsCount ?? 0,
        referred_by: s.user.referredBy || null
    };

    const miningPayload = {
        user_id: supabaseUserId,
        energy: s.energy,
        max_energy: s.maxEnergy,
        total_taps: s.totalTaps,
        taps_per_second: s.autoTapRate,
        coins_per_tap: s.tapPower,
        critical_chance: s.critChance,
        game_coins: s.gameCoins || 0,
        accumulated_coins: s.accumulatedCoins || 0,
        active_effects: s.activeEffects || [],
        owned_skins: s.ownedSkins || ['skin_default'],
        current_skin: s.currentSkin || 'skin_default',
        upgrades: s.upgrades,
        updated_at: nowIso
    };

    try {
        const { error: userError } = await supabaseClient
            .from('users')
            .upsert(userPayload, { onConflict: 'id' });

        if (userError) {
            console.warn('Supabase user sync error', userError);
        }

        const { error: miningError } = await supabaseClient
            .from('mining_data')
            .upsert(miningPayload, { onConflict: 'user_id' });

        if (miningError) {
            console.warn('Supabase mining sync error', miningError);
        }
    } catch (err) {
        console.error('Supabase sync failed', err);
    }
}

async function recordPremiumTransaction({ plan, days, amount, currency = 'UZS', meta = {} }) {
    if (!supabaseClient || !supabaseUserId) return;
    const payload = {
        user_id: supabaseUserId,
        plan,
        days,
        amount,
        currency,
        status: 'success',
        meta
    };
    const { error } = await supabaseClient.from('premium_transactions').insert(payload);
    if (error) {
        console.warn('Premium transaction insert failed', error);
        throw error;
    }
}

async function grantPremiumDays(days, source = 'manual', skipRecord = false) {
    if (!supabaseClient || !supabaseUserId) {
        showToast('Supabase ulanmagan', 'error');
        return false;
    }
    if (premiumSyncInFlight) return false;
    premiumSyncInFlight = true;
    try {
        const currentExpire = state.get('user').premiumExpires ? new Date(state.get('user').premiumExpires) : new Date();
        const baseDate = currentExpire > new Date() ? currentExpire : new Date();
        baseDate.setDate(baseDate.getDate() + days);
        const iso = baseDate.toISOString();

        const { error } = await supabaseClient.from('users')
            .update({ subscription_type: 1, premium_expires: iso })
            .eq('id', supabaseUserId);
        if (error) {
            throw error;
        }

        if (!skipRecord) {
            await recordPremiumTransaction({ plan: source, days, amount: 0, currency: 'SYS' });
        }

        state.update({
            user: { ...state.get('user'), isPremium: true, premiumExpires: iso }
        });
        showToast(`+${days} kun Premium aktivlashtirildi`, 'success');
        return true;
    } catch (err) {
        console.error('grantPremiumDays error', err);
        showToast('Premiumni aktivlashtirishda xatolik', 'error');
        return false;
    } finally {
        premiumSyncInFlight = false;
    }
}

async function exchangeXpForPremium() {
    const xp = state.get('xp');
    const cost = CONFIG.XP_PREMIUM_COST || 10000;
    if (xp < cost) {
        showToast('XP yetarli emas', 'error');
        return;
    }
    if (!supabaseClient || !supabaseUserId) {
        showToast('Supabase ulanmagan', 'error');
        return;
    }
    state.update({ xp: xp - cost });
    const success = await grantPremiumDays(1, 'xp_exchange', true);
    if (!success) {
        // rollback
        state.update({ xp });
    } else {
        await recordPremiumTransaction({ plan: 'xp_exchange', days: 1, amount: cost, currency: 'XP', meta: { type: 'exchange' } });
        scheduleSupabaseSync(state.state);
    }
}

async function exchangeGoldForPremium() {
    const gold = state.get('gold');
    const cost = CONFIG.GOLD_PREMIUM_COST || 50000;
    const rewardDays = CONFIG.GOLD_PREMIUM_DAYS || 3;
    if (gold < cost) {
        showToast('Gold yetarli emas', 'error');
        return;
    }
    if (!supabaseClient || !supabaseUserId) {
        showToast('Supabase ulanmagan', 'error');
        return;
    }
    state.update({ gold: gold - cost });
    const success = await grantPremiumDays(rewardDays, 'gold_exchange', true);
    if (!success) {
        state.update({ gold });
    } else {
        await recordPremiumTransaction({ plan: 'gold_exchange', days: rewardDays, amount: cost, currency: 'GOLD', meta: { type: 'exchange' } });
        scheduleSupabaseSync(state.state);
    }
}

async function buyPremiumPlan(planId, days, amount) {
    if (!supabaseClient || !supabaseUserId) {
        showToast('Supabase ulanmagan', 'error');
        return;
    }
    if (!planId || !days) {
        showToast('Plan maʼlumoti topilmadi', 'error');
        return;
    }
    showToast('Premium faollashtirilmoqda...', 'info');
    try {
        await recordPremiumTransaction({ plan: planId, days, amount, currency: 'UZS', meta: { source: 'plan' } });
        const success = await grantPremiumDays(days, planId, true);
        if (success) {
            showToast('Premium muvaffaqiyatli aktivlashtirildi', 'success');
            scheduleSupabaseSync(state.state);
            
            // Offer to return to bot
            setTimeout(() => {
                if (window.confirm && confirm('Premium muvaffaqiyatli faollashtirildi! Botga qaytib xaridni tasdiqlaysizmi?')) {
                    sendToBot('premium_purchased', { plan: planId, days: days });
                }
            }, 1000);
        }
    } catch (err) {
        console.error('buyPremiumPlan error', err);
        showToast('Premium sotib olishda xatolik', 'error');
    }
}

// ============================================
// TELEGRAM WEBAPP INTEGRATION
// ============================================
const tg = window.Telegram?.WebApp;

function initTelegram() {
    if (!tg) {
        console.log('Not in Telegram WebApp');
        return;
    }

    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();

    if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        state.update({
            user: {
                id: user.id,
                name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
                username: user.username || '',
                isPremium: user.is_premium || false,
                isAdmin: CONFIG.ADMIN_IDS.includes(user.id),
                referralCode: state.get('user')?.referralCode || null,
                referredBy: state.get('user')?.referredBy || null
            }
        });
        if (tg.initDataUnsafe?.start_param) {
            pendingReferralCode = tg.initDataUnsafe.start_param;
        }
        bootstrapSupabase();
    }

    document.getElementById('claimBtn')?.addEventListener('click', claimAutoTapEarnings);
    
    // Set theme
    document.documentElement.style.setProperty('--tg-theme-bg', tg.themeParams.bg_color || '#050505');
}

function haptic(type = 'light') {
    if (!state.get('settings').haptic || !tg?.HapticFeedback) return;
    
    switch(type) {
        case 'light': tg.HapticFeedback.impactOccurred('light'); break;
        case 'medium': tg.HapticFeedback.impactOccurred('medium'); break;
        case 'heavy': tg.HapticFeedback.impactOccurred('heavy'); break;
        case 'success': tg.HapticFeedback.notificationOccurred('success'); break;
        case 'error': tg.HapticFeedback.notificationOccurred('error'); break;
    }
}

function sendToBot(action, data) {
    if (tg) {
        tg.sendData(JSON.stringify({ action, ...data }));
    }
}

// ============================================
// AUDIO ENGINE
// ============================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.sounds = {};
        // Resume audio context on first user interaction
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
        if (!state.get('settings').sound) return;
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

// ============================================
// PARTICLE SYSTEM
// ============================================
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

// ============================================
// MESH GRADIENT BACKGROUND
// ============================================
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

// ============================================
// UPGRADES SYSTEM
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
// SHOP SYSTEM
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

function getEffectiveStat(stat) {
    let value = state.get(stat);
    const effects = state.get('activeEffects') || [];
    
    effects.forEach(eff => {
        const item = SHOP_ITEMS.boosters.find(i => i.id === eff.id);
        if (item && item.effect === stat) {
            if (item.multiplier) value *= item.multiplier;
            if (item.add) value += item.add;
        }
    });
    return value;
}

function buyShopItem(id, type) {
    const gameCoins = state.get('gameCoins');
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
        const ownedSkins = state.get('ownedSkins') || ['skin_default'];
        if (ownedSkins.includes(id)) {
            // Equip
            state.update({ currentSkin: id });
            showToast(`${item.name} o'rnatildi!`, 'success');
            updateUI(); // To update reactor look
            return;
        }
        
        state.update({
            gameCoins: gameCoins - item.cost,
            ownedSkins: [...ownedSkins, id],
            currentSkin: id
        });
        showToast(`${item.name} sotib olindi!`, 'success');
    } else {
        // Booster
        if (item.refill) {
            state.update({
                gameCoins: gameCoins - item.cost,
                energy: state.get('maxEnergy')
            });
            showToast('Energiya to\'ldirildi!', 'success');
        } else {
            const effects = state.get('activeEffects') || [];
            const existing = effects.find(e => e.id === id);
            
            let newEffects;
            const now = Date.now();
            
            if (existing) {
                // Extend duration
                newEffects = effects.map(e => e.id === id ? { ...e, endTime: e.endTime + item.duration * 1000 } : e);
            } else {
                newEffects = [...effects, { id, endTime: now + item.duration * 1000 }];
            }
            
            state.update({
                gameCoins: gameCoins - item.cost,
                activeEffects: newEffects
            });
            showToast(`${item.name} faollashdi!`, 'success');
        }
    }
    
    haptic('success');
    audio.play('upgrade');
    renderShopModal(); // Re-render to show updated buttons
    updateUI();
}

function getUpgradeCost(type) {
    const upgrade = UPGRADES[type];
    const level = state.get('upgrades')[type];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

function purchaseUpgrade(type) {
    const cost = getUpgradeCost(type);
    const gameCoins = state.get('gameCoins');
    
    if (gameCoins < cost) {
        showToast('Yetarli coin yo\'q!', 'error');
        haptic('error');
        audio.play('error');
        return false;
    }
    
    const upgrades = { ...state.get('upgrades') };
    upgrades[type]++;
    
    state.update({
        gameCoins: gameCoins - cost,
        upgrades
    });
    
    applyUpgradeEffects();
    showToast(`${UPGRADES[type].name} yangilandi!`, 'success');
    haptic('success');
    audio.play('levelUp');
    renderUpgrades();
    updateUI();
    
    return true;
}

function applyUpgradeEffects() {
    const upgrades = state.get('upgrades');
    state.update({
        tapPower: UPGRADES.tapPower.effect(upgrades.tapPower),
        autoTapRate: UPGRADES.autoTap.effect(upgrades.autoTap),
        maxEnergy: UPGRADES.energy.effect(upgrades.energy),
        critChance: UPGRADES.crit.effect(upgrades.crit)
    });
}

// ============================================
// ACHIEVEMENTS SYSTEM
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
    { id: 'quiz_10', name: '10 ta quiz', icon: 'fa-brain', condition: s => s.quizStats.total >= 10 },
    { id: 'quiz_perfect', name: 'Mukammal quiz', icon: 'fa-trophy', condition: s => s.quizStats.streak >= 10 }
];

function checkAchievements() {
    const unlocked = state.get('achievements');
    const stateData = state.state;
    
    ACHIEVEMENTS.forEach(ach => {
        if (!unlocked.includes(ach.id) && ach.condition(stateData)) {
            unlocked.push(ach.id);
            state.set('achievements', unlocked);
            showToast(`🏆 Yutuq: ${ach.name}`, 'success');
            haptic('success');
            audio.play('achievement');
        }
    });
}

// ============================================
// DAILY CHALLENGES
// ============================================
function generateDailyChallenges() {
    const today = new Date().toDateString();
    const lastReset = state.get('lastChallengeReset');
    
    if (lastReset === today) return;
    
    const challenges = [
        { id: 'tap_500', name: '500 ta tap', target: 500, progress: 0, reward: 500, type: 'taps' },
        { id: 'earn_2000', name: '2000 coin yig\'ish', target: 2000, progress: 0, reward: 300, type: 'gold' },
        { id: 'quiz_3', name: '3 ta quiz o\'ynash', target: 3, progress: 0, reward: 400, type: 'quiz' },
        { id: 'upgrade_1', name: '1 ta upgrade olish', target: 1, progress: 0, reward: 200, type: 'upgrade' }
    ];
    
    state.update({
        dailyChallenges: challenges,
        lastChallengeReset: today
    });
}

function updateChallengeProgress(type, amount = 1) {
    const challenges = state.get('dailyChallenges').map(c => {
        if (c.type === type && c.progress < c.target) {
            c.progress = Math.min(c.progress + amount, c.target);
        }
        return c;
    });
    state.set('dailyChallenges', challenges);
    renderChallenges();
}

function claimChallengeReward(id) {
    const challenges = state.get('dailyChallenges');
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge || challenge.progress < challenge.target || challenge.claimed) return;
    
    challenge.claimed = true;
    state.update({
        dailyChallenges: challenges,
        gameCoins: state.get('gameCoins') + challenge.reward
    });
    
    showToast(`+${challenge.reward} coin!`, 'success');
    haptic('success');
    audio.play('achievement');
    renderChallenges();
    updateUI();
}

// ============================================
// LEADERBOARD (Simulated)
// ============================================
const AI_PLAYERS = [
    { name: 'CryptoMaster', score: 0 },
    { name: 'TapKing', score: 0 },
    { name: 'GoldHunter', score: 0 },
    { name: 'NexusPro', score: 0 },
    { name: 'SpeedTapper', score: 0 },
    { name: 'DiamondHands', score: 0 },
    { name: 'MoonWalker', score: 0 },
    { name: 'StarGazer', score: 0 }
];

function updateLeaderboard() {
    const userScore = state.get('xp'); // Use global XP for leaderboard
    
    AI_PLAYERS.forEach(player => {
        player.score += Math.floor(Math.random() * 50); // XP growth simulation
        if (player.score < userScore * 0.8) {
            player.score = Math.floor(userScore * (0.8 + Math.random() * 0.4));
        }
    });
    
    const leaderboard = [
        { name: state.get('user').name, score: userScore, isUser: true },
        ...AI_PLAYERS
    ].sort((a, b) => b.score - a.score);
    
    return leaderboard;
}

// ============================================
// PRESTIGE SYSTEM
// ============================================
function canPrestige() {
    return state.get('totalGoldEarned') >= CONFIG.PRESTIGE_THRESHOLD;
}

function calculatePrestigeReward() {
    const total = state.get('totalGoldEarned');
    return Math.floor(Math.sqrt(total / 1000));
}

function doPrestige() {
    if (!canPrestige()) return;
    
    const reward = calculatePrestigeReward();
    const newPrestigeLevel = state.get('prestigeLevel') + 1;
    
    state.update({
        gameCoins: 0,
        // XP and Level are global and NOT reset
        energy: 1000,
        maxEnergy: 1000,
        tapPower: 1,
        autoTapRate: 0,
        critChance: 5,
        // totalTaps and totalGoldEarned kept for achievements? Or reset? 
        // Usually prestige resets progress but keeps achievements.
        // Let's reset mining progress stats but assume achievements are permanent.
        // totalTaps: 0, // Maybe keep stats?
        // totalGoldEarned: 0, // Maybe keep stats? 
        // For now, let's follow the "hard reset" pattern for mining stats but KEEP GLOBAL XP/Level
        upgrades: { tapPower: 0, autoTap: 0, energy: 0, crit: 0, luck: 0 },
        prestigeLevel: newPrestigeLevel,
        darkMatter: state.get('darkMatter') + reward
    });
    
    showToast(`Prestige! +${reward} Dark Matter`, 'success');
    haptic('heavy');
    audio.play('achievement');
    checkAchievements();
    updateUI();
    renderAll();
}

// ============================================
// QUIZ SYSTEM
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

let currentQuiz = {
    category: 'general',
    difficulty: 'medium',
    questionCount: 10,
    questions: [],
    currentIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 30
};

function startQuiz(options = null) {
    let category, difficulty, count;
    let customQuestions = null;

    if (options) {
        category = options.category || 'general';
        difficulty = options.difficulty || 'medium';
        count = options.questionCount || 10;
        customQuestions = options.questions;
    } else {
        category = document.querySelector('.category-card.active')?.dataset.category || 'general';
        difficulty = document.querySelector('.diff-btn.active')?.dataset.diff || 'medium';
        count = parseInt(document.querySelector('.count-btn.active')?.dataset.count || '10');
    }
    
    let questions;
    if (customQuestions) {
        questions = [...customQuestions];
    } else if (category === 'mixed' || difficulty === 'adaptive') {
        // Combine all questions for adaptive/mixed mode
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
    
    shuffleArray(questions);
    
    currentQuiz = {
        category,
        difficulty,
        questionCount: Math.min(count, questions.length),
        questions: questions.slice(0, Math.min(count, questions.length)),
        currentIndex: 0,
        score: 0,
        timer: null,
        timeLeft: difficulty === 'easy' ? 45 : difficulty === 'hard' ? 20 : 30
    };
    
    document.querySelector('.quiz-container').style.display = 'none';
    document.getElementById('quizGame').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    showQuestion();
    startTimer();
    haptic('medium');
    
    if (document.getElementById('modalOverlay').classList.contains('active')) {
        closeModal();
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function showQuestion() {
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    if (!q) return endQuiz();
    
    document.getElementById('quizProgress').textContent = `${currentQuiz.currentIndex + 1}/${currentQuiz.questionCount}`;
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
    if (currentQuiz.answered) return;
    currentQuiz.answered = true;
    
    clearInterval(currentQuiz.timer);
    
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    const answers = document.querySelectorAll('.quiz-answer');
    
    answers[q.c].classList.add('correct');
    
    if (index === q.c) {
        currentQuiz.score++;
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
        currentQuiz.currentIndex++;
        currentQuiz.answered = false;
        
        if (currentQuiz.currentIndex < currentQuiz.questionCount) {
            currentQuiz.timeLeft = currentQuiz.difficulty === 'easy' ? 45 : currentQuiz.difficulty === 'hard' ? 20 : 30;
            showQuestion();
            startTimer();
        } else {
            endQuiz();
        }
    }, 1500);
}

function startTimer() {
    const timerEl = document.querySelector('#quizTimer span');
    timerEl.textContent = currentQuiz.timeLeft;
    
    currentQuiz.timer = setInterval(() => {
        currentQuiz.timeLeft--;
        timerEl.textContent = currentQuiz.timeLeft;
        
        if (currentQuiz.timeLeft <= 0) {
            clearInterval(currentQuiz.timer);
            selectAnswer(-1);
        }
    }, 1000);
}

function endQuiz() {
    clearInterval(currentQuiz.timer);
    
    const accuracy = Math.round((currentQuiz.score / currentQuiz.questionCount) * 100);
    const xpEarned = currentQuiz.score * 50;
    
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    document.getElementById('resultsScore').textContent = `${currentQuiz.score}/${currentQuiz.questionCount}`;
    document.getElementById('resultsAccuracy').textContent = `${accuracy}% aniqlik`;
    document.getElementById('resultsXP').textContent = `+${xpEarned} XP`;
    
    const quizStats = state.get('quizStats');
    state.update({
        xp: state.get('xp') + xpEarned,
        quizStats: {
            total: quizStats.total + 1,
            correct: quizStats.correct + currentQuiz.score,
            streak: accuracy === 100 ? quizStats.streak + 1 : 0
        }
    });
    
    updateChallengeProgress('quiz', 1);
    checkAchievements();
    checkLevelUp();
    updateUI();
    
    haptic('success');
    audio.play('achievement');
}

function closeQuiz() {
    clearInterval(currentQuiz.timer);
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('quizResults').style.display = 'none';
    document.querySelector('.quiz-container').style.display = 'block';
}

// ============================================
// MINING GAME
// ============================================
let particles = null;
let meshGradient = null;

function handleTap(e) {
    const energy = state.get('energy');
    if (energy <= 0) {
        showToast('Energiya tugadi!', 'warning');
        haptic('error');
        return;
    }
    
    audio.init();
    
    const isCritical = Math.random() * 100 < getEffectiveStat('critChance');
    const baseGold = state.get('tapPower');
    const goldEarned = isCritical ? baseGold * state.get('critMultiplier') : baseGold;
    const xpEarned = isCritical ? 2 : 1;
    
    state.update({
        gameCoins: state.get('gameCoins') + goldEarned,
        xp: state.get('xp') + xpEarned,
        energy: energy - 1,
        totalTaps: state.get('totalTaps') + 1,
        totalGoldEarned: state.get('totalGoldEarned') + goldEarned
    });
    
    // Visual feedback
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);
    
    showClickEffect(x, y, goldEarned, isCritical);
    createShockwave(x - rect.left, y - rect.top); // Add Shockwave relative to card
    
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
    
    updateChallengeProgress('taps', 1);
    updateChallengeProgress('gold', goldEarned);
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
    const xp = state.get('xp');
    const level = state.get('level');
    const xpNeeded = level * 1000;
    
    if (xp >= xpNeeded) {
        state.update({
            level: level + 1,
            xp: xp - xpNeeded
        });
        showToast(`🎉 ${level + 1}-darajaga ko'tarildingiz!`, 'success');
        haptic('success');
        audio.play('levelUp');
        checkAchievements();
    }
}

function regenerateEnergy() {
    const energy = state.get('energy');
    const maxEnergy = state.get('maxEnergy');
    
    if (energy < maxEnergy) {
        state.set('energy', Math.min(energy + CONFIG.ENERGY_REGEN_RATE, maxEnergy));
        updateEnergyBar();
    }
}

function autoTap() {
    const rate = getEffectiveStat('autoTapRate');
    if (rate <= 0) return;
    
    // Auto tap consumes energy? Let's assume yes for consistency with previous logic, 
    // but typically passive income shouldn't. 
    // For now, let's keep energy consumption to avoid unbalancing existing logic 
    // unless user requested otherwise.
    const energy = state.get('energy');
    if (energy <= 0) return;
    
    const goldEarned = rate;
    
    // Accumulate coins instead of direct credit
    state.update({
        accumulatedCoins: (state.get('accumulatedCoins') || 0) + goldEarned,
        energy: energy - 1,
        totalGoldEarned: state.get('totalGoldEarned') + goldEarned
    });
    
    updateUI();
}

function claimAutoTapEarnings() {
    const accumulated = state.get('accumulatedCoins') || 0;
    if (accumulated <= 0) return;
    
    state.update({
        gameCoins: state.get('gameCoins') + accumulated,
        accumulatedCoins: 0
    });
    
    showToast(`+${formatNumber(accumulated)} coin olindi!`, 'success');
    haptic('success');
    audio.play('achievement'); // or coin sound
    updateUI();
}

function updateActiveEffects() {
    const effects = state.get('activeEffects') || [];
    if (effects.length === 0) {
        document.getElementById('activeEffectsContainer').style.display = 'none';
        return;
    }

    const now = Date.now();
    const validEffects = effects.filter(e => e.endTime > now);

    if (validEffects.length !== effects.length) {
        state.update({ activeEffects: validEffects });
        applyUpgradeEffects(); // Re-calculate stats if effects expired
    }

    renderActiveEffects(validEffects);
}

function renderActiveEffects(effects) {
    const container = document.getElementById('activeEffectsContainer');
    if (!effects || effects.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = effects.map(e => {
        const item = SHOP_ITEMS.boosters.find(i => i.id === e.id);
        if (!item) return '';
        
        const timeLeft = Math.max(0, Math.ceil((e.endTime - Date.now()) / 1000));
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        return `
            <div class="active-effect-pill">
                <i class="fas ${item.icon}"></i>
                <span>${item.name}</span>
                <span class="timer">${minutes}:${seconds.toString().padStart(2, '0')}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
function updateUI() {
    const s = state.state;
    
    // Header
    document.getElementById('userName').textContent = s.user.name;
    document.getElementById('userAvatar').textContent = s.user.name.charAt(0).toUpperCase();
    document.getElementById('userTier').querySelector('span').textContent = s.user.isPremium ? 'Premium' : 'Standard';
    
    animateNumber('headerXP', s.xp);
    animateNumber('headerGold', s.gold);
    
    // Stats bar
    document.getElementById('statLevel').textContent = s.level;
    document.getElementById('statStreak').textContent = s.streak;
    document.getElementById('statReferrals').textContent = s.user.referralsCount || 0;
    
    if (s.darkMatter > 0) {
        document.getElementById('darkMatterChip').style.display = 'flex';
        document.getElementById('statDarkMatter').textContent = s.darkMatter;
    }
    
    // Mining
    animateNumber('miningBalance', s.gameCoins);
    document.getElementById('tapPower').textContent = s.tapPower;
    document.getElementById('autoTapRate').textContent = s.autoTapRate;
    
    // Claim Button
    const claimContainer = document.getElementById('claimContainer');
    const claimAmount = document.getElementById('claimAmount');
    if (s.accumulatedCoins > 0) {
        claimContainer.style.display = 'flex';
        claimAmount.textContent = formatNumber(s.accumulatedCoins);
    } else {
        claimContainer.style.display = 'none';
    }
    
    updateEnergyBar();
    updatePrestigeSection();
    
    // Profile
    document.getElementById('profileAvatar').textContent = s.user.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = s.user.name;
    document.getElementById('profileUsername').textContent = s.user.username ? `@${s.user.username}` : '';
    document.getElementById('profileId').textContent = s.user.id;
    document.getElementById('profileXP').textContent = formatNumber(s.xp);
    document.getElementById('profileGold').textContent = formatNumber(s.gold);
    document.getElementById('profileLevel').textContent = s.level;
    document.getElementById('profileStreak').textContent = s.streak;
    
    // Premium
    const isPremium = s.user.isPremium;
    document.getElementById('premiumStatusText').textContent = isPremium ? 'Premium' : 'Standard';
    document.getElementById('premiumStatusCard').classList.toggle('active', isPremium);
    document.getElementById('exchangeXP').textContent = formatNumber(s.xp);
    const xpBtn = document.getElementById('exchangeBtn');
    if (xpBtn) xpBtn.disabled = s.xp < (CONFIG.XP_PREMIUM_COST || 10000);
    const goldBtn = document.getElementById('goldExchangeBtn');
    if (goldBtn) goldBtn.disabled = s.gold < (CONFIG.GOLD_PREMIUM_COST || 50000);
    
    // Quiz stats
    renderQuizStats();
    
    // Admin
    if (s.user.isAdmin) {
        document.querySelector('.admin-nav').style.display = 'flex';
        document.getElementById('sectionAdmin').style.display = 'block';
    }
}

function updateEnergyBar() {
    const energy = state.get('energy');
    const maxEnergy = state.get('maxEnergy');
    const percent = (energy / maxEnergy) * 100;
    
    const fill = document.getElementById('energyFill');
    fill.style.width = `${percent}%`;
    fill.classList.toggle('low', percent < 20);
    
    document.getElementById('energyText').textContent = `${energy}/${maxEnergy}`;
}

function updatePrestigeSection() {
    const section = document.getElementById('prestigeSection');
    if (canPrestige()) {
        section.style.display = 'block';
        document.getElementById('prestigeReward').textContent = calculatePrestigeReward();
    } else {
        section.style.display = 'none';
    }
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderUpgrades() {
    const grid = document.getElementById('upgradesGrid');
    const gameCoins = state.get('gameCoins');
    const upgrades = state.get('upgrades');
    
    grid.innerHTML = Object.entries(UPGRADES).map(([key, u]) => {
        const level = upgrades[key];
        const cost = getUpgradeCost(key);
        const canAfford = gameCoins >= cost;
        
        return `
            <div class="upgrade-item ${canAfford ? '' : 'disabled'}" data-upgrade="${key}">
                <div class="upgrade-icon"><i class="fas ${u.icon}"></i></div>
                <div class="upgrade-info">
                    <div class="upgrade-name">${u.name}</div>
                    <div class="upgrade-level">Lv.${level}</div>
                </div>
                <div class="upgrade-cost"><i class="fas fa-coins"></i>${formatNumber(cost)}</div>
            </div>
        `;
    }).join('');
    
    grid.querySelectorAll('.upgrade-item').forEach(el => {
        el.addEventListener('click', () => {
            const type = el.dataset.upgrade;
            if (purchaseUpgrade(type)) {
                updateChallengeProgress('upgrade', 1);
            }
        });
    });
}

function renderChallenges() {
    const list = document.getElementById('challengesList');
    const challenges = state.get('dailyChallenges');
    
    list.innerHTML = challenges.map(c => {
        const percent = Math.min((c.progress / c.target) * 100, 100);
        const completed = c.progress >= c.target;
        
        return `
            <div class="challenge-item ${completed ? 'completed' : ''}">
                <div class="challenge-icon"><i class="fas fa-bullseye"></i></div>
                <div class="challenge-info">
                    <div class="challenge-name">${c.name}</div>
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width:${percent}%"></div>
                    </div>
                </div>
                ${completed && !c.claimed ? 
                    `<button class="challenge-claim-btn" data-id="${c.id}">Olish</button>` :
                    `<div class="challenge-reward"><i class="fas fa-coins"></i>${c.reward}</div>`
                }
            </div>
        `;
    }).join('');
    
    list.querySelectorAll('.challenge-claim-btn').forEach(btn => {
        btn.addEventListener('click', () => claimChallengeReward(btn.dataset.id));
    });
}

function renderAchievements() {
    const preview = document.getElementById('achievementsPreview');
    const unlocked = state.get('achievements');
    
    preview.innerHTML = ACHIEVEMENTS.slice(0, 8).map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <i class="fas ${a.icon}"></i>
            </div>
        `;
    }).join('');
}

function renderPodium() {
    const podium = document.getElementById('podium');
    const leaderboard = updateLeaderboard();
    const top3 = leaderboard.slice(0, 3);
    
    const medals = ['🥇', '🥈', '🥉'];
    const classes = ['first', 'second', 'third'];
    
    podium.innerHTML = top3.map((p, i) => `
        <div class="podium-item ${classes[i]}">
            <div class="podium-rank">${medals[i]}</div>
            <div class="podium-avatar">${p.name.charAt(0)}</div>
            <div class="podium-name">${p.name}${p.isUser ? ' (Siz)' : ''}</div>
            <div class="podium-score">${formatNumber(p.score)}</div>
        </div>
    `).join('');
}

function renderQuizStats() {
    const grid = document.getElementById('quizStatsGrid');
    const stats = state.get('quizStats');
    const accuracy = stats.total > 0 ? Math.round((stats.correct / (stats.total * 10)) * 100) : 0;
    
    grid.innerHTML = `
        <div class="quiz-stat-item"><div class="value">${stats.total}</div><div class="label">Jami</div></div>
        <div class="quiz-stat-item"><div class="value">${stats.correct}</div><div class="label">To'g'ri</div></div>
        <div class="quiz-stat-item"><div class="value">${accuracy}%</div><div class="label">Aniqlik</div></div>
        <div class="quiz-stat-item"><div class="value">${stats.streak}</div><div class="label">Streak</div></div>
    `;
}

function renderDashboard() {
    const dashboard = document.getElementById('dashboardStats');
    const s = state.state;
    
    dashboard.innerHTML = `
        <div class="dashboard-stat-item"><div class="value">${formatNumber(s.totalTaps)}</div><div class="label">Jami taplar</div></div>
        <div class="dashboard-stat-item"><div class="value">${formatNumber(s.totalGoldEarned)}</div><div class="label">Jami gold</div></div>
        <div class="dashboard-stat-item"><div class="value">${s.quizStats.total}</div><div class="label">Quizlar</div></div>
        <div class="dashboard-stat-item"><div class="value">${state.get('achievements').length}</div><div class="label">Yutuqlar</div></div>
    `;
}

function renderRecommendations() {
    const list = document.getElementById('recommendationsList');
    const recommendations = [
        "Kunlik vazifalarni bajaring va bonus oling",
        "Quiz o'ynab XP yig'ing",
        "Upgrade sotib olib kuchingizni oshiring"
    ];
    
    list.innerHTML = recommendations.map(r => `
        <div class="recommendation-item"><i class="fas fa-lightbulb"></i><span>${r}</span></div>
    `).join('');
}

function renderAll() {
    renderUpgrades();
    renderChallenges();
    renderAchievements();
    renderPodium();
    renderDashboard();
    renderRecommendations();
    updateUI();
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
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

// ============================================
// MODAL SYSTEM
// ============================================
function openModal(type) {
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    const modals = {
        leaderboard: { icon: 'fa-trophy', title: 'Reyting', content: renderLeaderboardModal },
        achievements: { icon: 'fa-medal', title: 'Yutuqlar', content: renderAchievementsModal },
        shop: { icon: 'fa-store', title: 'Do\'kon', content: renderShopModal },
        referral: { icon: 'fa-share-nodes', title: 'Referral', content: renderReferralModal },
        notifications: { icon: 'fa-bell', title: 'Xabarlar', content: renderNotificationsModal },
        help: { icon: 'fa-question-circle', title: 'Yordam', content: renderHelpModal },
        support: { icon: 'fa-headset', title: 'Qo\'llab-quvvatlash', content: renderSupportModal },
        aiTests: { icon: 'fa-robot', title: 'AI Testlar', content: renderAiTestsModal },
        statistics: { icon: 'fa-chart-line', title: 'Statistika', content: renderStatisticsModal },
        mistakes: { icon: 'fa-times-circle', title: 'Xatolar tahlili', content: renderMistakesModal },
        srs: { icon: 'fa-repeat', title: 'SRS Vazifalar', content: renderSrsModal },
        adaptive: { icon: 'fa-sliders-h', title: 'Adaptiv test', content: renderAdaptiveModal },
        duel: { icon: 'fa-swords', title: 'Duel qo\'llanma', content: renderDuelModal },
        certificates: { icon: 'fa-certificate', title: 'Sertifikatlar', content: renderCertificatesModal },
        premium: { icon: 'fa-gem', title: 'Premium A\'zolik', content: renderPremiumModal },
        newFeatures: { icon: 'fa-star', title: 'Yangi Imkoniyatlar', content: renderNewFeaturesModal },
        rpg: { icon: 'fa-gamepad', title: 'RPG Tizimi', content: renderRpgModal }
    };
    
    const modal = modals[type];
    if (!modal) return;
    
    title.innerHTML = `<i class="fas ${modal.icon}"></i><span>${modal.title}</span>`;
    const result = modal.content ? modal.content(body) : '';
    
    if (result instanceof Promise) {
        body.innerHTML = modalLoadingHtml();
        result.then(html => {
            body.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);">Ma\'lumot topilmadi</p>';
        }).catch(err => {
            console.error('Modal content error', err);
            body.innerHTML = `<p style="color:var(--accent-red);text-align:center;">Xatolik: ${err.message || 'ma\'lumot olishda muammo'}</p>`;
        });
    } else if (typeof result === 'string') {
        body.innerHTML = result;
    } else if (result === undefined) {
        // modal.content handled DOM directly
    } else {
        body.innerHTML = modalLoadingHtml();
    }
    
    // Load flashcards when SRS modal opens
    if (type === 'srs') {
        setTimeout(() => loadMyFlashcards(), 100);
    }
    
    overlay.classList.add('active');
    haptic('light');
}

function renderPremiumModal() {
    return `
        <div style="padding:16px;">
            <div style="text-align:center;margin-bottom:24px;">
                <div style="width:80px;height:80px;background:linear-gradient(135deg, #ffd700, #ffa500);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 0 20px rgba(255, 215, 0, 0.3);">
                    <i class="fas fa-crown" style="font-size:40px;color:white;"></i>
                </div>
                <h3 style="background:linear-gradient(to right, #ffd700, #ffa500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;margin:0;">Premium Status</h3>
                <p style="color:var(--text-muted);margin-top:8px;">Cheklovsiz imkoniyatlar dunyosi</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-glass);border-radius:12px;">
                    <i class="fas fa-film" style="color:var(--accent-cyan);font-size:20px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:600;">4K & HD Kinolar</div>
                        <div style="font-size:11px;color:var(--text-muted);">Eng yuqori sifatda tomosha qiling</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-glass);border-radius:12px;">
                    <i class="fas fa-headphones" style="color:var(--accent-purple);font-size:20px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:600;">Audio Kitoblar</div>
                        <div style="font-size:11px;color:var(--text-muted);">Cheklovsiz tinglash imkoniyati</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-glass);border-radius:12px;">
                    <i class="fas fa-bolt" style="color:var(--accent-gold);font-size:20px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:600;">2x XP & Coins</div>
                        <div style="font-size:11px;color:var(--text-muted);">Barcha harakatlar uchun ikki hissa mukofot</div>
                    </div>
                </div>
            </div>

            <div style="background:var(--bg-elevated);padding:20px;border-radius:16px;text-align:center;border:1px solid var(--accent-gold);">
                <div style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">Maxsus Taklif</div>
                <div style="font-size:28px;font-weight:800;color:var(--accent-gold);margin-bottom:8px;">24,990 so'm <span style="font-size:14px;color:var(--text-muted);font-weight:normal;">/oy</span></div>
                <button onclick="closeModal(); navigateTo('premium');" style="width:100%;padding:14px;background:linear-gradient(135deg, #ffd700, #ffa500);border:none;border-radius:12px;color:black;font-weight:700;font-size:16px;cursor:pointer;margin-top:12px;box-shadow:0 4px 12px rgba(255, 215, 0, 0.3);">
                    Tariflarni Ko'rish
                </button>
            </div>
        </div>
    `;
}

function renderNewFeaturesModal() {
    return `
        <div style="padding:16px;">
            <div style="margin-bottom:20px;">
                <h3 style="margin:0 0 8px 0;">Yangi Imkoniyatlar 🚀</h3>
                <p style="color:var(--text-muted);font-size:13px;margin:0;">Nexus tizimiga qo'shilgan so'nggi yangiliklar</p>
            </div>

            <div style="display:flex;flex-direction:column;gap:16px;">
                <div style="background:var(--bg-glass);border-radius:16px;padding:16px;border:1px solid var(--glass-border);">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="width:32px;height:32px;background:rgba(0, 255, 247, 0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-brain" style="color:var(--accent-cyan);"></i>
                        </div>
                        <div style="font-weight:600;">SRS Flashcards</div>
                    </div>
                    <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px 0;">Intervalli takrorlash tizimi orqali bilimlarni mustahkamlang. O'z kartalaringizni yarating va boshqaring.</p>
                    <button onclick="openModal('srs')" style="padding:8px 16px;background:var(--bg-elevated);border:1px solid var(--accent-cyan);border-radius:8px;color:var(--accent-cyan);font-size:12px;cursor:pointer;">Sinab ko'rish</button>
                </div>

                <div style="background:var(--bg-glass);border-radius:16px;padding:16px;border:1px solid var(--glass-border);">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="width:32px;height:32px;background:rgba(157, 78, 221, 0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-sliders-h" style="color:var(--accent-purple);"></i>
                        </div>
                        <div style="font-weight:600;">Adaptiv Testlar</div>
                    </div>
                    <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px 0;">Sizning bilim darajangizga moslashuvchi sun'iy intellekt asosidagi testlar.</p>
                    <button onclick="openModal('adaptive')" style="padding:8px 16px;background:var(--bg-elevated);border:1px solid var(--accent-purple);border-radius:8px;color:var(--accent-purple);font-size:12px;cursor:pointer;">Boshlash</button>
                </div>

                <div style="background:var(--bg-glass);border-radius:16px;padding:16px;border:1px solid var(--glass-border);">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="width:32px;height:32px;background:rgba(255, 0, 0, 0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-swords" style="color:var(--accent-red);"></i>
                        </div>
                        <div style="font-weight:600;">Duel Rejimi</div>
                    </div>
                    <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px 0;">Do'stlar bilan bellashing! Bilimlar jangi boshlandi.</p>
                    <button onclick="openModal('duel')" style="padding:8px 16px;background:var(--bg-elevated);border:1px solid var(--accent-red);border-radius:8px;color:var(--accent-red);font-size:12px;cursor:pointer;">Chorlash</button>
                </div>
            </div>
        </div>
    `;
}

function modalLoadingHtml() {
    return `
        <div style="padding:24px;text-align:center;color:var(--text-muted);">
            <i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:12px;"></i>
            <div>Ma'lumot yuklanmoqda...</div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function renderLeaderboardModal() {
    if (!supabaseClient) {
        // Fallback to local simulation if no Supabase
        const leaderboard = updateLeaderboard();
        return renderLeaderboardHTML(leaderboard);
    }

    return (async () => {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('full_name, username, xp, id')
                .order('xp', { ascending: false })
                .limit(20);

            if (error) throw error;

            const leaderboard = data.map(u => ({
                name: u.full_name || u.username || 'User',
                score: u.xp,
                isUser: u.id === supabaseUserId
            }));
            
            return renderLeaderboardHTML(leaderboard);
        } catch (err) {
            console.error('Leaderboard error', err);
            // Fallback
            return renderLeaderboardHTML(updateLeaderboard());
        }
    })();
}

function renderLeaderboardHTML(leaderboard) {
    return leaderboard.map((p, i) => `
        <div class="leaderboard-row ${p.isUser ? 'user' : ''}" style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-glass);border-radius:12px;margin-bottom:8px;">
            <div style="width:24px;text-align:center;font-weight:700;color:${i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'}">${i + 1}</div>
            <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;text-transform:uppercase;">${p.name.charAt(0)}</div>
            <div style="flex:1;font-weight:500;">${p.name}${p.isUser ? ' (Siz)' : ''}</div>
            <div style="color:var(--accent-gold);font-weight:600;">${formatNumber(p.score)} XP</div>
        </div>
    `).join('');
}

function renderAchievementsModal() {
    const unlocked = state.get('achievements');
    return ACHIEVEMENTS.map(a => {
        const isUnlocked = unlocked.includes(a.id);
        return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-glass);border-radius:12px;margin-bottom:8px;opacity:${isUnlocked ? 1 : 0.5};">
                <div style="width:40px;height:40px;background:${isUnlocked ? 'rgba(255,215,0,0.2)' : 'var(--bg-elevated)'};border-radius:10px;display:flex;align-items:center;justify-content:center;">
                    <i class="fas ${a.icon}" style="color:${isUnlocked ? 'var(--accent-gold)' : 'var(--text-muted)'}"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600;">${a.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${isUnlocked ? 'Ochilgan ✓' : 'Qulflangan'}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderShopModal() {
    // Ensure shop state exists
    const ownedSkins = state.get('ownedSkins') || ['skin_default'];
    const currentSkin = state.get('currentSkin') || 'skin_default';
    
    // Helper to render tabs
    const renderContent = (type) => {
        if (type === 'boosters') {
            return SHOP_ITEMS.boosters.map(item => `
                <div class="upgrade-item" onclick="buyShopItem('${item.id}', 'booster')">
                    <div class="upgrade-icon"><i class="fas ${item.icon}"></i></div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">${item.name}</div>
                        <div class="upgrade-level">${item.desc}</div>
                    </div>
                    <div class="upgrade-cost">
                        <i class="fas fa-coins"></i> ${formatNumber(item.cost)}
                    </div>
                </div>
            `).join('');
        } else {
            return SHOP_ITEMS.skins.map(item => {
                const owned = ownedSkins.includes(item.id);
                const equipped = currentSkin === item.id;
                let btnText = owned ? (equipped ? 'Faol' : 'O\'rnatish') : formatNumber(item.cost);
                let btnIcon = owned ? (equipped ? 'fa-check' : 'fa-exchange-alt') : 'fa-coins';
                let btnClass = owned ? (equipped ? 'active-skin' : 'owned-skin') : '';
                
                return `
                <div class="upgrade-item ${btnClass}" onclick="buyShopItem('${item.id}', 'skin')">
                    <div class="upgrade-icon"><i class="fas ${item.icon}"></i></div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">${item.name}</div>
                        <div class="upgrade-level">${item.desc}</div>
                    </div>
                    <div class="upgrade-cost" style="${owned ? 'color:var(--text-muted);' : ''}">
                        <i class="fas ${btnIcon}"></i> ${btnText}
                    </div>
                </div>
            `}).join('');
        }
    };

    // Tab switching logic embedded in HTML via simple onclick re-render or just render all for simplicity
    // Let's use simple sections
    return `
        <div style="padding:10px;">
            <div style="text-align:center;margin-bottom:16px;">
                <i class="fas fa-store" style="font-size:32px;color:var(--accent-cyan);"></i>
                <h3 style="margin:4px 0;">Do'kon</h3>
                <p style="color:var(--text-muted);font-size:12px;">Coinlaringizni ishlating</p>
            </div>
            
            <h4 style="margin:10px 0;color:var(--accent-gold);">⚡ Kuchaytirgichlar</h4>
            <div class="upgrades-grid" style="margin-bottom:20px;">
                ${renderContent('boosters')}
            </div>
            
            <h4 style="margin:10px 0;color:var(--accent-purple);">🎨 Skinlar</h4>
            <div class="upgrades-grid">
                ${renderContent('skins')}
            </div>
        </div>
    `;
}

function renderReferralModal() {
    const link = getReferralLink(state.get('user').referralCode);
    const referrals = state.get('user').referralsCount || 0;
    return `
        <div style="text-align:center;padding:20px;display:flex;flex-direction:column;gap:16px;">
            <div>
                <i class="fas fa-share-nodes" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px;"></i>
                <h3>Do'stlaringizni taklif qiling</h3>
                <p style="color:var(--text-muted);margin:12px 0;">Har bir do'st uchun ${CONFIG.REFERRAL_REWARD_XP} XP va taklif qiluvchiga bonus gold!</p>
            </div>
            <div style="background:var(--bg-elevated);padding:12px;border-radius:12px;word-break:break-all;font-size:12px;">${link}</div>
            <button onclick="navigator.clipboard.writeText('${link}');showToast('Nusxa olindi','success');" style="padding:12px 24px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">
                <i class="fas fa-copy"></i> Nusxalash
            </button>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-muted);">
                <span>Taklif qilingan do'stlar:</span>
                <span style="font-weight:600;color:var(--accent-cyan);">${referrals}</span>
            </div>
        </div>
    `;
}

function renderNotificationsModal() {
    if (!supabaseClient) {
        return `
            <div style="text-align:center;padding:20px;">
                <i class="fas fa-exclamation-circle" style="font-size:48px;color:var(--accent-red);margin-bottom:16px;"></i>
                <p style="color:var(--text-muted);">Supabase ulanmagan</p>
            </div>
        `;
    }

    return (async () => {
        try {
            const { data, error } = await supabaseClient
                .from('broadcast_messages')
                .select('message_text, created_at')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (!data || !data.length) {
                return `
                    <div style="text-align:center;padding:20px;">
                        <i class="fas fa-bell-slash" style="font-size:48px;color:var(--text-muted);margin-bottom:16px;"></i>
                        <p style="color:var(--text-muted);">Yangi xabarlar yo'q</p>
                    </div>
                `;
            }

            return `
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${data.map(msg => `
                        <div style="padding:12px;background:var(--bg-glass);border-radius:12px;border:1px solid var(--glass-border);">
                            <div style="font-size:13px;color:var(--text-primary);margin-bottom:6px;">${msg.message_text}</div>
                            <div style="font-size:10px;color:var(--text-muted);text-align:right;">
                                ${new Date(msg.created_at).toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            console.error('Notifications error', err);
            return `<div style="padding:20px;text-align:center;color:var(--accent-red);">Xatolik yuz berdi</div>`;
        }
    })();
}

function renderAiTestsModal(container) {
    if (!container) {
        return `<div style="padding:20px;">AI testlar oynasi</div>`;
    }
    if (!supabaseClient || !supabaseUserId) {
        container.innerHTML = `
            <div style="padding:20px;text-align:center;">
                <p style="color:var(--accent-red);">Supabase ulanmagan. CONFIG dagi URL/KEY ni to'ldiring.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = aiTestsModalTemplate();
    const listEl = container.querySelector('#aiTestsList');
    const formEl = container.querySelector('#aiTestForm');
    const statusEl = container.querySelector('#aiTestStatus');

    loadAiTestsList(listEl);
    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        createAiTestFromForm(formEl, listEl, statusEl);
    });
}

function aiTestsModalTemplate() {
    return `
        <div class="ai-tests-modal" style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;flex-direction:column;gap:6px;">
                <h3 style="margin:0;">Mening AI testlarim</h3>
                <p style="color:var(--text-muted);margin:0;font-size:13px;">Yaratilgan testlar ro'yxati va yangi test qo'shish.</p>
            </div>
            <div id="aiTestsList" style="max-height:220px;overflow:auto;border:1px solid var(--glass-border);border-radius:12px;padding:12px;background:var(--bg-glass);">
                ${modalLoadingHtml()}
            </div>
            <form id="aiTestForm" style="display:flex;flex-direction:column;gap:10px;border:1px solid var(--glass-border);border-radius:12px;padding:12px;background:var(--bg-glass);">
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label>Test nomi</label>
                    <input name="title" type="text" required placeholder="Masalan: Matematika asoslari" style="padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);">
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label>Tavsif</label>
                    <textarea name="description" rows="2" placeholder="Qisqa tavsif" style="padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);"></textarea>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:140px;">
                        <label>Kategoriya</label>
                        <select name="category" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);">
                            <option value="general">Umumiy</option>
                            <option value="science">Fan</option>
                            <option value="tech">Texnologiya</option>
                            <option value="history">Tarix</option>
                        </select>
                    </div>
                    <div style="flex:1;min-width:140px;">
                        <label>Qiyinlik</label>
                        <select name="difficulty" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);">
                            <option value="easy">Oson</option>
                            <option value="medium" selected>O'rta</option>
                            <option value="hard">Qiyin</option>
                        </select>
                    </div>
                    <div style="flex:1;min-width:140px;">
                        <label>Savollar soni</label>
                        <input name="question_count" type="number" value="10" min="5" max="50" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);">
                    </div>
                </div>
                <button type="submit" style="padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));color:#fff;font-weight:600;cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> Yangi test qo'shish
                </button>
                <div id="aiTestStatus" style="font-size:12px;color:var(--text-muted);"></div>
            </form>
        </div>
    `;
}

async function loadAiTestsList(target) {
    if (!target) return;
    if (!supabaseClient) {
        target.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);">Supabase ulanmagan (Offline Mode).</div>`;
        return;
    }
    target.innerHTML = modalLoadingHtml();
    try {
        const { data, error } = await supabaseClient
            .from('quizzes')
            .select('id,title,description,category,difficulty,question_count,created_at')
            .eq('creator_id', supabaseUserId)
            .order('created_at', { ascending: false })
            .limit(20);
        if (error) throw error;
        if (!data || !data.length) {
            target.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-muted);">Hozircha AI testlar yaratilmagan.</div>`;
            return;
        }
        target.innerHTML = data.map(q => `
            <div style="padding:12px;margin-bottom:8px;background:var(--bg-elevated);border-radius:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-weight:600;">${q.title}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${new Date(q.created_at).toLocaleString()}</div>
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${q.category} • ${q.difficulty} • ${q.question_count} savol</div>
                ${q.description ? `<div style="font-size:12px;margin-top:6px;">${q.description}</div>` : ''}
                <button class="play-ai-quiz-btn" data-config='${JSON.stringify({category: q.category, difficulty: q.difficulty, questionCount: q.question_count})}' style="margin-top:10px;width:100%;padding:8px;background:var(--accent-cyan);border:none;border-radius:8px;color:#000;font-weight:600;cursor:pointer;">
                    <i class="fas fa-play"></i> Boshlash
                </button>
            </div>
        `).join('');
        
        target.querySelectorAll('.play-ai-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const config = JSON.parse(btn.dataset.config);
                startQuiz(config);
            });
        });
    } catch (err) {
        console.error('loadAiTestsList error', err);
        target.innerHTML = `<div style="padding:12px;color:var(--accent-red);text-align:center;">Xatolik: ${err.message}</div>`;
    }
}

async function createAiTestFromForm(form, listEl, statusEl) {
    if (!supabaseClient) return;
    const formData = new FormData(form);
    const payload = {
        creator_id: supabaseUserId,
        title: formData.get('title')?.toString().trim(),
        description: formData.get('description')?.toString().trim() || null,
        category: formData.get('category') || 'general',
        difficulty: formData.get('difficulty') || 'medium',
        question_count: Number(formData.get('question_count')) || 10,
        is_public: false,
        is_active: true
    };

    if (!payload.title) {
        statusEl.textContent = 'Test nomi talab qilinadi';
        statusEl.style.color = 'var(--accent-red)';
        return;
    }

    statusEl.textContent = 'Saqlanmoqda...';
    statusEl.style.color = 'var(--text-muted)';
    try {
        const { error } = await supabaseClient.from('quizzes').insert(payload);
        if (error) throw error;
        statusEl.textContent = 'Saqlangan ✅';
        statusEl.style.color = 'var(--accent-green)';
        form.reset();
        loadAiTestsList(listEl);
    } catch (err) {
        console.error('createAiTestFromForm error', err);
        statusEl.textContent = `Xatolik: ${err.message}`;
        statusEl.style.color = 'var(--accent-red)';
    }
}

function renderStatisticsModal() {
    if (!supabaseClient || !supabaseUserId) {
        return `<div style="padding:20px;text-align:center;color:var(--text-muted);">Supabase ulanmagan.</div>`;
    }
    return (async () => {
        const [{ data: results, error: resultsError }, { data: quizzes, error: quizzesError }] = await Promise.all([
            supabaseClient
                .from('quiz_results')
                .select('score,total,accuracy,created_at')
                .eq('user_id', supabaseUserId)
                .order('created_at', { ascending: false })
                .limit(100),
            supabaseClient
                .from('quizzes')
                .select('id')
                .eq('creator_id', supabaseUserId)
        ]);

        if (resultsError) {
            console.error('Stats error', resultsError);
            return `<div style="padding:20px;text-align:center;color:var(--accent-red);">Xatolik yuz berdi.</div>`;
        }

        const totalAttempts = results?.length || 0;
        const avgAccuracy = totalAttempts
            ? (results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / totalAttempts).toFixed(1)
            : '0.0';
        const bestScore = results?.reduce((max, r) => Math.max(max, r.score || 0), 0) || 0;
        const totalQuizzes = quizzes?.length || 0;
        const s = state.state;

        // Prepare chart data (last 10 attempts, reversed to show chronological order)
        const chartData = (results || []).slice(0, 10).reverse();
        const maxBarHeight = 100;
        
        const chartHTML = chartData.length ? `
            <div style="margin-top:20px;padding:15px;background:var(--bg-glass);border-radius:12px;border:1px solid var(--glass-border);">
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">So'nggi 10 ta o'yin dinamikasi (Aniqlik %)</div>
                <div style="display:flex;align-items:flex-end;gap:8px;height:${maxBarHeight}px;padding-bottom:5px;border-bottom:1px solid var(--glass-border);">
                    ${chartData.map(r => {
                        const height = Math.max(5, (r.accuracy / 100) * maxBarHeight);
                        const color = r.accuracy >= 80 ? 'var(--accent-green)' : r.accuracy >= 50 ? 'var(--accent-gold)' : 'var(--accent-red)';
                        return `
                            <div style="flex:1;background:${color};height:${height}px;border-radius:4px 4px 0 0;position:relative;transition:height 0.5s ease;">
                                <div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--text-muted);">${r.accuracy}%</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div style="padding:10px;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
                    <div class="dashboard-stat-item">
                        <div class="value">${formatNumber(s.totalTaps)}</div>
                        <div class="label">Jami taplar</div>
                    </div>
                    <div class="dashboard-stat-item">
                        <div class="value">${formatNumber(s.totalGoldEarned)}</div>
                        <div class="label">Jami coin</div>
                    </div>
                    <div class="dashboard-stat-item">
                        <div class="value">${totalQuizzes}</div>
                        <div class="label">Yaratilgan testlar</div>
                    </div>
                    <div class="dashboard-stat-item">
                        <div class="value">${totalAttempts}</div>
                        <div class="label">Quiz urinishlari</div>
                    </div>
                    <div class="dashboard-stat-item">
                        <div class="value">${avgAccuracy}%</div>
                        <div class="label">O'rtacha aniqlik</div>
                    </div>
                    <div class="dashboard-stat-item">
                        <div class="value">${bestScore}</div>
                        <div class="label">Eng yuqori bal</div>
                    </div>
                </div>
                ${chartHTML}
            </div>
        `;
    })();
}

function renderMistakesModal() {
    if (!supabaseClient || !supabaseUserId) {
        return `<div style="padding:20px;text-align:center;color:var(--text-muted);">Supabase ulanmagan.</div>`;
    }
    return (async () => {
        const { data, error } = await supabaseClient
            .from('quiz_results')
            .select('quiz_id,score,total,accuracy,created_at')
            .eq('user_id', supabaseUserId)
            .lt('accuracy', 100) // Only show quizzes with mistakes
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        if (!data || !data.length) {
            return `
                <div style="padding:20px;text-align:center;">
                    <i class="fas fa-check-double" style="font-size:48px;color:var(--accent-green);margin-bottom:16px;"></i>
                    <p style="color:var(--text-muted);">Ajoyib! So'nggi o'yinlarda xatolar yo'q.</p>
                </div>
            `;
        }
        return data.map(res => {
            const acc = res.accuracy ?? (res.total ? Math.round((res.score / res.total) * 100) : 0);
            return `
                <div style="padding:12px;margin-bottom:8px;background:var(--bg-glass);border-radius:12px;border-left: 3px solid var(--accent-red);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:600;">Quiz #${res.quiz_id || 'Autogen'}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${new Date(res.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:14px;font-weight:700;color:var(--accent-red);">${res.total - res.score} xato</div>
                            <div style="font-size:10px;color:var(--text-muted);">${acc}% aniqlik</div>
                        </div>
                    </div>
                    <button onclick="startSrsReview()" style="width:100%;margin-top:10px;padding:8px;background:rgba(239, 68, 68, 0.15);border:1px solid var(--accent-red);border-radius:8px;color:var(--accent-red);font-size:11px;font-weight:600;cursor:pointer;">
                        <i class="fas fa-dumbbell"></i> Qayta ishlash (SRS)
                    </button>
                </div>
            `;
        }).join('');
    })();
}

let currentFlashcards = [];
let flashcardIndex = 0;

async function startSrsReview() {
    // Show loading state
    const overlay = document.getElementById('modalOverlay');
    const body = overlay.querySelector('.modal-body');
    if (body) body.innerHTML = modalLoadingHtml();

    currentFlashcards = [];
    
    // Try to load from Supabase first
    if (supabaseClient && supabaseUserId) {
        try {
            const { data, error } = await supabaseClient
                .from('flashcards')
                .select('*')
                .eq('user_id', supabaseUserId)
                .limit(20);
                
            if (data && data.length > 0) {
                // Map to quiz format
                currentFlashcards = data.map(card => ({
                    q: card.question,
                    a: [card.answer], // Only one answer for flashcards
                    c: 0,
                    id: card.id,
                    isCustom: true
                }));
            }
        } catch (err) {
            console.error('SRS load error', err);
        }
    }

    // If no custom cards, use general questions as fallback
    if (currentFlashcards.length === 0) {
        currentFlashcards = [...QUIZ_QUESTIONS.general, ...QUIZ_QUESTIONS.science, ...QUIZ_QUESTIONS.tech]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
    } else {
        // Shuffle custom cards
        currentFlashcards.sort(() => 0.5 - Math.random());
    }

    flashcardIndex = 0;
    renderFlashcard();
}

function renderFlashcard() {
    const card = currentFlashcards[flashcardIndex];
    if (!card) {
        // End of session
        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <div style="margin-bottom:20px;">
                    <i class="fas fa-check-circle" style="font-size:64px;color:var(--accent-green);"></i>
                </div>
                <h3>Ajoyib!</h3>
                <p style="color:var(--text-muted);margin:10px 0;">Bugungi takrorlash rejasini bajardingiz.</p>
                <div style="font-size:24px;color:var(--accent-gold);margin:15px 0;">+500 XP</div>
                <button id="closeSrsBtn" style="padding:12px 24px;background:var(--accent-cyan);border:none;border-radius:12px;font-weight:600;cursor:pointer;">Yopish</button>
            </div>
        `;
        
        const closeBtn = document.getElementById('closeSrsBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                closeModal();
                state.update({xp: state.get('xp') + 500});
                updateUI();
            };
        }
        return;
    }

    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div style="padding:20px;text-align:center;height:100%;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Flashcard ${flashcardIndex + 1}/${currentFlashcards.length}</div>
            
            <div class="flashcard-container" id="flashcardItem">
                <div class="flashcard-inner">
                    <div class="flashcard-front">${card.q}</div>
                    <div class="flashcard-back">${card.a[card.c]}</div>
                </div>
            </div>
            
            <p style="font-size:11px;color:var(--text-muted);margin-bottom:20px;">Javobni ko'rish uchun kartaga bosing</p>
            
            <div style="display:flex;gap:10px;">
                <button class="flashcard-btn hard" style="flex:1;padding:12px;background:var(--bg-glass);border:1px solid var(--accent-red);color:var(--accent-red);border-radius:12px;font-weight:600;">Qiyin</button>
                <button class="flashcard-btn easy" style="flex:1;padding:12px;background:var(--bg-glass);border:1px solid var(--accent-green);color:var(--accent-green);border-radius:12px;font-weight:600;">Oson</button>
            </div>
        </div>
    `;
    
    // Attach listeners
    const cardEl = document.getElementById('flashcardItem');
    if (cardEl) {
        cardEl.onclick = () => {
            cardEl.classList.toggle('flipped');
            handleButtonClick('Flip Flashcard', cardEl);
        };
    }

    const hardBtn = body.querySelector('.flashcard-btn.hard');
    if (hardBtn) {
        hardBtn.onclick = (e) => {
            handleButtonClick('Flashcard Hard', e.target);
            flashcardIndex++;
            renderFlashcard();
        };
    }

    const easyBtn = body.querySelector('.flashcard-btn.easy');
    if (easyBtn) {
        easyBtn.onclick = (e) => {
            handleButtonClick('Flashcard Easy', e.target);
            flashcardIndex++;
            renderFlashcard();
        };
    }
}


function renderSrsModal(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <i class="fas fa-brain" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px;"></i>
                <h3>SRS Flashcards</h3>
                <p style="color:var(--text-muted);margin-top:8px;margin-bottom:20px;">
                    Intervalli takrorlash tizimi orqali bilimlaringizni mustahkamlang.
                </p>
                <button id="startSrsBtn" style="padding:12px 24px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">
                    <i class="fas fa-play"></i> Takrorlashni boshlash
                </button>
            </div>
            
            <div style="border-top:1px solid var(--glass-border);padding-top:20px;margin-top:20px;">
                <h4 style="margin-bottom:12px;"><i class="fas fa-plus-circle"></i> Yangi Flashcard qo'shish</h4>
                <form id="addFlashcardForm" style="display:flex;flex-direction:column;gap:12px;">
                    <div>
                        <label style="font-size:12px;color:var(--text-muted);margin-bottom:4px;display:block;">Savol (old tomon)</label>
                        <textarea id="flashcardQuestion" rows="2" required placeholder="Masalan: Python nima?" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-glass);color:var(--text-primary);resize:none;"></textarea>
                    </div>
                    <div>
                        <label style="font-size:12px;color:var(--text-muted);margin-bottom:4px;display:block;">Javob (orqa tomon)</label>
                        <textarea id="flashcardAnswer" rows="2" required placeholder="Masalan: Dasturlash tili" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-glass);color:var(--text-primary);resize:none;"></textarea>
                    </div>
                    <div>
                        <label style="font-size:12px;color:var(--text-muted);margin-bottom:4px;display:block;">Kategoriya</label>
                        <select id="flashcardCategory" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-glass);color:var(--text-primary);">
                            <option value="general">Umumiy</option>
                            <option value="science">Fan</option>
                            <option value="tech">Texnologiya</option>
                            <option value="history">Tarix</option>
                            <option value="language">Til</option>
                        </select>
                    </div>
                    <button type="button" id="saveFlashcardBtn" style="padding:12px;background:var(--accent-green);border:none;border-radius:12px;color:#000;font-weight:600;cursor:pointer;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                    <div id="flashcardStatus" style="font-size:12px;text-align:center;"></div>
                </form>
            </div>
            
            <div id="myFlashcardsList" style="border-top:1px solid var(--glass-border);padding-top:20px;margin-top:20px;">
                <h4 style="margin-bottom:12px;"><i class="fas fa-layer-group"></i> Mening kartalarim</h4>
                <div id="flashcardsContainer" style="max-height:200px;overflow-y:auto;">
                    <div style="text-align:center;color:var(--text-muted);padding:12px;">Yuklanmoqda...</div>
                </div>
            </div>
        </div>
    `;

    // Attach Event Listeners
    document.getElementById('startSrsBtn').addEventListener('click', startSrsReview);
    document.getElementById('saveFlashcardBtn').addEventListener('click', saveFlashcard);
}

async function saveFlashcard() {
    const question = document.getElementById('flashcardQuestion')?.value?.trim();
    const answer = document.getElementById('flashcardAnswer')?.value?.trim();
    const category = document.getElementById('flashcardCategory')?.value || 'general';
    const statusEl = document.getElementById('flashcardStatus');
    
    if (!question || !answer) {
        if (statusEl) {
            statusEl.textContent = 'Savol va javobni to\'ldiring!';
            statusEl.style.color = 'var(--accent-red)';
        }
        return;
    }
    
    if (!supabaseClient || !supabaseUserId) {
        if (statusEl) {
            statusEl.textContent = 'Supabase ulanmagan!';
            statusEl.style.color = 'var(--accent-red)';
        }
        return;
    }
    
    if (statusEl) {
        statusEl.textContent = 'Saqlanmoqda...';
        statusEl.style.color = 'var(--text-muted)';
    }
    
    try {
        const { error } = await supabaseClient.from('flashcards').insert({
            user_id: supabaseUserId,
            question: question,
            answer: answer,
            category: category,
            difficulty: 1,
            next_review: new Date().toISOString(),
            repetitions: 0
        });
        
        if (error) throw error;
        
        if (statusEl) {
            statusEl.textContent = 'Saqlandi! ✅';
            statusEl.style.color = 'var(--accent-green)';
        }
        
        // Clear form
        document.getElementById('flashcardQuestion').value = '';
        document.getElementById('flashcardAnswer').value = '';
        
        // Reload flashcards list
        loadMyFlashcards();
        
        // Haptic feedback
        handleButtonClick('Save Flashcard', document.getElementById('addFlashcardForm'));
        
        showToast('Flashcard saqlandi!', 'success');
    } catch (err) {
        console.error('saveFlashcard error', err);
        if (statusEl) {
            statusEl.textContent = `Xatolik: ${err.message}`;
            statusEl.style.color = 'var(--accent-red)';
        }
    }
}

async function loadMyFlashcards() {
    const container = document.getElementById('flashcardsContainer');
    if (!container) return;
    
    if (!supabaseClient || !supabaseUserId) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:12px;">Supabase ulanmagan.</div>';
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('flashcards')
            .select('id,question,answer,category,difficulty,repetitions,created_at')
            .eq('user_id', supabaseUserId)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        
        if (!data || !data.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:12px;">Hozircha kartalar yo\'q. Yangi karta qo\'shing!</div>';
            return;
        }
        
        container.innerHTML = data.map(card => `
            <div style="padding:12px;margin-bottom:8px;background:var(--bg-glass);border-radius:12px;border-left:3px solid var(--accent-cyan);">
                <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${card.question}</div>
                <div style="font-size:12px;color:var(--text-muted);">${card.answer}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                    <span style="font-size:10px;color:var(--text-muted);">${card.category} • ${card.repetitions || 0} takror</span>
                    <button onclick="deleteFlashcard(${card.id})" style="padding:4px 8px;background:rgba(239,68,68,0.15);border:1px solid var(--accent-red);border-radius:6px;color:var(--accent-red);font-size:10px;cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('loadMyFlashcards error', err);
        container.innerHTML = `<div style="text-align:center;color:var(--accent-red);padding:12px;">Xatolik: ${err.message}</div>`;
    }
}

async function deleteFlashcard(id) {
    if (!supabaseClient || !supabaseUserId) return;
    
    if (!confirm('Bu kartani o\'chirmoqchimisiz?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('flashcards')
            .delete()
            .eq('id', id)
            .eq('user_id', supabaseUserId);
        
        if (error) throw error;
        
        loadMyFlashcards();
        showToast('Karta o\'chirildi', 'success');
    } catch (err) {
        console.error('deleteFlashcard error', err);
        showToast('O\'chirishda xatolik', 'error');
    }
}

function renderAdaptiveModal() {
    return `
        <div style="padding:20px;text-align:center;">
            <i class="fas fa-sliders-h" style="font-size:48px;color:var(--accent-purple);margin-bottom:16px;"></i>
            <h3>Adaptiv Test</h3>
            <p style="color:var(--text-muted);margin-top:8px;margin-bottom:20px;">
                Sizning bilim darajangizga moslashuvchi maxsus test rejimi. 
                Savollar osonlikdan qiyinlikka qarab o'zgarib boradi.
            </p>
            <button onclick="startQuiz({difficulty: 'adaptive', category: 'general', questionCount: 15})" style="padding:12px 24px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">
                <i class="fas fa-play"></i> Testni boshlash
            </button>
        </div>
    `;
}

function renderDuelModal() {
    return `
        <div style="padding:20px;text-align:center;">
            <i class="fas fa-swords" style="font-size:48px;color:var(--accent-red);margin-bottom:16px;"></i>
            <h3>Duel Rejimi</h3>
            <p style="color:var(--text-muted);margin-top:8px;margin-bottom:20px;">
                Do'stlaringiz bilan real vaqtda bellashing! 
                G'olib barcha yutuqni oladi.
            </p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button onclick="if(window.Telegram?.WebApp){window.Telegram.WebApp.switchInlineQuery('duel', ['users', 'groups'])}else{window.open('https://t.me/${CONFIG.BOT_USERNAME}', '_blank')}" style="padding:14px;background:linear-gradient(135deg,var(--accent-red),var(--accent-purple));border:none;border-radius:12px;color:white;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <i class="fas fa-fist-raised"></i> Do'stni chorlash
                </button>
                <a href="https://t.me/${CONFIG.BOT_USERNAME}" target="_blank" style="padding:14px;background:var(--bg-elevated);border:1px solid var(--glass-border);border-radius:12px;color:var(--text-primary);text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <i class="fas fa-robot"></i> Bot orqali o'ynash
                </a>
            </div>
        </div>
    `;
}

function renderCertificatesModal() {
    if (!supabaseClient || !supabaseUserId) {
        return `<div style="padding:20px;text-align:center;color:var(--text-muted);">Supabase ulanmagan.</div>`;
    }
    return (async () => {
        const { data, error } = await supabaseClient
            .from('quiz_results')
            .select('*')
            .eq('user_id', supabaseUserId)
            .gte('accuracy', 90)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Certificates error', error);
            return `<div style="padding:20px;text-align:center;color:var(--accent-red);">Xatolik yuz berdi.</div>`;
        }

        if (!data || !data.length) {
            return `
                <div style="padding:20px;text-align:center;">
                    <i class="fas fa-certificate" style="font-size:48px;color:var(--text-muted);margin-bottom:16px;"></i>
                    <p style="color:var(--text-muted);">Sizda hali sertifikatlar yo'q.</p>
                    <p style="font-size:12px;color:var(--text-secondary);margin-top:8px;">Sertifikat olish uchun quizlarda 90% dan yuqori natija ko'rsating!</p>
                </div>
            `;
        }

        return data.map(cert => `
            <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0.5));border:1px solid var(--accent-gold);padding:16px;border-radius:12px;margin-bottom:12px;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-10px;right:-10px;font-size:60px;opacity:0.1;color:var(--accent-gold);transform:rotate(15deg);">
                    <i class="fas fa-certificate"></i>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-weight:700;color:var(--accent-gold);font-size:18px;">SERTIFIKAT</div>
                    <div style="font-size:12px;color:var(--text-muted);">${new Date(cert.created_at).toLocaleDateString()}</div>
                </div>
                <div style="font-size:14px;margin-bottom:4px;">Muvaffaqiyatli yakunlandi</div>
                <div style="font-size:12px;color:var(--text-muted);">Natija: ${cert.score}/${cert.total} (${cert.accuracy}%)</div>
                <div style="margin-top:12px;text-align:right;">
                    <span style="font-family:'Courier New', monospace;font-size:10px;color:var(--text-muted);">ID: ${cert.id.split('-')[0]}</span>
                </div>
            </div>
        `).join('');
    })();
}

function renderHelpModal() {
    return `
        <div style="padding:10px;">
            <div style="margin-bottom:16px;">
                <h4 style="margin-bottom:8px;"><i class="fas fa-gamepad" style="color:var(--accent-cyan);margin-right:8px;"></i>O'yin</h4>
                <p style="font-size:13px;color:var(--text-secondary);">Reaktorga bosib gold yig'ing. Kritik urilishlar 2x gold beradi!</p>
            </div>
            <div style="margin-bottom:16px;">
                <h4 style="margin-bottom:8px;"><i class="fas fa-arrow-up" style="color:var(--accent-cyan);margin-right:8px;"></i>Upgrade</h4>
                <p style="font-size:13px;color:var(--text-secondary);">Gold sarflab kuchingizni oshiring.</p>
            </div>
            <div style="margin-bottom:16px;">
                <h4 style="margin-bottom:8px;"><i class="fas fa-brain" style="color:var(--accent-cyan);margin-right:8px;"></i>Quiz</h4>
                <p style="font-size:13px;color:var(--text-secondary);">Savollarni javoblab XP yig'ing.</p>
            </div>
            <div>
                <h4 style="margin-bottom:8px;"><i class="fas fa-atom" style="color:var(--accent-purple);margin-right:8px;"></i>Prestige</h4>
                <p style="font-size:13px;color:var(--text-secondary);">100K gold yig'ib Dark Matter oling va qaytadan boshlang!</p>
            </div>
        </div>
    `;
}

function renderSupportModal() {
    return `
        <div style="text-align:center;padding:20px;">
            <i class="fas fa-headset" style="font-size:48px;color:var(--accent-cyan);margin-bottom:16px;"></i>
            <h3>Qo'llab-quvvatlash</h3>
            <p style="color:var(--text-muted);margin:12px 0;">Savollaringiz bo'lsa, bog'laning:</p>
            <button onclick="if(window.Telegram?.WebApp){window.Telegram.WebApp.openTelegramLink('https://t.me/${CONFIG.SUPPORT_USERNAME}')}else{window.open('https://t.me/${CONFIG.SUPPORT_USERNAME}', '_blank')}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:linear-gradient(135deg,var(--accent-cyan),var(--accent-purple));border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">
                <i class="fas fa-paper-plane"></i> Yozish
            </button>
        </div>
    `;
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const sectionMap = {
        gamification: 'sectionGamification',
        newFunctions: 'sectionNewFunctions',
        profile: 'sectionProfile',
        premium: 'sectionPremium',
        aiQuiz: 'sectionAiQuiz',
        admin: 'sectionAdmin'
    };
    
    const sectionId = sectionMap[section];
    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    }
    
    haptic('light');
    window.scrollTo(0, 0);
    
    // Auto save on navigation
    state.saveState();
}

// ============================================
// SETTINGS
// ============================================
function openSettings() {
    document.getElementById('settingsOverlay').classList.add('active');
    
    const settings = state.get('settings');
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('hapticToggle').checked = settings.haptic;
    document.getElementById('themeSelect').value = settings.theme;
    
    haptic('light');
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('active');
}

function saveSettings() {
    const settings = {
        sound: document.getElementById('soundToggle').checked,
        haptic: document.getElementById('hapticToggle').checked,
        theme: document.getElementById('themeSelect').value
    };
    state.set('settings', settings);
    showToast('Sozlamalar saqlandi', 'success');
}

// ============================================
// SPOTLIGHT EFFECT
// ============================================
function initSpotlight() {
    const spotlight = document.getElementById('spotlight');
    
    document.addEventListener('mousemove', (e) => {
        spotlight.style.left = `${e.clientX}px`;
        spotlight.style.top = `${e.clientY}px`;
        spotlight.classList.add('active');
    });
    
    document.addEventListener('mouseleave', () => {
        spotlight.classList.remove('active');
    });
}

// ============================================
// STREAK SYSTEM
// ============================================
function checkStreak() {
    const lastActive = state.get('lastActive');
    const today = new Date().toDateString();
    
    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
            state.update({
                streak: state.get('streak') + 1,
                lastActive: today
            });
            showToast(`🔥 ${state.get('streak')} kunlik streak!`, 'success');
        } else if (lastActive) {
            state.update({
                streak: 1,
                lastActive: today
            });
        } else {
            state.update({
                streak: 1,
                lastActive: today
            });
        }
        
        checkAchievements();
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
async function searchUser() {
    const query = document.getElementById('adminSearchInput').value.trim();
    const results = document.getElementById('adminSearchResults');
    
    if (!query) {
        results.innerHTML = '<p style="color:var(--text-muted);text-align:center;">ID yoki username kiriting</p>';
        return;
    }
    if (!supabaseClient) {
        results.innerHTML = '<p style="color:var(--accent-red);text-align:center;">Supabase ulanmagan</p>';
        return;
    }

    results.innerHTML = modalLoadingHtml();
    const isNumeric = /^\d+$/.test(query);
    let request = supabaseClient
        .from('users')
        .select('id, username, full_name, xp, gold, level, subscription_type, premium_expires')
        .limit(20);

    if (isNumeric) {
        request = request.eq('id', Number(query));
    } else {
        request = request.ilike('username', `%${query}%`);
    }

    const { data, error } = await request;
    if (error) {
        console.error('Admin search error', error);
        results.innerHTML = `<p style="color:var(--accent-red);text-align:center;">Xatolik: ${error.message}</p>`;
        return;
    }

    if (!data || !data.length) {
        results.innerHTML = `<p style="color:var(--text-muted);text-align:center;">Mos foydalanuvchi topilmadi.</p>`;
        return;
    }

    const tierLabel = (t) => {
        if (t >= 2) return 'Exclusive';
        if (t >= 1) return 'Premium';
        return 'Free';
    };

    results.innerHTML = data.map(user => `
        <div style="padding:12px;margin-bottom:8px;background:var(--bg-glass);border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
                <div style="font-weight:600;">${user.full_name || 'Noma\'lum'}</div>
                <div style="font-size:12px;color:var(--text-muted);">@${user.username || 'none'} • ID: ${user.id}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">XP: ${formatNumber(user.xp || 0)} • Gold: ${formatNumber(user.gold || 0)}</div>
            </div>
            <div style="text-align:right;font-size:12px;">
                <div style="font-weight:600;">${tierLabel(user.subscription_type)}</div>
                <div>${user.premium_expires ? new Date(user.premium_expires).toLocaleDateString() : '—'}</div>
            </div>
        </div>
    `).join('');
}

async function sendBroadcast() {
    const text = document.getElementById('broadcastText').value.trim();
    if (!text) {
        showToast('Xabar matnini kiriting', 'error');
        return;
    }
    if (!supabaseClient || !supabaseUserId) {
        showToast('Supabase ulanmagan', 'error');
        return;
    }
    try {
        const payload = {
            sent_by: supabaseUserId,
            message_text: text
        };
        const { error } = await supabaseClient.from('broadcast_messages').insert(payload);
        if (error) {
            throw error;
        }
        showToast('Broadcast xabari saqlandi', 'success');
        document.getElementById('broadcastText').value = '';
    } catch (err) {
        console.error('sendBroadcast error', err);
        showToast('Broadcastni saqlashda xatolik', 'error');
    }
}

function exportData() {
    const data = JSON.stringify(state.state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_data.json';
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Ma\'lumotlar yuklandi', 'success');
}

function clearCache() {
    if (confirm('Keshni tozalashni xohlaysizmi?')) {
        localStorage.clear();
        showToast('Kesh tozalandi', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.section));
    });
    
    // Reactor tap
    document.getElementById('reactorCore').addEventListener('click', handleTap);
    document.getElementById('reactorCore').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTap(e.touches[0]);
    });
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('settingsClose').addEventListener('click', closeSettings);
    document.getElementById('settingsOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('settingsOverlay')) closeSettings();
    });
    
    document.getElementById('soundToggle').addEventListener('change', saveSettings);
    document.getElementById('hapticToggle').addEventListener('change', saveSettings);
    document.getElementById('themeSelect').addEventListener('change', saveSettings);
    
    // Modal
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.modal));
    });
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
    
    // Prestige
    document.getElementById('prestigeBtn').addEventListener('click', doPrestige);
    
    // Quiz
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });
    
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('quizCloseBtn').addEventListener('click', closeQuiz);
    document.getElementById('resultsRetryBtn').addEventListener('click', () => {
        document.getElementById('quizResults').style.display = 'none';
        startQuiz();
    });
    document.getElementById('resultsBackBtn').addEventListener('click', closeQuiz);
    
    // Premium
    document.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.dataset.plan;
            const days = parseInt(btn.dataset.days, 10);
            const amount = parseInt(btn.dataset.amount, 10);
            buyPremiumPlan(plan, days, amount);
        });
    });
    
    document.getElementById('exchangeBtn').addEventListener('click', () => {
        exchangeXpForPremium();
    });
    document.getElementById('goldExchangeBtn').addEventListener('click', () => {
        exchangeGoldForPremium();
    });
    
    // Admin
    document.getElementById('adminSearchBtn')?.addEventListener('click', searchUser);
    document.getElementById('broadcastBtn')?.addEventListener('click', sendBroadcast);
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('clearCacheBtn')?.addEventListener('click', clearCache);
    
    // New Functions
    const functionActions = {
        'ai-test': () => openModal('aiTests'),
        'my-tests': () => openModal('aiTests'),
        'statistics': () => openModal('statistics'),
        'mistakes': () => openModal('mistakes'),
        'srs': () => openModal('srs'),
        'adaptive': () => openModal('adaptive'),
        'duel': () => openModal('duel'),
        'certificates': () => openModal('certificates'),
        'quick-quiz': () => startQuiz({ category: 'mixed', difficulty: 'easy', questionCount: 15 }),
        'rpg': () => openModal('rpg')
    };

    document.querySelectorAll('.function-card').forEach(card => {
        card.addEventListener('click', () => {
            const func = card.dataset.func;
            if (functionActions[func]) {
                functionActions[func]();
            } else {
                showToast('Funksiya tez kunda!', 'info');
            }
            haptic('light');
        });
    });
}

// ============================================
// MYSTERY DROP SYSTEM (GACHA)
// ============================================
class MysteryDropSystem {
    constructor() {
        this.container = document.getElementById('mysteryDropContainer');
        this.active = false;
        this.timer = null;
        this.scheduleNext();
    }

    scheduleNext() {
        // Random time between 60s and 120s
        const delay = (60 + Math.random() * 60) * 1000;
        this.timer = setTimeout(() => this.spawn(), delay);
    }

    spawn() {
        if (this.active) return;
        this.active = true;

        const drop = document.createElement('div');
        drop.className = 'mystery-drop';
        drop.innerHTML = '<i class="fas fa-cube"></i>';
        
        // Random position
        const x = Math.random() * (window.innerWidth - 60);
        const y = Math.random() * (window.innerHeight - 60);
        drop.style.left = `${x}px`;
        drop.style.top = `${y}px`;

        drop.addEventListener('click', () => this.collect(drop));
        
        this.container.appendChild(drop);

        // Disappear after 15 seconds if not clicked
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
        
        // Rewards logic
        const roll = Math.random();
        let rewardType, amount, message;

        if (roll < 0.6) {
            // Common: Gold
            amount = Math.floor(1000 + Math.random() * 2000);
            state.update({ gameCoins: state.get('gameCoins') + amount });
            rewardType = 'coin';
            message = `+${amount} Coin`;
        } else if (roll < 0.9) {
            // Rare: XP
            amount = Math.floor(500 + Math.random() * 500);
            state.update({ xp: state.get('xp') + amount });
            rewardType = 'xp';
            message = `+${amount} XP`;
        } else {
            // Legendary: Energy Refill
            state.update({ energy: state.get('maxEnergy') });
            rewardType = 'energy';
            message = 'To\'liq Energiya!';
        }

        showToast(`📦 Cosmic Crate: ${message}`, 'success');
        haptic('heavy');
        audio.play('achievement');
        
        // Particles
        const rect = drop.getBoundingClientRect();
        if (particles) {
            particles.emit(rect.left + 30, rect.top + 30, 30, '#00fff7');
        }

        updateUI();
        this.scheduleNext();
    }
}

// ============================================
// CURSOR TRAIL EFFECT
// ============================================
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

// ============================================
// RPG SYSTEM (Basic Shell)
// ============================================
function renderRpgModal() {
    // Placeholder stats for now
    const stats = {
        str: 10 + Math.floor(state.get('level') * 1.5),
        agi: 8 + Math.floor(state.get('level') * 1.2),
        int: 12 + Math.floor(state.get('level') * 1.8),
        hp: 100 + state.get('level') * 20
    };

    return `
        <div style="padding:10px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="width:80px;height:80px;margin:0 auto 10px;background:linear-gradient(135deg,var(--accent-purple),var(--accent-cyan));border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;">
                    <i class="fas fa-user-astronaut"></i>
                </div>
                <h3 style="margin:0;">${state.get('user').name}</h3>
                <p style="color:var(--text-muted);font-size:12px;">Level ${state.get('level')} Space Ranger</p>
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

// ============================================
// VISUAL EFFECTS (Magnetic & Parallax)
// ============================================
class MagneticButtons {
    constructor() {
        this.buttons = document.querySelectorAll('button, .nav-item, .function-card, .upgrade-item');
        this.init();
    }

    init() {
        if ('ontouchstart' in window) return; // Disable on touch devices

        this.buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
                // Add transition temporarily for smooth reset
                btn.style.transition = 'transform 0.3s ease-out';
                setTimeout(() => {
                    btn.style.transition = '';
                }, 300);
            });
        });
    }
}

class ParallaxEffect {
    constructor() {
        this.cards = document.querySelectorAll('.mining-card, .profile-header, .premium-status-card');
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
        
        // Reset on leave
        document.addEventListener('mouseleave', () => {
            this.cards.forEach(card => {
                card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
                card.style.transition = 'transform 0.5s ease-out';
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('Nexus Ultimate WebApp initializing...');
    
    // Init Telegram
    initTelegram();
    
    // Apply upgrade effects
    applyUpgradeEffects();
    
    // Generate daily challenges
    generateDailyChallenges();
    
    // Check streak
    checkStreak();
    
    // Init canvas effects
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
        particles = new ParticleSystem(particleCanvas);
        particles.update();
    }
    
    const meshCanvas = document.getElementById('meshGradient');
    if (meshCanvas) {
        meshGradient = new MeshGradient(meshCanvas);
        meshGradient.animate();
    }
    
    // Init spotlight
    initSpotlight();
    
    // Init mystery drops
    new MysteryDropSystem();
    
    // Init Visual Effects (High-End)
    initVisualEffects();
    
    // Init cursor trail (only on desktop/large screens typically, but works on webapp too)
    if (!('ontouchstart' in window) || window.innerWidth > 768) {
        new CursorTrail();
        new MagneticButtons();
        new ParallaxEffect();
    }
    
    // Render all
    renderAll();
    
    // Init event listeners
    initEventListeners();
    
    // Start intervals
    setInterval(regenerateEnergy, CONFIG.ENERGY_REGEN_INTERVAL);
    setInterval(autoTap, 1000);
    setInterval(updateActiveEffects, 1000);
    setInterval(() => state.saveState(), CONFIG.AUTO_SAVE_INTERVAL);
    setInterval(() => {
        renderUpgrades();
        renderPodium();
    }, 5000);
    
    // Check maintenance mode
    checkMaintenanceMode();
    
    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.add('visible');
    }, 1500);
    
    console.log('Nexus Ultimate WebApp initialized!');
}

function checkMaintenanceMode() {
    const isMaintenance = localStorage.getItem('nexus_maintenance') === 'true';
    const toggle = document.getElementById('maintenanceToggle');
    
    if (toggle) {
        toggle.checked = isMaintenance;
        toggle.addEventListener('change', (e) => {
            localStorage.setItem('nexus_maintenance', e.target.checked);
            if (e.target.checked) {
                showToast('Texnik xizmat rejimi yoqildi', 'warning');
            } else {
                showToast('Texnik xizmat rejimi o\'chirildi', 'success');
            }
        });
    }

    if (isMaintenance && !state.get('user').isAdmin) {
        document.body.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#050505;color:white;text-align:center;padding:20px;">
                <i class="fas fa-tools" style="font-size:64px;color:#ffd700;margin-bottom:20px;"></i>
                <h1 style="margin-bottom:10px;font-family:'Outfit',sans-serif;">Texnik Xizmat</h1>
                <p style="color:rgba(255,255,255,0.6);">Tizimda profilaktika ishlari olib borilmoqda.<br>Tez orada qaytamiz!</p>
            </div>
        `;
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
