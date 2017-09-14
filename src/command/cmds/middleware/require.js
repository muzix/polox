import Parse from 'parse/node';
import {
  getClient
} from '../../../exchange';
import * as Utils from '../../../utils';

export const userRequire = fnc => argv => {
  let reply = argv.reply;
  if (argv.userId == null) {
    reply('Lệnh không hợp lệ!');
  } else {
    // var Account = Parse.Object.extend("Account");
    let query = new Parse.Query(Parse.User);
    query.equalTo("username", argv.userId);
    query.find({ useMasterKey: true }).then(results => {
      if (results.length <= 0) {
        reply('Tài khoản chưa được tạo!');
        argv.reject('Tài khoản chưa được tạo!');
      } else {
        let user = results[0];
        argv.parseData = { user };
        fnc(user, argv);
      }
    });
  }
}

export const exchangeRequire = fnc => userRequire((user, argv) => {
  let reply = argv.reply;
  let promise = new Promise((resolve, reject) => {
    if (argv.exchange != null) {
      resolve(argv.exchange)
    } else {
      let Setting = Parse.Object.extend("Setting");
      let settingQuery = new Parse.Query(Setting);
      settingQuery.equalTo("user", user);
      settingQuery.equalTo("key", "activeExchange");
      settingQuery.find({ useMasterKey: true })
      .then(results => {
        if (results.length <= 0) {
          reject('Chưa cài đặt sàn mặc định cho mọi giao dịch');
        } else {
          let setting = results[0];
          resolve(setting.get('value'));
        }
      })
    }
  });
  promise.then(exchange => {
    let categories = ['BITTREX', 'POLONIEX'];
    if (!categories.includes(exchange)) {
      reply('Cài đặt activeExchange chỉ nhận giá trị BITTREX hoặc POLONIEX.\nE.g: !setting set activeExchange BITTREX');
      return;
    }
    var Account = Parse.Object.extend("Account");
    var query = new Parse.Query(Account);
    query.equalTo("user", user);
    query.equalTo("exchange", exchange);
    query.find({ useMasterKey: true }).then(results => {
      if (results.length <= 0) {
        reply('Tài khoản sàn chưa được đăng ký!');
      } else {
        let account = results[0];
        let p1 = Utils.decrypt(account.get('api_key'));
        let p2 = Utils.decrypt(account.get('api_secret'));
        Promise.all([p1, p2]).then(values => {
          let exchangeClient = getClient(exchange, values[0], values[1]);
          if (exchangeClient == null) {
            reply(`Sàn ${exchange} chưa được hỗ trợ!`);
          } else {
            fnc(user, exchange, exchangeClient, argv);
          }
        });
      }
    });
  }).catch(error => {
    argv.reject(error);
  });
});
