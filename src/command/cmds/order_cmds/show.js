import Parse from 'parse/node';
import * as Exchange from '../../../exchange';
import {
  exchangeRequire
} from '../middleware/require';
var pad = require('pad-right');
// const debug = require('debug')('polonie');
import * as DB from '../../../database';
import {
  Order
} from '../../../database/model';

exports.command = 'show <objectId>'

exports.describe = 'Xem thông tin một lệnh đã đặt'

exports.handler = exchangeRequire((user, exchangeName, exchangeClient, argv) => {
  let reply = argv.reply;
  let objectId = argv.objectId;

  let query = new Parse.Query(Order);
  query.get(objectId, { useMasterKey: true })
  .then(order => {
    let orderId = order.get('order_id');
    Exchange.isOrderOpen(exchangeClient)(orderId)
    .then(response => {
      reply('Lệnh đang treo');
    })
    .catch(error => {
      order.set('status', 'COMPLETED');
      order.save(null, { useMasterKey: true }).then(object => {
        reply('Lệnh đã khớp');
      }, error => {
        reply(`Lệnh đã khớp.\n\'\'\'${error.message}\`\`\``);
      })
    });
  }, error => {
    reply(`ID lệnh không đúng\n\`\`\`${error.message}\`\`\``);
  });
})
