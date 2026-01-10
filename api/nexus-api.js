// 🤖 NEXUS QUANTUM API - Real-time Backend
// WebSocket + REST API for full functionality

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// 🗄️ In-memory database (replace with real DB in production)
const users = new Map();
const rooms = new Map();
const battles = new Map();
const leaderboard = [];

// 🌐 WebSocket Connection Manager
wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    ws.clientId = clientId;
    
    console.log(`🔌 Client connected: ${clientId}`);
    
    // Handle messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            await handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        handleDisconnection(clientId);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId: clientId,
        timestamp: Date.now()
    }));
});

// 📨 WebSocket Message Handler
async function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'auth':
            await handleAuth(ws, data.user);
            break;
        case 'battle_action':
            await handleBattleAction(ws, data);
            break;
        case 'wayground_message':
            await handleWaygroundMessage(ws, data);
            break;
        case 'room_join':
            await handleRoomJoin(ws, data);
            break;
        case 'room_leave':
            await handleRoomLeave(ws, data);
            break;
    }
}

// 🔐 Authentication Handler
async function handleAuth(ws, userData) {
    if (!userData || !userData.id) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid user data'
        }));
        return;
    }
    
    // Store user connection
    ws.userId = userData.id;
    
    // Get or create user
    let user = users.get(userData.id);
    if (!user) {
        user = {
            id: userData.id,
            name: userData.name || 'Anonymous',
            avatar: userData.avatar || 'A',
            level: 1,
            xp: 0,
            gold: 100,
            energy: 1000,
            maxEnergy: 1000,
            mining: {
                balance: 0,
                tapPower: 1,
                autoTapRate: 0,
                critChance: 5
            },
            achievements: [],
            lastSeen: Date.now()
        };
        users.set(userData.id, user);
        updateLeaderboard();
    }
    
    // Update last seen
    user.lastSeen = Date.now();
    
    // Send user data
    ws.send(JSON.stringify({
        type: 'auth_success',
        user: user,
        leaderboard: leaderboard.slice(0, 10)
    }));
    
    console.log(`✅ User authenticated: ${user.name} (${user.id})`);
}

// ⚔️ Battle Action Handler
async function handleBattleAction(ws, data) {
    const { action, battleId, answer } = data;
    
    if (!ws.userId || !battleId) {
        return;
    }
    
    const battle = battles.get(battleId);
    if (!battle) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Battle not found'
        }));
        return;
    }
    
    switch (action) {
        case 'join':
            // Add user to battle
            if (!battle.participants.find(p => p.id === ws.userId)) {
                const user = users.get(ws.userId);
                battle.participants.push({
                    id: ws.userId,
                    name: user.name,
                    score: 0,
                    ready: false
                });
                
                // Notify all participants
                broadcastToBattle(battleId, {
                    type: 'battle_update',
                    battle: battle
                });
            }
            break;
            
        case 'answer':
            // Process answer
            const participant = battle.participants.find(p => p.id === ws.userId);
            if (participant && battle.currentQuestion) {
                const isCorrect = answer === battle.currentQuestion.correct;
                if (isCorrect) {
                    participant.score += 10;
                    
                    // Update user XP and Gold
                    const user = users.get(ws.userId);
                    user.xp += 5;
                    user.gold += 10;
                    updateLeaderboard();
                }
                
                // Mark as ready
                participant.ready = true;
                
                // Check if all participants answered
                if (battle.participants.every(p => p.ready)) {
                    // Move to next question or end battle
                    if (battle.questionIndex < battle.questions.length - 1) {
                        battle.questionIndex++;
                        battle.currentQuestion = battle.questions[battle.questionIndex];
                        battle.participants.forEach(p => p.ready = false);
                    } else {
                        // End battle
                        endBattle(battleId);
                    }
                }
                
                // Broadcast update
                broadcastToBattle(battleId, {
                    type: 'battle_update',
                    battle: battle
                });
            }
            break;
    }
}

// 🏛️ Wayground Message Handler
async function handleWaygroundMessage(ws, data) {
    const { roomId, message } = data;
    
    if (!ws.userId || !roomId || !message) {
        return;
    }
    
    const room = rooms.get(roomId);
    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
        }));
        return;
    }
    
    const user = users.get(ws.userId);
    const messageData = {
        id: uuidv4(),
        userId: ws.userId,
        userName: user.name,
        userAvatar: user.avatar,
        message: message,
        timestamp: Date.now()
    };
    
    // Add message to room
    room.messages.push(messageData);
    
    // Broadcast to room members
    broadcastToRoom(roomId, {
        type: 'wayground_message',
        message: messageData
    });
}

