import * as fs from 'fs';
import * as path from 'path';
import Logger from './Logger';
import ConfigurationInterface from './ConfigurationInterface';

export default class Configuration implements ConfigurationInterface {
    /**
     * @property {string} filePath Location of meteor-deployer configuration json file. Typically production.config.json
     * @property {string} buildPath Output path to where the package should be built at
     */
    public filePath: string = process.cwd();
    public buildPath: string;

    /**
     * Deserializes the target.config.json file provided at filePath
     * @param {string} filePath Path to target.config.json file to parse.
     * @return {Configuration} Object that conforms to Configuration interface.
     */
    public static parseConfigFile(filePath: string): Configuration {
        if(filePath == '' || !fs.existsSync(filePath)){
            throw `Invalid config file: ${filePath}`;
        }
        Logger.log(`=> Parsing meteor config at path: ${filePath}`);
        let configPath = (path.isAbsolute(filePath))? filePath : path.join(process.cwd(), filePath);
        const json = fs.readFileSync(configPath, 'utf8');
        const obj = JSON.parse(json) as ConfigurationInterface;
        Configuration.validateJson(configPath, obj);
        let instance = new Configuration(obj);
        instance.filePath = configPath;
        return instance;
    }

    public static validateJson(configPath: string, obj: ConfigurationInterface): void {
        if(obj.buildPath == undefined){
            throw `${configPath} is missing "buildPath" key.`;
        }
    }

    public constructor(obj: ConfigurationInterface) {
        this.buildPath = obj.buildPath;
    }
}