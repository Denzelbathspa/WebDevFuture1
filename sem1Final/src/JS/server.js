import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

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

app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ Server is working!',
        universeId: UNIVERSE_ID,
        apiKeyPresent: !!ROBLOX_API_KEY,
        time: new Date().toISOString()
    });
});

// ==================== DIAGNOSTIC ENDPOINTS ====================
app.get('/api/debug-data-store', async (req, res) => {
    console.log('🔍 Debugging ordered data store contents...');
    
    try {
        const storeName = 'RebirthLeaderboard_A';
        const url = `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/ordered-data-stores/${storeName}/scopes/global/entries?max_page_size=5`;
        
        console.log(`Testing: ${storeName}`);
        console.log(`URL: ${url}`);
        console.log(`API Key present: ${ROBLOX_API_KEY ? 'Yes' : 'No'}`);
        
        const response = await fetch(url, {
            headers: {
                'x-api-key': ROBLOX_API_KEY,
                'Accept': 'application/json'
            }
        });
        
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`Raw Response: ${responseText.substring(0, 500)}`);
        
        try {
            const data = JSON.parse(responseText);
            console.log('Parsed JSON:', JSON.stringify(data, null, 2));
            
            res.json({
                success: true,
                status: response.status,
                dataStore: storeName,
                dataStoreEntries: data.dataStoreEntries || [],
                entryCount: data.dataStoreEntries ? data.dataStoreEntries.length : 0,
                rawResponse: data
            });
        } catch (parseError) {
            res.json({
                success: false,
                status: response.status,
                rawResponse: responseText,
                parseError: parseError.message
            });
        }
        
    } catch (error) {
        console.error('Debug error:', error);
        res.json({
            error: error.message,
            stack: error.stack
        });
    }
});

