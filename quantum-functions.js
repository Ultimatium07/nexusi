/* ============================================
   QUANTUM SHOP SYSTEM
   ============================================ */

function renderShop() {
    const upgradesGrid = document.getElementById('upgradesGrid');
    if (!upgradesGrid) return;

    const upgrades = [
        {
            type: 'tap',
            name: 'Tap Power',
            description: 'Har bir bosishda ko\'proq tanga',
            icon: 'hand-pointer',
            baseCost: 100,
            multiplier: 1.5,
            effect: () => QuantumState.mining.tapPower += 0.5
        },
        {
            type: 'energy',
            name: 'Energy Capacity',
            description: 'Ko\'proq energiya zaxirasi',
            icon: 'battery-full',
            baseCost: 200,
            multiplier: 1.3,
            effect: () => QuantumState.user.maxEnergy += 200
        },
        {
            type: 'auto',
            name: 'Auto Mining',
            description: 'Avtomatik mining',
            icon: 'robot',
            baseCost: 1000,
            multiplier: 2,
            effect: () => QuantumState.mining.autoTapRate += 0.1
        },
        {
            type: 'luck',
            name: 'Critical Chance',
            description: '2x ko\'proq tanga shansi',
            icon: 'dice',
            baseCost: 500,
            multiplier: 1.2,
            effect: () => QuantumState.mining.critChance += 5
        }
    ];

    const boosters = [
        {
            type: 'energy_refill',
            name: 'Energy Refill',
            description: 'Energiyani to\'ldirish',
            cost: 100,
            icon: 'battery-three-quarters',
            effect: () => {
                QuantumState.user.energy = QuantumState.user.maxEnergy;
                QuantumApp.ui.updateEnergy(QuantumState.user.energy);
            }
        },
        {
            type: 'double_tap',
            name: 'Double Tap',
            description: '2x tap power 5 daqiqa',
            cost: 500,
            icon: 'hand-sparkles',
            effect: () => QuantumState.mining.multiplier = 2
        },
        {
            type: 'lucky_boost',
            name: 'Lucky Boost',
            description: '50% crit chance 10 daqiqa',
            cost: 1000,
            icon: 'clover',
            effect: () => QuantumState.mining.critChance = 50
        }
    ];

    let html = '';

    // Render upgrades
    upgrades.forEach(upgrade => {
        const level = QuantumState.mining.upgrades[upgrade.type] || 0;
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, level));
        const canAfford = QuantumState.user.gold >= cost;
        const isMaxLevel = level >= 100;

        html += `
            <div class="upgrade-card ${isMaxLevel ? 'maxed' : ''} ${!canAfford ? 'disabled' : ''}">
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
                    <div class="upgrade-level">Level ${level}/100</div>
                    <div class="upgrade-cost">
                        <i class="fas fa-coins"></i>
                        ${formatNumber(cost)}
                    </div>
                </div>
                <button class="upgrade-btn" onclick="purchaseUpgrade('${upgrade.type}')" ${isMaxLevel || !canAfford ? 'disabled' : ''}>
                    ${isMaxLevel ? 'MAX' : 'Upgrade'}
                </button>
            </div>
        `;
    });

    // Render boosters
    boosters.forEach(booster => {
        const canAfford = QuantumState.user.gold >= booster.cost;

        html += `
            <div class="booster-card ${!canAfford ? 'disabled' : ''}">
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
                    ${formatNumber(booster.cost)}
                </div>
                <button class="booster-btn" onclick="purchaseBooster('${booster.type}')" ${!canAfford ? 'disabled' : ''}>
                    Buy
                </button>
            </div>
        `;
    });

    upgradesGrid.innerHTML = html;
}

