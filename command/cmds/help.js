const yargs = require('yargs');

exports.command = 'bithelp'

exports.describe = 'Help help'

exports.handler = argv => {
  let reply = argv.reply;
  console.log('HELP!');
  yargs.showHelp(data => reply(data));
}
