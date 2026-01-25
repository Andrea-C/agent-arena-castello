/**
 * GameDataLoader - Loads and processes game data from JSON
 * Converts function strings back to executable functions
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_LANGUAGE = 'en';
const LOCALES_DIR = path.join(__dirname, 'locales');

/**
 * Deep merge two objects
 * @param {object} target - Target object
 * @param {object} source - Source object to merge into target
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && typeof source[key] !== 'function') {
            // If both target and source have the same key as an object, merge them recursively
            if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

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
        if (obj.__fn__ === true) {
            // Handle source-based functions (full function source code)
            if (obj.source) {
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
            // Handle template-based functions (args + template format)
            else if (obj.args && obj.template) {
                const argNames = obj.args;
                const template = obj.template;
                // Create a function that performs template substitution
                return function(...values) {
                    let result = template;
                    for (let i = 0; i < argNames.length; i++) {
                        result = result.replace(new RegExp('\\$\\{' + argNames[i] + '\\}', 'g'), values[i]);
                    }
                    return result;
                };
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
 * Load i18n data for a specific language
 * Falls back to DEFAULT_LANGUAGE if the requested language is not available
 * @param {string} language - Language code (e.g., 'en', 'it', 'es')
 * @returns {object} The loaded i18n data
 */
function loadI18nForLanguage(language = DEFAULT_LANGUAGE) {
    // Check if the language folder exists
    const langDir = path.join(LOCALES_DIR, language);
    
    if (!fs.existsSync(langDir)) {
        console.warn(`Language '${language}' not found, falling back to '${DEFAULT_LANGUAGE}'`);
        language = DEFAULT_LANGUAGE;
    }
    
    const i18nJsPath = path.join(LOCALES_DIR, language, 'i18n.js');
    const i18nDataPath = path.join(LOCALES_DIR, language, 'i18n_data.json');
    
    // Load the i18n.js module (contains static strings)
    let i18nStatic = {};
    if (fs.existsSync(i18nJsPath)) {
        // Clear require cache to ensure fresh load
        delete require.cache[require.resolve(i18nJsPath)];
        i18nStatic = require(i18nJsPath);
    }
    
    
    // Load and process i18n_data.json (contains game-specific text with functions)
    let i18nData = {};
    if (fs.existsSync(i18nDataPath)) {
        i18nData = loadGameData(i18nDataPath);
    }
    
    
    // Deep merge static and dynamic i18n data
    // This ensures nested objects (like AvventuraNelCastelloJSEngine.messages) are properly merged
    const mergedI18n = deepMerge(i18nStatic, i18nData);
    
    
    // Set global.i18n for runtime access by eval'd functions
    global.i18n = mergedI18n;
    
    return mergedI18n;
}

/**
 * Load both game data and i18n data
 * IMPORTANT: Load i18n data FIRST and set global.i18n before loading game_data
 * because the functions in game_data.json reference i18n.AvventuraNelCastelloJS
 * @param {string} language - Optional language code (default: 'en')
 */
function loadAllGameData(language = DEFAULT_LANGUAGE) {
    const gameDataPath = path.join(__dirname, 'game_data.json');
    
    // Load i18n data for the specified language FIRST
    const i18nData = loadI18nForLanguage(language);
    
    // Now load game_data.json - the eval'd functions will have access to global.i18n
    const gameData = loadGameData(gameDataPath);
    
    return {
        gameData,
        i18nData
    };
}

/**
 * Get the path to the locales directory
 */
function getLocalesDir() {
    return LOCALES_DIR;
}

module.exports = {
    loadGameData,
    loadAllGameData,
    loadI18nForLanguage,
    getLocalesDir,
    processData,
    DEFAULT_LANGUAGE
};
