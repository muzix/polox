import Parse from 'parse/node';
var program = require('commander');
import { bittrex } from '../exchange';
import * as Utils from '../utils';
import chatbot from '../chatbot';
import polonie from './polonie';

export const checkuuid = (reply, uuid) => {
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
      reply(message);
    } else {
      if (err) {
        reply(err);
      } else {
        reply(data.message);
      }
    }
  });
}

export const check = (reply, uuid) => {
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
            let msg = msgWithDBOrder(result);
            reply(msg);
          } else {
            if (order.CancelInitiated && result.get('status') === 'ENTER') {
              result.destroy({ useMasterKey: true });
              reply('Ai hủy lệnh này mà không nói với mình vậy. Làm việc kỳ cục!\n\nXóa rồi đừng hỏi lại nữa nha <ss type =\"smirk\"></ss>')
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
                            reply('Lệnh đã được cắt lỗ! <ss type =\"cry\"></ss>');
                          });
                        } else {
                          reply(data.message);
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
                            reply('Đã thòng lệnh chờ lãi! <ss type =\"smile\"></ss>');
                          });
                        } else {
                          reply(data.message);
                        }
                      })
                    }
                  } else {
                    if (err) {
                      reply(err);
                    } else {
                      reply(data.message);
                    }
                  }
                });
              } else if (result.get('status') === 'WAIT_CUTLOSS') {
                result.set('status', 'CUTLOSS');
                result.save(null, { useMasterKey: true }).then(obj => {
                  reply('Lệnh đã lỗ! <ss type =\"cry\"></ss>');
                });
              } else if (result.get('status') === 'WAIT_PROFIT') {
                result.set('status', 'TAKEPROFIT');
                result.save(null, { useMasterKey: true }).then(obj => {
                  reply('Lệnh đã lãi! <ss type =\"smile\"></ss>');
                });
              }
            }
          }
        } else {
          if (err) {
            reply(err);
          } else {
            reply(data.message);
          }
        }
      });
    } else {
      reply('Sai id order rồi, nhập lại đê! <ss type =\"rofl\">;)</ss>');
    }
  });
}

export const checkAll = (reply) => {
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
          reply('Không có lệnh nào!');
        } else {
          let message = '';
          filteredResults.map(result => {
            let info = `#${result.get('symbol')}\nPosition: ${result.get('position')}\n\nRate: ${result.get('rate')}\n\nBTC: ${result.get('btc')}\n\nTake Profit: ${result.get('takeprofit')}\n\nCut Loss: ${result.get('cutloss')}\n\nUuid: ${result.get('uuid')}\n\n`;
            message = message + info;
          });
          reply(message);
        }
      }, err => {
        reply(err.message);
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

const msgWithDBOrder = (result) => {
  let info = `#${result.get('symbol')}\nPosition: ${result.get('position')}\n\nRate: ${result.get('rate')}\n\nBTC: ${result.get('btc')}\n\nTake Profit: ${result.get('takeprofit')}\n\nCut Loss: ${result.get('cutloss')}\n\nUuid: ${result.get('uuid')}\n\n`;
  return info;
}
