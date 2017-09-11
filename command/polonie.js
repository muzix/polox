#! /usr/bin/env babel-node

/**
 * Module dependencies.
 */

import Parse from 'parse/node';
var program = require('commander');
const yargs = require('yargs');
const YargsPromise = require('yargs-promise');
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

    yargs.version('0.1.0');

    program
      .command('buy [symbol]')
      .allowUnknownOption()
      .description('Buy in an amount of symbol')
      .action(this.private(SubCommand.buy));

    program
      .command('sell [symbol]')
      .allowUnknownOption()
      .description('Sell out an amount of symbol')
      .action(this.private(SubCommand.sell));

    program
      .command('check [uuid]')
      .allowUnknownOption()
      .description('Check status of an order')
      .action(this.private(SubCommand.check));

    program
      .command('checkall')
      .allowUnknownOption()
      .description('Check status of all open orders')
      .action(this.private(SubCommand.checkAll));

    program
      .command('cancel [uuid]')
      .allowUnknownOption()
      .description('Cancel an order')
      .action(this.private(SubCommand.cancel));

    program
      .command('cancelall')
      .allowUnknownOption()
      .description('Cancel all orders')
      .action(this.private(SubCommand.cancelAll));

    program
      .command('balances')
      .allowUnknownOption()
      .description('Get all balances')
      .action(this.private(SubCommand.balances));

    program
      .command('checkuuid')
      .allowUnknownOption()
      .description('Check order directly on bittrex by uuid')
      .action(this.private(SubCommand.checkuuid));

    // program.on('--help', function(){
    //   console.log('  Examples:');
    //   console.log('');
    //   console.log('    $ custom-help --help');
    //   console.log('    $ custom-help -h');
    //   console.log('');
    // });

    this.cmdCallback = null;
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

  parse = (commandStr, context) => {
    this.cmdCallback = context.reply;

    if (this.parser == null) {
      this.parser = new YargsPromise(yargs, context);
      this.parser.commandDir('cmds').help();
    }

    // program.parse(argv);
    this.parser.parse(commandStr)
    .then(({ data, argv }) => {
      // console.log(data);
      if (data && data !== '') {
        context.reply(data);
      }
    })
    .catch(({ error, argv }) => {
      // console.log(error);
      if (error.message) {
        context.reply(error.message);
      } else {
        context.reply(error);
      }
    });
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

const commandInst = new Command();
export default commandInst;
