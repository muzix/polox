import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const buy = (reply, symbol) => {
  console.log('BUY ' + symbol);
  console.log('RATE: ' + program.rate);
  console.log('BTC: ' + program.btc);
  console.log('TAKE PROFIT: ' + program.takeprofit);
  console.log('CUT LOSS: ' + program.cutloss);

  if (symbol == null ||
    program.rate == null ||
    program.btc == null ||
    program.takeprofit == null ||
    program.cutloss == null)
  {
    reply('Lệnh không hợp lệ!');
  } else {
    let symbolQty = program.btc / program.rate;
    bittrex.buylimit({ market: symbol, quantity: symbolQty , rate: program.rate}, data => {
      if (data.success) {
        createOrder(program.userid, 'long', symbol, program.rate, program.btc, symbolQty, program.takeprofit, program.cutloss, data.result.uuid)
        .then(msg => reply(msg))
        .catch(msg => reply(msg));
      } else {
        reply(data.message);
      }
      // response.success('OK');
    });
  }
}

export const sell = (reply, symbol) => {
  console.log('SELL ' + symbol);
  console.log('RATE: ' + program.rate);
  console.log('BTC: ' + program.btc);
  console.log('TAKE PROFIT: ' + program.takeprofit);
  console.log('CUT LOSS: ' + program.cutloss);

  if (symbol == null ||
    program.rate == null ||
    program.btc == null ||
    program.takeprofit == null ||
    program.cutloss == null)
  {
    reply('Lệnh không hợp lệ!');
  } else {
    let symbolQty = program.btc / program.rate;
    bittrex.selllimit({ market: symbol, quantity: symbolQty , rate: program.rate}, data => {
      if (data.success) {
        createOrder(program.userid, 'short', symbol, program.rate, program.btc, symbolQty, program.takeprofit, program.cutloss, data.result.uuid)
        .then(msg => reply(msg))
        .catch(msg => reply(msg));
      } else {
        reply(data.message);
      }
      // response.success('OK');
    });
  }
}

const createOrder = (userid, position, symbol, rate, btc, quantity, takeprofit, cutloss, uuid) => {
  return new Promise((resolve, reject) => {
    let Order = Parse.Object.extend('Order');
    let order = new Order();
    order.set('position', position);
    order.set('symbol', symbol);
    order.set('rate', rate);
    order.set('btc', btc);
    order.set('quantity', quantity);
    order.set('takeprofit', takeprofit);
    order.set('cutloss', cutloss);
    order.set('uuid', uuid);
    order.set('discord_user_id', userid);
    order.set('status', 'ENTER');
    order.save(null, { useMasterKey: true }).then(obj => {
      // console.log(obj);
      resolve('Lệnh đã được đặt!');
    }, err => {
      // console.log(err.message);
      reject(err.message);
    });
  });
}
