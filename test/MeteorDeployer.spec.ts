'use strict';
import 'mocha';
import { MeteorDeployer } from '../src/MeteorDeployer';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as childProcess from 'child_process';
import * as fs from 'fs';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('MeteorDeployer constructor', (): void => {
    it('should initialize properties', (): void => {
        const buildPath = '/some/path';
        
        const deployer = new MeteorDeployer(MeteorSettingsFixture, buildPath);
        
        assert.equal(deployer.buildPath, buildPath);
        assert.equal(deployer.settings, MeteorSettingsFixture);
    });
});

describe('MeteorDeployer.build()', (): void => {
    it('should execute multiple commands', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
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
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.dockerBuild();

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.isTrue(command.includes('docker build -f'));
        assert.isTrue(command.includes(deployer.dockerfilePath));
        assert.isTrue(command.includes(deployer.buildPath));
    });
    it('should apply tag version', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        const tagVersion = '9.9.9';
        
        deployer.dockerBuild(tagVersion);

        const command: string = callback.args[0][0];
        assert.isTrue(command.includes(tagVersion));
    });
});

describe('MeteorDeployer.createBuild()', (): void => {
    it('should execute build command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.createBuild();

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.isTrue(command.includes(deployer.buildPath));
        assert.isTrue(command.includes(deployer.settings.name));
        assert.isTrue(command.includes(deployer.settings.ROOT_URL));
        assert.isTrue(command.includes(deployer.settings.PORT));
        assert.equal(command, `meteor build --allow-superuser --directory /some/path/${MeteorSettingsFixture.name} --server ${MeteorSettingsFixture.ROOT_URL}:${MeteorSettingsFixture.PORT}`)
    });
});

describe('MeteorDeployer.copySettings()', (): void => {
    it('should perform copyFileSync command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => { });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.copySettings();

        assert.isTrue(callback.calledOnce);
        const source: string = callback.args[0][0];
        assert.isTrue(source.includes(deployer.settings.filePath));
        const destination: string = callback.args[0][1];
        assert.isTrue(destination.includes(deployer.buildPath));
        assert.isTrue(destination.includes(deployer.settings.name));
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('settings.json'));
    });
    it('should throw with invalid build path', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        assert.throws((): void => {
            deployer.copySettings();
        });
    });
});

describe('MeteorDeployer.createPackageFile()', (): void => {
    it('should perform writeFileSync command', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.createPackageFile();

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('package.json'));
    });
    it('update package version number', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
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
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
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
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.createDockerfile();

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('Dockerfile'));
    });
});