// 🏠 Room Join Handler
async function handleRoomJoin(ws, data) {
    const { roomId } = data;
    
    if (!ws.userId || !roomId) {
        return;
    }
    
    const room = rooms.get(roomId);
    if (!room) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
        }));
        return;
    }
    
    // Add user to room
    if (!room.participants.find(p => p.id === ws.userId)) {
        const user = users.get(ws.userId);
        room.participants.push({
            id: ws.userId,
            name: user.name,
            avatar: user.avatar,
            joinedAt: Date.now()
        });
        
        // Send room data
        ws.send(JSON.stringify({
            type: 'room_joined',
            room: room
        }));
        
        // Notify others
        broadcastToRoom(roomId, {
            type: 'user_joined',
            user: {
                id: ws.userId,
                name: user.name,
                avatar: user.avatar
            }
        });
    }
}

// 🚪 Room Leave Handler
async function handleRoomLeave(ws, data) {
    const { roomId } = data;
    
    if (!ws.userId || !roomId) {
        return;
    }
    
    const room = rooms.get(roomId);
    if (room) {
        // Remove user from room
        room.participants = room.participants.filter(p => p.id !== ws.userId);
        
        // Notify others
        broadcastToRoom(roomId, {
            type: 'user_left',
            userId: ws.userId
        });
    }
}

// 📢 Broadcast Functions
function broadcastToBattle(battleId, data) {
    const battle = battles.get(battleId);
    if (battle) {
        battle.participants.forEach(participant => {
            const connection = Array.from(wss.clients)
                .find(client => client.userId === participant.id);
            if (connection && connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify(data));
            }
        });
    }
}

function broadcastToRoom(roomId, data) {
    const room = rooms.get(roomId);
    if (room) {
        room.participants.forEach(participant => {
            const connection = Array.from(wss.clients)
                .find(client => client.userId === participant.id);
            if (connection && connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify(data));
            }
        });
    }
}

// 🏆 End Battle Function
function endBattle(battleId) {
    const battle = battles.get(battleId);
    if (!battle) return;
    
    // Sort participants by score
    battle.participants.sort((a, b) => b.score - a.score);
    
    // Award prizes
    battle.participants.forEach((participant, index) => {
        const user = users.get(participant.id);
        if (user) {
            const prizes = [100, 50, 25, 10, 5]; // Gold prizes
            const xpPrizes = [100, 50, 25, 10, 5]; // XP prizes
            
            user.gold += prizes[index] || 5;
            user.xp += xpPrizes[index] || 5;
            
            // Check for achievements
            if (index === 0 && !user.achievements.includes('battle_winner')) {
                user.achievements.push('battle_winner');
            }
        }
    });
    
    updateLeaderboard();
    
    // Broadcast results
    broadcastToBattle(battleId, {
        type: 'battle_ended',
        battle: battle
    });
    
    // Remove battle
    battles.delete(battleId);
}

// 📊 Update Leaderboard
function updateLeaderboard() {
    leaderboard.length = 0;
    
    users.forEach(user => {
        leaderboard.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            level: user.level,
            xp: user.xp,
            gold: user.gold,
            achievements: user.achievements.length
        });
    });
    
    // Sort by XP
    leaderboard.sort((a, b) => b.xp - a.xp);
    
    // Broadcast leaderboard update
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'leaderboard_update',
                leaderboard: leaderboard.slice(0, 10)
            }));
        }
    });
}

// 🔌 Handle Disconnection
function handleDisconnection(clientId) {
    const ws = Array.from(wss.clients).find(client => client.clientId === clientId);
    if (ws && ws.userId) {
        // Update last seen
        const user = users.get(ws.userId);
        if (user) {
            user.lastSeen = Date.now();
        }
        
        // Remove from active rooms/battles
        rooms.forEach(room => {
            room.participants = room.participants.filter(p => p.id !== ws.userId);
        });
        
        battles.forEach(battle => {
            battle.participants = battle.participants.filter(p => p.id !== ws.userId);
        });
    }
}

