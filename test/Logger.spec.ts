'use strict';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Logger } from '../src/Logger';

afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

//process.env['npm_lifecycle_event'] == 'test' || (process.env['VSCODE_PID'] != undefined);
describe('Logger.checkEnvironment()', (): void => {
    it('should return true with test npm_lifecycle_event and test VSCODE_PID', (): void => {
        const VSCODE_PID = process.env['VSCODE_PID'];
        const npmLifecycleEvent = process.env['npm_lifecycle_event'];
        process.env['VSCODE_PID'] = 'test';
        process.env['npm_lifecycle_event'] = 'test';        

        const result = Logger.checkEnvironment();
        
        assert.isTrue(result);
        process.env['npm_lifecycle_event'] = npmLifecycleEvent;
        process.env['VSCODE_PID'] = VSCODE_PID;
    });
    it('should return true with test npm_lifecycle_event and undefined VSCODE_PID', (): void => {
        const VSCODE_PID = process.env['VSCODE_PID'];
        const npmLifecycleEvent = process.env['npm_lifecycle_event'];
        process.env['VSCODE_PID'] = 'test';
        process.env['npm_lifecycle_event'] = 'test';        

        const result = Logger.checkEnvironment();
        
        assert.isTrue(result);
        process.env['npm_lifecycle_event'] = npmLifecycleEvent;
        process.env['VSCODE_PID'] = VSCODE_PID;
    });
    it('should return true with undefined npm_lifecycle_event and test VSCODE_PID', (): void => {
        const VSCODE_PID = process.env['VSCODE_PID'];
        const npmLifecycleEvent = process.env['npm_lifecycle_event'];
        process.env['VSCODE_PID'] = undefined;
        process.env['npm_lifecycle_event'] = undefined;

        const result = Logger.checkEnvironment();
        
        assert.isTrue(result);
        process.env['npm_lifecycle_event'] = npmLifecycleEvent;
        process.env['VSCODE_PID'] = VSCODE_PID;
    });
    it('should return true with test npm_lifecycle_event and undefined VSCODE_PID', (): void => {
        const VSCODE_PID = process.env['VSCODE_PID'];
        const npmLifecycleEvent = process.env['npm_lifecycle_event'];
        process.env['VSCODE_PID'] = undefined;
        process.env['npm_lifecycle_event'] = undefined;

        const result = Logger.checkEnvironment();
        
        assert.isTrue(result);
        process.env['npm_lifecycle_event'] = npmLifecycleEvent;
        process.env['VSCODE_PID'] = VSCODE_PID;
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