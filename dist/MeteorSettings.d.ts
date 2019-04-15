export default class MeteorSettings {
    filePath: string;
    name: string;
    ROOT_URL: string;
    PORT: string;
    MONGO_URL: string;
    constructor();
    readFile(filePath: string): void;
}
