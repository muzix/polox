const Bittrex = require('bittrex-wrapper');
const Poloniex = require('poloniex-api-node');

const bittrexClient = new Bittrex();
export const getClient = (exchange, key, secret) => {
  if (exchange === 'BITTREX') {
    return new Bittrex(key, secret);
  } else if (exchange === 'POLONIEX') {
    return new Poloniex(key, secret);
  }
  return null;
}
export const getTicker = (market) => bittrexClient.publicGetTicker(market);
export const getMarketSummaries = () => bittrexClient.publicGetMarketSummaries();
export const getBalances = (client) => {
  let ret = {
    currency : '',
		balance : 0.00000000,
		available : 0.00000000,
		pending : 0.00000000,
    btcValue: 0.00000000,
  }
  if (client instanceof Bittrex) {
    return client.accountGetBalances().then(response => {
      if (response.success === false) throw response;
      let result = response.result;
      return result.map(balance => {
        return {
          ...ret,
          currency: balance.Currency,
          balance: balance.Balance,
          available: balance.Available,
          pending: balance.Pending,
        };
      });
    });
  } else if (client instanceof Poloniex) {
    return client.returnCompleteBalances().then(balances => {
      return Object.keys(balances).map(key => {
        let balance = balances[key];
        return {
          ...ret,
          currency: key,
          balance: parseFloat(balance.available) + parseFloat(balance.onOrders),
          available: parseFloat(balance.available),
          pending: parseFloat(balance.onOrders),
          btcValue: parseFloat(balance.btcValue),
        };
      });
    });
  }
}
