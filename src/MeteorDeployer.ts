import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import Configuration from './Configuration';
import MeteorSettings from './MeteorSettings';
import Logger from './Logger';
import NpmPackageInterface from './NpmPackageInterface';

export default class MeteorDeployer {

    /**
     * Looks for `${target}.json` and `${target}.deployment.json` files to parse.
     * @param {string} target The name of the settings and configuration files to work with
     * @throws
     * @returns {MeteorDeployer}
     */
    public static parseTarget(target: string): MeteorDeployer {
        const meteorSettings = MeteorSettings.parseSettingsFile(`${target}.json`);
        const config = Configuration.parseConfigFile(`${target}.config.json`);
        return new MeteorDeployer(meteorSettings, config);
    }

    /**
     * @property {MeteorSettings} meteorSettings Settings json decoded into a MeteorSettings object.
     * @property {Configuration} config Configuration parsed from `${target}.deployment.json` file
     * @property {string} appName lowercase alphanumeric formatted app name from the MeteorSettings
     * @property {string} bundlePath The path to the built bundle.
     * @property {string} dockerfilePath The path thhe Dockerfile that was created inside the bundle.
     * @property {string} bundleVersion The version number parsed from the project's package.json file.
     */
    public meteorSettings: MeteorSettings;
    public config: Configuration;
    public appName: string;
    public bundlePath: string;
    public dockerfilePath: string;
    private _packageVersion: string = '0.0.0';
    // public s3Bucket: string|undefined;
    // private s3Key: string|undefined;
    // private s3Secret: string|undefined;

    /**
     * Decodes the settings file at settingsPath into the settings property. `buildPath` is stored for use later
     * @param {MeteorSettings} meteorSettings `MeteorSettings` that have been parsed to be used with the build process.
     * @param {Configuration} config Configuration parsed from `${target}.deployment.json` file
     */
    public constructor(meteorSettings: MeteorSettings, config: Configuration) {
        this.meteorSettings = meteorSettings;
        this.config = config;
        this.appName = meteorSettings.name.toLocaleLowerCase().replace(/[^a-z0-9-_]/gi,'');
        this.bundlePath = path.join(this.config.buildPath, this.appName, 'bundle');
        this.dockerfilePath = path.join(this.bundlePath, 'Dockerfile');
    }
    
    public packageVersion(): string {
        if(this._packageVersion == '0.0.0'){
            this._packageVersion = this.parsePackageVersion();
        }
        return this._packageVersion;
    }
    /**
     * Reads the package.json file at settings path to determine package version number.
     */
    public parsePackageVersion(): string {
        const npmPackage = this.readNpmPackageFile();
        const version = npmPackage.version as string;
        if(version == undefined ){
            throw `Version wasn't set in package.json`;
        } else if(version.split('.').length != 3){
            throw `Unexpected package version: ${version}`;
        }
        return version
    }
    /**
     * Reads the package.json file at settings path and returns an NpmPackageInterface
     * @returns {NpmPackageInterface}
     */
    public readNpmPackageFile(): NpmPackageInterface {
        const directory = path.dirname(this.meteorSettings.filePath);
        const filePath = path.join(directory, 'package.json');
        if(filePath == '' || !fs.existsSync(filePath)){
            throw `Invalid path to package.json: ${filePath}`;
        }
        Logger.log(`=> Parsing package.json at path: ${filePath}`);
        const json = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(json) as NpmPackageInterface;
    }

    /**
     * Builds the bundle, copies settings json, creates a package.json to launch the app and includes a Dockerfile
     * for building a docker image
     */
    public build(): void {
        Logger.log('=> Building')
        this.createBuild();
        this.copySettings();
        this.createPackageFile(this.packageVersion());
        this.createDockerfile();
        Logger.log('=> Done Building')
    }

