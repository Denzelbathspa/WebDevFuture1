import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// ==================== Middleware ==================== //
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY || 'not_set';
const UNIVERSE_ID = process.env.ROBLOX_UNIVERSE_ID || 'not_set';

console.log('🔧 Server starting...');
console.log('Universe ID:', UNIVERSE_ID);
console.log('API Key:', ROBLOX_API_KEY ? 'Set' : 'Not set');

// ==================== MAIN LEADERBOARDS ENDPOINT ====================
app.get('/api/leaderboards', async (req, res) => {
    console.log('📊 Leaderboards endpoint called');
    
    const startTime = Date.now();
    
    try {
        if (!ROBLOX_API_KEY || ROBLOX_API_KEY === 'not_set' || 
            !UNIVERSE_ID || UNIVERSE_ID === 'not_set') {
            console.log('Using fallback data (missing credentials)');
            const elapsed = Date.now() - startTime;
            return res.json({
                ...getFallbackData(),
                _metadata: {
                    source: 'fallback_no_creds',
                    connected: false,
                    error: 'Missing API credentials',
                    responseTime: `${elapsed}ms`,
                    timestamp: new Date().toISOString()
                }
            });
        }
        
        console.log('🔄 Fetching ordered leaderboard data...');
        
        // Define all four ordered data stores
        const orderedDataStores = [
            { name: 'RebirthLeaderboard_A', key: 'topRebirths', sortOrder: 'DESCENDING', minValue: 1 },
            { name: 'FastestTimeLeaderboard_A', key: 'fastest', sortOrder: 'ASCENDING', minValue: 0 },
            { name: 'PlayTime_A', key: 'topPlaytime', sortOrder: 'DESCENDING', minValue: 60 },
            { name: 'Completions_A', key: 'topCompletions', sortOrder: 'DESCENDING', minValue: 1 }
        ];
        
        // Fetch all four data stores in parallel
        const fetchPromises = orderedDataStores.map(async (store) => {
            console.log(`📥 Fetching ${store.name}...`);
            
            const orderByParam = store.sortOrder === 'DESCENDING' ? 'value desc' : 'value';
            const url = `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/ordered-data-stores/${store.name}/scopes/global/entries?orderBy=${encodeURIComponent(orderByParam)}&maxPageSize=100`;
            
            try {
                const response = await fetch(url, {
                    headers: {
                        'x-api-key': ROBLOX_API_KEY,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    console.log(`❌ ${store.name} failed: ${response.status}`);
                    return { key: store.key, data: [], error: `HTTP ${response.status}` };
                }
                
                const data = await response.json();
                
                if (!data.orderedDataStoreEntries || data.orderedDataStoreEntries.length === 0) {
                    console.log(`ℹ️ ${store.name}: No entries found`);
                    return { key: store.key, data: [] };
                }
                
                console.log(`✅ ${store.name}: Found ${data.orderedDataStoreEntries.length} entries`);
                
                // Filter for minimum value
                const filteredEntries = data.orderedDataStoreEntries.filter(entry => entry.value > store.minValue);
                
                if (filteredEntries.length === 0) {
                    console.log(`ℹ️ ${store.name}: No entries with value > ${store.minValue}`);
                    return { key: store.key, data: [] };
                }
                
                // Get top 10 filtered entries
                const topEntries = filteredEntries.slice(0, 10);
                
                // Format entries with rank and username
                const formattedEntries = await Promise.all(
                    topEntries.map(async (entry, index) => {
                        try {
                            const entryId = entry.id || entry.path.split('/').pop();
                            const rawValue = entry.value;
                            
                            // Get username from Roblox API
                            const username = await getUsernameFromUserId(entryId);
                            
                            // Format the value for display
                            const formattedValue = formatLeaderboardValue(store.name, rawValue);
                            
                            return {
                                rank: index + 1,
                                username: username,
                                value: formattedValue,
                                rawValue: rawValue,
                                playerId: entryId
                            };
                            
                        } catch (error) {
                            console.log(`Error processing entry in ${store.name}:`, error.message);
                            const entryId = entry.id || entry.path.split('/').pop();
                            const rawValue = entry.value || 0;
                            
                            return {
                                rank: index + 1,
                                username: `Player_${entryId.substring(0, 6)}`,
                                value: formatLeaderboardValue(store.name, rawValue),
                                rawValue: rawValue,
                                playerId: entryId
                            };
                        }
                    })
                );
                
                console.log(`🎯 ${store.name}: Returning ${formattedEntries.length} formatted entries`);
                return { key: store.key, data: formattedEntries };
                
            } catch (error) {
                console.error(`Error fetching ${store.name}:`, error.message);
                return { key: store.key, data: [], error: error.message };
            }
        });
        
        const results = await Promise.all(fetchPromises);
        const elapsed = Date.now() - startTime;
        
        // Build response object
        const responseData = {
            topRebirths: getFallbackData().topRebirths,
            fastest: getFallbackData().fastest,
            topPlaytime: getFallbackData().topPlaytime,
            topCompletions: getFallbackData().topCompletions
        };
        
        // Replace fallback data with real data where available
        let successfulFetches = 0;
        results.forEach(result => {
            if (result.data && result.data.length > 0) {
                responseData[result.key] = result.data;
                successfulFetches++;
            }
        });
        
        res.json({
            ...responseData,
            _metadata: {
                source: successfulFetches > 0 ? 'ordered_data_stores' : 'fallback',
                connected: successfulFetches > 0,
                successfulCategories: successfulFetches,
                totalCategories: 4,
                responseTime: `${elapsed}ms`,
                timestamp: new Date().toISOString(),
                note: successfulFetches > 0 
                    ? `✅ ${successfulFetches}/4 ordered leaderboards loaded!`
                    : '❌ No ordered data found, using fallback'
            }
        });
        
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`🔥 Error in ${elapsed}ms:`, error.message);
        
        res.json({
            ...getFallbackData(),
            _metadata: {
                source: 'fallback_error',
                connected: false,
                error: error.message,
                responseTime: `${elapsed}ms`,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Helper function to format values based on data store type
function formatLeaderboardValue(dataStoreName, rawValue) {
    if (rawValue === null || rawValue === undefined) {
        if (dataStoreName === 'PlayTime_A') {
            return "0m";
        }
        if (dataStoreName === 'FastestTimeLeaderboard_A') {
            return "0:00";
        }
        return 0;
    }
    
    const numValue = Number(rawValue);
    
    if (dataStoreName === 'PlayTime_A') {
        const minutes = Math.floor(numValue / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    }
    
    if (dataStoreName === 'FastestTimeLeaderboard_A') {
        let totalSeconds;
        
        if (numValue < 100) {
            totalSeconds = numValue;
        } else if (numValue < 60000) {
            totalSeconds = Math.floor(numValue / 1000);
        } else {
            totalSeconds = Math.floor(numValue / 1000);
        }
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const milliseconds = Math.floor((numValue % 1000) / 10);
        
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else if (seconds > 0) {
            return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
        } else {
            return `${numValue}ms`;
        }
    }
    
    return numValue;
}

// Get username from Roblox User ID
async function getUsernameFromUserId(userId) {
    try {
        const response = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            return userData.name || `Player_${userId.substring(0, 6)}`;
        }
    } catch (error) {
        // Silently fail
    }
    
    return `Player_${userId.substring(0, 6)}`;
}

function getFallbackData() {
    return {
        topRebirths: [
            { rank: 1, username: "ProPlayer1", value: 83 },
            { rank: 2, username: "GameMaster", value: 76 },
            { rank: 3, username: "WalkWarrior", value: 72 },
            { rank: 4, username: "SpeedRunner", value: 68 },
            { rank: 5, username: "CasualGamer", value: 65 },
            { rank: 6, username: "PizzaLover", value: 61 },
            { rank: 7, username: "Walker123", value: 58 },
            { rank: 8, username: "ChillPlayer", value: 55 },
            { rank: 9, username: "NewbiePro", value: 52 },
            { rank: 10, username: "JustWalking", value: 49 }
        ],
        topPlaytime: [
            { rank: 1, username: "TimeMaster", value: "325m" },
            { rank: 2, username: "Dedicated", value: "298m" },
            { rank: 3, username: "AlwaysOn", value: "276m" },
            { rank: 4, username: "Grinder", value: "254m" },
            { rank: 5, username: "Persistent", value: "231m" },
            { rank: 6, username: "Regular", value: "215m" },
            { rank: 7, username: "Frequent", value: "198m" },
            { rank: 8, username: "Occasional", value: "182m" },
            { rank: 9, username: "Casual", value: "167m" },
            { rank: 10, username: "Newcomer", value: "152m" }
        ],
        topCompletions: [
            { rank: 1, username: "Completionist", value: 142 },
            { rank: 2, username: "Finisher", value: 128 },
            { rank: 3, username: "Achiever", value: 115 },
            { rank: 4, username: "Perfectionist", value: 103 },
            { rank: 5, username: "Master", value: 97 },
            { rank: 6, username: "Expert", value: 86 },
            { rank: 7, username: "Skilled", value: 78 },
            { rank: 8, username: "Regular", value: 71 },
            { rank: 9, username: "Amateur", value: 64 },
            { rank: 10, username: "Beginner", value: 58 }
        ],
        fastest: [
            { rank: 1, username: "SpeedDemon", value: "1:24" },
            { rank: 2, username: "QuickSilver", value: "1:31" },
            { rank: 3, username: "Flash", value: "1:37" },
            { rank: 4, username: "Sonic", value: "1:42" },
            { rank: 5, username: "Rapid", value: "1:48" },
            { rank: 6, username: "Swift", value: "1:53" },
            { rank: 7, username: "Fast", value: "1:59" },
            { rank: 8, username: "Quick", value: "2:04" },
            { rank: 9, username: "Brisk", value: "2:11" },
            { rank: 10, username: "Speedy", value: "2:17" }
        ]
    };
}

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`
    🚀 Server running: http://localhost:${PORT}
    
    Available endpoint:
    • http://localhost:${PORT}/api/leaderboards
    
    🔑 Current configuration:
    - Universe ID: ${UNIVERSE_ID}
    - API Key: ${ROBLOX_API_KEY === 'not_set' ? 'NOT SET' : 'SET'}
    `);
});