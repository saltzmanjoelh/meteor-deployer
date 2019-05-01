#!/usr/bin/env node

import { MeteorSettings } from "./MeteorSettings";
import { MeteorDeployer } from "./MeteorDeployer";

//Validate input
const argv = require('minimist')(process.argv.slice(2));
if(argv.settings == undefined || argv['_'].length == 0){
    if(argv['_'].length == 0){
        const settingsPath = (argv.settings != undefined)? argv.settings : 'production.json';
        console.log(`You didn't specify any actions. Maybe you meant to call \`meteor-deployer --settings ${settingsPath} build\`?`);
    } else if(argv.settings == undefined || argv.settings == ''){
        console.log('You didn\'t provide the `--settings PATH` flag.')
    }
    console.log('Usage: meteor-deployer --settings file.json [OPTIONS] [ACTIONS]\n');
    console.log('Options:');
    console.log('  --buildPath:\tPath to where you want the bundle built at.');
    console.log('\n');
    console.log('Actions:');
    console.log('  build:\t\tBuild the Meteor bundle, copy the settings json and create a Dockerfile');
    console.log('  docker-build:\tCalls `docker build` with the Dockerfile in the built bundle directory');
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

const settings = MeteorSettings.parseSettingsFile(argv.settings);
const deployer = new MeteorDeployer(settings, (argv.buildPath == undefined)? process.cwd() : argv.buildPath);
//Perform all actions
if(argv._.contains('build')) {
    deployer.build();
}
