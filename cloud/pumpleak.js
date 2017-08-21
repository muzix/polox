import { bittrex } from '../bittrex';
const chalk = require('chalk');

Parse.Cloud.define('pumpleak', (request, response) => {
  let market = request.params.market;
  let seed = request.params.seed;
  let priceSafe = request.params.priceSafe;
  let fake = request.params.fake;
  let holdRatio = request.params.holdRatio;
  let sellRatio = request.params.sellRatio;
  let sellInterval = request.params.sellInterval;
  let forcePrice = request.params.forcePrice;
  let exitTimer = request.params.exitTimer;
  if (market == null || market === '' || seed == null || priceSafe == null || fake == null || holdRatio == null || sellRatio == null || sellInterval == null) {
    response.error('Market require!');
  } else {
    // var Market = Parse.Object.extend("Market");
    // var query = new Parse.Query(Market);
    // query.equalTo("MarketName", market);
    // query.find({ useMasterKey: true }).then(results => {
    //   var result = results.reduce((r, e, i) => {
    //     let nextMarket = results[i+1];
    //     if (nextMarket) {
    //       let nextLast = nextMarket.get("Last");
    //       let curLast = e.get("Last");
    //       r.push(Number((nextLast / curLast)));
    //     }
    //     return r;
    //   }, []);
    //   console.log(result);
    //   response.success('OK');
    // }, error => {
    //   response.error(error);
    // });
    getOrderBook({ market : market, depth : 50, type : 'both' }, priceSafe).then(data => {
      var Market = Parse.Object.extend('Market');
      var query = new Parse.Query(Market);
      query.equalTo('MarketName', market);
      query.descending("createdAt");
      query.limit(1);
      query.find({ useMasterKey: true }).then(results => {
        let result = results[0];
        let refPrice = result.get('Last');
        if (priceSafe == 0) {
          let sells = data.result.sell;
          let firstAsk = sells[0];
          refPrice = firstAsk.Rate;
        } else {
          if (forcePrice != null) {
            refPrice = forcePrice;
          }
        }
        console.log(chalk.bgGreen.bold(`REF PRICE: ${refPrice}`));
        let holdPrice = refPrice * holdRatio;
        holdPrice = holdPrice.toFixed(8);
        console.log(chalk.bgGreen.bold(`HOLD PRICE: ${holdPrice}`));
        console.log(chalk.bgGreen.bold(`EXIT PRICE X2: ${holdPrice * 2}`));
        console.log(chalk.bgGreen.bold(`EXIT PRICE X3: ${holdPrice * 3}`));
        console.log(chalk.bgGreen.bold(`EXIT PRICE X4: ${holdPrice * 4}`));
        let quantity = seed / holdPrice;
        quantity = quantity.toFixed(8);
        if (quantity === 0) {
          let tmpQty = seed / holdPrice;
          quantity = tmpQty.toFixed(8);
        }
        if (true) {
          if (fake == 1) {
            console.log(chalk.bgGreen.bold(`Buy ${quantity} ${market} at rate ${holdPrice}`));
          } else {
            bittrex.buylimit({ market: market, quantity: quantity , rate: holdPrice}, data => {
              console.log(chalk.bgGreen.bold(data));
              // response.success('OK');
            });
          }
          if (exitTimer == null) {
            setInterval(() => {
              pumpExit(market, seed, holdPrice, sellRatio, fake, quantity);
            }, sellInterval);
          } else {
            setTimeout(() => {
              bittrex.getmarketsummaries(data => {
                let markets = data.result;
                let marketName;
                let subscribeMarkets = [];
                for (marketName of markets) {
                  if (marketName.MarketName === market) {
                    let sellPrice = marketName.Last;
                    console.log(chalk.bgYellow(`LAST EXIT PRICE: ${sellPrice}`));
                    let customSellRatio = sellPrice * 0.95 / holdPrice;
                    pumpExit(market, seed, holdPrice, customSellRatio, fake, quantity);
                    break;
                  }
                }
              });
            }, exitTimer);
          }
        } else {
          console.log(chalk.bgGreen(`Buy ${quantity} ${market} at rate ${holdPrice}`));
          console.log(chalk.bgGreen(`Sell ${quantity} ${market} at rate ${holdPrice * sellRatio}`));
          response.success('Fake');
        }
      });
      // let sells = data.result.sell;
      // let refPrice = 0;
      // if (priceSafe == 1) {
      //   refPrice =
      // }
      // let firstAsk = sells[0];
      // let sell;
      // let availableQty = 0;

      // let quantity = Math.floor(seed / firstAsk.Rate);
      // if (quantity <= firstAsk.Quantity) {
      //   // bittrex.buylimit({ market: market, quantity: quantity , rate: firstAsk.Rate}, data => {
      //   //   console.log(data);
      //   //   response.success('OK');
      //   // });
      //   bittrex.selllimit({ market: market, quantity: 1000, rate: firstAsk.Rate * 3 }, data => {
      //     console.log(data);
      //     response.success(data);
      //   });
      // }
    });
  }
});

