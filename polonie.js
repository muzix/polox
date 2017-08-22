#! /usr/bin/env babel-node

/**
 * Module dependencies.
 */

import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from './bittrex';

import * as Utils from './utils';

class Command {
  constructor() {
    require('dotenv').config();
    Parse.initialize(process.env.APP_ID);
    Parse.serverURL = `http://${process.env.HOST}:${process.env.PORT}/services`;
    Parse.masterKey = process.env.MASTER_KEY;
    // Parse.Cloud.useMasterKey();

    program
     .version('0.1.0')
     .option('-r, --rate [rate]', 'Rate for buy/sell')
     .option('-b, --btc [btc]', 'Buy/sell btc quantity')
     .option('-t, --takeprofit [rate]', 'Rate for take profit order')
     .option('-c, --cutloss [rate]', 'Rate for cut loss order')
     .option('--userid [userid]', 'User Id of Trader')
     .option('--exchange [exchange]', 'Name of exchange')
     .option('--apikey [apikey]', 'API KEY')
     .option('--apisecret [apisecret]', 'API SECRET');

    program
      .command('buy [symbol]')
      .description('Buy in an amount of symbol')
      .action(this.private(this.buy));

    program
      .command('sell [symbol]')
      .description('Sell out an amount of symbol')
      .action(this.private(this.sell));

    program
      .command('check [uuid]')
      .description('Check status of an order')
      .action(this.private(this.check));

    program
      .command('checkall')
      .description('Check status of all open orders')
      .action(this.private(this.checkAll));

    program
      .command('cancel [uuid]')
      .description('Cancel an order')
      .action(this.private(this.cancel));

    program
      .command('cancelall')
      .description('Cancel all orders')
      .action(this.private(this.cancelAll));

    program
      .command('balances')
      .description('Get all balances')
      .action(this.private(this.balances));

    program
      .command('checkuuid')
      .description('Check order directly on bittrex by uuid')
      .action(this.private(this.checkuuid));

    program
      .command('register')
      .description('Register exchange account with bot')
      .action(this.register);

    program
      .command('account')
      .description('Account exchange information')
      .action(this.account);

    program
      .command('help')
      .description('Help')
      .action(this.help);

    // program.on('--help', function(){
    //   console.log('  Examples:');
    //   console.log('');
    //   console.log('    $ custom-help --help');
    //   console.log('    $ custom-help -h');
    //   console.log('');
    // });

    this.cmdCallback = null;
  }

  //ERROR
  help = () => {
    program.outputHelp(msg => {
      // console.log(`
      //   {code}
      //   ${msg.replace(/\s+|\r\n|\n/, '')}
      //   {code}
      //   `);
      this.reply(`
        ${msg.replace(/\s+|\r\n|\n/, '')}
        `);
      return msg;
    });
  }

  register = () => {
    console.log('USERID: ' + program.userid);
    console.log('EXCHANGE: ' + program.exchange);
    console.log('API_KEY: ' + program.apikey);
    console.log('API_SECRET: ' + program.apisecret);

    if (program.userid == null ||
      program.exchange == null ||
      program.apikey == null ||
      program.apisecret == null)
    {
      this.reply('Lệnh không hợp lệ!');
    } else {
      if (program.exchange !== 'BITTREX' && program.exchange !== 'POLONIEX') {
        this.reply('Chỉ hỗ trợ sàn BITTREX và POLONIEX');
      } else {
        let p1 = Utils.encrypt(program.apikey);
        let p2 = Utils.encrypt(program.apisecret);
        Promise.all([p1, p2]).then(values => {
          let encryptedApiKey = values[0];
          let encryptedApiSecret = values[1];
          let Account = Parse.Object.extend('Account');
          let query = new Parse.Query(Account);
          query.equalTo('user_id', program.userid);
          query.equalTo('exchange', program.exchange);
          query.find({ useMasterKey: true }).then(results => {
            let account = null;
            let accountExist = false;
            if (results.length <= 0) {
              // Create new Account
              accountExist = false;
              account = new Account();
              account.set('user_id', program.userid);
              account.set('exchange', program.exchange);
            } else if (results.length === 1){
              // Get existing account
              accountExist = true;
              account = results[0];
            } else {
              this.reply(`Có nhiều tài khoản ${program.exchange} cho tài khoản này. Có gì không đúng?`)
              return;
            }
            account.set('api_key', encryptedApiKey);
            account.set('api_secret', encryptedApiSecret);
            account.save(null, { useMasterKey: true }).then(obj => {
              // console.log(obj);
              if (accountExist) {
                this.reply('Tài khoản đã được cập nhật');
              } else {
                this.reply('Tài khoản đã được tạo!');
              }
            }, err => {
              // console.log(err.message);
              this.reply(err.message);
            });
          })
        });
      }
    }
  }

