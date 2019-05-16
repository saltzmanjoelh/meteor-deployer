export default class Logger {

    /**
     * VSCODE_PID is set when running tests through Test Explorer UI
     * npm_lifecycle_event is set when running tests through `npm test`
     * In either case, we don't want to have logging clutter up the test results
     * @param {string} npmLifecycleEvent process.env['npmLifecycleEvent']
     * @param {string} vsCodePid process.env['VSCODE_PID']
     * @returns {boolean} true if we should be logging otherwise false
     */
    public static skipLogging(npmLifecycleEvent: string|undefined, vsCodePid: string|undefined) : boolean {
        return npmLifecycleEvent == 'test' || vsCodePid != undefined;
    }

    /**
     * @property {boolean} shouldSkipLogging If we should be logging to console or not.
     */
    public static shouldSkipLogging: boolean = Logger.skipLogging(process.env['npmLifecycleEvent'], process.env['VSCODE_PID']);
    
    /**
     * Prints to `stdout` with newline.
     * @returns {string} returns the string that was logged or null if nothing was logged.
     */
    public static log(message: string): void {
        if(this.shouldSkipLogging){
            return;
        }
        console.log(message);
    }
}

export { Logger };