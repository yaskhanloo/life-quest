import sqlite3
from flask import g, current_app
import click
from flask.cli import with_appcontext

DATABASE = 'life_quest.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def close_db(e=None):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            game_data TEXT DEFAULT '{}'
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_state (
            user_id INTEGER PRIMARY KEY,
            currentXP INTEGER NOT NULL DEFAULT 0,
            currentLevel INTEGER NOT NULL DEFAULT 1,
            dailyQuests TEXT NOT NULL,
            weeklyQuests TEXT NOT NULL,
            powerUps TEXT NOT NULL,
            lastResetDate TEXT NOT NULL,
            lastWeeklyReset TEXT,
            startDate TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    db.commit()
    db.close()

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

# Placeholder for a schema file - we will create schema.sql next

if __name__ == '__main__':
    # This part is for testing the db creation directly
    # In a real Flask app, init_db_command would be used
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    # This table stores the game state for each user
    # We'll store the complex game data as a JSON string for simplicity initially
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_state (
            user_id INTEGER PRIMARY KEY,
            currentXP INTEGER NOT NULL DEFAULT 0,
            currentLevel INTEGER NOT NULL DEFAULT 1,
            dailyQuests TEXT NOT NULL, -- Store as JSON string
            weeklyQuests TEXT NOT NULL, -- Store as JSON string
            powerUps TEXT NOT NULL, -- Store as JSON string
            lastResetDate TEXT NOT NULL,
            lastWeeklyReset TEXT,
            startDate TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    db.commit()
    db.close()
    print(f"Database '{DATABASE}' initialized with users and game_state tables.")