function purchaseUpgrade(type) {
    const upgrades = {
        tap: { baseCost: 100, multiplier: 1.5 },
        energy: { baseCost: 200, multiplier: 1.3 },
        auto: { baseCost: 1000, multiplier: 2 },
        luck: { baseCost: 500, multiplier: 1.2 }
    };

    const upgrade = upgrades[type];
    const level = QuantumState.mining.upgrades[type] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, level));

    if (QuantumState.user.gold < cost) {
        QuantumApp.ui.showNotification('Oltin yetarli emas!', 'error');
        return;
    }

    if (level >= 100) {
        QuantumApp.ui.showNotification('Maximum level ga yetdingiz!', 'error');
        return;
    }

    // Purchase
    QuantumState.user.gold -= cost;
    QuantumState.mining.upgrades[type] = level + 1;

    // Apply effects
    switch (type) {
        case 'tap':
            QuantumState.mining.tapPower = 1 + (QuantumState.mining.upgrades.tap * 0.5);
            break;
        case 'energy':
            QuantumState.user.maxEnergy = 1000 + (QuantumState.mining.upgrades.energy * 200);
            break;
        case 'auto':
            QuantumState.mining.autoTapRate = QuantumState.mining.upgrades.auto * 0.1;
            startAutoMining();
            break;
        case 'luck':
            QuantumState.mining.critChance = 5 + (QuantumState.mining.upgrades.luck * 0.5);
            break;
    }

    // Update UI
    QuantumApp.ui.updateGold(QuantumState.user.gold);
    renderShop();

    QuantumApp.ui.showNotification(`Upgraded to level ${level + 1}!`, 'success');
    QuantumApp.audio.play('levelup', { vibrate: 100 });
}

function purchaseBooster(type) {
    const boosters = {
        energy_refill: { cost: 100, duration: 0 },
        double_tap: { cost: 500, duration: 300000 },
        lucky_boost: { cost: 1000, duration: 600000 }
    };

    const booster = boosters[type];

    if (QuantumState.user.gold < booster.cost) {
        QuantumApp.ui.showNotification('Oltin yetarli emas!', 'error');
        return;
    }

    // Purchase
    QuantumState.user.gold -= booster.cost;

    // Apply effect
    switch (type) {
        case 'energy_refill':
            QuantumState.user.energy = QuantumState.user.maxEnergy;
            QuantumApp.ui.updateEnergy(QuantumState.user.energy);
            break;
        case 'double_tap':
            QuantumState.mining.multiplier = 2;
            setTimeout(() => {
                QuantumState.mining.multiplier = 1;
                QuantumApp.ui.showNotification('Double Tap ended!', 'info');
            }, booster.duration);
            break;
        case 'lucky_boost':
            QuantumState.mining.critChance = 50;
            setTimeout(() => {
                QuantumState.mining.critChance = 5 + (QuantumState.mining.upgrades.luck * 0.5);
                QuantumApp.ui.showNotification('Lucky Boost ended!', 'info');
            }, booster.duration);
            break;
    }

    // Update UI
    QuantumApp.ui.updateGold(QuantumState.user.gold);

    QuantumApp.ui.showNotification('Booster activated!', 'success');
    QuantumApp.audio.play('powerup', { vibrate: 80 });
}

/* ============================================
   QUANTUM BATTLE SYSTEM
   ============================================ */

function createBattleRoom(mode) {
    const room = {
        id: generateRoomId(),
        mode: mode, // 'duel', 'team', 'tournament'
        participants: [QuantumState.user],
        maxParticipants: mode === 'duel' ? 2 : mode === 'team' ? 6 : 10,
        status: 'waiting',
        questions: [],
        currentQuestion: 0,
        startTime: null
    };

    QuantumState.battle.room = room;
    QuantumState.battle.active = true;

    // Add to active battles
    const activeBattles = document.getElementById('activeBattles');
    if (activeBattles) {
        activeBattles.innerHTML += `
            <div class="battle-room-card" data-room-id="${room.id}">
                <div class="room-header">
                    <h4>Room ${room.id}</h4>
                    <span class="room-mode">${mode}</span>
                </div>
                <div class="room-participants">
                    <div class="participant-count">${room.participants.length}/${room.maxParticipants}</div>
                    <div class="participants-list">
                        ${room.participants.map(p => `<span class="participant">${p.name}</span>`).join('')}
                    </div>
                </div>
                <button class="join-battle-btn" onclick="joinBattleRoom('${room.id}')">
                    Join Battle
                </button>
            </div>
        `;
    }

    // Start battle if full or after timeout
    setTimeout(() => {
        if (room.participants.length >= 2) {
            startBattle(room);
        }
    }, 10000);
}

