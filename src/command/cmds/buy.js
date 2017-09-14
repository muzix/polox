import Parse from 'parse/node';
import * as Exchange from '../../exchange';
import {
  exchangeRequire
} from './middleware/require';
var pad = require('pad-right');
var debug = require('debug')('polonie');
import * as DB from '../../database';

exports.command = 'buy'

exports.describe = 'Invest moni - Manual Mode'

exports.builder = yargs => yargs.options({
  'market': {
    demandOption: true,
    describe: 'Market name',
    type: 'string'
  },
  'rate': {
    demandOption: true,
    describe: 'Enter rate',
    type: 'number'
  },
  'quantity': {
    demandOption: false,
    describe: 'Quantity of coin for this Order',
    type: 'number'
  },
  'btc': {
    demandOption: false,
    describe: 'Quantity of BTC spent for this Order',
    type: 'number'
  }
}).check(argv => {
  if (argv.btc || argv.quantity) return true;
  throw(new Error('Must provide at least --quantity or --btc'));
});

exports.handler = exchangeRequire((user, exchangeName, exchangeClient, argv) => {
  let reply = argv.reply;
  let { market, rate, btc, quantity } = argv;
  if (quantity == null) {
    quantity = btc / rate;
  }
  debug('Quantity: ', quantity);
  Exchange.buyLimit(exchangeClient)(market, quantity, rate)
  .then(orderId => {
    return DB.createOrder(exchangeName, orderId, user, 'manual', 'long', market, rate, btc, quantity)
    .catch(error => {
      // Rollback order
      Exchange.cancelOrder(exchangeClient)(orderId).then(isSuccess => {
        reply(`Có lỗi xảy ra! Đã rollback lệnh trên exchange.\n\`\`\`${error.message}\`\`\``);
      }).catch(error => {
        reply(`Có lỗi xảy ra, tuy nhiên lệnh đã ăn trên exchange.\nTrader tự xử nhé!`);
      });
    });
  })
  .then(order => {
    reply(`Lệnh đã được đặt! :ok_hand:\n\`\`\`${order.id}\`\`\``);
  })
  .catch(error => reply(error.message))
})
