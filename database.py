"""
Nexus Media Bot - SQLite Database Module
Real user data storage: XP, gold, level, streak, flashcards, quiz results
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "nexus_webapp.db")


def get_connection():
    """Get database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            full_name TEXT,
            xp INTEGER DEFAULT 0,
            gold INTEGER DEFAULT 100,
            level INTEGER DEFAULT 1,
            streak INTEGER DEFAULT 0,
            last_activity DATE,
            is_premium INTEGER DEFAULT 0,
            premium_until DATE,
            total_quizzes INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # XP History (for chart)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS xp_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            xp_amount INTEGER,
            date DATE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Quiz Results
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            topic TEXT,
            score INTEGER,
            total INTEGER,
            xp_earned INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Flashcards (user's wrong answers to review)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question TEXT,
            answer TEXT,
            times_reviewed INTEGER DEFAULT 0,
            last_reviewed TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Shop purchases
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_id TEXT,
            item_name TEXT,
            price INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Inventory (user's owned items)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_id TEXT,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, item_id)
        )
    """)
    
    conn.commit()
    conn.close()


# ========== USER OPERATIONS ==========
def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user data by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None


def create_user(user_id: int, username: str = "", full_name: str = "") -> Dict[str, Any]:
    """Create new user."""
    conn = get_connection()
    cursor = conn.cursor()
    
    today = datetime.now().date().isoformat()
    
    cursor.execute("""
        INSERT INTO users (user_id, username, full_name, last_activity)
        VALUES (?, ?, ?, ?)
    """, (user_id, username, full_name, today))
    
    # Initialize XP history with zeros for last 14 days
    for i in range(14):
        date = (datetime.now() - timedelta(days=13-i)).date().isoformat()
        cursor.execute("""
            INSERT INTO xp_history (user_id, xp_amount, date)
            VALUES (?, 0, ?)
        """, (user_id, date))
    
    conn.commit()
    conn.close()
    
    return get_user(user_id)


def get_or_create_user(user_id: int, username: str = "", full_name: str = "") -> Dict[str, Any]:
    """Get existing user or create new one."""
    user = get_user(user_id)
    if not user:
        user = create_user(user_id, username, full_name)
    return user


def update_user(user_id: int, **kwargs) -> Dict[str, Any]:
    """Update user fields."""
    conn = get_connection()
    cursor = conn.cursor()
    
    kwargs['updated_at'] = datetime.now().isoformat()
    
    set_clause = ", ".join([f"{k} = ?" for k in kwargs.keys()])
    values = list(kwargs.values()) + [user_id]
    
    cursor.execute(f"""
        UPDATE users SET {set_clause} WHERE user_id = ?
    """, values)
    
    conn.commit()
    conn.close()
    
    return get_user(user_id)


def add_xp(user_id: int, amount: int) -> Dict[str, Any]:
    """Add XP to user, handle level up, update streak."""
    user = get_or_create_user(user_id)
    
    new_xp = user['xp'] + amount
    new_level = (new_xp // 100) + 1
    
    # Streak logic
    today = datetime.now().date().isoformat()
    last_activity = user.get('last_activity')
    
    if last_activity:
        last_date = datetime.fromisoformat(last_activity).date()
        today_date = datetime.now().date()
        diff = (today_date - last_date).days
        
        if diff == 1:
            new_streak = user['streak'] + 1
        elif diff == 0:
            new_streak = user['streak']
        else:
            new_streak = 1
    else:
        new_streak = 1
    
    # Gold bonus for level up
    gold_bonus = 0
    if new_level > user['level']:
        gold_bonus = 50 * (new_level - user['level'])
    
    # Update user
    updated = update_user(
        user_id,
        xp=new_xp,
        level=new_level,
        streak=new_streak,
        gold=user['gold'] + gold_bonus,
        last_activity=today
    )
    
    # Update XP history for today
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE xp_history SET xp_amount = ?
        WHERE user_id = ? AND date = ?
    """, (new_xp, user_id, today))
    
    if cursor.rowcount == 0:
        cursor.execute("""
            INSERT INTO xp_history (user_id, xp_amount, date)
            VALUES (?, ?, ?)
        """, (user_id, new_xp, today))
    
    conn.commit()
    conn.close()
    
    return updated


