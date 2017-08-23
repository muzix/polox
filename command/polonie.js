#! /usr/bin/env babel-node

/**
 * Module dependencies.
 */

import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';

import * as Utils from '../utils';
import * as SubCommand from './command';

class Command {
  constructor() {
    require('dotenv').config();
    Parse.initialize(process.env.APP_ID);
    Parse.serverURL = `http://${process.env.HOST}:${process.env.PORT}/services`;
    Parse.masterKey = process.env.MASTER_KEY;
    // Parse.Cloud.useMasterKey();

    program
     .version('0.1.0')
     .allowUnknownOption()
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
      .action(this.private(SubCommand.buy));

    program
      .command('sell [symbol]')
      .description('Sell out an amount of symbol')
      .action(this.private(SubCommand.sell));

    program
      .command('check [uuid]')
      .description('Check status of an order')
      .action(this.private(SubCommand.check));

    program
      .command('checkall')
      .description('Check status of all open orders')
      .action(this.private(SubCommand.checkAll));

    program
      .command('cancel [uuid]')
      .description('Cancel an order')
      .action(this.private(SubCommand.cancel));

    program
      .command('cancelall')
      .description('Cancel all orders')
      .action(this.private(SubCommand.cancelAll));

    program
      .command('balances')
      .description('Get all balances')
      .action(this.private(SubCommand.balances));

    program
      .command('checkuuid')
      .description('Check order directly on bittrex by uuid')
      .action(this.private(SubCommand.checkuuid));

    program
      .command('register')
      .description('Register exchange account with bot')
      .action(this.private(SubCommand.register));

    program
      .command('account')
      .description('Account exchange information')
      .action(this.public(SubCommand.account));

    program
      .command('bithelp')
      .description('Help')
      .action(this.public(this.help));

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
              fnc(this.reply, argv);
            });
          } else {
            this.reply('Chưa code xong sàn này, chờ coder làm giàu đã :))!');
          }
        }
      });
    }
  }

  public = (fnc) => (argv) => {
    fnc(this.reply, argv);
  }

  parse = (argv, cb=null) => {
    this.cmdCallback = cb;
    program.parse(argv);
  }

  reply = (msg, isPrivate = false) => {
    if (this.cmdCallback) {
      this.cmdCallback(msg, isPrivate);
    }
  }

  // replyToUser(userid, msg) {
  //   if (this.discordClient) {
  //     this.discordClient.fetchUser(userid, true).then(user => {
  //       user.send(msg);
  //     });
  //   }
  // }

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
