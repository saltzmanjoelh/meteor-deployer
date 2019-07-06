'use strict';
import 'mocha';
import NpmPackageInterface from '../src/NpmPackageInterface';
import MeteorDeployer from '../src/MeteorDeployer';
import MeteorSettings from '../src/MeteorSettings';
import Configuration from '../src/Configuration';
import MeteorSettingsFixture from './MeteorSettingsFixture';
import ConfigurationFixture from './ConfigurationFixture';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';


afterEach((): void => {
    // Restore the default sandbox here
    sinon.restore();
});

describe('MeteorDeployer.parseTarget()', (): void => {
    it('should initialize new instance', (): void => {
        sinon.stub(MeteorSettings, 'parseSettingsFile').callsFake((): MeteorSettings => { return MeteorSettingsFixture; });
        sinon.stub(Configuration, 'parseConfigFile').callsFake((): Configuration => { return ConfigurationFixture; });
        
        assert.doesNotThrow((): void => {
            MeteorDeployer.parseTarget('develop');
        });
    });
    it('should throw error with invalid config', (): void => {
        assert.throws((): void => {
            MeteorDeployer.parseTarget('invalid');
        });
    });
});
describe('MeteorDeployer.parsePackageVersion()', (): void => {
    it('should return default value for undefined version number', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        sinon.stub(deployer, 'readNpmPackageFile').returns(JSON.parse('[]') as NpmPackageInterface);

        assert.throws((): void => {
            deployer.parsePackageVersion();
        });
    });
    it('should return default value for invalid version number', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        sinon.stub(deployer, 'readNpmPackageFile').callsFake((): NpmPackageInterface => { return {version: '1'}; });

        assert.throws((): void => {
            deployer.parsePackageVersion();
        });
    });
});
describe('MeteorDeployer.readNpmPackageFile()', (): void => {
    it('should throw with an invalid directory name from the MeteorSettings filePath', (): void => {
        sinon.stub(fs, 'existsSync').callsFake((): boolean => { return false; });
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);

        assert.throws((): void => {
            deployer.parsePackageVersion();
        });
    });
    it('should return NpmPackageInterface instance', (): void => {
        sinon.stub(fs, 'existsSync').callsFake((): boolean => { return true; });
        sinon.stub(fs, 'readFileSync').callsFake((): string => { return '{"version": "9.9.9"}'; });
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);

        const result = deployer.readNpmPackageFile();

        assert.isNotNull(result);
    });
});
describe('MeteorDeployer constructor', (): void => {
    it('should initialize properties', (): void => {
        
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        assert.equal(deployer.config.buildPath, ConfigurationFixture.buildPath);
        assert.equal(deployer.meteorSettings, MeteorSettingsFixture);
        assert.equal(deployer.appName, "exampleapp");
        assert.equal(deployer.bundlePath, "/some/path/exampleapp/bundle");
        assert.equal(deployer.dockerfilePath, "/some/path/exampleapp/bundle/Dockerfile");
    });
});

describe('MeteorDeployer packageVersion()', (): void => {
    it('should set private _packageVersion', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '1.1.1'; });

        const result = deployer.packageVersion();

        assert.equal(result, '1.1.1');
    });
    it('should use existing private _packageVersion', (): void => {
        //Create the deployer
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        //Specify what the version will be
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '1.1.1'; });
        //Set the private version
        deployer.packageVersion();
        //Change the result of parsePackageVersion to confirm that the private _packageVersion is being used
        sinon.restore();
        sinon.stub(deployer, 'parsePackageVersion').callsFake((): string => { return '9.9.9'; });

        //Check that the internal value is returned again
        const result = deployer.packageVersion();

        assert.equal(result, '1.1.1');
    });
});

describe('MeteorDeployer.build()', (): void => {
    it('should execute multiple commands', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const createBuild = sinon.stub(deployer, 'createBuild').callsFake((): void => {  });
        const copySettings = sinon.stub(deployer, 'copySettings').callsFake((): void => {  });
        const createPackageFile = sinon.stub(deployer, 'createPackageFile').callsFake((): void => {  });
        const createDockerfile = sinon.stub(deployer, 'createDockerfile').callsFake((): void => {  });
        
        deployer.build();

        assert.isTrue(createBuild.calledOnce);
        assert.isTrue(copySettings.calledOnce);
        assert.isTrue(createPackageFile.calledOnce);
        assert.isTrue(createDockerfile.calledOnce);
    });
});

