"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class MeteorSettings {
    // [selector: string]: string | undefined;
    constructor() {
        this.filePath = ''; //Location of deployment settings json file. Typically production.json
        this.name = ''; //The name of your application
        this.ROOT_URL = ''; //The url to where you are deploying your application (http://app.example.com)
        this.PORT = ''; //The port your app uses to access Meteor. (3000)
        this.MONGO_URL = ''; //The url that the app uses to access Mongo DB (mongodb+srv://user:password@cluster1.mongodb.net)
    }
    readFile(filePath) {
        if (filePath == '' || !fs.existsSync(filePath)) {
            throw `Invalid path to meteor settings file: ${filePath}`;
        }
        console.log(`=> Parsing deployment settings at path: ${filePath}`);
        let settingsPath = (path.isAbsolute(filePath)) ? filePath : path.join(process.cwd(), filePath);
        var obj = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const requiredKeys = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        let missingKeys = [];
        for (const key in requiredKeys) {
            if (obj.hasOwnProperty(key)) {
                this[key] = obj[key];
            }
            else {
                missingKeys.push(key);
            }
        }
        if (missingKeys.length > 0) {
            throw `Settings json file must include ${requiredKeys.join(', ')}\nDidn't find ${missingKeys.join(', ')}.`;
        }
    }
}
exports.default = MeteorSettings;
