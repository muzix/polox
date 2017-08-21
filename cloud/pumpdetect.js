import { bittrex } from '../bittrex';
const chalk = require('chalk');

Parse.Cloud.job('pumpdetect', (request, status) => {
  status.message('Shitcoin Pump detection activated!');
  pumpdetect();
});

function pumpdetect() {
  let lastVolMarkets = {};
  bittrex.getmarketsummaries(data => {
    let lowVolMarket = [];
    for(var i in data.result) {
      let market = data.result[i];
      if (market.BaseVolume <= 80 && market.MarketName.startsWith('BTC')) {
        lowVolMarket.push(market.MarketName);
        lastVolMarkets[market.MarketName] = 0;
      }
    }
    if (lowVolMarket.length > 0) {
      bittrex.websockets.subscribe(lowVolMarket, data => {
        if (data.M === 'updateExchangeState') {
          let notifTitle = 'Update altcoin';
          let notifBody = '';
          let isPush = false;
          data.A.forEach(function(data_for) {
            // console.log('Market Update for '+ data_for.MarketName, data_for);
            let buys = data_for.Buys;
            let sells = data_for.Sells;
            let buyVol = buys.reduce((prevVol, curOrder) => {
              return prevVol + curOrder.Rate * curOrder.Quantity;
            }, 0);
            let sellVol = sells.reduce((prevVol, curOrder) => {
              return prevVol + curOrder.Rate * curOrder.Quantity;
            }, 0);
            let totalVol = buyVol;  //+ sellVol;
            let lastVol = lastVolMarkets[data_for.MarketName]
            let deltaVol = totalVol - lastVol;
            lastVolMarkets[data_for.MarketName] = totalVol;
            if (Math.abs(deltaVol) > 8) {
              console.log(chalk.bgBlue.white.bold(`Market Update for ${data_for.MarketName}: ${totalVol} Volume - Last vol: ${lastVol} Changed ${deltaVol}`));
              notifBody = notifBody + ' ' + data_for.MarketName;
              isPush = true;
            }
          });
          // if (isPush) fication(notifTitle, notifBody);
        }
      });
    }
  });
}
