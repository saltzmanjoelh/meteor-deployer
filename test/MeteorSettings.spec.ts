'use strict';
import 'mocha';
import MeteorSettings from '../src/MeteorSettings';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('MeteorSettings.parseSettingsFile()', (): void => {
    it('should throw with empty path', (): void => {
        assert.throws((): void => {
            MeteorSettings.parseSettingsFile('');
        });
    });
    it('should throw with invalid path', (): void => {
        assert.throws((): void => {
            MeteorSettings.parseSettingsFile('invalid path');
        });
    });
    it('should return MeteorSettings with absolute path', (): void => {
        const json = `${JSON.stringify(MeteorSettingsFixture)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);

        assert.doesNotThrow((): void => {
            MeteorSettings.parseSettingsFile('/path');
        });
    });
    it('should return MeteorSettings with relative path', (): void => {
        const json = `${JSON.stringify(MeteorSettingsFixture)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);
        sinon.stub(path, 'isAbsolute').returns(false);

        assert.doesNotThrow((): void => {
            MeteorSettings.parseSettingsFile('path');
        });
    });
});

describe('MeteorSettings.validateProperties()', (): void => {

    it('should not throw error with valid properties', (): void => {
        assert.doesNotThrow((): void => {
            MeteorSettingsFixture.validateProperties();
        });
    });

    it('should throw error with invalid properties', (): void => {
        const settings = new MeteorSettings();
        assert.throws((): void => {
            settings.validateProperties();
        });
    });
});

describe('MeteorSettings.envString()', (): void => {

    it('should concat all properties together', (): void => {
        const settings = MeteorSettingsFixture;
        
        const result = settings.envString();

        assert.equal(result, `name="${MeteorSettingsFixture.name}" ROOT_URL="${MeteorSettingsFixture.ROOT_URL}" PORT="${MeteorSettingsFixture.PORT}" MONGO_URL="${MeteorSettingsFixture.MONGO_URL}" `);
    });
    it('should skip setting empty values', (): void => {
        const settings = new MeteorSettings();
        settings.name = '';
        settings.ROOT_URL = 'http://app.example.com';
        settings.PORT = '3000';
        settings.MONGO_URL = 'mongo://db.example.com';

        assert.doesNotThrow((): void => {
            settings.envString();
        });
    });
});