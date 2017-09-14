import Parse from 'parse/node';
import * as Utils from '../../../utils';
import {
  userRequire
} from '../middleware/require';
var pad = require('pad-right');

exports.command = 'show [key]'

exports.describe = 'Xem danh sách các cài đặt của tài khoản'

exports.handler = userRequire((user, argv) => {
  console.log('KEY: ' + argv.key);
  let reply = argv.reply;
  let key = argv.key;
  let Setting = Parse.Object.extend('Setting');
  let query = new Parse.Query(Setting);
  query.equalTo("user", user);
  if (key != null) {
    query.equalTo("key", key);
  }
  query.find({ useMasterKey: true }).then(results => {
    if (results.length <= 0) {
      reply('Không có cài đặt nào');
      argv.resolve('OK');
    } else {
      let message = `\`\`\`\n`;
      let tmp = `${pad('KEY', 25, ' ')}${pad('VALUE', 25, ' ')}\n`;
      message = message + tmp;
      results.map(setting => {
        let key = setting.get('key');
        let value = setting.get('value');
        let tmp = `${pad(key, 25, ' ')}${pad(value, 25, ' ')}\n`;
        message = message + tmp;
      });
      message = message + `\`\`\``;
      reply(message);
      argv.resolve('OK');
    }
  });
});
