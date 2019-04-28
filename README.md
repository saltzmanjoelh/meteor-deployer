[![Build Status](https://travis-ci.org/saltzmanjoelh/meteor-deployer.svg?branch=master)](https://travis-ci.org/saltzmanjoelh/meteor-deployer)  [![Coverage Status](https://coveralls.io/repos/github/saltzmanjoelh/meteor-deployer/badge.svg?branch=master)](https://coveralls.io/github/saltzmanjoelh/meteor-deployer?branch=master)

## Install
`npm install -g @saltzmanjoelh/meteor-deployer`

## Usage
`meteor-deployer --settings file.json [options]`

| Option      | Description                                 |
| ----------- | ------------------------------------------- |
| --buildPath | Path to where you want the bundle built at. |

## Example Settings json file
```
{
    "name": "Example App",
    "ROOT_URL": "https://app.example.com",
    "PORT": 3000,
    "MONGO_URL": "mongodb+srv://user:db.example.com/exampleApp"
}
```