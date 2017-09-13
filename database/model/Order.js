import Parse from 'parse/node';

class Order extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('Order');
    // All other initialization go here below
  }

  static make(exchange, orderId, user, type, position, symbol, rate, btc, quantity, takeprofit, cutloss) {
    var order = new Order();
    order.set('type', type);
    order.set('position', position);
    order.set('symbol', symbol);
    order.set('rate', rate);
    order.set('btc', btc);
    order.set('quantity', quantity);
    order.set('takeprofit', takeprofit);
    order.set('cutloss', cutloss);
    order.set('order_id', orderId);
    order.set('exchange', exchange);
    order.set('user', user);
    order.set('status', 'PENDING');
    return order;
  }
}

export default Order;
