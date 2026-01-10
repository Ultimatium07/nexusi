// ==================== CONFIGURATION ====================
const ADMIN_IDS = [1087968824, 5765169612];
const BOT_USERNAME = 'nexus_media_bot';

// ==================== TELEGRAM WEBAPP ====================
const tg = window.Telegram?.WebApp;
let currentUser = null;

// ==================== USER DATA ====================
let userData = {
    id: 0, name: 'Foydalanuvchi', username: '', xp: 0, gold: 0, level: 1,
    streak: 0, referrals: 0, referralCode: '', isPremium: false, premiumExpiry: null,
    energy: 100, maxEnergy: 100, clickPower: 1, autoTap: false, autoTapLevel: 0,
    lastDailyBonus: null, achievements: [], challenges: {}, history: [], favorites: [],
    settings: { notifications: true, language: 'uz' },
    miningClicks: 0, totalGoldEarned: 0,
    createdAt: new Date().toISOString(), lastActive: new Date().toISOString()
};

// ==================== ACHIEVEMENTS ====================
const ACHIEVEMENTS = [
    { id: 'first_click', name: 'Birinchi Bosish', icon: '👆', condition: u => u.totalGoldEarned >= 1 },
    { id: 'gold_100', name: '100 Gold', icon: '🪙', condition: u => u.totalGoldEarned >= 100 },
    { id: 'gold_1000', name: '1K Gold', icon: '💰', condition: u => u.totalGoldEarned >= 1000 },
    { id: 'gold_10000', name: '10K Gold', icon: '🏆', condition: u => u.totalGoldEarned >= 10000 },
    { id: 'level_5', name: 'Level 5', icon: '⭐', condition: u => u.level >= 5 },
    { id: 'level_10', name: 'Level 10', icon: '🌟', condition: u => u.level >= 10 },
    { id: 'streak_7', name: '7 Kun Streak', icon: '🔥', condition: u => u.streak >= 7 },
    { id: 'streak_30', name: '30 Kun Streak', icon: '💪', condition: u => u.streak >= 30 },
    { id: 'referral_1', name: '1 Referral', icon: '👥', condition: u => u.referrals >= 1 },
    { id: 'referral_10', name: '10 Referral', icon: '🎉', condition: u => u.referrals >= 10 },
    { id: 'premium', name: 'Premium', icon: '💎', condition: u => u.isPremium },
    { id: 'auto_tap', name: 'Auto Tap', icon: '🤖', condition: u => u.autoTap }
];

// ==================== DAILY CHALLENGES ====================
const DAILY_CHALLENGES = [
    { id: 'mine_100', name: '100 marta mining', target: 100, reward: 50, type: 'mining' },
    { id: 'mine_500', name: '500 marta mining', target: 500, reward: 200, type: 'mining' },
    { id: 'earn_500', name: '500 gold ishlash', target: 500, reward: 100, type: 'gold' },
    { id: 'login', name: 'Kunlik kirish', target: 1, reward: 25, type: 'login' }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
            currentUser = tg.initDataUnsafe.user;
            userData.id = currentUser.id;
            userData.name = currentUser.first_name + (currentUser.last_name ? ' ' + currentUser.last_name : '');
            userData.username = currentUser.username || '';
        }
    }
    loadUserData();
    checkAdminAccess();
    renderAllTabs();
    updateUI();
    startEnergyRegen();
    if (userData.autoTap) startAutoTap();
    checkUrlParams();
    setupTabListeners();
    
    // Mark login challenge
    if (!userData.challenges.login) {
        userData.challenges.login = { progress: 1, completed: false };
        saveUserData();
    }
}

// ==================== DATA PERSISTENCE ====================
function loadUserData() {
    const saved = localStorage.getItem('nexus_user_data');
    if (saved) userData = { ...userData, ...JSON.parse(saved) };
    if (!userData.referralCode) userData.referralCode = generateReferralCode();
    const today = new Date().toDateString();
    if (userData.lastChallengeReset !== today) {
        userData.challenges = {};
        userData.lastChallengeReset = today;
    }
    saveUserData();
}

