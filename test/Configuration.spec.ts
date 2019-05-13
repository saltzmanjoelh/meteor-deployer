'use strict';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as config from '../src/Configuration';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('Configuration.validateJson()', (): void => {
    it('should throw error when buildPath is missing', (): void => {
        const obj = JSON.parse('{"invalid":true}') as config.ConfigurationInterface;
        assert.throws((): void => {
            config.Configuration.validateJson('path', obj);
        });
    });
});

describe('Configuration.parseConfigFile()', (): void => {
    it('should throw when filePath is empty', (): void => {
        assert.throws((): void => {
            config.Configuration.parseConfigFile('');
        });
    });
    it('should throw when filePath doesn\'t exist', (): void => {
        const fake = sinon.fake.returns(false);
        sinon.stub(fs, 'existsSync').callsFake(fake);

        assert.throws((): void => {
            config.Configuration.parseConfigFile('/invalid/path');
        });
    });
    it('should prefix full path to filename', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        config.Configuration.parseConfigFile('staging.config.json');

        const result: string = callback.args[0][0];
        assert.notEqual(result, 'staging.config.json');
    });
    it('should leave a full filePath as is', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        config.Configuration.parseConfigFile('/src/staging.config.json');

        const result: string = callback.args[0][0];
        assert.equal(result, '/src/staging.config.json');
    });
    it('should return configuration object', (): void => {
        sinon.stub(fs, 'existsSync').callsFake(sinon.fake.returns(true));
        const callback = sinon.fake.returns("{\"buildPath\": \"/tmp/appBundle\"}");
        sinon.stub(fs, 'readFileSync').callsFake(callback);

        const result = config.Configuration.parseConfigFile('/src/staging.config.json');

        assert.instanceOf(result, config.Configuration);
        
    });
});