function joinBattleRoom(roomId) {
    // Simulate joining
    QuantumApp.ui.showNotification('Joined battle room!', 'success');
    
    // Generate quiz for battle
    const quiz = generateMockQuiz('general', 'medium', 10);
    QuantumState.battle.questions = quiz;
    
    // Show battle screen
    showBattleScreen();
}

function showBattleScreen() {
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) {
        battleScreen.style.display = 'block';
        displayBattleQuestion(0);
    }
}

function displayBattleQuestion(index) {
    const question = QuantumState.battle.questions[index];
    const questionContainer = document.getElementById('battleQuestion');
    const optionsContainer = document.getElementById('battleOptions');

    if (questionContainer && optionsContainer) {
        questionContainer.textContent = question.question;
        
        optionsContainer.innerHTML = question.options.map((option, i) => `
            <button class="battle-option-btn" onclick="selectBattleAnswer(${i})">
                ${option}
            </button>
        `).join('');
    }
}

function selectBattleAnswer(answerIndex) {
    const question = QuantumState.battle.questions[QuantumState.battle.currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
        QuantumState.user.xp += 100;
        QuantumState.user.gold += 50;
        QuantumApp.ui.showNotification('Correct! +100 XP, +50 Gold', 'success');
    } else {
        QuantumApp.ui.showNotification('Wrong answer!', 'error');
    }

    // Next question
    QuantumState.battle.currentQuestion++;
    if (QuantumState.battle.currentQuestion < QuantumState.battle.questions.length) {
        displayBattleQuestion(QuantumState.battle.currentQuestion);
    } else {
        endBattle();
    }
}

function endBattle() {
    QuantumState.battle.active = false;
    QuantumState.battle.room = null;
    
    const battleScreen = document.getElementById('battleScreen');
    if (battleScreen) {
        battleScreen.style.display = 'none';
    }

    QuantumApp.ui.showNotification('Battle completed!', 'success');
}

/* ============================================
   QUANTUM GAMIFICATION
   ============================================ */

