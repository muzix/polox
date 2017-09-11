import Parse from 'parse/node';
import * as Exchange from '../../exchange';
import {
  exchangeRequire
} from './middleware/require';
var pad = require('pad-right');

exports.command = 'balances'

exports.describe = 'Get all balances'

exports.handler = exchangeRequire(argv => {
  let reply = argv.reply;
  let {
    exchangeClient,
    exchangeName,
  } = argv.parseData;
  Exchange.getBalances(exchangeClient)
  .then(result => {
    let filterResult = result.filter(balance => balance.balance > 0);
    if (filterResult.length <= 0) {
      reply('Tài khoản không có đồng nào. Vãi nghèo!');
      argv.resolve('OK');
    } else {
      let message = `\`\`\`\n`;
      let tmp = `${pad('Currency', 10, ' ')}${pad('Balance', 20, ' ')}${pad('Available', 20, ' ')}${pad('Pending', 20, ' ')}${pad('BtcValue', 20, ' ')}\n`;
      message = message + tmp;
      filterResult.map(balance => {
        let tmp = `${pad(balance.currency, 10, ' ')}${pad(balance.balance.toString(), 20, ' ')}${pad(balance.available.toString(), 20, ' ')}${pad(balance.pending.toString(), 20, ' ')}${pad(balance.btcValue.toString(), 20, ' ')}\n`;
        message = message + tmp;
      });
      message = message + `\`\`\``;
      reply(message);
      argv.resolve('OK');
    }
  })
  .catch(error => reply(error.message));
})