function saveUserData() {
    userData.lastActive = new Date().toISOString();
    localStorage.setItem('nexus_user_data', JSON.stringify(userData));
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'NX';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

// ==================== RENDER TABS ====================
function renderAllTabs() {
    renderHomeTab();
    renderEducationTab();
    renderGameTab();
    renderPremiumTab();
    renderAdminTab();
}

function renderHomeTab() {
    document.getElementById('homeContent').innerHTML = `
        <div class="card">
            <div class="card-title">👤 Profil</div>
            <div class="list-item" onclick="showModal('Statistika', getStatsHTML())">
                <div class="list-item-icon">📊</div>
                <div class="list-item-content"><div class="list-item-title">Statistika</div><div class="list-item-subtitle">Faoliyat va yutuqlar</div></div>
                <div class="list-item-arrow">›</div>
            </div>
            <div class="list-item" onclick="showModal('Sozlamalar', getSettingsHTML())">
                <div class="list-item-icon">⚙️</div>
                <div class="list-item-content"><div class="list-item-title">Sozlamalar</div><div class="list-item-subtitle">Til, bildirishnomalar</div></div>
                <div class="list-item-arrow">›</div>
            </div>
            <div class="list-item" onclick="showModal('Tarix', getHistoryHTML())">
                <div class="list-item-icon">📜</div>
                <div class="list-item-content"><div class="list-item-title">Tarix</div><div class="list-item-subtitle">So'rovlar tarixi</div></div>
                <div class="list-item-arrow">›</div>
            </div>
            <div class="list-item" onclick="showModal('Sevimlilar', getFavoritesHTML())">
                <div class="list-item-icon">⭐</div>
                <div class="list-item-content"><div class="list-item-title">Sevimlilar</div><div class="list-item-subtitle">Saqlangan kontentlar</div></div>
                <div class="list-item-arrow">›</div>
            </div>
        </div>
        <div class="card">
            <div class="card-title">🎁 Kunlik Bonus</div>
            <div class="streak-display" id="streakDisplay"></div>
            <button class="btn btn-gold" id="dailyBonusBtn" onclick="claimDailyBonus()">🎁 Kunlik bonusni olish</button>
        </div>
        <div class="card">
            <div class="card-title">👥 Referral Tizimi</div>
            <p style="color:var(--text-secondary);margin-bottom:10px;font-size:14px;">Do'stlaringizni taklif qiling va bonus oling!</p>
            <div class="referral-code" id="referralCode">${userData.referralCode}</div>
            <button class="btn btn-primary" onclick="shareReferral()">📤 Ulashish</button>
        </div>
        <div class="card">
            <div class="card-title">🔔 Bildirishnomalar</div>
            <div id="notificationsList">
                <div class="list-item"><div class="list-item-icon" style="background:var(--success);">✓</div>
                <div class="list-item-content"><div class="list-item-title">Xush kelibsiz!</div><div class="list-item-subtitle">WebApp'ga muvaffaqiyatli kirdingiz</div></div></div>
            </div>
        </div>`;
    initStreakDisplay();
    checkDailyBonusStatus();
}

function renderEducationTab() {
    document.getElementById('educationContent').innerHTML = `
        <div class="card">
            <div class="card-title">📚 Ta'lim Resurslari</div>
            <div class="list-item" onclick="openAIQuiz()"><div class="list-item-icon" style="background:var(--info);">🧠</div><div class="list-item-content"><div class="list-item-title">AI Quiz</div><div class="list-item-subtitle">Bilimingizni sinab ko'ring</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openCourses()"><div class="list-item-icon" style="background:var(--success);">📖</div><div class="list-item-content"><div class="list-item-title">Kurslar</div><div class="list-item-subtitle">Bepul va pullik kurslar</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openPodcasts()"><div class="list-item-icon" style="background:var(--warning);">🎙️</div><div class="list-item-content"><div class="list-item-title">Podcastlar</div><div class="list-item-subtitle">Audio kontentlar</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openFlashcards()"><div class="list-item-icon" style="background:var(--accent);">🃏</div><div class="list-item-content"><div class="list-item-title">Flashcards</div><div class="list-item-subtitle">Kartochkalar bilan o'rganish</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openBooks()"><div class="list-item-icon" style="background:#8b4513;">📚</div><div class="list-item-content"><div class="list-item-title">Kitoblar</div><div class="list-item-subtitle">Elektron kutubxona</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openMovies()"><div class="list-item-icon" style="background:#e50914;">🎬</div><div class="list-item-content"><div class="list-item-title">Filmlar</div><div class="list-item-subtitle">Ta'limiy filmlar</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openMindmap()"><div class="list-item-icon" style="background:var(--premium);">🗺️</div><div class="list-item-content"><div class="list-item-title">Mindmap</div><div class="list-item-subtitle">Fikrlar xaritasi</div></div><div class="list-item-arrow">›</div></div>
            <div class="list-item" onclick="openAIMentor()"><div class="list-item-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);">🤖</div><div class="list-item-content"><div class="list-item-title">AI Mentor</div><div class="list-item-subtitle">Shaxsiy AI yordamchi</div></div><div class="list-item-arrow">›</div></div>
        </div>
        <div class="card">
            <div class="card-title">💬 AI Chat</div>
            <div id="aiChatMessages" style="max-height:200px;overflow-y:auto;margin-bottom:15px;">
                <div style="padding:10px;background:var(--bg-secondary);border-radius:10px;margin-bottom:10px;"><strong>AI:</strong> Salom! Men sizga yordam berishga tayyorman.</div>
            </div>
            <div style="display:flex;gap:10px;">
                <input type="text" class="input" id="aiChatInput" placeholder="Savolingizni yozing..." style="flex:1;">
                <button class="btn btn-primary" style="width:auto;padding:12px 20px;" onclick="sendAIMessage()">📤</button>
            </div>
        </div>`;
}

function renderGameTab() {
    document.getElementById('gameContent').innerHTML = `
        <div class="card">
            <div class="card-title">⛏️ Mining Clicker</div>
            <div class="mining-area">
                <div style="font-size:14px;color:var(--text-secondary);margin-bottom:10px;">Har bir bosishda: <span id="clickPower" style="color:var(--gold);">+${userData.clickPower}</span> gold</div>
                <div class="mining-coin" id="miningCoin" onclick="mineGold(event)">💰</div>
                <div class="energy-bar"><div class="energy-fill" id="energyFill" style="width:${(userData.energy/userData.maxEnergy)*100}%;"></div><div class="energy-text"><span id="currentEnergy">${userData.energy}</span>/<span id="maxEnergy">${userData.maxEnergy}</span> ⚡</div></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px;">
                    <button class="btn btn-secondary" onclick="upgradeClickPower()">⬆️ Kuch (<span id="upgradeCost">${getUpgradeCost()}</span>🪙)</button>
                    <button class="btn btn-secondary" onclick="upgradeEnergy()">🔋 Energiya (<span id="energyUpgradeCost">${getEnergyUpgradeCost()}</span>🪙)</button>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-title">🤖 Auto Tap</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <div><div style="font-weight:bold;">Avtomatik mining</div><div style="font-size:12px;color:var(--text-secondary);">Har 5 sekundda +<span id="autoTapAmount">${userData.autoTap ? userData.clickPower : 0}</span> gold</div></div>
                <div id="autoTapStatus" style="color:${userData.autoTap ? 'var(--success)' : 'var(--text-secondary)'};">${userData.autoTap ? '✅ Faol' : "O'chirilgan"}</div>
            </div>
            <button class="btn btn-gold" onclick="buyAutoTap()" id="autoTapBtn" ${userData.autoTap ? 'disabled' : ''}>🤖 ${userData.autoTap ? 'Auto Tap faol' : 'Auto Tap sotib olish (500🪙)'}</button>
        </div>
        <div class="card"><div class="card-title">🏆 Yutuqlar</div><div class="achievement-grid" id="achievementsGrid"></div></div>
        <div class="card"><div class="card-title">📋 Kunlik Vazifalar</div><div id="challengesList"></div></div>
        <div class="card"><div class="card-title">🏅 Liderlar Jadvali</div><div id="leaderboardList"></div><button class="btn btn-secondary" style="margin-top:15px;" onclick="refreshLeaderboard()">🔄 Yangilash</button></div>`;
    renderAchievements();
    renderChallenges();
    renderLeaderboard();
}

function renderPremiumTab() {
    document.getElementById('premiumContent').innerHTML = `
        <div class="card" style="background:linear-gradient(135deg,rgba(155,89,182,0.2),rgba(142,68,173,0.2));border:1px solid var(--premium);">
            <div class="card-title" style="color:var(--premium);">💎 Premium Obuna</div>
            <p style="color:var(--text-secondary);margin-bottom:20px;">Premium obuna bilan barcha imkoniyatlardan foydalaning!</p>
            <div class="premium-feature"><span class="premium-feature-icon">♾️</span><span>Cheksiz AI so'rovlar</span></div>
            <div class="premium-feature"><span class="premium-feature-icon">⚡</span><span>2x XP va Gold</span></div>
            <div class="premium-feature"><span class="premium-feature-icon">🎨</span><span>Maxsus temalar</span></div>
            <div class="premium-feature"><span class="premium-feature-icon">🚀</span><span>Tezkor javoblar</span></div>
            <div class="premium-feature"><span class="premium-feature-icon">📊</span><span>Kengaytirilgan statistika</span></div>
            <div class="premium-feature"><span class="premium-feature-icon">🎁</span><span>Eksklyuziv bonuslar</span></div>
            <div style="margin-top:20px;">
                <button class="btn btn-premium" onclick="buyPremium('monthly')" style="margin-bottom:10px;">💎 Oylik - 29,000 so'm</button>
                <button class="btn btn-premium" onclick="buyPremium('yearly')">👑 Yillik - 249,000 so'm (30% chegirma)</button>
            </div>
        </div>
        <div class="card">
            <div class="card-title">💱 XP Almashtirish</div>
            <p style="color:var(--text-secondary);margin-bottom:15px;font-size:14px;">XP larni Gold ga almashtiring (1000 XP = 100 Gold)</p>
            <div class="input-group"><label class="input-label">XP miqdori</label><input type="number" class="input" id="xpExchangeAmount" placeholder="1000" min="1000" step="1000"></div>
            <button class="btn btn-gold" onclick="exchangeXP()">💱 Almashtirish</button>
        </div>
        <div class="card" id="premiumStatusCard"><div class="card-title">📊 Obuna Holati</div><div id="premiumStatus">${userData.isPremium ? '<p style="color:var(--success);">✅ Premium obunangiz faol</p>' : '<p style="color:var(--text-secondary);">Hozirda premium obunangiz yo\'q</p>'}</div></div>`;
}

function renderAdminTab() {
    document.getElementById('adminContent').innerHTML = `
        <div class="admin-section">
            <div class="admin-title">👑 Admin Panel</div>
            <div style="margin-bottom:20px;"><h4 style="margin-bottom:10px;">📊 Tizim Statistikasi</h4>
                <div class="admin-stat"><span>Jami foydalanuvchilar:</span><span id="adminTotalUsers">1,234</span></div>
                <div class="admin-stat"><span>Premium foydalanuvchilar:</span><span id="adminPremiumUsers">89</span></div>
                <div class="admin-stat"><span>Bugungi faol:</span><span id="adminActiveToday">456</span></div>
                <div class="admin-stat"><span>Jami so'rovlar:</span><span id="adminTotalRequests">12,567</span></div>
            </div>
        </div>
        <div class="admin-section">
            <div class="admin-title">🔍 Foydalanuvchi Qidirish</div>
            <div class="input-group"><input type="text" class="input" id="adminUserSearch" placeholder="User ID yoki username..."></div>
            <button class="btn btn-primary" onclick="searchUser()">🔍 Qidirish</button>
            <div id="adminSearchResult" style="margin-top:15px;"></div>
        </div>
        <div class="admin-section">
            <div class="admin-title">👤 Foydalanuvchi Boshqaruvi</div>
            <div class="input-group"><label class="input-label">User ID</label><input type="number" class="input" id="adminTargetUserId" placeholder="User ID kiriting"></div>
            <div class="input-group"><label class="input-label">Miqdor</label><input type="number" class="input" id="adminAmount" placeholder="Miqdor kiriting" value="100"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                <button class="btn btn-secondary" onclick="adminAddXP()">⚡ XP qo'shish</button>
                <button class="btn btn-secondary" onclick="adminAddGold()">🪙 Gold qo'shish</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button class="btn btn-premium" onclick="adminGrantPremium()">💎 Premium berish</button>
                <button class="btn btn-primary" style="background:#e74c3c;" onclick="adminBanUser()">🚫 Ban qilish</button>
            </div>
        </div>
        <div class="admin-section">
            <div class="admin-title">📢 Broadcast Xabar</div>
            <div class="input-group"><label class="input-label">Xabar matni</label><textarea class="input" id="adminBroadcastText" rows="3" placeholder="Barcha foydalanuvchilarga xabar..."></textarea></div>
            <button class="btn btn-primary" onclick="sendBroadcast()">📤 Yuborish</button>
        </div>
        <div class="admin-section">
            <div class="admin-title">💾 Ma'lumotlar</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <button class="btn btn-secondary" onclick="exportData()">📥 Export</button>
                <button class="btn btn-secondary" onclick="importData()">📤 Import</button>
            </div>
        </div>`;
}

// ==================== UI UPDATES ====================
function updateUI() {
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('userAvatar').textContent = userData.isPremium ? '👑' : '👤';
    document.getElementById('userXP').textContent = formatNumber(userData.xp);
    document.getElementById('userGold').textContent = formatNumber(userData.gold);
    document.getElementById('userStreak').textContent = userData.streak;
    document.getElementById('userReferrals').textContent = userData.referrals;
    document.getElementById('premiumBadge').style.display = userData.isPremium ? 'inline-flex' : 'none';
    checkAchievements();
    checkLevelUp();
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ==================== TAB NAVIGATION ====================
function setupTabListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabName + 'Content')?.classList.add('active');
    hapticFeedback('light');
}

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) switchTab(tab);
}

