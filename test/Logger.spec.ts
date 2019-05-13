'use strict';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Logger } from '../src/Logger';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('Logger.skipLogging()', (): void => {
    it('should return true with test npm_lifecycle_event and valid VSCODE_PID', (): void => {

        const result = Logger.skipLogging('test', '100');
        
        assert.isTrue(result);
    });
    it('should return true with test npm_lifecycle_event and undefined VSCODE_PID', (): void => {

        const result = Logger.skipLogging('test', undefined);
        
        assert.isTrue(result);
    });
    it('should return true with undefined npm_lifecycle_event and valid VSCODE_PID', (): void => {

        const result = Logger.skipLogging(undefined, '100');
        
        assert.isTrue(result);
    });
    it('should return true with undefined npm_lifecycle_event and undefined VSCODE_PID', (): void => {

        const result = Logger.skipLogging(undefined, undefined);
        
        assert.isFalse(result);
    });
    it('should return true with invalid npm_lifecycle_event and valid VSCODE_PID', (): void => {

        const result = Logger.skipLogging('invalid', '100');
        
        assert.isTrue(result);
    });
    it('should return true with invalid npm_lifecycle_event and undefined VSCODE_PID', (): void => {

        const result = Logger.skipLogging('invalid', undefined);
        
        assert.isFalse(result);
    });
});

describe('Logger.log()', (): void => {
    it('should log to console', (): void => {
        Logger.shouldSkipLogging = false;
        const callback = sinon.fake();
        sinon.stub(console, 'log').callsFake(callback);

        Logger.log('test message');
        
        assert.isTrue(callback.calledOnce);
        const message: string = callback.args[0][0];
        assert.equal(message, 'test message');
        Logger.shouldSkipLogging = true;
    });
});