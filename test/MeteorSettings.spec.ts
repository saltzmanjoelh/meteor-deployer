'use strict';

import { expect } from 'chai';
import 'mocha';
import MeteorSettings from '../MeteorSettings';

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