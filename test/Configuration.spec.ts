'use strict';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import Configuration from '../src/Configuration';
import ConfigurationInterface from '../src/ConfigurationInterface';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('Configuration.validateJson()', (): void => {
    it('should throw error when buildPath is missing', (): void => {
        const obj = JSON.parse('{"invalid":true}') as ConfigurationInterface;
        assert.throws((): void => {
            Configuration.validateJson('path', obj);
        });
    });
});

describe('Configuration.parseConfigFile()', (): void => {
    it('should throw when filePath is empty', (): void => {
        assert.throws((): void => {
            Configuration.parseConfigFile('');
        });
    });
    it('should throw when filePath doesn\'t exist', (): void => {
        const fake = sinon.fake.returns(false);
        sinon.stub(fs, 'existsSync').callsFake(fake);

        assert.throws((): void => {
            Configuration.parseConfigFile('/invalid/path');
        });
    });
    it('should prefix full path to filename', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        Configuration.parseConfigFile('staging.config.json');

        const result: string = callback.args[0][0];
        assert.notEqual(result, 'staging.config.json');
    });
    it('should leave a full filePath as is', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        Configuration.parseConfigFile('/src/staging.config.json');

        const result: string = callback.args[0][0];
        assert.equal(result, '/src/staging.config.json');
    });
    it('should return configuration object', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        const result = Configuration.parseConfigFile('/src/staging.config.json');

        assert.instanceOf(result, Configuration);
        
    });
});