// ==================== ADMIN ====================
function checkAdminAccess() {
    const isAdmin = ADMIN_IDS.includes(userData.id);
    document.getElementById('adminTab').style.display = isAdmin ? 'flex' : 'none';
}

function searchUser() {
    const query = document.getElementById('adminUserSearch').value;
    if (!query) return showToast('ID yoki username kiriting');
    document.getElementById('adminSearchResult').innerHTML = `<div class="list-item"><div class="list-item-content"><div class="list-item-title">User: ${query}</div><div class="list-item-subtitle">XP: 1500 | Gold: 2300 | Level: 5</div></div></div>`;
    showToast('Foydalanuvchi topildi');
}

function adminAddXP() {
    const userId = document.getElementById('adminTargetUserId').value;
    const amount = document.getElementById('adminAmount').value || 100;
    if (!userId) return showToast('User ID kiriting');
    sendBotCommand({ action: 'admin_add_xp', user_id: userId, amount: amount });
    showToast(`${amount} XP qo'shildi`);
}

function adminAddGold() {
    const userId = document.getElementById('adminTargetUserId').value;
    const amount = document.getElementById('adminAmount').value || 100;
    if (!userId) return showToast('User ID kiriting');
    sendBotCommand({ action: 'admin_add_gold', user_id: userId, amount: amount });
    showToast(`${amount} Gold qo'shildi`);
}