function renderAchievements() {
    const achievements = [
        { id: 'first_mine', name: 'First Mine', description: 'Mine your first coin', icon: 'coin', unlocked: true },
        { id: 'mining_100', name: 'Mining Novice', description: 'Mine 100 coins', icon: 'pickaxe', unlocked: QuantumState.mining.balance >= 100 },
        { id: 'mining_1000', name: 'Mining Expert', description: 'Mine 1000 coins', icon: 'gem', unlocked: QuantumState.mining.balance >= 1000 },
        { id: 'quiz_master', name: 'Quiz Master', description: 'Complete 10 quizzes', icon: 'graduation-cap', unlocked: QuantumState.gamification.achievements.includes('quiz_master') },
        { id: 'battle_winner', name: 'Battle Winner', description: 'Win 5 battles', icon: 'trophy', unlocked: QuantumState.gamification.achievements.includes('battle_winner') },
        { id: 'level_10', name: 'Experienced', description: 'Reach level 10', icon: 'star', unlocked: QuantumState.user.level >= 10 },
        { id: 'level_50', name: 'Master', description: 'Reach level 50', icon: 'crown', unlocked: QuantumState.user.level >= 50 },
        { id: 'referral_10', name: 'Popular', description: 'Refer 10 friends', icon: 'users', unlocked: QuantumState.user.referrals >= 10 }
    ];

    const achievementsGrid = document.getElementById('achievementsGrid');
    if (achievementsGrid) {
        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status">
                    ${achievement.unlocked ? '<i class="fas fa-check"></i>' : '<i class="fas fa-lock"></i>'}
                </div>
            </div>
        `).join('');
    }
}

function renderLeaderboard() {
    const mockLeaderboard = [
        { rank: 1, name: 'QuantumMaster', level: 50, xp: 125000, gold: 50000 },
        { rank: 2, name: 'NexusPro', level: 45, xp: 98000, gold: 42000 },
        { rank: 3, name: 'CryptoKing', level: 42, xp: 85000, gold: 38000 },
        { rank: 4, name: 'QuizChampion', level: 40, xp: 76000, gold: 35000 },
        { rank: 5, name: 'BattleLegend', level: 38, xp: 68000, gold: 32000 },
        { rank: 6, name: 'MiningExpert', level: 35, xp: 59000, gold: 28000 },
        { rank: 7, name: 'AIWhisperer', level: 32, xp: 51000, gold: 25000 },
        { rank: 8, name: 'QuantumUser', level: QuantumState.user.level, xp: QuantumState.user.xp, gold: QuantumState.user.gold, isYou: true }
    ];

    const leaderboardList = document.getElementById('leaderboardList');
    if (leaderboardList) {
        leaderboardList.innerHTML = mockLeaderboard.map(player => `
            <div class="leaderboard-item ${player.isYou ? 'you' : ''}">
                <div class="rank">#${player.rank}</div>
                <div class="player-info">
                    <div class="player-name">${player.name} ${player.isYou ? '(You)' : ''}</div>
                    <div class="player-stats">
                        Level ${player.level} • ${formatNumber(player.xp)} XP • ${formatNumber(player.gold)} Gold
                    </div>
                </div>
                <div class="player-avatar">
                    <div class="avatar-circle">${player.name.charAt(0)}</div>
                </div>
            </div>
        `).join('');
    }
}

/* ============================================
   QUANTUM WAYGROUND
   ============================================ */

function createWaygroundRoom(type, topic) {
    const room = {
        id: generateRoomId(),
        type: type, // 'study', 'discussion', 'session'
        topic: topic,
        host: QuantumState.user,
        participants: [QuantumState.user],
        maxParticipants: type === 'study' ? 4 : type === 'discussion' ? 10 : 20,
        createdAt: new Date(),
        messages: []
    };

    QuantumState.wayground.rooms.push(room);
    renderWaygroundRooms();

    QuantumApp.ui.showNotification(`Created ${type} room: ${topic}`, 'success');
}

function joinWaygroundRoom(roomId) {
    const room = QuantumState.wayground.rooms.find(r => r.id === roomId);
    if (room && room.participants.length < room.maxParticipants) {
        room.participants.push(QuantumState.user);
        QuantumState.wayground.currentRoom = room;
        
        openWaygroundRoom(room);
        QuantumApp.ui.showNotification('Joined room!', 'success');
    }
}

function openWaygroundRoom(room) {
    const roomModal = document.getElementById('waygroundRoomModal');
    if (roomModal) {
        roomModal.classList.add('active');
        
        // Update room info
        const roomTitle = document.getElementById('roomTitle');
        const roomTopic = document.getElementById('roomTopic');
        const participantsList = document.getElementById('roomParticipants');
        const messagesContainer = document.getElementById('roomMessages');
        
        if (roomTitle) roomTitle.textContent = `${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room`;
        if (roomTopic) roomTopic.textContent = room.topic;
        if (participantsList) {
            participantsList.innerHTML = room.participants.map(p => `
                <div class="room-participant">
                    <div class="participant-avatar">${p.avatar}</div>
                    <div class="participant-name">${p.name}</div>
                </div>
            `).join('');
        }
        
        // Load messages
        if (messagesContainer) {
            messagesContainer.innerHTML = room.messages.map(msg => `
                <div class="room-message ${msg.sender === QuantumState.user.id ? 'own' : ''}">
                    <div class="message-sender">${msg.senderName}</div>
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
            `).join('');
        }
    }
}

function sendWaygroundMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (content && QuantumState.wayground.currentRoom) {
        const message = {
            id: Date.now(),
            sender: QuantumState.user.id,
            senderName: QuantumState.user.name,
            content: content,
            timestamp: new Date()
        };
        
        QuantumState.wayground.currentRoom.messages.push(message);
        
        // Add to UI
        const messagesContainer = document.getElementById('roomMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML += `
                <div class="room-message own">
                    <div class="message-sender">${message.senderName}</div>
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
                </div>
            `;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        input.value = '';
    }
}

function renderWaygroundRooms() {
    const roomsList = document.getElementById('waygroundRoomsList');
    if (roomsList) {
        roomsList.innerHTML = QuantumState.wayground.rooms.map(room => `
            <div class="wayground-room-card" onclick="joinWaygroundRoom('${room.id}')">
                <div class="room-header">
                    <h4>${room.topic}</h4>
                    <span class="room-type">${room.type}</span>
                </div>
                <div class="room-info">
                    <div class="room-host">by ${room.host.name}</div>
                    <div class="room-participants-count">${room.participants.length}/${room.maxParticipants}</div>
                </div>
                <button class="join-room-btn">Join</button>
            </div>
        `).join('');
    }
}

/* ============================================
   REFERRAL SYSTEM
   ============================================ */

function generateReferralCode() {
    const code = 'NEXUS' + Math.random().toString(36).substr(2, 9).toUpperCase();
    QuantumState.user.referralCode = code;
    return code;
}

function getReferralLink() {
    const code = QuantumState.user.referralCode || generateReferralCode();
    return `https://nexusi.vercel.app?ref=${code}`;
}

function copyReferralLink() {
    const link = getReferralLink();
    navigator.clipboard.writeText(link).then(() => {
        QuantumApp.ui.showNotification('Referral link copied!', 'success');
    });
}

function handleReferral(referralCode) {
    // Simulate handling referral
    QuantumState.user.referrals++;
    QuantumState.user.gold += 100;
    QuantumState.user.xp += 500;
    
    QuantumApp.ui.updateGold(QuantumState.user.gold);
    QuantumApp.ui.updateXP(QuantumState.user.xp);
    
    QuantumApp.ui.showNotification('Referral bonus received! +100 Gold, +500 XP', 'success');
}

/* ============================================
   DAILY CHALLENGES
   ============================================ */

function renderDailyChallenges() {
    const challenges = [
        { id: 'mine_100', name: 'Mining Master', description: 'Mine 100 coins today', progress: Math.min(QuantumState.mining.balance, 100), total: 100, reward: { gold: 50, xp: 100 } },
        { id: 'quiz_5', name: 'Quiz Expert', description: 'Complete 5 quizzes', progress: 0, total: 5, reward: { gold: 100, xp: 200 } },
        { id: 'battle_3', name: 'Battle Champion', description: 'Win 3 battles', progress: 0, total: 3, reward: { gold: 150, xp: 300 } },
        { id: 'invite_2', name: 'Social Butterfly', description: 'Invite 2 friends', progress: QuantumState.user.referrals, total: 2, reward: { gold: 200, xp: 400 } }
    ];

    const challengesList = document.getElementById('dailyChallengesList');
    if (challengesList) {
        challengesList.innerHTML = challenges.map(challenge => `
            <div class="challenge-card ${challenge.progress >= challenge.total ? 'completed' : ''}">
                <div class="challenge-info">
                    <h4>${challenge.name}</h4>
                    <p>${challenge.description}</p>
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(challenge.progress / challenge.total) * 100}%"></div>
                    </div>
                    <div class="progress-text">${challenge.progress}/${challenge.total}</div>
                </div>
                <div class="challenge-reward">
                    <i class="fas fa-coins"></i> ${challenge.reward.gold}
                    <i class="fas fa-star"></i> ${challenge.reward.xp}
                </div>
            </div>
        `).join('');
    }
}

/* ============================================
   FILE ANALYSIS
   ============================================ */

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        analyzeFile(file.name, content);
    };
    reader.readAsText(file);
}

