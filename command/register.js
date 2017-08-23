import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const register = (reply) => {
  console.log('USERID: ' + program.userid);
  console.log('EXCHANGE: ' + program.exchange);
  console.log('API_KEY: ' + program.apikey);
  console.log('API_SECRET: ' + program.apisecret);

  if (program.userid == null ||
    program.exchange == null ||
    program.apikey == null ||
    program.apisecret == null)
  {
    reply('Lệnh không hợp lệ!');
  } else {
    if (program.exchange !== 'BITTREX' && program.exchange !== 'POLONIEX') {
      reply('Chỉ hỗ trợ sàn BITTREX và POLONIEX');
    } else {
      let p1 = Utils.encrypt(program.apikey);
      let p2 = Utils.encrypt(program.apisecret);
      Promise.all([p1, p2]).then(values => {
        let encryptedApiKey = values[0];
        let encryptedApiSecret = values[1];
        let Account = Parse.Object.extend('Account');
        let query = new Parse.Query(Account);
        query.equalTo('user_id', program.userid);
        query.equalTo('exchange', program.exchange);
        query.find({ useMasterKey: true }).then(results => {
          let account = null;
          let accountExist = false;
          if (results.length <= 0) {
            // Create new Account
            accountExist = false;
            account = new Account();
            account.set('user_id', program.userid);
            account.set('exchange', program.exchange);
          } else if (results.length === 1){
            // Get existing account
            accountExist = true;
            account = results[0];
          } else {
            reply(`Có nhiều tài khoản ${program.exchange} cho tài khoản này. Có gì không đúng?`)
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
    }
  }
}
