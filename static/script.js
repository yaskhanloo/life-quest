// Game data structure
        let gameData = {
            currentXP: 0,
            currentLevel: 1,
            dailyQuests: {
                routine: false,
                meditate: false,
                exercise: false,
                german: false,
                diet: false,
                water: false,
                tracking: false,
                sleep: false
            },
            weeklyQuests: {
                work: false,
                health: false,
                germanWeekly: false,
                reflect: false,
                relationship: false,
                adulting: false
            },
            powerUps: {
                insight: 0,
                serotonin: 0,
                courage: 0,
                mvp: 0
            },
            lastResetDate: new Date().toDateString(),
            lastWeeklyReset: null,
            startDate: new Date().toISOString().split('T')[0]
        };

        // Quest data
 // Authentication elements
 const loginForm = document.getElementById('loginForm');
 const registerForm = document.getElementById('registerForm');
 const gameContainer = document.querySelector('.container'); // The main game content
 const authMessage = document.getElementById('authMessage');
 const logoutButton = document.getElementById('logoutButton');

 // Game data structure
        const dailyQuestData = [
            { key: 'routine', label: 'Completed the morning and evening routines', icon: '✅' },
            { key: 'meditate', label: 'Meditate or Journal (5+ minutes)', icon: '🧘‍♀️' },
            { key: 'exercise', label: 'Exercise or Walk (30+ minutes)', icon: '🏋️‍♀️' },
            { key: 'german', label: 'Practice German (20+ minutes)', icon: '📚' },
            { key: 'diet', label: 'Stick to low-carb, high-protein meals', icon: '🍽️' },
            { key: 'water', label: 'Drink 2+ liters of water', icon: '💧' },
            { key: 'tracking', label: 'Mood Track', icon: '🧠' },
            { key: 'sleep', label: 'In bed before 23:00', icon: '🛏️' }
        ];

        const weeklyQuestData = [
            { key: 'work', label: 'Finish one major work task', icon: '🧠' },
            { key: 'health', label: 'Lose 0.5–1 kg', icon: '🔍' },
            { key: 'germanWeekly', label: 'Finish a B1.2 module', icon: '🗣️' },
            { key: 'reflect', label: 'Weekly reflection', icon: '✍️' },
            { key: 'relationship', label: 'Quality time/date night', icon: '❤️' },
            { key: 'adulting', label: 'Finish chores', icon: '🧽' }
        ];

        const powerUpData = [
            { key: 'insight', label: 'Spark of Insight', xp: 10, icon: '💡', desc: 'Read something that gives a new idea' },
            { key: 'serotonin', label: 'Serotonin Boost', xp: 10, icon: '✨', desc: 'Do one thing just for joy, guilt-free' },
            { key: 'courage', label: 'Courage Token', xp: 15, icon: '🤝', desc: 'Have a procrastination overcome' },
            { key: 'mvp', label: 'MVP Move', xp: 15, icon: '🧩', desc: 'Make quantifiable progress on a project' }
        ];

 // Function to get the user token (assuming stored in local storage for now)
 function getUserToken() {
 return localStorage.getItem('userToken');
 }

 // Function to set the user token
 function setUserToken(token) {
 localStorage.setItem('userToken', token);
 }

 // Function to remove the user token
 function removeUserToken() {
 localStorage.removeItem('userToken');
 }

 // Load data from backend
        async function loadData() {
            try {
                const token = getUserToken();
                const response = await fetch('/load_game_data', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const savedData = await response.json();
                    gameData = { ...gameData, ...savedData };
                } else {
                    console.error('Failed to load game data:', response.statusText);
                }
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        }

 // Save data to backend
        async function saveData() {
            try {
                const token = getUserToken();
                await fetch('/save_game_data', {
                    method: 'POST',
                    headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(gameData)
                });
            } catch (error) {
                console.error('Error saving game data:', error);
            }
        }

        // Check for daily reset
        function checkDailyReset() {
            const today = new Date().toDateString();
            if (gameData.lastResetDate !== today) {
                gameData.dailyQuests = {
                    routine: false,
                    meditate: false,
                    exercise: false,
                    german: false,
                    diet: false,
                    water: false,
                    tracking: false,
                    sleep: false
                };
                gameData.lastResetDate = today;
                saveData();
            }
        }

        // Check for weekly reset (Sundays)
        function checkWeeklyReset() {
            const today = new Date();
            const lastReset = gameData.lastWeeklyReset ? new Date(gameData.lastWeeklyReset) : new Date(0);

            // Check if today is Sunday (0) and we haven't reset this week
            if (today.getDay() === 0 && today.toDateString() !== lastReset.toDateString()) {
                gameData.weeklyQuests = {
                    work: false,
                    health: false,
                    germanWeekly: false,
                    reflect: false,
                    relationship: false,
                    adulting: false
                };
                gameData.lastWeeklyReset = today.toDateString();
                saveData();
            }
        }

        // Update days left counter
        function updateDaysLeft() {
            const now = new Date();
            const juneEnd = new Date(now.getFullYear(), 5, 30); // June 30
            const daysLeft = Math.max(0, Math.ceil((juneEnd - now) / (1000 * 60 * 60 * 24)));

            const daysLeftElement = document.getElementById('daysLeft');
            if (daysLeft > 0) {
                daysLeftElement.textContent = `${daysLeft} days left in June`;
            } else {
                daysLeftElement.textContent = 'June is over! How did you do?';
            }
        }

        // Show level up animation
        function showLevelUp(newLevel) {
            const modal = document.getElementById('levelUpModal');
            const text = document.getElementById('levelUpText');
            text.textContent = `You're now Level ${newLevel}!`;
            modal.classList.remove('hidden');

            setTimeout(() => {
                modal.classList.add('hidden');
            }, 2000);
        }

        // Update level based on XP
        function updateLevel() {
            const newLevel = Math.min(5, Math.floor(gameData.currentXP / 100) + 1);
            if (newLevel > gameData.currentLevel) {
                gameData.currentLevel = newLevel;
                showLevelUp(newLevel);
            }
        }

        // Update UI displays
        function updateUI() {
            // Update level and XP display
            document.getElementById('levelDisplay').textContent = `Level ${gameData.currentLevel}`;
            document.getElementById('xpDisplay').textContent = `Total XP: ${gameData.currentXP}`;

            // Update progress bar
            const progressPercentage = gameData.currentXP % 100;
            document.getElementById('progressBar').style.width = `${progressPercentage}%`;

            // Update progress text
            const xpToNext = 100 - progressPercentage;
            const progressText = document.getElementById('progressText');
            if (gameData.currentLevel < 5) {
                progressText.textContent = `${xpToNext} XP to Level ${gameData.currentLevel + 1}`;
            } else {
                progressText.textContent = 'Max Level Reached! 🎉';
            }

            // Update counters
            const completedDaily = Object.values(gameData.dailyQuests).filter(Boolean).length;
            const completedWeekly = Object.values(gameData.weeklyQuests).filter(Boolean).length;

            document.getElementById('dailyCounter').textContent = `${completedDaily}/8`;
            document.getElementById('weeklyCounter').textContent = `${completedWeekly}/6`;
        }

        // Toggle daily quest
        function toggleDailyQuest(questKey) {
            const newState = !gameData.dailyQuests[questKey];
            gameData.dailyQuests[questKey] = newState;
 gameData.currentXP += newState ? 5 : -5; // Update XP locally first
            saveData();
 await saveData(); // Ensure data is saved before rendering/updating UI
            renderQuests();
            updateUI();
        }

        // Toggle weekly quest
        function toggleWeeklyQuest(questKey) {
            const newState = !gameData.weeklyQuests[questKey];
            gameData.weeklyQuests[questKey] = newState;
 gameData.currentXP += newState ? 20 : -20; // Update XP locally first
            saveData();
 await saveData(); // Ensure data is saved before rendering/updating UI
            renderQuests();
            updateUI();
        }

        // Add power-up
        function addPowerUp(powerUpKey) {
            const powerUp = powerUpData.find(p => p.key === powerUpKey);
            gameData.powerUps[powerUpKey]++;
 gameData.currentXP += powerUp.xp; // Update XP locally first
            saveData();
 await saveData(); // Ensure data is saved before rendering/updating UI
            renderPowerUps();
            updateUI();
        }

        // Render daily and weekly quests
        function renderQuests() {
            // Render daily quests
            const dailyContainer = document.getElementById('dailyQuests');
            dailyContainer.innerHTML = '';

            dailyQuestData.forEach(quest => {
                const questElement = document.createElement('div');
                questElement.className = `quest-item ${gameData.dailyQuests[quest.key] ? 'completed' : ''}`;
                questElement.onclick = () => toggleDailyQuest(quest.key);

                questElement.innerHTML = `
                    <span class="${gameData.dailyQuests[quest.key] ? 'check-icon' : 'unchecked-icon'}">
                        ${gameData.dailyQuests[quest.key] ? '✓' : '○'}
                    </span>
                    <span class="quest-icon">${quest.icon}</span>
                    <span class="quest-text">${quest.label}</span>
                `;

                dailyContainer.appendChild(questElement);
            });

            // Render weekly quests
            const weeklyContainer = document.getElementById('weeklyQuests');
            weeklyContainer.innerHTML = '';

            weeklyQuestData.forEach(quest => {
                const questElement = document.createElement('div');
                questElement.className = `quest-item weekly ${gameData.weeklyQuests[quest.key] ? 'completed' : ''}`;
                questElement.onclick = () => toggleWeeklyQuest(quest.key);

                questElement.innerHTML = `
                    <span class="${gameData.weeklyQuests[quest.key] ? 'check-icon' : 'unchecked-icon'}">
                        ${gameData.weeklyQuests[quest.key] ? '✓' : '○'}
                    </span>
                    <span class="quest-icon">${quest.icon}</span>
                    <span class="quest-text">${quest.label}</span>
                `;

                weeklyContainer.appendChild(questElement);
            });
        }

        // Render power-ups
        function renderPowerUps() {
            const container = document.getElementById('powerUps');
            container.innerHTML = '';

            powerUpData.forEach(powerUp => {
                const powerUpElement = document.createElement('div');
                powerUpElement.className = 'powerup-item';

                powerUpElement.innerHTML = `
                    <div class="powerup-header">
                        <div class="powerup-title">
                            <span style="font-size: 1.5rem;">${powerUp.icon}</span>
                            <span style="font-weight: 500;">${powerUp.label}</span>
                        </div>
                        <div class="powerup-controls">
                            <span class="powerup-count">${gameData.powerUps[powerUp.key]}x</span>
                            <button class="plus-btn" onclick="addPowerUp('${powerUp.key}')">+</button>
                        </div>
                    </div>
                    <p class="powerup-desc">${powerUp.desc}</p>
                    <p class="powerup-xp">+${powerUp.xp} XP</p>
                `;

                container.appendChild(powerUpElement);
            });
        }

        // Export progress
        function exportProgress() {
            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `life-quest-progress-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }

        // Reset progress
        function resetProgress() {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                gameData = {
                    currentXP: 0,
                    currentLevel: 1,
                    dailyQuests: {
                        routine: false,
                        meditate: false,
                        exercise: false,
                        german: false,
                        diet: false,
                        water: false,
                        tracking: false,
                        sleep: false
                    },
                    weeklyQuests: {
                        work: false,
                        health: false,
                        germanWeekly: false,
                        reflect: false,
                        relationship: false,
                        adulting: false
                    },
                    powerUps: {
                        insight: 0,
                        serotonin: 0,
                        courage: 0,
                        mvp: 0
                    },
                    lastResetDate: new Date().toDateString(),
                    lastWeeklyReset: null,
                    startDate: new Date().toISOString().split('T')[0]
                };

                saveData();
                renderQuests();
                renderPowerUps();
                updateUI();
            }
        }

        // Initialize the app
        function init() {
            loadData();
            checkDailyReset();
            checkWeeklyReset();
            updateDaysLeft();
            renderQuests();
            renderPowerUps();
            updateUI();
        }

        // Start the app when page loads
        document.addEventListener('DOMContentLoaded', init);