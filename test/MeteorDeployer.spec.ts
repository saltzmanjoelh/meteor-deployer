'use strict';
import 'mocha';
import { MeteorDeployer } from '../MeteorDeployer';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as child_process from 'child_process';

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
        const callback = sinon.fake();
        sinon.stub(child_process, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, '/some/path');
        
        deployer.createBuild();

        assert.isTrue(callback.calledOnce);
        const args: string = callback.args[0][0];
        assert.isTrue(args.includes(deployer.buildPath));
        assert.isTrue(args.includes(deployer.settings.name));
        assert.isTrue(args.includes(deployer.settings.ROOT_URL));
        assert.isTrue(args.includes(deployer.settings.PORT));
    });
});
