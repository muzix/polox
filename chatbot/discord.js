
// Import the discord.js module
const Discord = require('discord.js');

import polonie from '../command/polonie';

export const initializeDiscord = (client) => {
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

    // console.log(message.channel.id);
    if(message.channel.type !== 'dm' &&
    message.channel.id !== '344357179266039828' &&
    message.channel.id !== '316438470191087616') {
      return;
    }

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if(message.content.indexOf(PREFIX) !== 0) return;

    let commandStr = message.content.slice(PREFIX.length).trim();
    let fakeArgv = ['/usr/bin/node', './command/polonie.js'];
    let realArgv = commandStr.split(/\s+/);
    let cmd = realArgv[0];

    if (cmd === 'register') {
      if (message.channel.type !== 'dm') {
        // Message isn't sent in direct channel
        message.channel.send('Thông tin tế nhị, pm riêng đi thím ;)')
        return;
      }
    }

    let argv = fakeArgv.concat(realArgv);
    // if (cmd === 'register' || cmd === 'account') {
      argv = argv.concat(['--userid', message.author.id, '--exchange', 'BITTREX']);
    // }
    console.log(argv);
    polonie.parse(argv, (msg, isPrivate) => {
      if (!isPrivate) {
        message.channel.send(msg);
      } else {
        message.author.send(msg);
      }
    });
  });

  // Log our bot in
  client.login(token);
}

// Create an instance of a Discord client
const client = new Discord.Client();
export default client;