describe('MeteorDeployer.dockerBuild()', (): void => {
    it('should execute docker build command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.dockerBuild('1.0.0');

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, `docker build . --tag ${deployer.appName}:1.0.0`);
    });
    it('should apply tag version', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => {  });
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const tagVersion = '9.9.9';
        
        deployer.dockerBuild(tagVersion);

        const command: string = callback.args[0][0];
        assert.include(command, tagVersion);
    });

    it('should cd to bundle directory', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(process, 'cwd').returns('');
        const execSyncFake = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(execSyncFake);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.dockerBuild('1.0.0');

        assert.isTrue(execSyncFake.calledOnce);
        const command: string = execSyncFake.args[0][0];
        assert.include(command, `cd "${deployer.bundlePath}"`);
    });

    it('should not cd to bundle directory', (): void => {
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(process, 'cwd').returns(deployer.bundlePath);
        const execSyncFake = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(execSyncFake);
        
        deployer.dockerBuild('1.0.0');

        assert.isTrue(execSyncFake.calledOnce);
        const command: string = execSyncFake.args[0][0];
        assert.notInclude(command, `cd "${deployer.bundlePath}"`);
    });
});

describe('MeteorDeployer.createBuild()', (): void => {
    it('should execute build command', (): void => {
        sinon.stub(fs, 'existsSync').returns(true);
        sinon.stub(fs, 'accessSync').returns();
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createBuild();

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, deployer.config.buildPath);
        assert.include(command, deployer.appName);
        assert.include(command, deployer.meteorSettings.ROOT_URL);
        assert.include(command, deployer.meteorSettings.PORT);
        assert.include(command, `meteor build --allow-superuser --architecture=os.linux.x86_64 --server-only --directory "/some/path/${deployer.appName}" --server ${MeteorSettingsFixture.ROOT_URL}:${MeteorSettingsFixture.PORT}`)
    });

    it('should create build directory', (): void => {
        sinon.stub(fs, 'existsSync').returns(false);
        const callback = sinon.fake();
        sinon.stub(fs, 'mkdirSync').callsFake(callback);
        sinon.stub(fs, 'accessSync').returns();
        sinon.stub(childProcess, 'execSync').callsFake(sinon.fake());
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createBuild();

        assert.isTrue(callback.calledOnce);
        const directory: string = callback.args[0][0];
        assert.equal(directory, deployer.config.buildPath);
    });

    it('should cd to project directory', (): void => {
        sinon.stub(fs, 'existsSync').returns(false);
        sinon.stub(fs, 'mkdirSync').callsFake(sinon.fake());
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(process, 'cwd').returns('');
        const execSyncFake = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(execSyncFake);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createBuild();

        assert.isTrue(execSyncFake.calledOnce);
        const command: string = execSyncFake.args[0][0];
        assert.include(command, `cd "${path.dirname(deployer.config.filePath)}"`);
    });

    it('should not cd to project directory', (): void => {
        sinon.stub(fs, 'existsSync').returns(false);
        sinon.stub(fs, 'mkdirSync').callsFake(sinon.fake());
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(process, 'cwd').returns(path.dirname(ConfigurationFixture.filePath));
        const execSyncFake = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(execSyncFake);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createBuild();

        assert.isTrue(execSyncFake.calledOnce);
        const command: string = execSyncFake.args[0][0];
        assert.notInclude(command, `cd "${path.dirname(deployer.config.filePath)}"`);
    });
});

describe('MeteorDeployer.copySettings()', (): void => {
    it('should perform copyFileSync command', (): void => {
        sinon.stub(fs, 'accessSync').callsFake((): void => { });
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.copySettings();

        assert.isTrue(callback.calledOnce);
        const source: string = callback.args[0][0];
        assert.isTrue(source.includes(deployer.meteorSettings.filePath));
        const destination: string = callback.args[0][1];
        assert.isTrue(destination.includes(deployer.config.buildPath));
        assert.isTrue(destination.includes(deployer.appName));
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('settings.json'));
    });
    it('should throw with invalid build path', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'copyFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        assert.throws((): void => {
            deployer.copySettings();
        });
    });
});

describe('MeteorDeployer.createPackageFile()', (): void => {
    it('should perform writeFileSync command', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createPackageFile('1.0.0');

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.config.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.config.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('package.json'));
    });
    it('update package version number', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = "9.9.9"
        
        deployer.createPackageFile(version);

        assert.isTrue(callback.calledOnce);
        const file: string = callback.args[0][1];
        assert.isTrue(file.includes(version), `File contents: ${file} should have contained version: ${version}`);
    });
});

