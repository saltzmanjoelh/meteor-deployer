import * as fs from 'fs';
import * as path from 'path'

export default class MeteorSettings {
    filePath: string = '';   //Location of deployment settings json file. Typically production.json
    name: string = '';       //The name of your application
    ROOT_URL: string = '';   //The url to where you are deploying your application (http://app.example.com)
    PORT: string = '';       //The port your app uses to access Meteor. (3000)
    MONGO_URL: string = '';  //The url that the app uses to access Mongo DB (mongodb+srv://user:password@cluster1.mongodb.net)

    static parseConfigFile(filePath: string): MeteorSettings {
        if(filePath == '' || !fs.existsSync(filePath)){
            throw `Invalid path to meteor settings file: ${filePath}`;
        }
        console.log(`=> Parsing deployment settings at path: ${filePath}`);
        let settingsPath = (path.isAbsolute(filePath))? filePath : path.join(process.cwd(), filePath);
        var obj: MeteorSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        obj.validateProperties();
        return obj;
    }

    validateProperties() {
        type MeteorSettingsKeys = keyof MeteorSettings;
        const requiredKeys: MeteorSettingsKeys[] = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        let missingKeys: string[] = [];
        requiredKeys.forEach((key) => {
            const value = this.getProperty(key);
            if (value == '') {
                missingKeys.push(key);
            }
        });
        if (missingKeys.length > 0) {
            throw `Settings json file must include ${requiredKeys.join(', ')}\nDidn't find ${missingKeys.join(', ')}.`;
        }
    }
    getProperty<K extends keyof MeteorSettings>(key: K) {
        return this[key];  // Inferred type is T[K]
    }
    
}