function adminGrantPremium() {
    const userId = document.getElementById('adminTargetUserId').value;
    if (!userId) return showToast('User ID kiriting');
    sendBotCommand({ action: 'admin_grant_premium', user_id: userId });
    showToast('Premium berildi');
}

function adminBanUser() {
    const userId = document.getElementById('adminTargetUserId').value;
    if (!userId) return showToast('User ID kiriting');
    if (confirm('Rostdan ham ban qilmoqchimisiz?')) {
        sendBotCommand({ action: 'admin_ban_user', user_id: userId });
        showToast('Foydalanuvchi ban qilindi');
    }
}

function sendBroadcast() {
    const text = document.getElementById('adminBroadcastText').value;
    if (!text) return showToast('Xabar matnini kiriting');
    if (confirm('Barcha foydalanuvchilarga yuborilsinmi?')) {
        sendBotCommand({ action: 'admin_broadcast', message: text });
        showToast('Xabar yuborildi');
        document.getElementById('adminBroadcastText').value = '';
    }
}

function exportData() {
    const data = JSON.stringify(userData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nexus_backup.json'; a.click();
    showToast('Ma\'lumotlar eksport qilindi');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                userData = { ...userData, ...data };
                saveUserData();
                updateUI();
                showToast('Ma\'lumotlar import qilindi');
            } catch { showToast('Xatolik yuz berdi'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== MINING ====================
function mineGold(event) {
    if (userData.energy <= 0) return showToast('Energiya tugadi! ⚡');
    const multiplier = userData.isPremium ? 2 : 1;
    const earned = userData.clickPower * multiplier;
    const isCritical = Math.random() < 0.1;
    const finalEarned = isCritical ? earned * 2 : earned;
    
    userData.gold += finalEarned;
    userData.totalGoldEarned += finalEarned;
    userData.energy--;
    userData.miningClicks++;
    userData.xp += Math.ceil(finalEarned / 10);
    
    // Update challenges
    if (!userData.challenges.mine_100) userData.challenges.mine_100 = { progress: 0, completed: false };
    if (!userData.challenges.mine_500) userData.challenges.mine_500 = { progress: 0, completed: false };
    if (!userData.challenges.earn_500) userData.challenges.earn_500 = { progress: 0, completed: false };
    userData.challenges.mine_100.progress++;
    userData.challenges.mine_500.progress++;
    userData.challenges.earn_500.progress += finalEarned;
    
    saveUserData();
    updateMiningUI();
    showClickEffect(event, finalEarned, isCritical);
    hapticFeedback(isCritical ? 'heavy' : 'light');
    checkChallenges();
}

function updateMiningUI() {
    document.getElementById('userGold').textContent = formatNumber(userData.gold);
    document.getElementById('userXP').textContent = formatNumber(userData.xp);
    document.getElementById('currentEnergy').textContent = userData.energy;
    document.getElementById('energyFill').style.width = (userData.energy / userData.maxEnergy * 100) + '%';
}

function showClickEffect(event, amount, isCritical) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = (isCritical ? '💥 ' : '+') + amount;
    effect.style.left = event.clientX + 'px';
    effect.style.top = event.clientY + 'px';
    if (isCritical) effect.style.color = '#ff0000';
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function getUpgradeCost() { return Math.floor(100 * Math.pow(1.5, userData.clickPower - 1)); }
function getEnergyUpgradeCost() { return Math.floor(150 * Math.pow(1.3, (userData.maxEnergy - 100) / 50)); }

function upgradeClickPower() {
    const cost = getUpgradeCost();
    if (userData.gold < cost) return showToast('Gold yetarli emas!');
    userData.gold -= cost;
    userData.clickPower++;
    saveUserData();
    renderGameTab();
    updateUI();
    showToast(`Kuch ${userData.clickPower} ga oshdi! ⬆️`);
}

function upgradeEnergy() {
    const cost = getEnergyUpgradeCost();
    if (userData.gold < cost) return showToast('Gold yetarli emas!');
    userData.gold -= cost;
    userData.maxEnergy += 50;
    userData.energy = userData.maxEnergy;
    saveUserData();
    renderGameTab();
    updateUI();
    showToast(`Energiya ${userData.maxEnergy} ga oshdi! 🔋`);
}

function buyAutoTap() {
    if (userData.autoTap) return;
    if (userData.gold < 500) return showToast('500 Gold kerak!');
    userData.gold -= 500;
    userData.autoTap = true;
    saveUserData();
    startAutoTap();
    renderGameTab();
    updateUI();
    showToast('Auto Tap faollashtirildi! 🤖');
}

function startAutoTap() {
    setInterval(() => {
        if (userData.autoTap && userData.energy > 0) {
            userData.gold += userData.clickPower;
            userData.totalGoldEarned += userData.clickPower;
            userData.energy--;
            saveUserData();
            updateMiningUI();
        }
    }, 5000);
}

function startEnergyRegen() {
    setInterval(() => {
        if (userData.energy < userData.maxEnergy) {
            userData.energy = Math.min(userData.energy + 1, userData.maxEnergy);
            saveUserData();
            if (document.getElementById('currentEnergy')) {
                document.getElementById('currentEnergy').textContent = userData.energy;
                document.getElementById('energyFill').style.width = (userData.energy / userData.maxEnergy * 100) + '%';
            }
        }
    }, 3000);
}

// ==================== ACHIEVEMENTS ====================
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = userData.achievements.includes(a.id);
        return `<div class="achievement ${unlocked ? 'unlocked' : 'locked'}"><div class="achievement-icon">${a.icon}</div><div class="achievement-name">${a.name}</div></div>`;
    }).join('');
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!userData.achievements.includes(a.id) && a.condition(userData)) {
            userData.achievements.push(a.id);
            userData.xp += 50;
            saveUserData();
            showToast(`🏆 Yutuq: ${a.name}!`);
        }
    });
}

