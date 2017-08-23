import discordClient from './discord';
import { initializeDiscord } from './discord';

class Chatbot {
  constructor() {

  }

  initialize = () => {
    initializeDiscord(discordClient);
  }

  send = (msg, channelId) => {
    console.log(msg);
    console.log(channelId);
    console.log(discordClient.channels);
    let channel = discordClient.channels.get(channelId);
    if (channel) {
      console.log(msg);
      channel.send(msg);
    }
  }
}

const chatbot = new Chatbot();
export default chatbot;