  private = (fnc) => (argv) => {
    if (program.userid == null) {
      this.reply('Lệnh không hợp lệ!');
    } else {
      var Account = Parse.Object.extend("Account");
      var query = new Parse.Query(Account);
      query.equalTo("user_id", program.userid);
      if (program.exchange) {
        query.equalTo("exchange", program.exchange);
      }
      query.find({ useMasterKey: true }).then(results => {
        if (results.length <= 0) {
          this.reply('Tài khoản chưa được tạo!');
        } else {
          let account = results[0];
          if (program.exchange === 'BITTREX') {
            let p1 = Utils.decrypt(account.get('api_key'));
            let p2 = Utils.decrypt(account.get('api_secret'));
            Promise.all([p1, p2]).then(values => {
              bittrex.options({
                'apikey' : values[0],
                'apisecret' : values[1]
              });
              fnc(argv);
            });
          } else {
            this.reply('Chưa code xong sàn này, chờ coder làm giàu đã :))!');
          }
        }
      });
    }
  }

  account = () => {
    if (program.userid == null)
    {
      this.reply('Lệnh không hợp lệ!');
    } else {
      var Account = Parse.Object.extend("Account");
      var query = new Parse.Query(Account);
      query.equalTo("user_id", program.userid);
      query.find({ useMasterKey: true }).then(results => {
        if (results.length <= 0) {
          this.reply('Tài khoản chưa được tạo!');
        } else {
          let promises = results.map(result => {
            let exchange = result.get('exchange');
            let encryptedApiKey = result.get('api_key');
            let encryptedApiSecret = result.get('api_secret');
            let p1 = Utils.decrypt(encryptedApiKey);
            let p2 = Utils.decrypt(encryptedApiSecret);
            return Promise.all([p1, p2]).then(values => {
              let censored1 = values[0].substr(0,5) + values[0].substr(6, values[0].length - 5).replace(/./g, '#');
              let censored2 = values[1].substr(0,5) + values[1].substr(6, values[1].length - 5).replace(/./g, '#');
              return `Exchange: ${exchange}\nAPI_KEY: ${censored1}\nAPI_SECRET: ${censored2}\n`;
            });
          });
          Promise.all(promises).then(values => {
            let message = values.join('\n');
            this.reply(message);
          });
        }
      });
    }
  }

