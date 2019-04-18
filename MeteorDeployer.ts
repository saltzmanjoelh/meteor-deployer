import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { MeteorSettings } from './MeteorSettings';
import { Logger } from './Logger';

class MeteorDeployer {

    /**
     * @property {string} buildPath Path to where you want the bundle built at
     * @property {MeteorSettings} settings Settings json decoded into a MeteorSettings object
     */
    buildPath: string; 
    settings: MeteorSettings;


    /**
     * Decodes the settings file at settingsPath into the settings property. `buildPath` is stored for use later
     * @param {string} Path to the settings file passed with `meteor --setting production.json`
     * @param {string} Path to where you want the bundle built at
     */
    constructor(settings: MeteorSettings, buildPath: string) {
        this.settings = settings;
        this.buildPath = buildPath;
    }

    /**
     * Builds the bundle using the values in the settings file.
     */
    createBuild() {
        Logger.log('=> Creating Bundle');
        const destination = path.join(this.buildPath, this.settings.name);
        const command = `meteor build --allow-superuser --directory ${destination} --server http://${this.settings.ROOT_URL}:${this.settings.PORT}`;
        execSync(command, {stdio: 'inherit'});
    }
    /**
     * Copies the settings file into the bundle root as `settings.json`
     */
    copySettings() {
        Logger.log('=> Copying settings file');
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.settings.filePath, destination);
        Logger.log(`\t${this.settings.filePath} copied to ${destination}`);
    }
    /**
     * Creates the `package.json` file at the root of the bundle for launching the app.
     */
    createPackageFile() {
        Logger.log('=> Creating package.json');
        
        const packageFile = {
            'name': 'app',
            'version': '1.0.0',
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
    createDockerfile() {
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
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'Dockerfile');
        fs.writeFileSync(destination, file);
        Logger.log(`\tDockerfile created at ${destination}`);
    }
}

export { MeteorDeployer };
// const deployer = new MeteorDeployer();
// deployer.run(process.argv);

