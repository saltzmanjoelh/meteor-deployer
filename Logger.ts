class Logger {
    /**
     * @property {boolean} shouldLog If we should be logging to console or not.
     */
    static shouldSkipLogging: boolean = process.env['npm_lifecycle_event'] == 'test' || (process.env['VSCODE_PID'] != undefined);
    /**
     * Prints to `stdout` with newline.
     */
    static log(message: string) {
        if(this.shouldSkipLogging){
            return;
        }
        console.log(process.env['npm_lifecycle_event']);
        console.log(process.env['VSCODE_PID']);
        console.log(message);
    }
}
export { Logger };