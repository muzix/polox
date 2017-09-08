import Parse from 'parse/node';
import * as Exchange from '../../exchange';

exports.command = 'ticker <market>'

exports.describe = 'Get ticker of market'

exports.handler = argv => {
  let reply = argv.reply;
  let market = argv.market;
  Exchange.getTicker(market)
  .then(data => {
    let message = `Bid: ${data.result.Bid}\nAsk: ${data.result.Ask}\nLast: ${data.result.Last}`;
    reply(message);
  })
  .catch(error => reply(error));
}
