import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import MeteorSettings from './MeteorSettings';

class MeteorDeployer {

    configPath: string
    buildPath: string; //Path to where you want the bundle built at
    config: MeteorSettings;

    constructor(configPath: string, buildPath: string) {
        this.configPath = configPath;
        this.config = MeteorSettings.parseConfigFile(configPath);
        this.buildPath = buildPath;
    }

    createBuild() {
        console.log('=> Creating Bundle');
        const command = `meteor build --allow-superuser --directory ${this.buildPath}/${this.config.name} --server http://${this.config.name}:${this.config.PORT}`;
        execSync(command, {stdio: 'inherit'});
    }
    copySettings() {
        console.log('=> Copying settings file');
        const destination = path.join(this.buildPath, this.config.name, 'bundle', 'settings.json');
        fs.copyFileSync(this.configPath, destination);
        console.log(`\t${this.config} copied to ${destination}`);
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
        const destination = path.join(this.buildPath, this.config.name, 'bundle', 'package.json');
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
        ENV MONGO_URL=${this.config.MONGO_URL}
        ENV ROOT_URL=${this.config.ROOT_URL}:${this.config.PORT}/
        CMD ["npm", "start"]
        EXPOSE 3000`;
        const destination = path.join(this.buildPath, this.config.name, 'bundle', 'Dockerfile');
        fs.writeFileSync(destination, file);
        console.log(`\tDockerfile created at ${destination}`);
    }
}

// const deployer = new MeteorDeployer();
// deployer.run(process.argv);

