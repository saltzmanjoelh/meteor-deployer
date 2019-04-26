'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const MeteorSettings_1 = require("../src/MeteorSettings");
const MeteorSettingsFixture_1 = require("./MeteorSettingsFixture");
const chai_1 = require("chai");
const sinon = require("sinon");
const fs = require("fs");
afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
});
describe('MeteorSettings.parseSettingsFile()', () => {
    it('should throw with empty path', () => {
        chai_1.assert.throws(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('');
        });
    });
    it('should throw with invalid path', () => {
        chai_1.assert.throws(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('invalid path');
        });
    });
    it('should return MeteorSettings with valid file', () => {
        const json = `${JSON.stringify(MeteorSettingsFixture_1.default)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);
        chai_1.assert.doesNotThrow(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('path');
        });
    });
});
describe('MeteorSettings.validateProperties()', () => {
    it('should not throw error with valid properties', () => {
        chai_1.assert.doesNotThrow(() => {
            MeteorSettingsFixture_1.default.validateProperties();
        });
    });
    it('should throw error with invalid properties', () => {
        const settings = new MeteorSettings_1.MeteorSettings();
        chai_1.assert.throws(() => {
            settings.validateProperties();
        });
    });
});
