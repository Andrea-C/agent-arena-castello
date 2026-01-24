/**
 * Parser for game commands
 * Adapted from source_app/IFEngine/js/Parser.js for server-side use
 */

class Parser {
    constructor(verbs, commands) {
        this.verbs = verbs;
        this.commands = commands;
        this.override = {};
    }

    setOverride(override) {
        this.override = override ? override : {};
    }

    parse(input) {
        // Either an imperative command or a verb
        let c = this._parse(input, this.commands, true);
        return c === false ? 
            this._parse(input, this.verbs, false) : 
            c;
    }

    _parse(input, sorgente, patternEsatto) {
        let override = patternEsatto ? 
            (this.override.commands === undefined ? {} : this.override.commands) :
            (this.override.verbs === undefined ? {} : this.override.verbs);

        for (let chiave in sorgente) {
            let obj = { ...sorgente[chiave] };
            
            let overrideObj = this._getSource(chiave, override);
            if (overrideObj) {
                if (typeof overrideObj == 'function') {
                    obj.callback = overrideObj;
                } else {
                    obj = { ...sorgente[chiave], ...overrideObj };
                }
            }

            let pattern = 
                obj.pattern === undefined ? 
                "(" + chiave + ")" : 
                (
                    typeof obj.pattern == 'function' ? 
                    obj.pattern() : 
                    (
                        obj.pattern.substr(0, 1) != "(" ? 
                        `(${obj.pattern})` :
                        obj.pattern
                    )
                );

            if (
                sorgente != this.commands && 
                override != this.override.commands && 
                input.indexOf(" ") == -1 && 
                (obj.singolo === undefined || obj.singolo == false)
            ) {
                let matches = input.match(new RegExp("^" + pattern + "$", 'i'));
                if (matches != null)
                    return input;
            }

            if (patternEsatto == false) {
                if (
                    (obj.movimento === undefined || obj.movimento == false) && 
                    (obj.complex === undefined || obj.complex == false)
                ) {
                    pattern += obj.singolo ? 
                        "(?:\\s+(.+))?" : 
                        "\\s+(.+)";
                }
            }

            pattern = new RegExp("^" + pattern + "$", 'i');
            let matches = input.match(pattern);

            if (matches != null) {
                let subjects = [];
                let i = 2;

                // If it's a movement and can be used alone
                // map direction with "direzione" attribute
                if (obj.direzione !== undefined) {
                    subjects.push(obj.direzione);
                } else {
                    // Map the "subjects" of the action
                    while (i < matches.length && matches[i] != undefined) {
                        subjects.push(matches[i].trim());
                        i++;
                    }
                }

                // Return object containing action and subjects
                return {
                    verb: chiave,
                    actionObject: obj,
                    command: sorgente == this.commands,
                    subjects: subjects
                };
            }
        }

        return false;
    }

    _getSource(key, source, separator) {
        if (separator === undefined)
            separator = "|";

        for (let k in source) {
            let i = k.split(separator);
            let p = i.filter((e) => { return key == e; });
            if (p.length > 0)
                return source[k];
        }

        return null;
    }
}

module.exports = Parser;
