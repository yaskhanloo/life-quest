import sqlite3
import json
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from .database import init_db, get_db

# Initialize the database before the first request


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key' # Replace with a strong secret key

# --- Helper Functions ---

def get_current_user():
    """Gets the logged-in user's ID from the session."""
    return session.get('user_id')

def save_user_data(user_id, game_data):
    """Saves the user's game data to the database."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE users SET game_data = ? WHERE id = ?", (json.dumps(game_data), user_id))
    db.commit()

def load_user_data(user_id):
    """Loads the user's game data from the database."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT game_data FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if row and row[0]:
        return json.loads(row[0])
    return None # Or return a default game_data structure if needed

# --- Routes ---

@app.route('/')
def index():
    user_id = get_current_user()
    if user_id:
        # User is logged in, load their data (optional, might do this via API later)
        # game_data = load_user_data(user_id)
 return render_template('index.html')

    else:
        # User is not logged in, show a landing or login page
        return render_template('login.html') # We'll create login.html later

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)
        
        db = get_db()
        cursor = db.cursor()
        
        try:
            cursor.execute("INSERT INTO users (username, password, game_data) VALUES (?, ?, ?)", 
                           (username, hashed_password, json.dumps({}))) # Save default empty game data
            db.commit()
            return redirect(url_for('login')) # Redirect to login after registration
        except sqlite3.IntegrityError:
            # Handle case where username already exists
            return render_template('register.html', error='Username already exists.')
            
    return render_template('register.html') # We'll create register.html later

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id, password FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user[1], password):
            session['user_id'] = user[0]
            return redirect(url_for('index')) # Redirect to index after successful login
        else:
            return render_template('login.html', error='Invalid username or password.')
            
    return render_template('index.html')

@app.route('/load_game_data', methods=['GET'])
def load_game_data():
 user_id = get_current_user()
 if user_id:
 game_data = load_user_data(user_id)
 if game_data is not None:
 return jsonify(game_data), 200
 else:
 # Return a default empty game data structure if none exists
 return jsonify({}), 200
 return jsonify({"error": "Unauthorized"}), 401

@app.route('/save_game_data', methods=['POST'])
def save_game_data():
 user_id = get_current_user()
 if user_id:
 game_data = request.json
 save_user_data(user_id, game_data)
 return jsonify({"message": "Game data saved successfully"}), 200
 return jsonify({"error": "Unauthorized"}), 401

if __name__ == '__main__':
 init_db()
    app.run(debug=True)