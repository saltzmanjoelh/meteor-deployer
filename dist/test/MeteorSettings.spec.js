'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// var expect = require('chai').expect;
const chai_1 = require("chai");
require("mocha");
const MeteorSettings_1 = require("../MeteorSettings");
describe('constructor test', () => {
    it('should throw with empty path', () => {
        chai_1.expect(MeteorSettings_1.default).to.throw(`Invalid path to meteor settings file: "`);
        const settings = new MeteorSettings_1.default('');
    });
});
