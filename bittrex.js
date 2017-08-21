require('dotenv').config();
// var FixedArray = require("fixed-array");
// Init Bittrex API client
export const bittrex = require('node.bittrex.api');

bittrex.options({
  'apikey' : process.env.BITTREX_API_KEY,
  'apisecret' : process.env.BITTREX_API_SECRET,
  'stream' : false, // will be removed from future versions
  'verbose' : true,
  'cleartext' : false
});

// const ORDER_BOOK_LIMIT = 50;
// let marketOrderBook = {};
//
// function bittrexClient() {
//   buildSubscribeMarket(bittrex).then(subscribeMarkets => {
//     return subscribeMarket(bittrex, subscribeMarkets);
//   }).then(() => {
//     console.log('Next');
//   });
// }
//
// function buildSubscribeMarket(bittrex) {
//   return new Promise((resolve, reject) => {
//     bittrex.getmarketsummaries(data => {
//       let markets = data.result;
//       let market;
//       let subscribeMarkets = [];
//       for (market of markets) {
//         if (market.MarketName.startsWith('BTC-DOGE')) {
//           subscribeMarkets.push(market.MarketName);
//           marketOrderBook[market.MarketName] = {
//             MarketName: market.MarketName,
//             Nounce: 0,
//             Buys: new FixedArray(ORDER_BOOK_LIMIT),
//             Sells: new FixedArray(ORDER_BOOK_LIMIT),
//             Fills: new FixedArray(ORDER_BOOK_LIMIT),
//           };
//         }
//       }
//       resolve(subscribeMarkets);
//     });
//   });
// }
//
// function subscribeMarket(bittrex, subscribeMarkets) {
//   return new Promise((resolve, reject) => {
//     bittrex.websockets.subscribe(subscribeMarkets, function(data) {
//       // console.log(data);
//       if (data.M === 'updateExchangeState') {
//         data.A.forEach(function(data_for) {
//           let book = marketOrderBook[data_for.MarketName];
//           let newBook = Object.assign({}, book);
//           newBook.Nounce = data_for.Nounce;
//           let buy, sell, fill;
//           for (buy of data_for.Buys) {
//             newBook.Buys.push(buy);
//           }
//           for (sell of data_for.Sells) {
//             newBook.Sells.push(sell);
//           }
//           for (fill of data_for.Fills) {
//             newBook.Fills.push(fill);
//           }
//
//           marketOrderBook[data_for.MarketName] = newBook;
//         });
//         // console.log(marketOrderBook['BTC-DOGE'].Buys.values());
//       }
//     });
//     resolve('OK');
//   });
// }
//
// export default bittrexClient;
