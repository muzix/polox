const Bittrex = require('bittrex-wrapper');

const bittrexClient = new Bittrex();
export const getClient = (exchange, key, secret) => {
  if (exchange === 'BITTREX') {
    return new Bittrex(key, secret);
  }
  return null;
}
export const getTicker = (market) => bittrexClient.publicGetTicker(market);
export const getMarketSummaries = () => bittrexClient.publicGetMarketSummaries();