  buy = (symbol) => {
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
      this.reply('Lệnh không hợp lệ!');
    } else {
      let symbolQty = program.btc / program.rate;
      bittrex.buylimit({ market: symbol, quantity: symbolQty , rate: program.rate}, data => {
        if (data.success) {
          this.createOrder('long', symbol, program.rate, program.btc, symbolQty, program.takeprofit, program.cutloss, data.result.uuid);
        } else {
          this.reply(data.message);
        }
        // response.success('OK');
      });
    }
  }

  sell = (symbol) => {
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
      this.reply('Lệnh không hợp lệ!');
    } else {
      let symbolQty = program.btc / program.rate;
      bittrex.selllimit({ market: symbol, quantity: symbolQty , rate: program.rate}, data => {
        if (data.success) {
          this.createOrder('short', symbol, program.rate, program.btc, symbolQty, program.takeprofit, program.cutloss, data.result.uuid);
        } else {
          this.reply(data.message);
        }
        // response.success('OK');
      });
    }
  }

  createOrder = (position, symbol, rate, btc, quantity, takeprofit, cutloss, uuid) => {
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
    order.set('status', 'ENTER');
    order.save(null, { useMasterKey: true }).then(obj => {
      // console.log(obj);
      this.reply('Lệnh đã được đặt!');
    }, err => {
      // console.log(err.message);
      this.reply(err.message);
    });
  }

  checkuuid = (uuid) => {
    bittrex.getorder({uuid: uuid}, (data, err) => {
      if (data.success) {
        let order = data.result;
        let message = `
          OrderUuid: ${order.OrderUuid}
          Exchange: ${order.Exchange}
          Type: ${order.Type}
          Quantity: ${order.Quantity}
          QuantityRemaining: ${order.QuantityRemaining}
          Limit: ${order.Limit}
          Price: ${order.Price}
          Opened: ${order.Opened}
          Closed: ${order.Closed}
          IsOpen: ${order.IsOpen}
          CancelInitiated: ${order.CancelInitiated}
        `;
        this.reply(message);
      } else {
        if (err) {
          this.reply(err);
        } else {
          this.reply(data.message);
        }
      }
    });
  }

  check = (uuid) => {
    var Order = Parse.Object.extend("Order");
    var query = new Parse.Query(Order);
    query.equalTo("uuid", uuid);
    query.find({ useMasterKey: true }).then(results => {
      if (results.length > 0) {
        bittrex.getorder({uuid: uuid}, (data, err) => {
          if (data.success) {
            let order = data.result;
            let result = results[0];
            if (order.IsOpen) {
              let msg = this.msgWithDBOrder(result);
              this.reply(msg);
            } else {
              if (order.CancelInitiated && result.get('status') === 'ENTER') {
                result.destroy({ useMasterKey: true });
                this.reply('Ai hủy lệnh này mà không nói với mình vậy. Làm việc kỳ cục!\n\nXóa rồi đừng hỏi lại nữa nha <ss type =\"smirk\"></ss>')
              } else {
                //TODO place takeprofit order
                if (result.get('status') === 'ENTER') {
                  let market = result.get('symbol');
                  let takeprofit = result.get('takeprofit');
                  let cutloss = result.get('cutloss');
                  let quantity = result.get('quantity');
                  let position = result.get('position');
                  bittrex.getticker({market: market}, (data, err) => {
                    if (data.success) {
                      if ((position === 'long' && data.result.Last < cutloss) || (position === 'short' && data.result.Last > cutloss)) {
                        let cmdFunction = position === 'long' ? bittrex.selllimit : bittrex.buylimit;
                        let cutlossRate = position === 'long' ? 0.00000001 : 1;
                        cmdFunction({market: market, quantity: quantity, rate: cutlossRate}, (data, err) => {
                          if (data.success) {
                            result.set('uuid', data.result.uuid);
                            result.set('status', 'WAIT_CUTLOSS');
                            result.save(null, { useMasterKey: true }).then(obj => {
                              this.reply('Lệnh đã được cắt lỗ! <ss type =\"cry\"></ss>');
                            });
                          } else {
                            this.reply(data.message);
                          }
                        });
                      } else {
                        let cmdFunction = position === 'long' ? bittrex.selllimit : bittrex.buylimit;
                        let takeprofitRate = takeprofit;
                        cmdFunction({market:market, quantity:quantity, rate:takeprofitRate}, (data, err) => {
                          if (data.success) {
                            result.set('uuid', data.result.uuid);
                            result.set('status', 'WAIT_PROFIT');
                            result.save(null, { useMasterKey: true }).then(obj => {
                              this.reply('Đã thòng lệnh chờ lãi! <ss type =\"smile\"></ss>');
                            });
                          } else {
                            this.reply(data.message);
                          }
                        })
                      }
                    } else {
                      if (err) {
                        this.reply(err);
                      } else {
                        this.reply(data.message);
                      }
                    }
                  });
                } else if (result.get('status') === 'WAIT_CUTLOSS') {
                  result.set('status', 'CUTLOSS');
                  result.save(null, { useMasterKey: true }).then(obj => {
                    this.reply('Lệnh đã lỗ! <ss type =\"cry\"></ss>');
                  });
                } else if (result.get('status') === 'WAIT_PROFIT') {
                  result.set('status', 'TAKEPROFIT');
                  result.save(null, { useMasterKey: true }).then(obj => {
                    this.reply('Lệnh đã lãi! <ss type =\"smile\"></ss>');
                  });
                }
              }
            }
          } else {
            if (err) {
              this.reply(err);
            } else {
              this.reply(data.message);
            }
          }
        });
      } else {
        this.reply('Sai id order rồi, nhập lại đê! <ss type =\"rofl\">;)</ss>');
      }
    });
  }

  checkAll = () => {
    bittrex.getopenorders({}, (data, err) => {
      if (data.success) {
        let orders = data.result;
        var Order = Parse.Object.extend("Order");
        var query = new Parse.Query(Order);
        query.find({ useMasterKey: true }).then(results => {
          let filteredResults = results.filter(result => {
            let uuid = result.get('uuid');
            let filteredOrders = orders.filter(order => {
              return order.OrderUuid === uuid;
            });
            if (filteredOrders.length <= 0) {
              result.destroy({ useMasterKey: true });
              return false;
            } else {
              return true;
            }
          });
          if (filteredResults.length <= 0) {
            this.reply('Không có lệnh nào!');
          } else {
            let message = '';
            filteredResults.map(result => {
              let info = `#${result.get('symbol')}\nPosition: ${result.get('position')}\n\nRate: ${result.get('rate')}\n\nBTC: ${result.get('btc')}\n\nTake Profit: ${result.get('takeprofit')}\n\nCut Loss: ${result.get('cutloss')}\n\nUuid: ${result.get('uuid')}\n\n`;
              message = message + info;
            });
            this.reply(message);
          }
        }, err => {
          this.reply(err.message);
        });
      } else {
        if (err) {
          this.reply(err);
        } else {
          this.reply(data.message);
        }
      }
    });
  }

  msgWithDBOrder = (result) => {
    let info = `#${result.get('symbol')}\nPosition: ${result.get('position')}\n\nRate: ${result.get('rate')}\n\nBTC: ${result.get('btc')}\n\nTake Profit: ${result.get('takeprofit')}\n\nCut Loss: ${result.get('cutloss')}\n\nUuid: ${result.get('uuid')}\n\n`;
    return info;
  }

  balances = () => {
    bittrex.getbalances(data => {
      if (data.success) {
        let balances = data.result;
        let availBalances = balances.filter(balance => {
          return balance.Balance > 0;
        });
        if (availBalances.length > 0) {
          let message = '';
          availBalances.map(balance => {
            let info = `#${balance.Currency}\nBalance: ${balance.Balance}\nAvailable: ${balance.Available}\nPending: ${balance.Pending}\nAddress: ${balance.CryptoAddress}\n\n`;
            message = message + info;
          });
          // console.log(message);
          this.reply(message);
        } else {
          this.reply("Tài khoản không có đồng nào, vãi nghèo :((");
        }
      } else {
        this.reply(data.message);
      }
    })
  }

  cancel = (uuid) => {
    bittrex.cancel({uuid: uuid}, data => {
      if (data.success) {
        this.reply('Đã hủy lệnh!');
        var Order = Parse.Object.extend("Order");
        var query = new Parse.Query(Order);
        query.equalTo("uuid", uuid);
        query.find({ useMasterKey: true }).then(results => {
          if (results.length > 0) {
            results.map(result => {
              result.destroy({ useMasterKey: true });
            });
          }
        });
      } else {
        if (err) {
          this.reply(err);
        } else {
          this.reply(data.message);
        }
      }
    });
  }

  cancelAll = () => {

  }

  parse = (argv, cb=null) => {
    this.cmdCallback = cb;
    program.parse(argv);
  }

  reply = (msg) => {
    if (this.cmdCallback) {
      this.cmdCallback(msg);
    }
  }

}

// polonie buy BTCLTC --rate 0.00123 --takeprofit 0.00150 --cutloss 0.00090
// polonie sell BTCLTC --rate 0.00123 --takeprofit 0.00100 --cutloss 0.00150


// let fakeArgv = ['', ''];
// let commandStr = 'buy BTCLTC --rate 0.0012 --takeprofit 0.0023 --cutloss 0.0008';
// let argv = fakeArgv.concat(commandStr.split(' '));
const commandInst = new Command();
// program.parse(process.argv);
// program.help(null);
// console.log(result);

export default commandInst;