describe('MeteorDeployer.createDockerfile()', (): void => {
    it('should create Dockerfile', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createDockerfile();

        assert.isTrue(callback.calledOnce);
        const file: string = callback.args[0][1];
        assert.isTrue(file.includes(MeteorSettingsFixture.MONGO_URL), `Dockerfile: ${file} should have contained MONGO_URL: ${MeteorSettingsFixture.MONGO_URL}`);
        assert.isTrue(file.includes(MeteorSettingsFixture.ROOT_URL), `Dockerfile: ${file} should have contained ROOT_URL: ${MeteorSettingsFixture.ROOT_URL}`);
        assert.isTrue(file.includes(MeteorSettingsFixture.MONGO_URL), `Dockerfile: ${file} should have contained PORT: ${MeteorSettingsFixture.PORT}`);
    });
    it('should create Dockerfile in the bundle', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'writeFileSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.createDockerfile();

        assert.isTrue(callback.calledOnce);
        const destination: string = callback.args[0][0];
        assert.isTrue(destination.includes(deployer.config.buildPath), `Destination: ${destination} should have contained the buildPath: ${deployer.config.buildPath}`);
        assert.isTrue(destination.includes('bundle'));
        assert.isTrue(destination.includes('Dockerfile'));
    });
});

describe('MeteorDeployer.dockerIsInstall', (): void => {
    it('should return true if docker bin exists', (): void => {
        const buffer = Buffer.from('/usr/local/bin/docker', 'utf8');
        sinon.stub(childProcess, 'execSync').returns(buffer);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);

        const result = deployer.dockerIsInstalled();

        assert.isTrue(result, 'docker is should be considered installed when a valid path is returned');
    });
    it('should return false if docker bin does not exist', (): void => {
        const buffer = Buffer.from('', 'utf8');
        sinon.stub(childProcess, 'execSync').returns(buffer);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);

        const result = deployer.dockerIsInstalled();

        assert.isFalse(result, 'docker should not be considered installed when an empty path is returned');
    });
});

describe('MeteorDeployer.tarBundle()', (): void => {
    it('should verify bundlePath is readable', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'accessSync').callsFake(callback);
        sinon.stub(childProcess, 'execSync').callsFake(sinon.fake());
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledTwice);
        const directory: string = callback.args[0][0];
        assert.equal(directory, deployer.bundlePath);
    });
    it('should verify buildPath is readable', (): void => {
        const callback = sinon.fake();
        sinon.stub(fs, 'accessSync').callsFake(callback);
        sinon.stub(childProcess, 'execSync').callsFake(sinon.fake());
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledTwice);
        const directory: string = callback.args[1][0];
        assert.equal(directory, deployer.config.buildPath);
    });
    it('should move to bundle subdir', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, `-C "${deployer.bundlePath}"`);
    });
    it('should create tar with app name', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(fs, 'existsSync').returns(true);//archive created
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, '1.0.0');
        const command: string = callback.args[0][0];
        assert.include(command, `-czf "/some/path/${deployer.appName}/${deployer.appName}_1.0.0.tar"`);
    });
    it('should append verison number to tar', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = '9.9.9';
        
        deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, version);

        assert.isTrue(callback.calledOnce);
        const command: string = callback.args[0][0];
        assert.include(command, `${deployer.appName}_${version}.tar`);
    });
    it('should return tar path', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(fs, 'existsSync').returns(true);
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = '9.9.9';
        
        let result = deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, version);

        assert.isNotNull(result);
        assert.equal(result, path.join(deployer.config.buildPath, deployer.appName, `${deployer.appName}_${version}.tar`));
    });
    it('should return undefined if archive does not exist', (): void => {
        sinon.stub(fs, 'accessSync').callsFake(sinon.fake());
        sinon.stub(fs, 'existsSync').returns(false);
        const callback = sinon.fake();
        sinon.stub(childProcess, 'execSync').callsFake(callback);
        const deployer = new MeteorDeployer(MeteorSettingsFixture, ConfigurationFixture);
        const version = '9.9.9';
        
        let result = deployer.tarBundle(deployer.bundlePath, deployer.config.buildPath, version);

        assert.isUndefined(result);
    });
});