// ==================== CHALLENGES ====================
function renderChallenges() {
    const list = document.getElementById('challengesList');
    if (!list) return;
    list.innerHTML = DAILY_CHALLENGES.map(c => {
        const progress = userData.challenges[c.id]?.progress || 0;
        const completed = userData.challenges[c.id]?.completed || false;
        const percent = Math.min((progress / c.target) * 100, 100);
        return `<div class="challenge-item">
            <div class="challenge-header"><div class="challenge-title">${c.name}</div><div class="challenge-reward">+${c.reward} 🪙</div></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${percent}%;${completed ? 'background:var(--success);' : ''}"></div></div>
            <div class="challenge-progress">${progress}/${c.target} ${completed ? '✅' : ''}</div>
        </div>`;
    }).join('');
}

function checkChallenges() {
    DAILY_CHALLENGES.forEach(c => {
        const challenge = userData.challenges[c.id];
        if (challenge && !challenge.completed && challenge.progress >= c.target) {
            challenge.completed = true;
            userData.gold += c.reward;
            saveUserData();
            showToast(`✅ Vazifa bajarildi: ${c.name}! +${c.reward} 🪙`);
        }
    });
    renderChallenges();
}

// ==================== LEADERBOARD ====================
function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    const leaders = [
        { name: 'Ali', score: 15000 }, { name: 'Vali', score: 12500 },
        { name: 'Sardor', score: 10000 }, { name: userData.name, score: userData.totalGoldEarned },
        { name: 'Jasur', score: 5000 }
    ].sort((a, b) => b.score - a.score);
    list.innerHTML = leaders.map((l, i) => `
        <div class="leaderboard-item ${l.name === userData.name ? 'style="border:1px solid var(--accent);"' : ''}">
            <div class="leaderboard-rank ${i < 3 ? 'rank-' + (i + 1) : ''}">${i + 1}</div>
            <div class="leaderboard-name">${l.name}</div>
            <div class="leaderboard-score">${formatNumber(l.score)} 🪙</div>
        </div>`).join('');
}

