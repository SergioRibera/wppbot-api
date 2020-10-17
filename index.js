const express = require('express');
const app = express();
const port = 3000;

const BotManager = require('./App/botmanager');

app.get('/start', async (req, res) => {
    let session = await BotManager.start(req.query.sessionName);

    if (["CONNECTED", "QRCODE", "STARTING"].includes(session.state)) {
        res.status(200).json({ result: 'success', message: session.state });
    } else {
        res.status(200).json({ result: 'error', message: session.state });
    }
});

app.get('/qrcode', async (req, res) => {
    var session = BotManager.getSession(req.query.sessionName);

    if (session != false) {
        if (session.status != 'isLogged') {
            if (req.query.image) {
                session.qrcode = session.qrcode.replace('data:image/png;base64,', '');
                const imageBuffer = Buffer.from(session.qrcode, 'base64');
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': imageBuffer.length
                });
                res.end(imageBuffer);
            } else {
                res.status(200).json({ result: "success", message: session.state, qrcode: session.qrcode });
            }
        } else {
            res.status(200).json({ result: "error", message: session.state });
        }
    } else {
        res.status(200).json({ result: "error", message: "NOTFOUND" });
    }
});

app.get("/enviarmensaje", async  (req, res, next)  =>{
     var result = await BotManager.sendText(
        req.query.sessionName,
        req.query.num,
        req.query.mensaje
    );
    res.json(result);
});//sendText

app.post("/sendText", async function sendText(req, res, next) {
    var result = await BotManager.sendText(
        req.body.sessionName,
        req.body.number,
        req.body.mensaje
    );
    res.json(result);
});

app.post("/sendFile", async (req, res, next) => {
    var result = await BotManager.sendFile(
        req.body.sessionName,
        req.body.number,
        req.body.base64Data,
        req.body.fileName,
        req.body.caption
    );
    res.json(result);
});

app.get("/close", async (req, res, next) => {
    var result = await BotManager.closeSession(req.query.sessionName);
    res.json(result);
});

app.listen(port, () => {
    console.log("El servidor se inició en el puerto: " + port);
});
