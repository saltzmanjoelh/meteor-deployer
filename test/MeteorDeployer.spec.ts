'use strict';
import 'mocha';
import { MeteorDeployer } from '../src/MeteorDeployer';
import { MeteorSettings } from '../src/MeteorSettings';
import { Configuration } from '../src/Configuration';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import ConfigurationFixture from './ConfigurationFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as childProcess from 'child_process';
import * as fs from 'fs';


afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('MeteorDeployer.parseTarget()', (): void => {
    it('should initialize new instance', (): void => {
        sinon.stub(MeteorSettings, 'parseSettingsFile').callsFake((): MeteorSettings => { return MeteorSettingsFixture; });
        sinon.stub(Configuration, 'parseConfigFile').callsFake((): Configuration => { return ConfigurationFixture; });
        
        assert.doesNotThrow((): void => {
            MeteorDeployer.parseTarget('develop');
        });
    });
    it('should throw error with invalid config', (): void => {
        assert.throws((): void => {
            MeteorDeployer.parseTarget('invalid');
        });
    });
});
describe('MeteorDeployer constructor', (): void => {
    it('should initialize properties', (): void => {
        
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        assert.equal(deployer.config.buildPath, ConfigurationFixture.buildPath);
        assert.equal(deployer.meteorSettings, MeteorSettingsFixture);
    });
});

describe('MeteorDeployer packageVersion()', (): void => {
    it('should set private _packageVersion', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '1.1.1'; });

        const result = deployer.packageVersion();

        assert.equal(result, '1.1.1');
    });
    it('should use existing private _packageVersion', (): void => {
        //Create the deployer
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        //Specify what the version will be
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '1.1.1'; });
        //Set the private version
        deployer.packageVersion();
        //Change the result of parsePackageVersion to confirm that the private _packageVersion is being used
        sinon.restore();
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '9.9.9'; });

        //Check that the internal value is returned again
        const result = deployer.packageVersion();

        assert.equal(result, '1.1.1');
    });
});

describe('MeteorDeployer.build()', (): void => {
    it('should execute multiple commands', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const createBuild = sinon.stub(deployer, 'createBuild').callsFake((): void => {  });
        const copySettings = sinon.stub(deployer, 'copySettings').callsFake((): void => {  });
        const createPackageFile = sinon.stub(deployer, 'createPackageFile').callsFake((): void => {  });
        const createDockerfile = sinon.stub(deployer, 'createDockerfile').callsFake((): void => {  });
        
        
        deployer.build();

        assert.isTrue(createBuild.calledOnce);
        assert.isTrue(copySettings.calledOnce);
        assert.isTrue(createPackageFile.calledOnce);
        assert.isTrue(createDockerfile.calledOnce);
    });
});

describe('MeteorDeployer.dockerBuild()', (): void => {
    it('should execute docker build command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.dockerBuild('1.0.0');

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, 'docker build -f');
        assert.include(command, deployer.dockerfilePath);
        assert.include(command, deployer.config.buildPath);
    });
    it('should apply tag version', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const tagVersion = '9.9.9';
        
        deployer.dockerBuild(tagVersion);

        const command: string = callback.args[0][0];
        assert.include(command, tagVersion);
    });
});

describe('MeteorDeployer.createBuild()', (): void => {
    it('should execute build command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createBuild();

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, deployer.config.buildPath);
        assert.include(command, deployer.meteorSettings.name);
        assert.include(command, deployer.meteorSettings.ROOT_URL);
        assert.include(command, deployer.meteorSettings.PORT);
        assert.equal(command, `meteor build --allow-superuser --directory /some/path/${MeteorSettingsFixture.name} --server ${MeteorSettingsFixture.ROOT_URL}:${MeteorSettingsFixture.PORT}`)
    });
});

describe('MeteorDeployer.copySettings()', (): void => {
    it('should perform copyFileSync command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => { });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.copySettings();

        assert.isTrue(callback.calledOnce);
        const source: string = callback.args[0][0];
        assert.isTrue(source.includes(deployer.meteorSettings.filePath));
        const destination: string = callback.args[0][1];
        assert.isTrue(destination.includes(deployer.config.buildPath));
        assert.isTrue(destination.includes(deployer.meteorSettings.name));
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('settings.json'));
    });
    it('should throw with invalid build path', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        assert.throws((): void => {
            deployer.copySettings();
        });
    });
});

describe('MeteorDeployer.createPackageFile()', (): void => {
    it('should perform writeFileSync command', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createPackageFile('1.0.0');

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.config.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.config.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('package.json'));
    });
    it('update package version number', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = "9.9.9"
        
        deployer.createPackageFile(version);

        assert.isTrue(callback.calledOnce);
        const file: string = callback.args[0][1];
        assert.isTrue(file.includes(version), `File contents: ${file} should have contained version: ${version}`);
    });
});

describe('MeteorDeployer.createDockerfile()', (): void => {
    it('should create Dockerfile', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createDockerfile();

        assert.isTrue(callback.calledOnce);
        const file: string = callback.args[0][1];
        assert.isTrue(file.includes(MeteorSettingsFixture.MONGO_URL), `Dockerfile: ${file} should have contained MONGO_URL: ${MeteorSettingsFixture.MONGO_URL}`);
        assert.isTrue(file.includes(MeteorSettingsFixture.ROOT_URL), `Dockerfile: ${file} should have contained ROOT_URL: ${MeteorSettingsFixture.ROOT_URL}`);
        assert.isTrue(file.includes(MeteorSettingsFixture.MONGO_URL), `Dockerfile: ${file} should have contained PORT: ${MeteorSettingsFixture.PORT}`);
    });
    it('should create Dockerfile in the bundle', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createDockerfile();

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.config.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.config.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('Dockerfile'));
    });
});

describe('MeteorDeployer.tarBundle()', (): void => {
    it('should verify bundlePath is readable', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'accessSync').callsFake(callback);
        sinon.stub(childProcess, 'execSync').callsFake(sinon.fake());
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledTwice);
        const directory: string = callback.args[0][0];
        assert.equal(directory, deployer.bundlePath);
    });
    it('should verify buildPath is readable', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'accessSync').callsFake(callback);
        sinon.stub(childProcess, 'execSync').callsFake(sinon.fake());
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledTwice);
        const directory: string = callback.args[1][0];
        assert.equal(directory, deployer.config.buildPath);
    });
    it('should move to bundle subdir', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, `-C ${deployer.bundlePath}`);
    });
    it('should create tar with app name', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');
        const command: string = callback.args[0][0];
        assert.include(command, `-czf /some/path/${deployer.meteorSettings.name}/${deployer.meteorSettings.name}_1.0.0.tar`);
    });
    it('should append verison number to tar', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = '9.9.9';
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, version);

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, `${deployer.meteorSettings.name}_${version}.tar`);
    });
});