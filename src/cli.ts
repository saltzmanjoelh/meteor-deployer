#!/usr/bin/env node

import { MeteorDeployer } from "./MeteorDeployer";

//Validate input
const argv = require('minimist')(process.argv.slice(2));
if(argv.settings == undefined || argv['_'].length == 0){
    if(argv['_'].length == 0){
        console.log(`You didn't specify the TARGET. You should should specify something like \`meteor-deployer staging\` or \`meteor-deployer production\``);
    }
    console.log('Usage: meteor-deployer TARGET [ACTIONS]\n');
    console.log('Target: staging or production. Used to determine which settings and deployment files to use. For example `meteor-deployer staging` will use staging.json and staging.config.json.');
    console.log('\n');
    console.log('Actions:         If none are specified, all are performed.');
    console.log('  build:         Build the Meteor bundle, copy the settings json and create a Dockerfile in the bundle.');
    console.log('  docker-build:  Executes `docker build` with the Dockerfile in the built bundle directory');
    console.log('  tar:           Creates a tarball of the bundle in the build directory.');
    console.log('\n');
    console.log('Example Meteor settings json file:');
    console.log(`
    {
        "name": "Example App",
        "ROOT_URL": "https://app.example.com",
        "PORT": 3000,
        "MONGO_URL": "mongodb+srv://user:db.example.com/exampleApp"
        
    }
    `);
    console.log('Example meteor-deployer configuration json file:');
    console.log(`
    {
        "buildPath": "/tmp/appBuild",
        "s3": {
            "bucket": app.example.com.productionBundles,
            "credentialsPath": "./path/to/aws_credentials"
        }
    }
    `);
    console.log('Thanks: https://blog.mvp-space.com/how-to-dockerize-a-meteor-app-with-just-one-script-4bccb26f6ff0');
}

const target = argv._.splice(0, 1);
// const settings = MeteorSettings.parseSettingsFile(argv.settings);
// const deployer = new MeteorDeployer(target, (argv.buildPath == undefined)? process.cwd() : argv.buildPath);
const deployer = MeteorDeployer.parseTarget(target);
if(argv._.length == 1){//Only target was defined, perform all actions
    deployer.build();
    deployer.dockerBuild(deployer.packageVersion());
    deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, deployer.packageVersion());
} else {//actions were specified
    if(argv._.contains('build')) {
        deployer.build();
    }

}

