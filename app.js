const bodyParser = require('body-parser');
const express = require('express');
const app = express(0);
const port = 3000;
const webPush = require('web-push');

const allSubscriptions = {};
//  we want to use JSON to send post request to our application.
// Queremos usar o JSON para enviar uma solicitação de postagem para nosso aplicativo.

app.use(bodyParser.json());

// We use webpush to generate our public and private keys
const { publicKey, privateKey } = webPush.generateVAPIDKeys();

// We are giving webpush the required information to encrypt our data
webPush.setVapidDetails(
    'https://jmisteli.com',
    publicKey,
    privateKey
  );

//We tell express to serve the folder public as static content
// Dizemos express para servir a pasta public como conteúdo estático.

app.use(express.static('public'));
//send our public key to the client
app.get('/vapid-public-key', (req, res) => res.send({ publicKey }));

// allows our client to subscribe
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    registerTasks(subscription);
    res.send('subscribed!');
  });

  const registerTasks = (subscription) => {
    const endpoint = subscription.endpoint;
  
    // the endpoints are the keys of our subscriptions object
    // Every 3 seconds we will send a notification with the message 'hey this is a push!'
    const intervalID = setInterval(()=>{
        sendNotification(subscription, 'Hey this is a push!')
    }, 3000);
    allSubscriptions[endpoint] = intervalID;
  }

  // Allows our client to unsubscribe
app.post('/unsubscribe', (req, res) => {
    const endpoint = req.body.endpoint;
    // We find the client's endpoint and clear the interval associated with it
    const intervalID = allSubscriptions[endpoint];
    clearInterval(intervalID);
    // We delete the key
    delete allSubscriptions[endpoint];
  });

  // This function takes a subscription object and a payload as an argument
// It will try to encrypt the payload
// then attempt to send a notification via the subscription's endpoint
const sendNotification = async (subscription, payload) => {
    // This means we won't resend a notification if the client is offline
    const options = {
      TTL: 0
    };
  
    if (!subscription.keys) {
      payload = payload || null;
    }
  
    // web-push's sendNotification function does all the work for us
    try {
      const res = await webPush.sendNotification(subscription, payload, options);
      console.log(res, 'sent!');
    } catch (e) {
      console.log('error sending', e);
    }
  }

app.listen(port, () => console.log(`Listening on port ${port}`));