#! /usr/bin/env babel-node

/**
 * Module dependencies.
 */

import Parse from 'parse/node';
const yargs = require('yargs');
const YargsPromise = require('yargs-promise');
import { bittrex } from '../exchange';

import * as Utils from '../utils';

class Command {
  constructor() {
    require('dotenv').config();
    Parse.initialize(process.env.APP_ID);
    Parse.serverURL = `http://${process.env.HOST}:${process.env.PORT}/services`;
    Parse.masterKey = process.env.MASTER_KEY;
    // Parse.Cloud.useMasterKey();

    yargs.version('0.1.1');

    // this.cmdCallback = null;
  }

  parse = (commandStr, context) => {
    // this.cmdCallback = context.reply;

    if (this.parser == null) {
      this.parser = new YargsPromise(yargs, context);
      this.parser.commandDir('cmds').help();
    } else {
      this.parser.ctx = context;
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

  // reply = (msg, isPrivate = false) => {
  //   if (this.cmdCallback) {
  //     this.cmdCallback(msg, isPrivate);
  //   }
  // }

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
