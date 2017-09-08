import Parse from 'parse/node';
import * as Utils from '../../../utils';
import {
  userRequire
} from '../middleware/require';

exports.command = 'set [key] [value]'

exports.describe = 'Cập nhật setting của tài khoản'

exports.handler = userRequire(argv => {
  console.log('KEY: ' + argv.key);
  console.log('VALUE: ' + argv.value);
  let reply = argv.reply;
  let key = argv.key;
  let value = argv.value;
  if (key == null || value == null) {
    reply('Thiếu key và value. Ví dụ: setting set <key> <value>');
    argv.reject('Thiếu key và value. Ví dụ: setting set <key> <value>');
    return;
  }
  let { user } = argv.parseData;
  let Setting = Parse.Object.extend('Setting');
  let query = new Parse.Query(Setting);
  query.equalTo("user", user);
  query.equalTo("key", key);
  query.find({ useMasterKey: true }).then(results => {
    if (results.length <= 0) {
      let setting = new Setting();
      setting.set("user", user);
      setting.set("key", key);
      setting.set("value", value);
      setting.save(null, { useMasterKey: true }).then(setting => {
        reply(`Đã cài đặt ${key} với giá trị ${value}!`);
        argv.resolve('OK');
      })
    } else {
      let setting = results[0];
      setting.set("value", value);
      setting.save(null, { useMasterKey: true }).then(setting => {
        reply(`Đã cập nhật ${key} với giá trị ${value}!`);
        argv.resolve('OK');
      })
    }
  })
});