function refreshLeaderboard() {
    renderLeaderboard();
    showToast('Yangilandi! 🔄');
}

// ==================== STREAK & DAILY BONUS ====================
function initStreakDisplay() {
    const display = document.getElementById('streakDisplay');
    if (!display) return;
    const days = ['D', 'S', 'Ch', 'P', 'J', 'Sh', 'Y'];
    const today = new Date().getDay();
    display.innerHTML = days.map((d, i) => {
        const isActive = i < userData.streak % 7;
        const isCurrent = i === today;
        return `<div class="streak-day ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">${d}</div>`;
    }).join('');
}

function checkDailyBonusStatus() {
    const btn = document.getElementById('dailyBonusBtn');
    if (!btn) return;
    const today = new Date().toDateString();
    if (userData.lastDailyBonus === today) {
        btn.disabled = true;
        btn.textContent = '✅ Bonus olindi';
    }
}

function claimDailyBonus() {
    const today = new Date().toDateString();
    if (userData.lastDailyBonus === today) return showToast('Bugun bonus olindingiz!');
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (userData.lastDailyBonus === yesterday) {
        userData.streak++;
    } else if (userData.lastDailyBonus !== today) {
        userData.streak = 1;
    }
    
    const bonus = 50 + (userData.streak * 10);
    userData.gold += bonus;
    userData.xp += 25;
    userData.lastDailyBonus = today;
    saveUserData();
    updateUI();
    initStreakDisplay();
    checkDailyBonusStatus();
    showToast(`🎁 +${bonus} Gold! Streak: ${userData.streak} kun 🔥`);
}

// ==================== REFERRAL ====================
function shareReferral() {
    const text = `🚀 Nexus Media Bot - eng zo'r AI bot!\n\nMening referral kodom: ${userData.referralCode}\n\nhttps://t.me/${BOT_USERNAME}?start=${userData.referralCode}`;
    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
    } else {
        navigator.clipboard.writeText(text);
        showToast('Link nusxalandi! 📋');
    }
}

// ==================== PREMIUM ====================
function buyPremium(type) {
    sendBotCommand({ action: 'buy_premium', type: type });
    showToast('To\'lov sahifasiga yo\'naltirilmoqda...');
}

function exchangeXP() {
    const amount = parseInt(document.getElementById('xpExchangeAmount')?.value) || 0;
    if (amount < 1000) return showToast('Kamida 1000 XP kerak!');
    if (userData.xp < amount) return showToast('XP yetarli emas!');
    const gold = Math.floor(amount / 10);
    userData.xp -= amount;
    userData.gold += gold;
    saveUserData();
    updateUI();
    showToast(`💱 ${amount} XP → ${gold} Gold`);
}

// ==================== LEVEL SYSTEM ====================
function checkLevelUp() {
    const xpNeeded = userData.level * 500;
    if (userData.xp >= xpNeeded) {
        userData.level++;
        userData.xp -= xpNeeded;
        saveUserData();
        showToast(`🎉 Level ${userData.level}!`);
        document.getElementById('userLevel').textContent = userData.level;
    }
}

// ==================== EDUCATION FUNCTIONS ====================
function openAIQuiz() {
    const questions = [
        { q: 'Python qaysi yilda yaratilgan?', options: ['1989', '1991', '1995', '2000'], correct: 1 },
        { q: 'HTML nimaning qisqartmasi?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks Text Mark Language'], correct: 0 },
        { q: 'JavaScript kim tomonidan yaratilgan?', options: ['Guido van Rossum', 'Brendan Eich', 'James Gosling', 'Dennis Ritchie'], correct: 1 }
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    showModal('🧠 AI Quiz', `
        <p style="margin-bottom:15px;font-weight:bold;">${q.q}</p>
        ${q.options.map((o, i) => `<div class="quiz-option" onclick="checkQuizAnswer(this, ${i}, ${q.correct})">${o}</div>`).join('')}
    `);
}

