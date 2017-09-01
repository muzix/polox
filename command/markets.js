import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';
var pad = require('pad-right');

export const markets = (reply) => {
  bittrex.getmarketsummaries(data => {
    if (data.success) {
      let markets = data.result;
      let filtered = markets.filter(market => market.MarketName.startsWith('BTC-'));
      let sortedByVolume = filtered.sort((a, b) => b.BaseVolume - a.BaseVolume);
      let sub = sortedByVolume.slice(0, 19);
      let message = `\`\`\`\n`;
      let tmp = `${pad('MARKET', 11, ' ')}${pad('VOLUME', 10, ' ')}${pad('LAST', 12, ' ')}${pad('HIGH', 12, ' ')}${pad('LOW', 12, ' ')}\n`;
      message = message + tmp;
      sub.map(market => {
        let tmp = `${pad(market.MarketName, 11, ' ')}${pad(parseInt(market.BaseVolume).toString(), 10, ' ')}${pad(market.Last.toString(), 12, ' ')}${pad(market.High.toString(), 12, ' ')}${pad(market.Low.toString(), 12, ' ')}\n`;
        message = message + tmp;
      });
      message = message + `\`\`\``;
      reply(message);
    }
  });
}
