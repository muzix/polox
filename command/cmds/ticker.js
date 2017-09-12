import Parse from 'parse/node';
import * as Exchange from '../../exchange';

exports.command = 'ticker <market>'

exports.describe = 'Get ticker of market'

exports.handler = argv => {
  let reply = argv.reply;
  let market = argv.market;
  Exchange.getTicker(market)
  .then(data => {
    let message = `Bid: ${data.result.Bid.toFixed(8)}\nAsk: ${data.result.Ask.toFixed(8)}\nLast: ${data.result.Last.toFixed(8)}`;
    reply(message);
  })
  .catch(error => reply(error));
}
