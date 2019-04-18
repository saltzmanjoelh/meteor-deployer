"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const MeteorSettings_1 = require("./MeteorSettings");
const Logger_1 = require("./Logger");
class MeteorDeployer {
    /**
     * Decodes the settings file at settingsPath into the settings property. `buildPath` is stored for use later
     * @param {string} Path to the settings file passed with `meteor --setting production.json`
     * @param {string} Path to where you want the bundle built at
     */
    constructor(settingsPath, buildPath) {
        this.settingsPath = settingsPath;
        this.settings = MeteorSettings_1.MeteorSettings.parseSettingsFile(settingsPath);
        this.buildPath = buildPath;
    }
    /**
     * Builds the bundle using the values in the settings file.
     */
    createBuild() {
        Logger_1.Logger.log('=> Creating Bundle');
        const command = `meteor build --allow-superuser --directory ${this.buildPath}/${this.settings.name} --server http://${this.settings.name}:${this.settings.PORT}`;
        child_process_1.execSync(command, { stdio: 'inherit' });
    }
    /**
     * Copies the settings file into the bundle root as `settings.json`
     */
    copySettings() {
        Logger_1.Logger.log('=> Copying settings file');
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.settingsPath, destination);
        Logger_1.Logger.log(`\t${this.settings} copied to ${destination}`);
    }
    /**
     * Creates the `package.json` file at the root of the bundle for launching the app.
     */
    createPackageFile() {
        Logger_1.Logger.log('=> Creating package.json');
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
        Logger_1.Logger.log(`\tpackage.json created at ${destination}`);
    }
    /**
     * Creates a `dockerfile` in the root of the bundle for building an image. The image will contain the bundle
     * within the docker image.
     */
    createDockerfile() {
        Logger_1.Logger.log('=> Creating Dockerfile');
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
        Logger_1.Logger.log(`\tDockerfile created at ${destination}`);
    }
}
// const deployer = new MeteorDeployer();
// deployer.run(process.argv);
