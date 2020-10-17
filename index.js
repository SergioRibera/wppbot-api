const express = require('express');
const app = express();
const port = 3000;

const BotManager = require('./App/botmanager');

let bot = new BotManager(null);

app.get('/qrcode', (req, res) => {
    
    bot.setListener('QrReady', (ress) => {
        res.set('Content-Type', 'text/html');
        res.send('<img src="'+ress+'">');

        ress = ress.replace('data:image/png;base64,', '');
        const imageBuffer = Buffer.from(ress, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imageBuffer.length
        });
        res.end(imageBuffer);
    });
    bot.setListener('receiveMsg', (cliName, num, msg) => {
        res.json(msg);
    });
    bot.init(req.query.sessionName);
});

app.get('/enviarmensaje', (req, res) => {
    bot.init(req.query.sessionName);
    bot.setListener('session', (name, cli) => {
        //bot.setListener('receiveMsg', (cliName, num, msg) => {
            cli.sendText(req.query.num, req.query.mensaje)
                .then(res => { 
                    console.log('Mensaje enviado desde: ' + name);
                    console.log(res);
                })
                .catch(bot.onError);
        //});
    });
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