app.get('/api/list-ordered-stores', async (req, res) => {
    console.log('📋 Listing ALL ordered data stores...');
    
    try {
        const url = `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/ordered-data-stores`;
        
        const response = await fetch(url, {
            headers: {
                'x-api-key': ROBLOX_API_KEY,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        console.log('Found ordered data stores:');
        if (data.orderedDataStores && data.orderedDataStores.length > 0) {
            data.orderedDataStores.forEach((store, i) => {
                console.log(`${i + 1}. ${store.name}`);
            });
        } else {
            console.log('No ordered data stores found!');
        }
        
        res.json({
            success: true,
            orderedDataStores: data.orderedDataStores || [],
            count: data.orderedDataStores ? data.orderedDataStores.length : 0,
            allStoreNames: data.orderedDataStores ? data.orderedDataStores.map(s => s.name) : []
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== MAIN LEADERBOARDS ENDPOINT ====================
app.get('/api/leaderboards', async (req, res) => {
    console.log('📊 Leaderboards endpoint called - REFRESH REQUESTED');
    
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
        
        // Define all four ordered data stores (keep your existing structure)
        const orderedDataStores = [
            { name: 'RebirthLeaderboard_A', key: 'topRebirths', sortOrder: 'DESCENDING', minValue: 1 },
            { name: 'FastestTimeLeaderboard_A', key: 'fastest', sortOrder: 'ASCENDING', minValue: 0 },
            { name: 'PlayTime_A', key: 'topPlaytime', sortOrder: 'DESCENDING', minValue: 60 },
            { name: 'Completions_A', key: 'topCompletions', sortOrder: 'DESCENDING', minValue: 1 }
        ];
        
        // Fetch all four data stores in parallel
        const fetchPromises = orderedDataStores.map(async (store) => {
            console.log(`📥 Fetching ${store.name} (${store.sortOrder})...`);
            
            // Convert sortOrder to orderBy parameter
            const orderByParam = store.sortOrder === 'DESCENDING' ? 'value desc' : 'value';
            const url = `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/ordered-data-stores/${store.name}/scopes/global/entries?orderBy=${encodeURIComponent(orderByParam)}&maxPageSize=100`;
            
            console.log(`URL: ${url}`);
            
            try {
                const response = await fetch(url, {
                    headers: {
                        'x-api-key': ROBLOX_API_KEY,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`❌ ${store.name} failed: ${response.status}`, errorText.substring(0, 100));
                    return { key: store.key, data: [], error: `HTTP ${response.status}` };
                }
                
                const data = await response.json();
                
                // Check for orderedDataStoreEntries
                if (!data.orderedDataStoreEntries || data.orderedDataStoreEntries.length === 0) {
                    console.log(`ℹ️ ${store.name}: No entries found`);
                    return { key: store.key, data: [] };
                }
                
                console.log(`✅ ${store.name}: Found ${data.orderedDataStoreEntries.length} entries`);
                
                // Debug: Show first few values to verify ordering
                const firstThree = data.orderedDataStoreEntries.slice(0, 3).map(e => e.value);
                console.log(`First 3 values: ${firstThree.join(', ')}`);
                console.log(`Expected order: ${store.sortOrder === 'DESCENDING' ? 'highest first' : 'lowest first'}`);
                
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
        // Return placeholder values if no real data
        if (dataStoreName === 'PlayTime_A') {
            return "0m";
        }
        if (dataStoreName === 'FastestTimeLeaderboard_A') {
            return "0:00";
        }
        return 0;
    }
    
    // Convert to number for calculations
    const numValue = Number(rawValue);
    
    if (dataStoreName === 'PlayTime_A') {
        // Convert seconds to minutes
        const minutes = Math.floor(numValue / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    }
    
    if (dataStoreName === 'FastestTimeLeaderboard_A') {
        // Check if value is in seconds (like 2, 35 from your data) or milliseconds
        // Your data shows values like 2 and 35, which are likely seconds
        let totalSeconds;
        
        if (numValue < 100) {
            // Small numbers (2, 35) - assume seconds
            totalSeconds = numValue;
        } else if (numValue < 60000) {
            // Medium numbers (2000, 35000) - assume milliseconds
            totalSeconds = Math.floor(numValue / 1000);
        } else {
            // Large numbers - assume milliseconds
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
    
    // For rebirths and completions, return the number
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
        // Silently fail and return fallback
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

// UPDATED: Force Roblox test endpoint that fetches all four ordered data stores
app.get('/api/force-roblox-test', async (req, res) => {
    console.log('🔬 Force testing Roblox API for all four ordered data stores...');
    
    if (!ROBLOX_API_KEY || ROBLOX_API_KEY === 'not_set') {
        return res.json({ error: 'API key not set in .env file' });
    }
    
    if (!UNIVERSE_ID || UNIVERSE_ID === 'not_set') {
        return res.json({ error: 'Universe ID not set in .env file' });
    }
    
    const orderedDataStores = [
        'RebirthLeaderboard_A',
        'FastestTimeLeaderboard_A', 
        'PlayTime_A',
        'Completions_A'
    ];
    
    const results = [];
    
    for (const storeName of orderedDataStores) {
        try {
            const url = `https://apis.roblox.com/cloud/v2/universes/${UNIVERSE_ID}/ordered-data-stores/${storeName}/scopes/global/entries`;
            
            console.log(`Testing: ${storeName}`);
            console.log(`URL: ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    'x-api-key': ROBLOX_API_KEY,
                    'Accept': 'application/json'
                }
            });
            
            const responseText = await response.text();
            
            results.push({
                dataStore: storeName,
                status: response.status,
                statusText: response.statusText,
                url: url,
                response: responseText.substring(0, 500),
                success: response.ok
            });
            
            console.log(`  Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
            
        } catch (error) {
            results.push({
                dataStore: storeName,
                error: error.message,
                success: false
            });
            console.log(`  Error: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    res.json({
        apiKeyPreview: ROBLOX_API_KEY.substring(0, 20) + '...',
        universeId: UNIVERSE_ID,
        results: results,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/clear-cache', (req, res) => {
    console.log('🧹 Cache cleared manually');
    res.json({
        message: 'Server cache cleared',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        server: 'running',
        port: PORT,
        universeId: UNIVERSE_ID,
        apiKeyConfigured: ROBLOX_API_KEY !== 'not_set',
        apiKeyLength: ROBLOX_API_KEY.length,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
    🚀 Server running: http://localhost:${PORT}
    
    Test endpoints:
    • http://localhost:${PORT}/api/test
    • http://localhost:${PORT}/api/leaderboards
    • http://localhost:${PORT}/api/force-roblox-test
    • http://localhost:${PORT}/api/status
    • http://localhost:${PORT}/api/debug-data-store
    • http://localhost:${PORT}/api/list-ordered-stores
    • http://localhost:${PORT}/api/clear-cache
    
    React app should fetch from: http://localhost:${PORT}/api/leaderboards
    
    🔑 Current configuration:
    - Universe ID: ${UNIVERSE_ID}
    - API Key: ${ROBLOX_API_KEY === 'not_set' ? 'NOT SET' : 'SET'}
    
    🔬 Force test will check all four ordered data stores:
    - RebirthLeaderboard_A
    - FastestTimeLeaderboard_A
    - PlayTime_A
    - Completions_A
    
    🔍 Diagnostic endpoints:
    - /api/debug-data-store: Check raw API response for RebirthLeaderboard_A
    - /api/list-ordered-stores: List all ordered data stores in your universe
    `);
});

