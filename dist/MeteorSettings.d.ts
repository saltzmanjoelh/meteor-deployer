declare class MeteorSettings {
    /**
     * @property {string} filePath Location of deployment settings json file. Typically production.json
     * @property {string} name The name of your application
     * @property {string} ROOT_URL The url to where you are deploying your application (http://app.example.com)
     * @property {string} PORT The port your app uses to access Meteor. (3000)
     * @property {string} MONGO_URL The url that the app uses to access Mongo DB (mongodb+srv://user:password@cluster1.mongodb.net)
     */
    filePath: string;
    name: string;
    ROOT_URL: string;
    PORT: string;
    MONGO_URL: string;
    /**
     * Reads the  deployment settings json file at `filePath`. Throws exception if any of the required properties haven't been found
     * @param {string} filePath Location of deployment settings json file. Typically production.json
     * @throws
     * @returns {MeteorSettings} Returns a MeteorSettings object if the settings file contain all the required keys
     */
    static parseSettingsFile(filePath: string): MeteorSettings;
    static readSettingsObj(filePath: string): any;
    static parseSettingsObj(settingsObj: any): MeteorSettings;
    /**
     * Makes sure that all required properties have been set and are not empty strings.
     * @throws
     */
    validateProperties(): void;
}
export { MeteorSettings };
