/**
 * GameDataLoader - Loads and processes game data from JSON
 * Converts function strings back to executable functions
 */

const fs = require('fs');
const path = require('path');

/**
 * Load game data from JSON file and convert function strings to functions
 */
function loadGameData(filePath) {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);
    
    // Recursively process the data to convert function strings
    return processData(data);
}

/**
 * Process data recursively, converting function objects to actual functions
 */
function processData(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => processData(item));
    }
    
    if (typeof obj === 'object') {
        // Check if this is a function marker
        if (obj.__fn__ === true && obj.source) {
            try {
                // Convert the function string to an actual function
                // Use Function constructor to create a function that has access to i18n via global
                // The function source references 'i18n' which will be looked up at runtime
                const fnSource = obj.source;
                
                // Create the function directly - i18n will be resolved from global scope at runtime
                // We use a factory function that creates the actual function when called
                const fn = (function(src) {
                    // This creates a function that, when called, will:
                    // 1. Get i18n from global
                    // 2. Eval and run the original function source
                    return function(...args) {
                        const i18n = global.i18n;
                        const actualFn = eval('(' + src + ')');
                        return actualFn.apply(this, args);
                    };
                })(fnSource);
                
                return fn;
            } catch (e) {
                console.error('Error evaluating function:', obj.source, e);
                return () => { return 'Error in function'; };
            }
        }
        
        // Process all properties recursively
        const result = {};
        for (const key in obj) {
            result[key] = processData(obj[key]);
        }
        return result;
    }
    
    return obj;
}

/**
 * Load both game data and i18n data
 * IMPORTANT: Load i18n data FIRST and set global.i18n before loading game_data
 * because the functions in game_data.json reference i18n.AvventuraNelCastelloJS
 */
function loadAllGameData() {
    const gameDataPath = path.join(__dirname, 'game_data.json');
    const i18nDataPath = path.join(__dirname, 'i18n_data.json');
    
    // Load i18n data FIRST
    let i18nData = {};
    if (fs.existsSync(i18nDataPath)) {
        i18nData = loadGameData(i18nDataPath);
    }
    
    // Set global.i18n BEFORE loading game_data.json
    // This is critical because the functions in game_data.json reference i18n.AvventuraNelCastelloJS
    global.i18n = i18nData;
    
    // Now load game_data.json - the eval'd functions will have access to global.i18n
    const gameData = loadGameData(gameDataPath);
    
    return {
        gameData,
        i18nData
    };
}

module.exports = {
    loadGameData,
    loadAllGameData,
    processData
};