function checkQuizAnswer(el, selected, correct) {
    document.querySelectorAll('.quiz-option').forEach(o => o.style.pointerEvents = 'none');
    if (selected === correct) {
        el.classList.add('correct');
        userData.xp += 20;
        userData.gold += 10;
        saveUserData();
        updateUI();
        showToast('✅ To\'g\'ri! +20 XP, +10 Gold');
    } else {
        el.classList.add('wrong');
        document.querySelectorAll('.quiz-option')[correct].classList.add('correct');
        showToast('❌ Noto\'g\'ri javob');
    }
}

function openCourses() {
    showModal('📖 Kurslar', `
        <div class="list-item"><div class="list-item-icon" style="background:var(--success);">🐍</div><div class="list-item-content"><div class="list-item-title">Python Asoslari</div><div class="list-item-subtitle">Bepul • 20 dars</div></div></div>
        <div class="list-item"><div class="list-item-icon" style="background:var(--warning);">🌐</div><div class="list-item-content"><div class="list-item-title">Web Development</div><div class="list-item-subtitle">Premium • 50 dars</div></div></div>
        <div class="list-item"><div class="list-item-icon" style="background:var(--info);">📱</div><div class="list-item-content"><div class="list-item-title">Mobile App</div><div class="list-item-subtitle">Premium • 35 dars</div></div></div>
    `);
}

function openPodcasts() {
    showModal('🎙️ Podcastlar', `
        <div class="list-item"><div class="list-item-icon" style="background:var(--accent);">🎧</div><div class="list-item-content"><div class="list-item-title">Tech Talk</div><div class="list-item-subtitle">Texnologiya yangiliklari</div></div></div>
        <div class="list-item"><div class="list-item-icon" style="background:var(--premium);">💡</div><div class="list-item-content"><div class="list-item-title">Startup Stories</div><div class="list-item-subtitle">Muvaffaqiyat tarixi</div></div></div>
    `);
}

function openFlashcards() {
    showModal('🃏 Flashcards', `
        <div style="background:var(--bg-secondary);padding:30px;border-radius:15px;text-align:center;margin-bottom:15px;">
            <div style="font-size:14px;color:var(--text-secondary);margin-bottom:10px;">Savol:</div>
            <div style="font-size:18px;font-weight:bold;">API nima?</div>
        </div>
        <button class="btn btn-primary" onclick="this.previousElementSibling.innerHTML='<div style=\\'font-size:14px;color:var(--text-secondary);margin-bottom:10px;\\'>Javob:</div><div style=\\'font-size:16px;\\'>Application Programming Interface - dasturlar o\\'rtasida ma\\'lumot almashish interfeysi</div>'">🔄 Javobni ko'rish</button>
    `);
}

function openBooks() {
    showModal('📚 Kitoblar', `
        <div class="list-item"><div class="list-item-icon" style="background:#8b4513;">📕</div><div class="list-item-content"><div class="list-item-title">Clean Code</div><div class="list-item-subtitle">Robert C. Martin</div></div></div>
        <div class="list-item"><div class="list-item-icon" style="background:#2e8b57;">📗</div><div class="list-item-content"><div class="list-item-title">The Pragmatic Programmer</div><div class="list-item-subtitle">David Thomas</div></div></div>
    `);
}

function openMovies() {
    showModal('🎬 Filmlar', `
        <div class="list-item"><div class="list-item-icon" style="background:#e50914;">🎥</div><div class="list-item-content"><div class="list-item-title">The Social Network</div><div class="list-item-subtitle">Facebook tarixi</div></div></div>
        <div class="list-item"><div class="list-item-icon" style="background:#00a8e1;">🎥</div><div class="list-item-content"><div class="list-item-title">Steve Jobs</div><div class="list-item-subtitle">Apple asoschisi</div></div></div>
    `);
}

function openMindmap() {
    showModal('🗺️ Mindmap', `
        <p style="color:var(--text-secondary);margin-bottom:15px;">Fikrlar xaritasi yarating va o'rganishni osonlashtiring!</p>
        <div class="input-group"><label class="input-label">Mavzu</label><input type="text" class="input" placeholder="Mavzu kiriting..."></div>
        <button class="btn btn-primary" onclick="showToast('Mindmap yaratilmoqda...')">🗺️ Yaratish</button>
    `);
}

function openAIMentor() {
    showModal('🤖 AI Mentor', `
        <p style="color:var(--text-secondary);margin-bottom:15px;">Shaxsiy AI yordamchingiz har qanday savolga javob beradi!</p>
        <div style="background:var(--bg-secondary);padding:15px;border-radius:10px;margin-bottom:15px;">
            <strong>Imkoniyatlar:</strong>
            <ul style="margin-top:10px;padding-left:20px;color:var(--text-secondary);">
                <li>Kod yozishda yordam</li>
                <li>Tushuntirishlar</li>
                <li>Loyiha g'oyalari</li>
                <li>Xatolarni tuzatish</li>
            </ul>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);">Kunlik limit: ${userData.isPremium ? 'Cheksiz' : '10 ta so\'rov'}</p>
    `);
}

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const chat = document.getElementById('aiChatMessages');
    chat.innerHTML += `<div style="padding:10px;background:var(--accent);border-radius:10px;margin-bottom:10px;text-align:right;"><strong>Siz:</strong> ${message}</div>`;
    input.value = '';
    
    setTimeout(() => {
        chat.innerHTML += `<div style="padding:10px;background:var(--bg-secondary);border-radius:10px;margin-bottom:10px;"><strong>AI:</strong> Savolingiz qabul qilindi. Bot orqali to'liq javob olishingiz mumkin.</div>`;
        chat.scrollTop = chat.scrollHeight;
        userData.xp += 5;
        saveUserData();
        updateUI();
    }, 1000);
}

