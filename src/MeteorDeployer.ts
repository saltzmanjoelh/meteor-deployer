import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { MeteorSettings } from './MeteorSettings';
import { Logger } from './Logger';

class MeteorDeployer {

    /**
     * @property {string} buildPath Path to where you want the bundle built at
     * @property {MeteorSettings} settings Settings json decoded into a MeteorSettings object
     * @property {string} bundlePath The path to the built bundle
     * @property {string} dockerfilePath The path thhe Dockerfile that was created inside the bundle
     */
    public buildPath: string; 
    public settings: MeteorSettings;
    public bundlePath: string;
    public dockerfilePath: string;


    /**
     * Decodes the settings file at settingsPath into the settings property. `buildPath` is stored for use later
     * @param {MeteorSettings} settings `MeteorSettings` that have been parsed to be used with the build process.
     * @param {string} buildPath Path to where you want the bundle built at
     */
    public constructor(settings: MeteorSettings, buildPath: string) {
        this.settings = settings;
        this.buildPath = buildPath;
        this.bundlePath = path.join(this.buildPath, this.settings.name, 'bundle');
        this.dockerfilePath = path.join(this.bundlePath, 'Dockerfile');
    }

    /**
     * Builds the bundle, copies settings json, creates a package.json to launch the app and includes a Dockerfile
     * for building a docker image
     */
    public build(): void {
        this.createBuild();
        this.copySettings();
        this.createPackageFile();
        this.createDockerfile();
    }

    /**
     * Calls `docker build` with the Dockerfile in the built bundle directory
     * @param {string|null} tag Optional tag to be used with the Docker image
     */
    public dockerBuild(tag: string | null = null): void {
        Logger.log('=> Creating Docker image');
        fs.accessSync(this.buildPath, fs.constants.R_OK);
        const tagOption = (tag != null)? `--tag ${tag}`: '';
        const command = `docker build -f ${this.dockerfilePath} ${tagOption} ${this.buildPath}`;
        execSync(command, {stdio: 'inherit'});
    }

    /**
     * Builds the bundle using the values in the settings file.
     */
    public createBuild(): void {
        Logger.log('=> Creating Bundle');
        fs.accessSync(this.buildPath, fs.constants.W_OK);
        const destination = path.join(this.buildPath, this.settings.name);
        const command = `meteor build --allow-superuser --directory ${destination} --server ${this.settings.ROOT_URL}:${this.settings.PORT}`;
        execSync(command, {stdio: 'inherit'});
    }
    /**
     * Copies the settings file into the bundle root as `settings.json`
     */
    public copySettings(): void {
        Logger.log('=> Copying settings file');
        fs.accessSync(this.buildPath, fs.constants.W_OK);
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.settings.filePath, destination);
        Logger.log(`\t${this.settings.filePath} copied to ${destination}`);
    }
    /**
     * Creates the `package.json` file at the root of the bundle for launching the app.
     * @param {string} version Version number to be used in the package.json file
     */
    public createPackageFile(version: string = '1.0.0'): void {
        Logger.log('=> Creating package.json');
        
        const packageFile = {
            'name': 'app',
            'version': version,
            'scripts': {
                'start': 'METEOR_SETTINGS=$(cat settings.json) node main.js'
            }
        };
        const file = JSON.stringify(packageFile, null, ' ');
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'package.json');
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
        ENV MONGO_URL=${this.settings.MONGO_URL}
        ENV ROOT_URL=${this.settings.ROOT_URL}:${this.settings.PORT}/
        CMD ["npm", "start"]
        EXPOSE ${this.settings.PORT}`;
        const destination = this.dockerfilePath;
        fs.writeFileSync(destination, file);
        Logger.log(`\tDockerfile created at ${destination}`);
    }
}

export { MeteorDeployer };
// const deployer = new MeteorDeployer();
// deployer.run(process.argv);

