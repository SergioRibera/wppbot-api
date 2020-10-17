const express = require('express');
const app = express();
const port = 3000;

const BotManager = require('./App/botmanager');

let bot = new BotManager(null);

app.get('/qrcode', (req, res) => {
    
    bot.sessionName = req.query.sessionName;
    bot.setListener('QrReady', (ress) => {
        res.set('Content-Type', 'text/html');
        res.send('<img src="'+ress+'">');
    });
    bot.setListener('receiveMsg', (cliName, num, msg) => {
        res.json(msg);
    });
    bot.init();
});

app.get('/enviarmensaje', (req, res) => {
    bot.sessionName = req.query.sessionName;
    bot.setListener('receiveMsg', (cliName, num, msg) => {
        bot.getClient(cliName).sendText(num, req.query.mensaje)
            .then(res => { console.log(res);console.log(msg); })
            .catch(bot.onError);
    });
    bot.init();
});

app.post('/sendFile', async (req, res, next) => {
    bot.sendFile(req.body.sessionName, req.body.number, req.body.base64Data, req.body.caption);
    bot.setListener('sendMsg', (cliName, response) => {
        res.json(response);
    });
});

app.listen(port, () => {
    console.log("El servidor se inició en el puerto: " + port);
});
