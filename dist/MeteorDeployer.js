"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const MeteorSettings_1 = require("./MeteorSettings");
class MeteorDeployer {
    constructor(settingsPath, buildPath) {
        this.settingsPath = settingsPath;
        this.settings = new MeteorSettings_1.default(settingsPath);
        this.buildPath = buildPath;
    }
    createBuild() {
        console.log('=> Creating Bundle');
        const command = `meteor build --allow-superuser --directory ${this.buildPath}/${this.settings.name} --server http://${this.settings.name}:${this.settings.PORT}`;
        child_process_1.execSync(command, { stdio: 'inherit' });
    }
    copySettings() {
        console.log('=> Copying settings file');
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.settingsPath, destination);
        console.log(`\t${this.settings} copied to ${destination}`);
    }
    createPackageFile() {
        console.log('=> Creating package.json');
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
        console.log(`\tpackage.json created at ${destination}`);
    }
    createDockerfile() {
        console.log('=> Creating Dockerfile');
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
        EXPOSE 3000`;
        const destination = path.join(this.buildPath, this.settings.name, 'bundle', 'Dockerfile');
        fs.writeFileSync(destination, file);
        console.log(`\tDockerfile created at ${destination}`);
    }
}
// const deployer = new MeteorDeployer();
// deployer.run(process.argv);
