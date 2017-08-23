import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const balances = (reply) => {
  bittrex.getbalances(data => {
    if (data.success) {
      let balances = data.result;
      let availBalances = balances.filter(balance => {
        return balance.Balance > 0;
      });
      if (availBalances.length > 0) {
        let message = '';
        availBalances.map(balance => {
          let info = `#${balance.Currency}\nBalance: ${balance.Balance}\nAvailable: ${balance.Available}\nPending: ${balance.Pending}\nAddress: ${balance.CryptoAddress}\n\n`;
          message = message + info;
        });
        // console.log(message);
        reply(message);
      } else {
        reply("Tài khoản không có đồng nào, vãi nghèo :((");
      }
    } else {
      reply(data.message);
    }
  })
}