def spend_gold(user_id: int, amount: int) -> bool:
    """Spend gold, return True if successful."""
    user = get_user(user_id)
    if not user or user['gold'] < amount:
        return False
    
    update_user(user_id, gold=user['gold'] - amount)
    return True


# ========== XP HISTORY ==========
def get_xp_history(user_id: int, days: int = 14) -> List[int]:
    """Get XP history for last N days."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT xp_amount FROM xp_history
        WHERE user_id = ?
        ORDER BY date DESC
        LIMIT ?
    """, (user_id, days))
    
    rows = cursor.fetchall()
    conn.close()
    
    # Reverse to get chronological order, pad with zeros if needed
    history = [row['xp_amount'] for row in reversed(rows)]
    while len(history) < days:
        history.insert(0, 0)
    
    return history


# ========== QUIZ RESULTS ==========
def add_quiz_result(user_id: int, topic: str, score: int, total: int) -> Dict[str, Any]:
    """Add quiz result and award XP."""
    conn = get_connection()
    cursor = conn.cursor()
    
    xp_earned = score * 10
    
    cursor.execute("""
        INSERT INTO quiz_results (user_id, topic, score, total, xp_earned)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, topic, score, total, xp_earned))
    
    # Update user stats
    user = get_user(user_id)
    update_user(
        user_id,
        total_quizzes=user['total_quizzes'] + 1,
        correct_answers=user['correct_answers'] + score
    )
    
    conn.commit()
    conn.close()
    
    # Add XP
    add_xp(user_id, xp_earned)
    
    return {"topic": topic, "score": score, "total": total, "xp_earned": xp_earned}


def get_quiz_results(user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent quiz results."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT topic, score, total, created_at FROM quiz_results
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (user_id, limit))
    
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        created = datetime.fromisoformat(row['created_at'])
        now = datetime.now()
        diff = (now - created).days
        
        if diff == 0:
            date_str = "Bugun"
        elif diff == 1:
            date_str = "Kecha"
        else:
            date_str = f"{diff} kun oldin"
        
        results.append({
            "topic": row['topic'],
            "score": row['score'],
            "total": row['total'],
            "date": date_str
        })
    
    return results


def get_quiz_history(user_id: int, days: int = 7) -> List[int]:
    """Get daily quiz performance (average %) for last N days."""
    conn = get_connection()
    cursor = conn.cursor()
    
    history = []
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-1-i)).date().isoformat()
        
        cursor.execute("""
            SELECT AVG(score * 100.0 / total) as avg_score
            FROM quiz_results
            WHERE user_id = ? AND DATE(created_at) = ?
        """, (user_id, date))
        
        row = cursor.fetchone()
        avg = row['avg_score'] if row['avg_score'] else 0
        history.append(int(avg))
    
    conn.close()
    return history


# ========== FLASHCARDS ==========
def add_flashcard(user_id: int, question: str, answer: str) -> int:
    """Add flashcard for user."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO flashcards (user_id, question, answer)
        VALUES (?, ?, ?)
    """, (user_id, question, answer))
    
    card_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return card_id


def get_flashcards(user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
    """Get user's flashcards."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, question, answer, times_reviewed FROM flashcards
        WHERE user_id = ?
        ORDER BY times_reviewed ASC, created_at DESC
        LIMIT ?
    """, (user_id, limit))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


def mark_flashcard_reviewed(card_id: int):
    """Mark flashcard as reviewed."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE flashcards
        SET times_reviewed = times_reviewed + 1, last_reviewed = ?
        WHERE id = ?
    """, (datetime.now().isoformat(), card_id))
    
    conn.commit()
    conn.close()


# ========== LEADERBOARD ==========
def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
    """Get top users by XP."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT user_id, username, full_name, xp, level
        FROM users
        ORDER BY xp DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    leaderboard = []
    for row in rows:
        name = row['full_name'] or row['username'] or f"User{row['user_id']}"
        leaderboard.append({
            "user_id": row['user_id'],
            "name": name,
            "xp": row['xp'],
            "level": row['level']
        })
    
    return leaderboard


# ========== SHOP & INVENTORY ==========
SHOP_ITEMS = [
    {"id": "hint", "name": "Hint", "icon": "💡", "price": 50, "description": "Savol uchun maslahat"},
    {"id": "fifty", "name": "50/50", "icon": "🎯", "price": 100, "description": "2 ta noto'g'ri javobni olib tashlash"},
    {"id": "freeze", "name": "Streak Freeze", "icon": "❄️", "price": 200, "description": "Streakni 1 kun saqlash"},
    {"id": "xp_boost", "name": "XP Boost", "icon": "⚡", "price": 500, "description": "2x XP 1 soat davomida"},
    {"id": "avatar_frame", "name": "Gold Frame", "icon": "🖼️", "price": 1000, "description": "Oltin avatar ramkasi"},
    {"id": "title_pro", "name": "Pro Title", "icon": "🏅", "price": 2000, "description": "'Pro' unvoni"}
]


def get_shop_items() -> List[Dict[str, Any]]:
    """Get all shop items."""
    return SHOP_ITEMS


def purchase_item(user_id: int, item_id: str) -> Dict[str, Any]:
    """Purchase item from shop."""
    item = next((i for i in SHOP_ITEMS if i['id'] == item_id), None)
    if not item:
        return {"success": False, "error": "Item topilmadi"}
    
    user = get_user(user_id)
    if not user:
        return {"success": False, "error": "Foydalanuvchi topilmadi"}
    
    if user['gold'] < item['price']:
        return {"success": False, "error": "Yetarli oltin yo'q"}
    
    # Deduct gold
    spend_gold(user_id, item['price'])
    
    # Add to inventory
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO inventory (user_id, item_id, quantity)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1
    """, (user_id, item_id))
    
    # Record purchase
    cursor.execute("""
        INSERT INTO purchases (user_id, item_id, item_name, price)
        VALUES (?, ?, ?, ?)
    """, (user_id, item_id, item['name'], item['price']))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "item": item, "new_gold": user['gold'] - item['price']}


def get_inventory(user_id: int) -> List[Dict[str, Any]]:
    """Get user's inventory."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT item_id, quantity FROM inventory
        WHERE user_id = ?
    """, (user_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    inventory = []
    for row in rows:
        item = next((i for i in SHOP_ITEMS if i['id'] == row['item_id']), None)
        if item:
            inventory.append({
                **item,
                "quantity": row['quantity']
            })
    
    return inventory


# ========== FULL USER DATA FOR WEBAPP ==========
def get_full_user_data(user_id: int, username: str = "", full_name: str = "") -> Dict[str, Any]:
    """Get complete user data for WebApp."""
    user = get_or_create_user(user_id, username, full_name)
    
    # Calculate level progress
    xp_for_current = (user['level'] - 1) * 100
    xp_for_next = user['level'] * 100
    progress = ((user['xp'] - xp_for_current) / (xp_for_next - xp_for_current)) * 100
    
    # Get leaderboard with current user marked
    leaderboard = get_leaderboard(10)
    for entry in leaderboard:
        entry['is_current'] = entry['user_id'] == user_id
    
    # Tier based on level
    if user['is_premium']:
        tier = "Premium"
    elif user['level'] >= 10:
        tier = "Expert"
    elif user['level'] >= 5:
        tier = "Advanced"
    else:
        tier = "Beginner"
    
    return {
        "user_id": user['user_id'],
        "username": user['username'],
        "full_name": user['full_name'],
        "xp": user['xp'],
        "gold": user['gold'],
        "level": user['level'],
        "streak": user['streak'],
        "tier": tier,
        "is_premium": bool(user['is_premium']),
        "quizzes_completed": user['total_quizzes'],
        "level_progress": int(progress),
        "xp_history": get_xp_history(user_id, 14),
        "quiz_history": get_quiz_history(user_id, 7),
        "quiz_results": get_quiz_results(user_id, 5),
        "flashcards": get_flashcards(user_id, 10),
        "leaderboard": leaderboard,
        "shop_items": get_shop_items(),
        "inventory": get_inventory(user_id)
    }


# Initialize database on import
init_database()
