'use strict';
import 'mocha';
import { MeteorSettings } from '../MeteorSettings';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';

afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

describe('MeteorSettings.parseSettingsFile()', () => {
    it('should throw with empty path', () => {
        assert.throws(() => {
            MeteorSettings.parseSettingsFile('');
        });
    });
    it('should throw with invalid path', () => {
        assert.throws(() => {
            MeteorSettings.parseSettingsFile('invalid path');
        });
    });
    it('should return MeteorSettings with valid file', () => {
        const json = `${JSON.stringify(MeteorSettingsFixture)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);

        assert.doesNotThrow(() => {
            MeteorSettings.parseSettingsFile('path');
        });
    });
});

describe('MeteorSettings.validateProperties()', () => {

    it('should not throw error with valid properties', () => {
        assert.doesNotThrow(() => {
            MeteorSettingsFixture.validateProperties();
        });
    });

    it('should throw error with invalid properties', () => {
        const settings = new MeteorSettings();
        assert.throws(() => {
            settings.validateProperties();
        });
    });
});