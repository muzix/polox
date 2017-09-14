import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const cancel = (reply, uuid) => {
  bittrex.cancel({uuid: uuid}, data => {
    if (data.success) {
      reply('Đã hủy lệnh!');
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
        reply(err);
      } else {
        reply(data.message);
      }
    }
  });
}

export const cancelAll = (reply) => {

}
