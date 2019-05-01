[![Build Status](https://travis-ci.org/saltzmanjoelh/meteor-deployer.svg?branch=master)](https://travis-ci.org/saltzmanjoelh/meteor-deployer)  [![Coverage Status](https://coveralls.io/repos/github/saltzmanjoelh/meteor-deployer/badge.svg?branch=master)](https://coveralls.io/github/saltzmanjoelh/meteor-deployer?branch=master)

## Install
`npm install -g @saltzmanjoelh/meteor-deployer`

## Usage
`meteor-deployer --settings JSON_FILE_PATH [OPTIONS] [ACTIONS] `

## Example
`meteor-deployer --settings production.json build`

| Option      | Description                                 |
| ----------- | ------------------------------------------- |
| --buildPath | Path to where you want the bundle built at. |

| Action       | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| build        | Build the Meteor bundle, copy the settings json and create a Dockerfile. |
| docker-build | Calls `docker build` with the Dockerfile in the built bundle directory.  |

## Example Settings json file
```
{
    "name": "Example App",
    "ROOT_URL": "https://app.example.com",
    "PORT": 3000,
    "MONGO_URL": "mongodb+srv://user:db.example.com/exampleApp"
}
```

## Dockerize
Building a bundle will also create a `Dockerfile` in the bundle.

`cd $buildPath && docker build .`