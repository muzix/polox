import Parse from 'parse/node';
import { Order } from './model'

export const createOrder = (exchange, orderId, user, type, position, symbol, rate, btc, quantity, takeprofit, cutloss) => {
  return new Promise((resolve, reject) => {
    let order = Order.make(exchange, orderId, user, type, position, symbol, rate, btc, quantity, takeprofit, cutloss);
    order.save(null, { useMasterKey: true }).then(obj => {
      // console.log(obj);
      // resolve(`Lệnh đã được đặt! :ok_hand:\n\`\`\`${obj.id}\`\`\``);
      resolve(obj);
    }, err => {
      // console.log(err.message);
      reject(error);
    });
  });
}

export const deleteOrder = objectId => {
  return new Promise((resolve, reject) => {
    Order.get(objectId).then(order => {
      order.destroy({ useMasterKey: true }).then(deletedObject => {
        resolve(deletedObject);
      }, error => {
        reject(error);
      });
    }, error => {
      reject(error);
    });
  });
}
