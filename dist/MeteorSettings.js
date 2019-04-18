"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Logger_1 = require("./Logger");
class MeteorSettings {
    constructor() {
        /**
         * @property {string} filePath Location of deployment settings json file. Typically production.json
         * @property {string} name The name of your application
         * @property {string} ROOT_URL The url to where you are deploying your application (http://app.example.com)
         * @property {string} PORT The port your app uses to access Meteor. (3000)
         * @property {string} MONGO_URL The url that the app uses to access Mongo DB (mongodb+srv://user:password@cluster1.mongodb.net)
         */
        this.filePath = '';
        this.name = '';
        this.ROOT_URL = '';
        this.PORT = '';
        this.MONGO_URL = '';
    }
    /**
     * Reads the  deployment settings json file at `filePath`. Throws exception if any of the required properties haven't been found
     * @param {string} filePath Location of deployment settings json file. Typically production.json
     * @throws
     * @returns {MeteorSettings} Returns a MeteorSettings object if the settings file contain all the required keys
     */
    static parseSettingsFile(filePath) {
        const settingsObj = this.readSettingsObj(filePath);
        return this.parseSettingsObj(settingsObj);
    }
    static readSettingsObj(filePath) {
        if (filePath == '' || !fs.existsSync(filePath)) {
            throw `Invalid path to meteor settings file: ${filePath}`;
        }
        Logger_1.Logger.log(`=> Parsing deployment settings at path: ${filePath}`);
        let settingsPath = (path.isAbsolute(filePath)) ? filePath : path.join(process.cwd(), filePath);
        const json = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(json);
    }
    static parseSettingsObj(settingsObj) {
        const requiredKeys = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        const settings = new MeteorSettings();
        requiredKeys.forEach((key) => {
            settings[key] = settingsObj[key];
        });
        settings.validateProperties();
        return settings;
    }
    /**
     * Makes sure that all required properties have been set and are not empty strings.
     * @throws
     */
    validateProperties() {
        const requiredKeys = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        let missingKeys = [];
        requiredKeys.forEach((key) => {
            const value = this[key];
            if (value == '') {
                missingKeys.push(key);
            }
        });
        if (missingKeys.length > 0) {
            throw `Settings json file must include ${requiredKeys.join(', ')}\nDidn't find ${missingKeys.join(', ')}.`;
        }
    }
}
exports.MeteorSettings = MeteorSettings;