// ==================== PROFILE FUNCTIONS ====================
function getStatsHTML() {
    return `
        <div class="admin-stat"><span>Jami XP:</span><span>${formatNumber(userData.xp)}</span></div>
        <div class="admin-stat"><span>Jami Gold:</span><span>${formatNumber(userData.gold)}</span></div>
        <div class="admin-stat"><span>Level:</span><span>${userData.level}</span></div>
        <div class="admin-stat"><span>Streak:</span><span>${userData.streak} kun</span></div>
        <div class="admin-stat"><span>Mining clicks:</span><span>${formatNumber(userData.miningClicks)}</span></div>
        <div class="admin-stat"><span>Jami ishlangan:</span><span>${formatNumber(userData.totalGoldEarned)} gold</span></div>
        <div class="admin-stat"><span>Yutuqlar:</span><span>${userData.achievements.length}/${ACHIEVEMENTS.length}</span></div>
        <div class="admin-stat"><span>Referrallar:</span><span>${userData.referrals}</span></div>
        <div class="admin-stat"><span>A'zo bo'lgan:</span><span>${new Date(userData.createdAt).toLocaleDateString()}</span></div>
    `;
}

function getSettingsHTML() {
    return `
        <div class="list-item" onclick="toggleNotifications()">
            <div class="list-item-icon">🔔</div>
            <div class="list-item-content"><div class="list-item-title">Bildirishnomalar</div><div class="list-item-subtitle">${userData.settings.notifications ? 'Yoqilgan' : 'O\'chirilgan'}</div></div>
            <div class="list-item-arrow">${userData.settings.notifications ? '✅' : '❌'}</div>
        </div>
        <div class="list-item" onclick="changeLanguage()">
            <div class="list-item-icon">🌐</div>
            <div class="list-item-content"><div class="list-item-title">Til</div><div class="list-item-subtitle">${userData.settings.language === 'uz' ? 'O\'zbekcha' : 'Русский'}</div></div>
            <div class="list-item-arrow">›</div>
        </div>
        <button class="btn btn-primary" style="margin-top:15px;background:#e74c3c;" onclick="resetData()">🗑️ Ma'lumotlarni tozalash</button>
    `;
}

function getHistoryHTML() {
    if (userData.history.length === 0) return '<p style="color:var(--text-secondary);text-align:center;">Tarix bo\'sh</p>';
    return userData.history.slice(-10).reverse().map(h => `
        <div class="list-item"><div class="list-item-content"><div class="list-item-title">${h.type}</div><div class="list-item-subtitle">${h.date}</div></div></div>
    `).join('');
}

function getFavoritesHTML() {
    if (userData.favorites.length === 0) return '<p style="color:var(--text-secondary);text-align:center;">Sevimlilar bo\'sh</p>';
    return userData.favorites.map(f => `
        <div class="list-item"><div class="list-item-icon">⭐</div><div class="list-item-content"><div class="list-item-title">${f.title}</div><div class="list-item-subtitle">${f.type}</div></div></div>
    `).join('');
}

function toggleNotifications() {
    userData.settings.notifications = !userData.settings.notifications;
    saveUserData();
    showModal('Sozlamalar', getSettingsHTML());
    showToast(userData.settings.notifications ? 'Bildirishnomalar yoqildi' : 'Bildirishnomalar o\'chirildi');
}

function changeLanguage() {
    userData.settings.language = userData.settings.language === 'uz' ? 'ru' : 'uz';
    saveUserData();
    showModal('Sozlamalar', getSettingsHTML());
    showToast('Til o\'zgartirildi');
}

function resetData() {
    if (confirm('Barcha ma\'lumotlar o\'chiriladi. Davom etasizmi?')) {
        localStorage.removeItem('nexus_user_data');
        location.reload();
    }
}

// ==================== MODAL ====================
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
    hapticFeedback('light');
}

function closeModal(event) {
    if (!event || event.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').classList.remove('active');
    }
}

// ==================== UTILITIES ====================
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function hapticFeedback(type) {
    if (tg?.HapticFeedback) {
        if (type === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (type === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
        else tg.HapticFeedback.notificationOccurred('success');
    }
}

function sendBotCommand(data) {
    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        console.log('Bot command:', data);
    }
}

// Profile details function
function showProfileDetails() { showModal('📊 Statistika', getStatsHTML()); }
function showSettings() { showModal('⚙️ Sozlamalar', getSettingsHTML()); }
function showHistory() { showModal('📜 Tarix', getHistoryHTML()); }
function showFavorites() { showModal('⭐ Sevimlilar', getFavoritesHTML()); }
