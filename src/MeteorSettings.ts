import * as fs from 'fs';
import * as path from 'path';
import Logger from './Logger';

export default class MeteorSettings {
    /**
     * @property {string} filePath Location of meteor settings json file. Typically production.json
     * @property {string} name The name of your application
     * @property {string} ROOT_URL The url to where you are deploying your application (http://app.example.com)
     * @property {string} PORT The port your app uses to access Meteor. (3000)
     * @property {string} MONGO_URL The url that the app uses to access Mongo DB (mongodb://mongo.example.com:27017/admin)
     */
    public filePath: string = '';
    public name: string = '';
    public ROOT_URL: string = '';
    public PORT: string = '';
    public MONGO_URL: string = '';

    /**
     * Reads the meteor settings json file at `filePath`. Throws exception if any of the required properties haven't been found
     * @param {string} filePath Location of meteor settings json file. Typically production.json 
     * @throws
     * @returns {MeteorSettings} Returns a MeteorSettings object if the settings file contain all the required keys
     */
    public static parseSettingsFile(filePath: string): MeteorSettings {
        const settingsObj = this.readSettingsObj(filePath);
        return this.parseSettingsObj(settingsObj);
    }
    protected static readSettingsObj(filePath: string): MeteorSettings {
        if(filePath == '' || !fs.existsSync(filePath)){
            throw `Invalid path to meteor settings file: ${filePath}`;
        }
        Logger.log(`=> Parsing meteor settings at path: ${filePath}`);
        const settingsPath = (path.isAbsolute(filePath))? filePath : path.join(process.cwd(), filePath);
        const json = fs.readFileSync(settingsPath, 'utf8');
        const instance = JSON.parse(json) as MeteorSettings;
        instance.filePath = settingsPath;
        return instance;
    }
    protected static parseSettingsObj(settingsObj: MeteorSettings): MeteorSettings {
        type MeteorSettingsKeys = keyof MeteorSettings;
        const requiredKeys: MeteorSettingsKeys[] = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL', 'filePath'];
        const settings = new MeteorSettings();
        requiredKeys.forEach((key): void => {
            settings[key] = settingsObj[key];
        });
        settings.validateProperties();
        return settings;
    }

    /**
     * Makes sure that all required properties have been set and are not empty strings.
     * @throws
     */
    public validateProperties(): void {
        type MeteorSettingsKeys = keyof MeteorSettings;
        const requiredKeys: MeteorSettingsKeys[] = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        let missingKeys: string[] = [];
        requiredKeys.forEach((key): void => {
            const value = this[key];
            if (value == '') {
                missingKeys.push(key);
            }
        });
        if (missingKeys.length > 0) {
            throw `Settings json file must include ${requiredKeys.join(', ')}\nDidn't find ${missingKeys.join(', ')}.`;
        }
    }

    /**
     * Environment variables used when starting the meteor server
     */
    //???: Useful if you want a json string for env but why not use the settings.json file instead?
    public envString(): string {
        type MeteorSettingsKeys = keyof MeteorSettings;
        //TODO: Dynamically get the properties that have values?
        const requiredKeys: MeteorSettingsKeys[] = ['name', 'ROOT_URL', 'PORT', 'MONGO_URL'];
        let result = '';
        requiredKeys.forEach((key): void => {
            const value = this[key];
            if (value != '') {
                result += `${key}="${value}" `;
            }
        });
        return result
    }
    
}
export { MeteorSettings };