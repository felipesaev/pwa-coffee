const bodyParser = require('body-parser');
const express = require('express');
const app = express(0);
const port = 3000;


//  we want to use JSON to send post request to our application.
// Queremos usar o JSON para enviar uma solicitação de postagem para nosso aplicativo.

app.use(bodyParser.json());

//We tell express to serve the folder public as static content
// Dizemos express para servir a pasta public como conteúdo estático.

app.use(express.static('public'));

app.get('./public'); 

app.listen(port, () => console.log(`Listening on port ${port}`));