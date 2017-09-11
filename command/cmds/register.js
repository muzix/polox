import Parse from 'parse/node';
import { bittrex } from '../../exchange';
import * as Utils from '../../utils';

exports.command = 'register'

exports.describe = 'Đăng ký tài khoản sàn với Polonie'

exports.builder = yargs => yargs.options({
  'exchange': {
    'demandOption': true,
    'describe': 'Exchange name (BITTREX/POLONIEX)',
    'type': 'string'
  },
  'key': {
    demandOption: true,
    describe: 'Exchange api key',
    type: 'string'
  },
  'secret': {
    demandOption: true,
    describe: 'Exchange api secret',
    type: 'string'
  }
})

exports.handler = argv => {
  console.log('USERID: ' + argv.userId);
  console.log('EXCHANGE: ' + argv.exchange);
  console.log('API_KEY: ' + argv.key);
  console.log('API_SECRET: ' + argv.secret);
  let reply = argv.reply;
  let userid = argv.userId;
  let exchange = argv.exchange;
  let apikey = argv.key;
  let apisecret = argv.secret;
  if (userid == null ||
    exchange == null ||
    apikey == null ||
    apisecret == null)
  {
    reply('Lệnh không hợp lệ!');
  } else {
    if (exchange !== 'BITTREX' && exchange !== 'POLONIEX') {
      reply('Chỉ hỗ trợ sàn BITTREX và POLONIEX');
    } else {
      findOrCreateUserByDiscordId(userid)
      .then(user => {
        // Create Account
        let p1 = Utils.encrypt(apikey);
        let p2 = Utils.encrypt(apisecret);
        Promise.all([p1, p2]).then(values => {
          let encryptedApiKey = values[0];
          let encryptedApiSecret = values[1];
          let Account = Parse.Object.extend('Account');
          let query = new Parse.Query(Account);
          query.equalTo('user', user);
          query.equalTo('exchange', exchange);
          query.find({ useMasterKey: true }).then(results => {
            let account = null;
            let accountExist = false;
            if (results.length <= 0) {
              // Create new Account
              accountExist = false;
              account = new Account();
              // account.set('user_id', userid);
              account.set('exchange', exchange);
              account.set('user', user);
            } else if (results.length === 1){
              // Get existing account
              accountExist = true;
              account = results[0];
            } else {
              reply(`Có nhiều tài khoản ${exchange} cho tài khoản này. Có gì không đúng?`)
              return;
            }
            account.set('api_key', encryptedApiKey);
            account.set('api_secret', encryptedApiSecret);
            account.save(null, { useMasterKey: true }).then(obj => {
              // console.log(obj);
              if (accountExist) {
                reply('Tài khoản đã được cập nhật');
              } else {
                reply('Tài khoản đã được tạo!');
              }
            }, err => {
              // console.log(err.message);
              reply(err.message);
            });
          })
        });
      });
    }
  }
}

const findOrCreateUserByDiscordId = discordId => {
  return new Promise((resolve, reject) => {
    // Create or find User by Discord User Id
    let userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("username", discordId);
    userQuery.find({ useMasterKey: true }).then(results => {
      if (results.length <= 0) {
        let user = new Parse.User();
        user.set("username", discordId);
        user.set("password", "p0l0X_p@ssw0Rd");
        user.set("email", `${discordId}@discordapp.com`);
        user.signUp(null, { useMasterKey: true }).then(user => {
          resolve(user);
        }, error => {
          reject(error);
        })
      } else {
        let user = results[0];
        resolve(user);
      }
    }, error => {
      reject(error);
    })
  });
}
