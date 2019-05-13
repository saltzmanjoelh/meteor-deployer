import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { Configuration } from './Configuration';
import { MeteorSettings } from './MeteorSettings';
import { Logger } from './Logger';

class MeteorDeployer {

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
     * @property {string} bundlePath The path to the built bundle.
     * @property {string} dockerfilePath The path thhe Dockerfile that was created inside the bundle.
     * @property {string} bundleVersion The version number parsed from the project's package.json file.
     */
    public meteorSettings: MeteorSettings;
    public config: Configuration;
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
        this.bundlePath = path.join(this.config.buildPath, this.meteorSettings.name, 'bundle');
        this.dockerfilePath = path.join(this.bundlePath, 'Dockerfile');
    }

    public packageVersion(): string {
        if(this._packageVersion == '0.0.0'){
            this._packageVersion = this.parsePackageVersion();
        }
        return this._packageVersion;
    }
    public parsePackageVersion(): string {
        return '1.0.0';
    }

    /**
     * Builds the bundle, copies settings json, creates a package.json to launch the app and includes a Dockerfile
     * for building a docker image
     */
    public build(): void {
        this.createBuild();
        this.copySettings();
        this.createPackageFile(this.packageVersion());
        this.createDockerfile();
    }

    /**
     * Calls `docker build` with the Dockerfile in the built bundle directory
     * @param {string} tag Optional tag to be used with the Docker image
     */
    public dockerBuild(tag: string): void {
        Logger.log('=> Creating Docker image');
        fs.accessSync(this.config.buildPath, fs.constants.R_OK);
        const tagOption = `--tag ${tag}`;
        const command = `docker build -f ${this.dockerfilePath} ${tagOption} ${this.config.buildPath}`;
        execSync(command, {stdio: 'inherit'});
    }

    /**
     * Builds the bundle using the values in the settings file.
     */
    public createBuild(): void {
        Logger.log('=> Creating Bundle');
        fs.accessSync(this.config.buildPath, fs.constants.W_OK);
        const destination = path.join(this.config.buildPath, this.meteorSettings.name);
        const command = `meteor build --allow-superuser --directory ${destination} --server ${this.meteorSettings.ROOT_URL}:${this.meteorSettings.PORT}`;
        execSync(command, {stdio: 'inherit'});
    }
    /**
     * Copies the settings file into the bundle root as `settings.json`
     */
    public copySettings(): void {
        Logger.log('=> Copying settings file');
        fs.accessSync(this.config.buildPath, fs.constants.W_OK);
        const destination = path.join(this.config.buildPath, this.meteorSettings.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.meteorSettings.filePath, destination);
        Logger.log(`\t${this.meteorSettings.filePath} copied to ${destination}`);
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
                'start': 'METEOR_SETTINGS=$(cat settings.json) node main.js'
            }
        };
        const file = JSON.stringify(packageFile, null, ' ');
        const destination = path.join(this.config.buildPath, this.meteorSettings.name, 'bundle', 'package.json');
        fs.writeFileSync(destination, file);
        Logger.log(`\tpackage.json created at ${destination}`);
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
        FROM node:latest
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
        Logger.log(`\tDockerfile created at ${destination}`);
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
        const filename = `${this.meteorSettings.name}_${version}.tar`;
        const destination = path.join(this.config.buildPath, this.meteorSettings.name, filename);
        const command = `tar -C ${bundlePath} -czf ${destination} .`;
        execSync(command, {stdio: 'inherit'});
    }
}

export { MeteorDeployer };

