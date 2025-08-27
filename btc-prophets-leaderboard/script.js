// BTC Prophets Leaderboard JavaScript

class BTCProphetsLeaderboard {
    constructor() {
        this.currentTab = 'BTC Prophets';
        this.currentTimeframe = 'weekly';
        this.leaderboardData = this.generateSampleData();
        this.initializeEventListeners();
    }

    generateSampleData() {
        return {
            weekly: [
                { rank: 1, user: 'pepega', avatar: '🐸', profit: 1223, volume: 1223, roi: 40.96, rankChange: 2, hasInfinity: true, hasCrown: true },
                { rank: 2, user: 'idiotBoyBilly', avatar: '🔒', profit: 1223, volume: 1223, roi: 23.33, rankChange: -1, hasInfinity: true },
                { rank: 3, user: '0x6A0D57...6f35a', avatar: '👁️', profit: 1223, volume: 1223, roi: 17.32, rankChange: 1 },
                { rank: 4, user: 'cryptoCat', avatar: '👁️', profit: 1223, volume: 1223, roi: 8.13, rankChange: 0 },
                { rank: 5, user: 'libAnt', avatar: '🐸', profit: 1223, volume: 1223, roi: 7.20, rankChange: -1 },
                { rank: 6, user: '0x6A0D57...6f35a', avatar: '🕰️', profit: 1223, volume: 1223, roi: 4.28, rankChange: 0 },
                { rank: 7, user: 'FREE🇺🇸FREE🇺🇸PALESTINE🇵🇸', avatar: '🔒', profit: 1223, volume: 1223, roi: 3.53, rankChange: -1 },
                { rank: 8, user: '0xsmolrun', avatar: '✨', profit: 1223, volume: 1223, roi: 2.97, rankChange: 1 },
                { rank: 9, user: 'libAnt', avatar: '🐸', profit: 1223, volume: 1223, roi: 7.20, rankChange: 0 }
            ],
            daily: [
                { rank: 1, user: 'pepega', avatar: '🔒', profit: 1223, volume: 1223, roi: 40.96, rankChange: 0, hasInfinity: true, hasCrown: true },
                { rank: 2, user: 'cryptoWhale', avatar: '🐋', profit: 1150, volume: 1150, roi: 35.20, rankChange: 2 },
                { rank: 3, user: 'moonBoy', avatar: '🌙', profit: 980, volume: 980, roi: 28.50, rankChange: -1 }
            ]
        };
    }

    initializeEventListeners() {
        // Sub navigation tabs
        document.querySelectorAll('.sub-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.target.textContent);
            });
        });

        // History button
        document.querySelector('.history-btn').addEventListener('click', () => {
            this.showHistory();
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', (e) => {
            this.filterLeaderboard(e.target.value);
        });

        // Pro toggle
        document.getElementById('proToggle').addEventListener('change', (e) => {
            this.toggleProMode(e.target.checked);
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.sub-nav-item').forEach(item => {
            item.classList.remove('sub-nav-active');
            if (item.textContent === tabName) {
                item.classList.add('sub-nav-active');
            }
        });

        this.currentTab = tabName;
        
        if (tabName === 'BTC Prophets') {
            this.renderLeaderboard();
        } else {
            // Handle other tabs
            console.log(`Switched to ${tabName}`);
        }
    }

    renderLeaderboard(data = this.leaderboardData.weekly) {
        const tableBody = document.querySelector('.table-body');
        
        tableBody.innerHTML = data.map(user => `
            <div class="table-row">
                <div class="rank-cell">
                    ${user.rankChange !== 0 ? `
                        <span class="rank-indicator ${user.rankChange > 0 ? 'up' : 'down'}">
                            ${user.rankChange > 0 ? '▲' : '▼'} ${Math.abs(user.rankChange)}
                        </span>
                    ` : ''}
                    <span class="rank-number">${user.rank}</span>
                    ${user.hasInfinity ? '<span class="infinity-icon">∞</span>' : ''}
                </div>
                <div class="user-cell">
                    <div class="user-avatar-small">${user.avatar}</div>
                    <span class="username">${user.user}</span>
                    ${user.hasCrown ? '<span class="crown-icon">👑</span>' : ''}
                </div>
                <div class="profit-cell">$${user.profit.toLocaleString()}</div>
                <div class="volume-cell">$${user.volume.toLocaleString()}</div>
                <div class="roi-cell positive">+${user.roi}%</div>
            </div>
        `).join('');
    }

    updateLegendCards(timeframe = 'weekly') {
        const weeklyData = this.leaderboardData.weekly[0];
        const dailyData = this.leaderboardData.daily[0];
        
        // This would typically come from an API
        // For now, using the top performer from each timeframe
    }

    filterLeaderboard(searchTerm) {
        const filteredData = this.leaderboardData.weekly.filter(user => 
            user.user.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderLeaderboard(filteredData);
    }

    showHistory() {
        alert('History functionality would open a modal or navigate to history page');
    }

    toggleProMode(isEnabled) {
        console.log('Pro mode:', isEnabled ? 'Enabled' : 'Disabled');
        // Add pro mode functionality here
    }

    // Simulate real-time updates
    startRealTimeUpdates() {
        setInterval(() => {
            // Simulate rank changes and profit updates
            this.leaderboardData.weekly.forEach(user => {
                // Small random changes
                user.profit += Math.floor(Math.random() * 20 - 10);
                user.roi += (Math.random() - 0.5) * 0.1;
                user.roi = Math.max(0, user.roi); // Keep ROI positive for demo
            });
            
            // Re-sort by profit
            this.leaderboardData.weekly.sort((a, b) => b.profit - a.profit);
            
            // Update ranks
            this.leaderboardData.weekly.forEach((user, index) => {
                const oldRank = user.rank;
                user.rank = index + 1;
                user.rankChange = oldRank - user.rank;
            });
            
            this.renderLeaderboard();
        }, 30000); // Update every 30 seconds
    }
}

// Initialize the leaderboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const leaderboard = new BTCProphetsLeaderboard();
    
    // Start real-time updates (optional)
    // leaderboard.startRealTimeUpdates();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Navigate tabs with number keys
    if (e.key >= '1' && e.key <= '3') {
        const tabs = document.querySelectorAll('.sub-nav-item');
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
            tabs[index].click();
        }
    }
    
    // Focus search with Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input').focus();
    }
});