
// bittrex.getbalance({ currency : 'BTC' }, function( data ) {
//   console.log( data );
// });

// bittrex.getbalance({ currency : 'BTC' }, function( data ) {
//   console.log( data );
// });

/**
* @Author: Hoang Pham Huu <hoangph>
* @Date:   27/06/2016 9:23
* @Email:  huuhoang@vtvcab.vn
* @Project: VTVcab ON
* @Last modified by:   hoangph
* @Last modified time: 10/03/2017 4:19
*/


require('dotenv').config();
import path from 'path';
import express from 'express';
// import {Schema} from './schema/schema';
import Parse from 'parse/node';
import {ParseServer} from 'parse-server';
import ParseDashboard from 'parse-dashboard';
// var logger = require('parse-server/lib/Adapters/Logger/FileLoggerAdapter').FileLoggerAdapter
import polonie from './command/polonie';

const SERVER_PORT = process.env.PORT || 8082;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'polonie-x';
const MASTER_KEY = process.env.MASTER_KEY || 'master_ki';
const REST_API_KEY = process.env.REST_API_KEY || 'rest_api_ki'
const DATABASE_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/polonie';//process.env.DATABASE_URI || 'mongodb://localhost:27017/dev';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH || 'polonie:muzix@polonie';

// TMP

// Parse.initialize(APP_ID);
// Parse.serverURL = `http://${SERVER_HOST}:${SERVER_PORT}/services`;
// Parse.masterKey = MASTER_KEY;
// Parse.Cloud.useMasterKey();

// function getSchema() {
//   if (!IS_DEVELOPMENT) {
//     return Schema;
//   }
//
//   delete require.cache[require.resolve('./schema/schema.js')];
//   return require('./schema/schema.js').Schema;
// }
// console.log(DATABASE_URI);
const server = express();

// PARSE SERVER ENDPOINT
server.use(
  '/services',
  new ParseServer({
    databaseURI: DATABASE_URI,
    cloud: path.resolve(__dirname, 'cloud.js'),
    appId: APP_ID,
    masterKey: MASTER_KEY,
    restAPIKey: REST_API_KEY,
    serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/services`,
    // loggerAdapter: new logger({ logsFolder: './logs' }),
  })
);

if (IS_DEVELOPMENT) {
  let users;
  if (DASHBOARD_AUTH) {
    var [user, pass] = DASHBOARD_AUTH.split(':');
    users = [{user, pass}];
    console.log(users);
  }
  server.use(
    '/polonie',
    ParseDashboard({
      apps: [{
        serverURL: '/services',
        appId: APP_ID,
        masterKey: MASTER_KEY,
        appName: 'Polonie-X',
        iconName: 'app.png',
      }],
      iconsFolder: 'icons',
      users,
    }, IS_DEVELOPMENT)
  );
}

//SKYPE MESSAGE WEBHOOK
// import { connector } from './skype';
// server.post('/api/messages', connector.listen());

//CHAT BOT INIT
import chatbot from './chatbot';
chatbot.initialize();

// import { sendNotification } from './firebase';
// sendNotification('Hello', 'test');
// server.use('/', (req, res) => res.redirect('/spartacus'));

server.listen(SERVER_PORT, () => console.log(
  `Server is now running in ${process.env.NODE_ENV || 'development'} mode on http://${SERVER_HOST}:${SERVER_PORT}`
));
