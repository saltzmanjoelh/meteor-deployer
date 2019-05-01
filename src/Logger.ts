class Logger {

    /**
     * VSCODE_PID is set when running tests through Test Explorer UI
     * npm_lifecycle_event is set when running tests through `npm test`
     * In either case, we don't want to have logging clutter up the test results
     * @returns {boolean} true if we should be logging otherwise false
     */
    public static checkEnvironment() : boolean {
        return process.env['npm_lifecycle_event'] == 'test' || process.env['VSCODE_PID'] != undefined;
    }

    /**
     * @property {boolean} shouldSkipLogging If we should be logging to console or not.
     */
    public static shouldSkipLogging: boolean = Logger.checkEnvironment();
    
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