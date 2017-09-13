import Parse from 'parse/node';
import * as Exchange from '../../exchange';
import {
  exchangeRequire
} from './middleware/require';
var pad = require('pad-right');

exports.command = 'balances'

exports.describe = 'Get all balances'

exports.handler = exchangeRequire((user, exchangeName, exchangeClient, argv) => {
  let reply = argv.reply;
  Exchange.getBalances(exchangeClient)()
  .then(result => {
    let filterResult = result.filter(balance => balance.balance > 0);
    if (filterResult.length <= 0) {
      reply('Tài khoản không có đồng nào. Vãi nghèo!');
      argv.resolve('OK');
    } else {
      let message = `\`\`\`\n`;
      let tmp = `${pad('Currency', 10, ' ')}${pad('Balance', 15, ' ')}${pad('Available', 15, ' ')}${pad('Pending', 15, ' ')}${pad('BtcValue', 15, ' ')}\n`;
      message = message + tmp;
      filterResult.map(balance => {
        let tmp = `${pad(balance.currency, 10, ' ')}${pad(balance.balance.toString(), 15, ' ')}${pad(balance.available.toString(), 15, ' ')}${pad(balance.pending.toString(), 15, ' ')}${pad(balance.btcValue.toString(), 15, ' ')}\n`;
        message = message + tmp;
      });
      message = message + `\`\`\``;
      reply(message);
      argv.resolve('OK');
    }
  })
  .catch(error => reply(error.message));
})
