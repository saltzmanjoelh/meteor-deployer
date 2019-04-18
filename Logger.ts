class Logger {
    /**
     * @property {boolean} shouldLog If we should be logging to console or not.
     */
    static shouldLog: boolean = process.env['npm_lifecycle_event'] != 'test';
    /**
     * Prints to `stdout` with newline.
     */
    static log(message: string) {
        if(this.shouldLog){
            console.log(message);
        }
    }
}
export { Logger };