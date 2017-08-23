import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const account = (reply) => {
  if (program.userid == null)
  {
    reply('Lệnh không hợp lệ!');
  } else {
    var Account = Parse.Object.extend("Account");
    var query = new Parse.Query(Account);
    query.equalTo("user_id", program.userid);
    query.find({ useMasterKey: true }).then(results => {
      if (results.length <= 0) {
        reply('Tài khoản chưa được tạo!');
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
        });
      }
    });
  }
}
