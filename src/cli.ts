#!/usr/bin/env node

import MeteorDeployer from "./MeteorDeployer";
import * as path from 'path';

//Validate input
const argv = require('minimist')(process.argv.slice(2));
if(argv._.length == 0 || argv._.includes('help')){
    if(argv['_'].length == 0){
        console.log(`You didn't specify the TARGET. You should should specify something like \`meteor-deployer staging\` or \`meteor-deployer production\``);
    }
    console.log('Usage: meteor-deployer TARGET [ACTIONS] [OPTIONS]\n');
    console.log('Target: staging or production. Used to determine which settings and deployment files to use. Any target name can be used. For example `meteor-deployer staging` will use staging.json and staging.config.json.');
    console.log('\n');
    console.log('Actions:         If none are specified, all are performed.');
    console.log('  build:         Build the Meteor bundle, copy the settings json and create a Dockerfile in the bundle.');
    console.log('  docker-build:  Executes `docker build` with the Dockerfile in the built bundle directory');
    console.log('  tar:           Creates a tarball of the bundle in the build directory.');
    console.log('\n');
    console.log('Options:');
    console.log('  --source:      The path to the meteor package to work with. `process.cwd()` will be used by default.');
    console.log('\n');
    console.log('Example Meteor settings json file:');
    console.log(`
    {
        "name": "Example App",
        "ROOT_URL": "https://app.example.com",
        "PORT": 3000,
        "MONGO_URL": "mongodb://mongo.example.com:27017/admin"
        
    }
    `);
    console.log('Example meteor-deployer configuration json file:');
    console.log(`
    {
        "buildPath": "/tmp/appBuild",
        "s3": {
            "bucket": "app-example-com/productionBundles",
            "credentialsPath": "./path/to/aws_credentials"
        }
    }
    `);
    console.log('Thanks: https://blog.mvp-space.com/how-to-dockerize-a-meteor-app-with-just-one-script-4bccb26f6ff0');
    process.exit(1);
}

let target = argv._.splice(0, 1);
if(argv.source != undefined){
    if(path.isAbsolute(target)){
        console.log('You provided a path with the target and the --source arg. Pick one, don\'t use both.');
        process.exit(1);
    }
    target = path.join(argv.source, target);
}


const deployer = MeteorDeployer.parseTarget(target);
if(argv._.length == 0){//Only target was defined and has been removed
    console.log(`Deploy to ${target}`);
    deployer.build();
    if(deployer.dockerIsInstalled()){
        deployer.dockerBuild(deployer.packageVersion());
    }
    const archivePath = deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, deployer.packageVersion());
    if(archivePath){
        deployer.performUpload(archivePath);
    }
} else {//actions were specified
    console.log('Actions => ' + argv._.join(', '));
    if(argv._.includes('build')) {
        deployer.build();
    }
    if(argv._.includes('docker-build')) {
        if(deployer.dockerIsInstalled()){
            deployer.dockerBuild(deployer.packageVersion());
        }
    }
}

