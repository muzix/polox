import Parse from 'parse/node';
import * as Exchange from '../../../exchange';
import {
  exchangeRequire
} from '../middleware/require';
var pad = require('pad-right');
// const debug = require('debug')('polonie');
import * as DB from '../../../database';

exports.command = 'cancel <objectId>'

exports.describe = 'Hủy một lệnh đã đặt'

exports.handler = exchangeRequire((user, exchangeName, exchangeClient, argv) => {
  let reply = argv.reply;
  let objectId = argv.objectId;

  let Order = Parse.Object.extend('Order');
  let query = new Parse.Query(Order);
  query.get(objectId, { useMasterKey: true })
  .then(order => {
    let orderId = order.get('order_id');
    Exchange.cancelOrder(exchangeClient)(orderId)
    .then(isSuccess => {
      order.destroy({ useMasterKey: true }).then(deletedObject => {
        reply('Hủy lệnh thành công!')
      }, error => {
        reply(error.message);
      });
    })
    .catch(error => {
      reply(error.message);
    });
  }, error => {
    reply(`ID lệnh không đúng\n\`\`\`${error.message}\`\`\``);
  });
})
