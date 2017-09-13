import Parse from 'parse/node';
import * as Exchange from '../../exchange';
import {
  exchangeRequire
} from './middleware/require';
var pad = require('pad-right');

exports.command = 'autobuy'

exports.describe = 'Invest some moni for filthy reech dream'

exports.builder = yargs => yargs.options({
  'market': {
    'demandOption': true,
    'describe': 'Market name',
    'type': 'string'
  },
  'rate': {
    demandOption: true,
    describe: 'Enter rate',
    type: 'number'
  },
  'profit': {
    demandOption: true,
    describe: 'Which rate will place takeprofit order',
    type: 'number'
  },
  'loss': {
    demandOption: true,
    describe: 'Which rate will place cutloss order',
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
  },
  'share': {
    demandOption: false,
    describe: 'Do you want to share this with other Trader for Fame?',
  }
}).check(argv => {
  return argv.btc || argv.quantity;
});

exports.handler = exchangeRequire((user, exchangeName, exchangeClient, argv) => {
  let reply = argv.reply;
  let { market, rate, profit, loss, btc, share } = argv;
  let quantity = btc / rate;
  Exchange.buyLimit(exchangeClient)(market, quantity, rate)
  .then(order => {

  })
  .catch(error => reply(error.message))
})