// 🛠️ REST API Endpoints

// Get user data
app.get('/api/user/:userId', (req, res) => {
    const user = users.get(req.params.userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Save user progress
app.post('/api/user/:userId/save', (req, res) => {
    const userId = req.params.userId;
    const userData = req.body;
    
    const user = users.get(userId);
    if (user) {
        // Update user data
        Object.assign(user, userData);
        updateLeaderboard();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard.slice(0, 50));
});

// Create battle room
app.post('/api/battle/create', (req, res) => {
    const { mode, creatorId, topic, difficulty } = req.body;
    
    const battleId = uuidv4();
    const battle = {
        id: battleId,
        mode: mode || 'duel',
        creatorId: creatorId,
        topic: topic || 'general',
        difficulty: difficulty || 'medium',
        participants: [],
        questions: generateMockQuestions(topic, difficulty, 10),
        questionIndex: 0,
        currentQuestion: null,
        createdAt: Date.now(),
        status: 'waiting'
    };
    
    battles.set(battleId, battle);
    res.json({ battleId: battleId, battle: battle });
});

// Get active battles
app.get('/api/battles', (req, res) => {
    const activeBattles = Array.from(battles.values())
        .filter(battle => battle.status === 'waiting')
        .map(battle => ({
            id: battle.id,
            mode: battle.mode,
            topic: battle.topic,
            difficulty: battle.difficulty,
            participants: battle.participants.length,
            maxParticipants: battle.mode === 'duel' ? 2 : 4
        }));
    
    res.json(activeBattles);
});

// Create wayground room
app.post('/api/room/create', (req, res) => {
    const { type, topic, creatorId, name } = req.body;
    
    const roomId = uuidv4();
    const room = {
        id: roomId,
        type: type || 'study',
        topic: topic || 'general',
        creatorId: creatorId,
        name: name || `${type} Room`,
        participants: [],
        messages: [],
        createdAt: Date.now(),
        maxParticipants: 10
    };
    
    rooms.set(roomId, room);
    res.json({ roomId: roomId, room: room });
});

// Get active rooms
app.get('/api/rooms', (req, res) => {
    const activeRooms = Array.from(rooms.values())
        .map(room => ({
            id: room.id,
            type: room.type,
            topic: room.topic,
            name: room.name,
            participants: room.participants.length,
            maxParticipants: room.maxParticipants,
            createdAt: room.createdAt
        }));
    
    res.json(activeRooms);
});

// 🎯 Mock Question Generator
function generateMockQuestions(topic, difficulty, count) {
    const questions = {
        general: [
            { question: "O'zbekiston poytaxti qaysi shahar?", options: ["Toshkent", "Samarqand", "Buxoro", "Xiva"], correct: 0 },
            { question: "Dunyodagi eng uzun daryo qaysi?", options: ["Amudaryo", "Sirdaryo", "Nil", "Amazonka"], correct: 3 },
            { question: "Yil qancha oydan iborat?", options: ["10", "11", "12", "13"], correct: 2 }
        ],
        science: [
            { question: "Suvning kimyoviy formulasi nima?", options: ["H2O", "CO2", "O2", "N2"], correct: 0 },
            { question: "Yorug'lik tezligi nechchi?", options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correct: 0 }
        ],
        tech: [
            { question: "HTML qisqartmasi nima degani?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"], correct: 0 }
        ]
    };
    
    const selectedQuestions = questions[topic] || questions.general;
    const result = [];
    
    for (let i = 0; i < Math.min(count, selectedQuestions.length); i++) {
        result.push(selectedQuestions[i]);
    }
    
    return result;
}

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 NEXUS QUANTUM API Server running on port ${PORT}`);
    console.log(`🌐 WebSocket server ready`);
});

// 🧹 Cleanup inactive users every 5 minutes
setInterval(() => {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    users.forEach((user, userId) => {
        if (now - user.lastSeen > inactiveThreshold) {
            // Remove from active rooms/battles
            rooms.forEach(room => {
                room.participants = room.participants.filter(p => p.id !== userId);
            });
            
            battles.forEach(battle => {
                battle.participants = battle.participants.filter(p => p.id !== userId);
            });
        }
    });
}, 5 * 60 * 1000);

module.exports = app;
