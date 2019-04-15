// import * as yargs from 'yargs'
// /**
//      * 
//      * @param {string[]} argv 
//      */
//     run(argv: string[]) {
//         try {
//             this.parseArgs(argv);
//             this.validateArgs();
//             // this.parseSettings(this.settingsPath);
//             this.createBuild();
//             this.copySettings();
//             this.createPackageFile();
//             this.createDockerfile();
//             console.log('Thanks: https://blog.mvp-space.com/how-to-dockerize-a-meteor-app-with-just-one-script-4bccb26f6ff0');
//         } catch (e) {
//             console.log(e);
//         }

//     }
//     /**
//      * 
//      * @param {string[]} argv 
//      */
//     parseArgs(argv: string[]) {
//         // console.log('=> Parsing args');
//         // for (let index = 2; index < argv.length; ++index) {
//         //     let value = process.argv[index];
//         //     // console.log(`index: ${index} value: ${value}`)
//         //     if (value.startsWith('--')) {
//         //         const prop = value.replace('--', '');
//         //         this[prop] = process.argv[index + 1];
//         //         ++index;
//         //     } else if (index > 1 && value.length > 0) {
//         //         this.buildPath = value;
//         //     }
//         // }
//         yargs.scriptName('MeteorBuilder')
//             .usage('$0 <cmd> --settings ')
//             .command('build', 'Build a Meteor bundle', function (yargs) {
//                 return yargs.option('settings', {
//                   demandOption: true
//                 })
//               })
//               .help()
//               .argv
//             // .command('hello [name]', 'welcome ter yargs!', ([key: String]) => {
//             //     yargs.positional('name', {
//             //       type: 'string',
//             //       default: 'Cambi',
//             //       describe: 'the name to say hello to'
//             //     })
//             //   }, function (Options) {
//             //     console.log('hello', argv.name, 'welcome to yargs!')
//             //   })
//     }
//     validateArgs() {
//         console.log('=> Validating args');
//         let errors = ['You must specify --settings in the args. Typically it\'s a production.json file.',
//             'You must specify a path to the build directory'];
//         if (!this.hasOwnProperty('settings') &&
//             !this.hasOwnProperty('buildPath')) {
//             throw 'Usage: `node build.js --settings production.json /tmp/app_build`. \n' + errors.join('\n');
//         } else if (!this.hasOwnProperty('settings')) {
//             throw errors[0];
//         } else if (!this.hasOwnProperty('buildPath')) {
//             throw errors[1];
//         }
//     }