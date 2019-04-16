'use strict';
import 'mocha';
import MeteorSettings from '../MeteorSettings';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';

const validSettings = new MeteorSettings();
validSettings.name = Math.random().toString(36).substring(7);
validSettings.ROOT_URL = Math.random().toString(36).substring(7);
validSettings.PORT = Math.random().toString(36).substring(7);
validSettings.MONGO_URL = Math.random().toString(36).substring(7);


describe('parseSettingsFile test', () => {
    it('should throw with empty path', () => {
        expect(() => {
            MeteorSettings.parseSettingsFile('');
        }).to.throw();
    });
    it('should throw with invalid path', () => {
        expect(() => {
            MeteorSettings.parseSettingsFile('invalid path');
        }).to.throw();
    });
    it('should return MeteorSettings with valid file', () => {
        const json = `${JSON.stringify(validSettings)}`;
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'readFileSync').returns(json);
        expect(() => {
            MeteorSettings.parseSettingsFile('path');
        }).not.to.throw();
    });
});

describe('validateProperties test', () => {

    it('should not throw error with valid properties', () => {
        const settings = new MeteorSettings();
        settings.name = 'name';
        settings.ROOT_URL = 'ROOT_URL';
        settings.PORT = 'PORT';
        settings.MONGO_URL = 'MONGO_URL';
        expect(() => {
            settings.validateProperties();
        }).not.to.throw();
    });

    it('should throw error with invalid properties', () => {
        const settings = new MeteorSettings();
        expect(() => {
            settings.validateProperties();
        }).to.throw();
    });
});