async function analyzeFile(filename, content) {
    QuantumApp.ui.showNotification('Analyzing file...', 'info');
    
    // Use mock analysis for now
    setTimeout(() => {
        const analysis = {
            summary: `This is a ${filename.split('.').pop()} file containing ${content.length} characters.`,
            keywords: extractKeywords(content),
            topics: ['Technology', 'Education', 'Science'],
            difficulty: 'Medium'
        };
        
        showFileAnalysis(analysis);
        QuantumApp.ui.showNotification('Analysis complete!', 'success');
    }, 2000);
}

function extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const filtered = words.filter(word => word.length > 3 && !commonWords.includes(word));
    const frequency = {};
    
    filtered.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}

function showFileAnalysis(analysis) {
    const modal = document.getElementById('fileAnalysisModal');
    if (modal) {
        modal.classList.add('active');
        
        const summaryEl = document.getElementById('analysisSummary');
        const keywordsEl = document.getElementById('analysisKeywords');
        const topicsEl = document.getElementById('analysisTopics');
        
        if (summaryEl) summaryEl.textContent = analysis.summary;
        if (keywordsEl) {
            keywordsEl.innerHTML = analysis.keywords.map(keyword => 
                `<span class="keyword-tag">${keyword}</span>`
            ).join('');
        }
        if (topicsEl) {
            topicsEl.innerHTML = analysis.topics.map(topic => 
                `<span class="topic-tag">${topic}</span>`
            ).join('');
        }
    }
}

