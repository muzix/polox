import Parse from 'parse/node';
import {
  userRequire
} from './middleware/require';
import * as Utils from '../../utils';

exports.command = 'account'

exports.describe = 'Hiển thị danh sách sàn đã đăng ký'

exports.handler = userRequire(argv => {
  let reply = argv.reply;
  let { user } = argv.parseData;
  var Account = Parse.Object.extend("Account");
  var query = new Parse.Query(Account);
  query.equalTo("user", user);
  query.find({ useMasterKey: true }).then(results => {
    if (results.length <= 0) {
      reply('Bạn chưa đăng ký sàn nào!');
      argv.resolve('OK');
    } else {
      let promises = results.map(result => {
        let exchange = result.get('exchange');
        let encryptedApiKey = result.get('api_key');
        let encryptedApiSecret = result.get('api_secret');
        let p1 = Utils.decrypt(encryptedApiKey);
        let p2 = Utils.decrypt(encryptedApiSecret);
        return Promise.all([p1, p2]).then(values => {
          let censored1 = values[0].substr(0,5) + values[0].substr(6, values[0].length - 5).replace(/./g, '#');
          let censored2 = values[1].substr(0,5) + values[1].substr(6, values[1].length - 5).replace(/./g, '#');
          return `Exchange: ${exchange}\nAPI_KEY: ${censored1}\nAPI_SECRET: ${censored2}\n`;
        });
      });
      Promise.all(promises).then(values => {
        let message = values.join('\n');
        reply(message, true);
        argv.resolve('OK');
      });
    }
  });
});
