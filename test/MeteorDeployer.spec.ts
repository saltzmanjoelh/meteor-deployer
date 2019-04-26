'use strict';
import 'mocha';
import { MeteorDeployer } from '../MeteorDeployer';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as child_process from 'child_process';
import * as fs from 'fs';

afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('MeteorDeployer constructor', () => {
    it('should initialize properties', () => {
        const buildPath = '/some/path';
        
        const deployer = new MeteorDeployer(MeteorSettingsFixture, buildPath);
        
        assert.equal(deployer.buildPath, buildPath);
        assert.equal(deployer.settings, MeteorSettingsFixture);
    });
});

describe('MeteorDeployer.createBuild()', () => {
    it('should execute build command', () => {
        sinon.stub(fs, 'accessSync').callsFake(() => {  });//accessSync passes with fixture path
        const callback = sinon.fake();
        sinon.stub(child_process, 'execSync').callsFake(callback);
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

describe('MeteorDeployer.copySettings()', () => {
    it('should perform copyFileSync command', () => {
        sinon.stub(fs, 'accessSync').callsFake(() => { });//accessSync passes with fixture path
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
    it('should throw with invalid build path', () => {
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        assert.throws(() => {
            deployer.copySettings();
        });
    });
});

describe('MeteorDeployer.createPackageFile()', () => {
    it('should perform writeFileSync command', () => {
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
    it('update package version number', () => {
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