    /**
     * Builds the bundle using the values in the settings file.
     */
    public createBuild(): void {
        Logger.log('=> Creating Bundle');
        if(!fs.existsSync(this.config.buildPath)){
            fs.mkdirSync(this.config.buildPath);
        }
        fs.accessSync(this.config.buildPath, fs.constants.W_OK);
        const destination = path.join(this.config.buildPath, this.appName);
        let command = `meteor build --allow-superuser --architecture=os.linux.x86_64 --server-only --directory "${destination}" --server ${this.meteorSettings.ROOT_URL}:${this.meteorSettings.PORT}`;
        if(process.cwd() != path.dirname(this.config.filePath)){
            command = `cd "${path.dirname(this.config.filePath)}" && ${command}`;
        }
        Logger.log(` Executing: ${command}`);
        execSync(command, {stdio: 'inherit'});
        Logger.log(` Bundle created at "${destination}"`);
    }
    
    /**
     * Copies the settings file into the bundle root as `settings.json`
     */
    public copySettings(): void {
        Logger.log('=> Copying settings file');
        fs.accessSync(this.config.buildPath, fs.constants.W_OK);
        const destination = path.join(this.config.buildPath, this.appName, 'bundle', 'settings.json');
        fs.copyFileSync(this.meteorSettings.filePath, destination);
        Logger.log(`  ${this.meteorSettings.filePath} copied to ${destination}`);
    }
    /**
     * Creates the `package.json` file at the root of the bundle for launching the app.
     * @param {string} version Version number to be used in the package.json file
     */
    public createPackageFile(version: string): void {
        Logger.log('=> Creating package.json');
        
        const packageFile = {
            'name': 'app',
            'version': version,
            'scripts': {
                'start': 'METEOR_SETTINGS=\"$(cat settings.json)\" node main.js'
            }
        };
        const file = JSON.stringify(packageFile, null, ' ');
        const destination = path.join(this.config.buildPath, this.appName, 'bundle', 'package.json');
        fs.writeFileSync(destination, file);
        Logger.log(`  package.json created at ${destination}`);
    }

    /**
     * Creates a `dockerfile` in the root of the bundle for building an image. The image will contain the bundle
     * within the docker image.
     */
    public createDockerfile(): void {
        //.dockerignore node_modules test files, docker files themselves
        //npm cache clean --force
        //-e "NODE_ENV=production"
        //-u "node"
        Logger.log('=> Creating Dockerfile');
        let file = `
        FROM saltzmanjoelh/meteor-alpine:latest
        ENV NODE_ENV production

        # Install build tools to compile native npm modules
        #RUN apk add --update build-base python
        # Create app directory
        RUN mkdir -p /usr/app
        COPY . /usr/app
        RUN cd /usr/app/programs/server && npm install --production
        WORKDIR /usr/app/
        ENV PORT=3000
        ENV MONGO_URL=${this.meteorSettings.MONGO_URL}
        ENV ROOT_URL=${this.meteorSettings.ROOT_URL}:${this.meteorSettings.PORT}/
        CMD ["npm", "start"]
        EXPOSE ${this.meteorSettings.PORT}`;
        const destination = this.dockerfilePath;
        fs.writeFileSync(destination, file);
        Logger.log(`  Dockerfile created at ${destination}`);
    }

    /**
     * Calls `docker build` with the Dockerfile in the built bundle directory
     * @param {string} tag Optional tag to be used with the Docker image
     */
    public dockerBuild(tag: string): void {
        Logger.log('=> Creating Docker image');
        fs.accessSync(this.config.buildPath, fs.constants.R_OK);
        const tagOption = `--tag ${this.appName}:${tag}`;
        let command = `docker build . ${tagOption}`;
        let path = process.cwd();
        if(path != this.bundlePath){
            command = `cd "${this.bundlePath}" && ${command}`;
        }
        execSync(command, {stdio: 'inherit'});
        Logger.log(`  Docker image ${this.appName}:${tag} created`);
    }

    /**
     * 
     * @param {string} bundlePath Built bundle directory
     * @param {string} buildPath  Root build path
     * @param {string} version Current app version number
     */
    public tarBundle(bundlePath: string, buildPath: string, version: string): void {
        Logger.log('=> Creating tar');
        fs.accessSync(bundlePath, fs.constants.R_OK);
        fs.accessSync(buildPath, fs.constants.R_OK);
        const filename = `${this.appName}_${version}.tar`;
        const destination = path.join(this.config.buildPath, this.appName, filename);
        const command = `tar -C "${bundlePath}" -czf "${destination}" .`;
        execSync(command, {stdio: 'inherit'});
    }
}

export { MeteorDeployer };

