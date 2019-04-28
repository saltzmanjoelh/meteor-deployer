#!/usr/bin/env node

import { MeteorSettings } from "./MeteorSettings";
import { MeteorDeployer } from "./MeteorDeployer";

//Validate input
const argv = require('minimist')(process.argv.slice(2));
if(argv['settings'] == undefined){
    console.log('Usage: meteor-deployer --settings file.json [options]\n');
    console.log('Options:\n');
    console.log('--buildPath:\tPath to where you want the bundle built at');
    console.log('\n');
    console.log('Example settings json file:');
    console.log(`
    {
        "name": "Example App",
        "ROOT_URL": "https://app.example.com",
        "PORT": 3000,
        "MONGO_URL": "mongodb+srv://user:db.example.com/exampleApp"
    }
    `);
    console.log('Thanks: https://blog.mvp-space.com/how-to-dockerize-a-meteor-app-with-just-one-script-4bccb26f6ff0');
}


const settings = MeteorSettings.parseSettingsFile(argv['settings']);
const deployer = new MeteorDeployer(settings, (argv['buildPath'] == undefined)? process.cwd() : argv['buildPath']);
//Perform all actions
//TODO: take optional action arg from `arv['_']` and perform a specific action
deployer.createBuild();
deployer.copySettings();
deployer.createPackageFile();
deployer.createDockerfile();