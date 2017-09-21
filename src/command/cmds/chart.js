import Parse from 'parse/node';
import * as Exchange from '../../exchange';
import {
  exchangeRequire
} from './middleware/require';
import * as Utils from '../../utils';
const debug = require('debug')('polonie');
var fs = require('fs');
var stream = require('stream');
var d3 = require('d3');
var techan = require('techan');
var {
  chart,
  advanceChart
} = require('../../utils/chart');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const svg2png = require('svg2png');

exports.command = 'chart <market>'

exports.describe = 'Get chart image of market'

exports.builder = yargs => yargs.options({
  'interval': {
    alias: 'i',
    demandOption: false,
    describe: 'Candlestick Interval',
    type: 'string',
    default: '1D',
    choices: ['1', '5', '15', '30', '1h', '4h', '1D', '1W', '1M'],
  },
  'duration': {
    alias: 'd',
    demandOption: false,
    describe: 'Number of candle',
    type: 'number',
    default: 200
  },
  'advance': {
    alias: 'a',
    demandOption: false,
    describe: 'Advance Chart'
  }
});

exports.handler = (argv) => {
  let reply = argv.reply;
  let market = argv.market;
  let interval = argv.interval;
  let duration = argv.duration;
  let advance = argv.advance;

  Exchange.getTicks(market, interval)
  .then(response => {
    reply('Đợi chút nhé!');
    const { document } = (new JSDOM(``)).window;
    // Create the chart, passing in runtime environment specific setup: node d3, techan and csv data
    let body = null;
    if (advance == null) {
      body = d3.select(document.body).call(chart(d3, techan, response.result.slice(-duration), market));
    } else {
      body = d3.select(document.body).call(advanceChart(d3, techan, response.result.slice(-duration), market));
    }

    // Output result AVG
    let svgStr = `${body.html()}`;
    var buf = Buffer.from(svgStr, 'utf-8');
    return svg2png(buf);
  })
  .then(buffer => {
    // fs.writeFile("dest.png", buffer);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    let fileName = `${market}_${new Date().getTime().toString()}.png`;
    return Utils.driveUploadImageFromStream(fileName, 'image/png', process.env.DRIVE_FOLDER_ID, bufferStream)
  })
  .then(fileId => {
    let imageUrl = `https://docs.google.com/uc?id=${fileId}`
    reply({
      file: imageUrl
    });
  })
  .catch(error => reply(error.message));
};