/* ============================================
   AI CHAT
   ============================================ */

function openAIChat() {
    const modal = document.getElementById('aiChatModal');
    if (modal) {
        modal.classList.add('active');
        initAIChat();
    }
}

function initAIChat() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="ai-message">
                <div class="message-content">
                    Hello! I'm your AI assistant. How can I help you today?
                </div>
            </div>
        `;
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        addChatMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            removeTypingIndicator();
            const response = generateAIResponse(message);
            addChatMessage(response, 'ai');
        }, 1500);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML += `
            <div class="chat-message ${sender}">
                <div class="message-content">${message}</div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML += `
            <div class="typing-indicator">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    }
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

function generateAIResponse(message) {
    const responses = [
        "That's an interesting question! Let me help you with that.",
        "Based on my analysis, I would recommend...",
        "Great point! Here's what I think about it:",
        "I understand your concern. Let me provide some insights:",
        "That's a complex topic. Let me break it down for you:"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

function generateRoomId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function startAutoMining() {
    if (QuantumState.mining.autoTapRate > 0 && !QuantumState.mining.autoMining.active) {
        QuantumState.mining.autoMining.active = true;
        
        const autoMineInterval = setInterval(() => {
            if (QuantumState.mining.autoTapRate > 0 && QuantumState.user.energy > 0) {
                const amount = Math.floor(QuantumState.mining.tapPower * QuantumState.mining.multiplier);
                QuantumState.mining.balance += amount;
                QuantumState.mining.autoMining.amount += amount;
                
                QuantumApp.ui.updateBalance(QuantumState.mining.balance);
                
                const autoContainer = document.getElementById('autoMiningContainer');
                if (autoContainer) {
                    autoContainer.style.display = 'flex';
                    document.getElementById('autoAmount').textContent = formatNumber(QuantumState.mining.autoMining.amount);
                }
            } else {
                clearInterval(autoMineInterval);
                QuantumState.mining.autoMining.active = false;
            }
        }, 1000);
    }
}

// Make functions globally available
window.renderShop = renderShop;
window.purchaseUpgrade = purchaseUpgrade;
window.purchaseBooster = purchaseBooster;
window.createBattleRoom = createBattleRoom;
window.joinBattleRoom = joinBattleRoom;
window.selectBattleAnswer = selectBattleAnswer;
window.renderAchievements = renderAchievements;
window.renderLeaderboard = renderLeaderboard;
window.createWaygroundRoom = createWaygroundRoom;
window.joinWaygroundRoom = joinWaygroundRoom;
window.sendWaygroundMessage = sendWaygroundMessage;
window.copyReferralLink = copyReferralLink;
window.handleFileUpload = handleFileUpload;
window.openAIChat = openAIChat;
window.sendAIMessage = sendAIMessage;
