'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const MeteorSettings_1 = require("../MeteorSettings");
const chai_1 = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const validSettings = new MeteorSettings_1.MeteorSettings();
validSettings.name = Math.random().toString(36).substring(7);
validSettings.ROOT_URL = Math.random().toString(36).substring(7);
validSettings.PORT = Math.random().toString(36).substring(7);
validSettings.MONGO_URL = Math.random().toString(36).substring(7);
describe('parseSettingsFile test', () => {
    it('should throw with empty path', () => {
        chai_1.expect(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('');
        }).to.throw();
    });
    it('should throw with invalid path', () => {
        chai_1.expect(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('invalid path');
        }).to.throw();
    });
    it('should return MeteorSettings with valid file', () => {
        const json = `${JSON.stringify(validSettings)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);
        chai_1.expect(() => {
            MeteorSettings_1.MeteorSettings.parseSettingsFile('path');
        }).not.to.throw();
    });
});
describe('validateProperties test', () => {
    it('should not throw error with valid properties', () => {
        const settings = new MeteorSettings_1.MeteorSettings();
        settings.name = 'name';
        settings.ROOT_URL = 'ROOT_URL';
        settings.PORT = 'PORT';
        settings.MONGO_URL = 'MONGO_URL';
        chai_1.expect(() => {
            settings.validateProperties();
        }).not.to.throw();
    });
    it('should throw error with invalid properties', () => {
        const settings = new MeteorSettings_1.MeteorSettings();
        chai_1.expect(() => {
            settings.validateProperties();
        }).to.throw();
    });
});
