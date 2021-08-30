require('dotenv').config();
const tmi = require('tmi.js');

// Define configuration options
const opts = {
  debug: true,
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OATH_TOKEN
  },
  channels: [
    'ibeatyubot'
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

let talkativePeople = [];

let greetings = true;

const commands = {
  greet: {
    response: 'Wasup'
  },
  shutup: {
    response: (user) => {
      if(user === 'ugonlose' || user === 'ibeatyu88') {
        greetings = false;
        return 'Fine. I\'ll stop greeting people.';
      } else {
        return 'Nice try. YOU\'RE NOT MY SUPERVISOR!!!';
      }
    }
  },
  upvote: {
    response: (user) => `${user} was just upvoted!`
  }
}

// Called every time a message comes in
function onMessageHandler (channel, tags, message, self) {
  if (tags.username.toLowerCase() === process.env.TWITCH_USERNAME) return; // Ignore messages from the bot


  if(!talkativePeople.includes(tags.username)) {
    talkativePeople.push(tags.username);
    if(greetings) {
      client.say(channel, `Yo, ${tags.username}`);
    }
  }
  
  if(message.match(regexpCommand) !== null) {
    const [raw, command, argument] = message.match(regexpCommand);
  
    const { response } = commands[command] || {};
    if(typeof response === 'function') {
      client.say(channel, response(tags.username))
    } else if(typeof response === 'string') {
      client.say(channel, response);
    }
  }

}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Connect to Twitch:
client.connect();

client.on('connected', onConnectedHandler);

// Register our event handlers (defined below)
client.on('message', (channel, tags, message, self) => {
  onMessageHandler(channel, tags, message, self)
});