function pumpExit(market, seed, holdPrice, sellRatio, fake, quantity) {
  let coinName = market.split('-')[1];
  bittrex.getbalances(data => {
    let wallets = data.result.filter(item => {
      return item.Currency === coinName;
      // return item.Currency === 'BTC';
    });
    if ((wallets != null && wallets.length > 0) || fake == 1) {
      // console.log(wallets);
      // console.log(coinName);
      let balance = wallets[0];
      if ((balance != null && balance.Balance > 0) || fake == 1) {
        // fake balance
        if (fake == 1) {
          balance = { Balance: quantity };
          // balance.Balance = quantity;
        }

        let sellPrice = holdPrice * sellRatio;
        sellPrice = sellPrice.toFixed(8);
        if (sellRatio < 10) {
          console.log(chalk.bgYellow(`Sell ${balance.Balance} ${market} at rate ${sellPrice}`));
          bittrex.selllimit({ market: market, quantity: balance.Balance, rate: holdPrice * sellRatio }, data => {
            console.log(chalk.bgYellow(JSON.stringify(data)));
            if (data.success === true) {
              process.exit(0);
            }
          })
        } else {
          let sellQty = seed / sellPrice;
          sellQty = Math.floor(sellQty);
          console.log(sellQty);
          for (var i=1; i < sellRatio + 100; i++) {
            if (sellQty * i >= balance.Balance) {
              sellQty = balance.Balance - sellQty * (i - 1);
              console.log(chalk.bgYellow(`Sell ${sellQty} ${market} at rate ${sellPrice}`));
              bittrex.selllimit({ market: market, quantity: sellQty, rate: sellPrice }, data => {
                console.log(chalk.bgYellow(JSON.stringify(data)));
                if (data.success === true) {
                  process.exit(0);
                }
                // response.success(data);
              })
              break;
            } else {
              console.log(chalk.bgYellow(`Sell ${sellQty} ${market} at rate ${sellPrice}`));
              bittrex.selllimit({ market: market, quantity: sellQty, rate: sellPrice }, data => {
                console.log(chalk.bgYellow(JSON.stringify(data)));
                // response.success(data);
                if (data.success === true) {
                  process.exit(0);
                }
              })
            }
          }
        }
      } else {
        console.log(chalk.bgRed('Balance is empty'));
      }
    } else {
      console.log(chalk.bgRed('Wallet not ready'));
    }
  });
}

function getOrderBook(params, isSafe) {
  return new Promise((resolve, reject) => {
    if (isSafe == 1) resolve('OK');
    else {
      bittrex.getorderbook(params, data => {
        resolve(data);
      });
    }
  })
}

Parse.Cloud.define('saveticker', (request, response) => {
  ticker();
  response.success('OK');
});

Parse.Cloud.job('ticker', (request, status) => {
  status.message('Ticker activated!');
  setTimeout(ticker, 5000);
});

function ticker() {
  // return new Promise((resolve, reject) => {
    bittrex.getmarketsummaries(data => {
      let markets = data.result;
      let market;
      let subscribeMarkets = [];
      for (market of markets) {
        if (market.MarketName.startsWith('BTC')) {
          // console.log(market);
          let Market = Parse.Object.extend('Market');
          let marketObj = new Market();
          marketObj.set("MarketName", market.MarketName);
          marketObj.set("High", market.High);
          marketObj.set("Low", market.Low);
          marketObj.set("Volume", market.Volume);
          marketObj.set("Last", market.Last);
          marketObj.set("BaseVolume", market.BaseVolume);
          marketObj.set("TimeStamp", market.TimeStamp);
          marketObj.set("Bid", market.Bid);
          marketObj.set("Ask", market.Ask);
          marketObj.set("OpenBuyOrders", market.OpenBuyOrders);
          marketObj.set("OpenSellOrders", market.OpenSellOrders);
          marketObj.set("PrevDay", market.PrevDay);
          marketObj.set("Created", market.Created);
          marketObj.save(null, { useMasterKey: true }).then(object => {
            // console.log('Save ok');
          }, err => {
            console.log(err);
          });
        }
      }
    });
  // });
}
