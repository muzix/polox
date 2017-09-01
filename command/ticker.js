import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const ticker = (reply, market) => {
  bittrex.getticker({ market: market }, (data, err) => {
    if (data.success) {
      let message = `Bid: ${data.result.Bid}\nAsk: ${data.result.Ask}\nLast: ${data.result.Last}`;
      reply(message);
    } else {
      if (err) {
        reply(err);
      } else {
        reply(data.message);
      }
    }
  });
}
