
// Import the discord.js module
const Discord = require('discord.js');

import command from './polonie';

// Create an instance of a Discord client
export const client = new Discord.Client();

const PREFIX = '!';

// The token of your bot - https://discordapp.com/developers/applications/me
const token = process.env.DISCORD_TOKEN;

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('Discord bot ready!');
});

client.on("message", message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file.
  if(message.content.indexOf(PREFIX) !== 0) return;

  let commandStr = message.content.slice(PREFIX.length).trim();
  let fakeArgv = ['', ''];
  let realArgv = commandStr.split(/\s+/);
  let cmd = realArgv[0];
  let argv = fakeArgv.concat(realArgv);
  // if (cmd === 'register' || cmd === 'account') {
    argv = argv.concat(['--userid', message.author.id, '--exchange', 'BITTREX']);
  // }
  console.log(argv);
  command.parse(argv, msg => {
    message.channel.send(msg);
  });
});

// Log our bot in
client.login(token);
