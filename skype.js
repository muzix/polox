var builder = require('botbuilder');
import command from './polonie';
// Create chat bot
export const connector = new builder.ChatConnector({
    appId: process.env.SKYPE_APP_ID,
    appPassword: process.env.SKYPE_APP_PWD
});
var bot = new builder.UniversalBot(connector);

//Bot on
bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});
bot.on('typing', function (message) {
  // User is typing
});
bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});
//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content){
  return this.indexOf(content) !== -1;
}
bot.dialog('/', function (session) {
  let commandStr = session.message.text.trim();
  let userId = session.message.user.id;
  let userName = session.message.user.name;
  if (userId === '29:1XxC6dah22XLrk8Z5_LcEglvamF2tmaznBmXBl9ugFHc') {
    // console.log(JSON.stringify(session.message));
    // console.log(commandStr);
    let fakeArgv = ['', ''];
    let realArgv = commandStr.split(/\s+/);
    realArgv.shift();
    let argv = fakeArgv.concat(realArgv);
    console.log(argv);
    command.parse(argv, msg => {
      session.send(msg);
    });
  } else {
    session.send('Xin lỗi, bạn là ai nhỉ? Mình quen nhau không? <ss type =\"rofl\"></ss>');
  }
});
