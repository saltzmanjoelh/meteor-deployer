[![Build Status](https://travis-ci.org/saltzmanjoelh/meteor-deployer.svg?branch=master)](https://travis-ci.org/saltzmanjoelh/meteor-deployer)  [![Coverage Status](https://coveralls.io/repos/github/saltzmanjoelh/meteor-deployer/badge.svg?branch=master)](https://coveralls.io/github/saltzmanjoelh/meteor-deployer?branch=master)

## Install
`npm install -g @saltzmanjoelh/meteor-deployer`

## Usage
`meteor-deployer TARGET [ACTIONS] [OPTIONS]`

## Example
`meteor-deployer staging`

| TARGET                | Description                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| staging or production | Used to determine which settings and deployment files to use. Any target name can be used. For example `meteor-deployer staging` will use staging.json and staging.config.json. |

| Action       | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| build        | Build the Meteor bundle, copy the settings json and create a Dockerfile in the bundle. |
| docker-build | Executes `docker build` with the Dockerfile in the built bundle directory.             |
| tar          | Creates a tarball of the bundle in the build directory.                                |

| Option   | Description                                                                           |
| -------- | --------------------------------------------------------------------------------------|
| --source | The path to the meteor package to work with. `process.cwd()` will be used by default. |

## Example Meteor settings json file
```
{
    "name": "Example App",
    "ROOT_URL": "https://app.example.com",
    "PORT": 3000,
    "MONGO_URL": "mongodb+srv://user:db.example.com/exampleApp"
}
```

## Example deployment configuration json file:
```
{
    "buildPath": "/tmp/appBuild",
    "s3": {
        "bucket": "app-example-com/productionBundles",
        "credentialsPath": "./path/to/aws_credentials"
    }
}
```

Thanks: https://blog.mvp-space.com/how-to-dockerize-a-meteor-app-with-just-one-script-4bccb26f6ff0