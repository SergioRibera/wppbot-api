const venom = require('venom-bot');
const eventos = require('events');

String.prototype.capitalize = function (){
    var i, words, w, result = '';

    words = this.split(' ');
    for (i = 0; i < words.length; i += 1) {
        w = words[i];
        result += w.substr(0,1).toUpperCase() + w.substr(1);
        if (i < words.length - 1) {
            result += ' ';    // Add the spaces back in after splitting
        }
    }
    return result;
}

module.exports = class BotManager {
    static async start(sessionName) {
        BotManager.sessions = BotManager.sessions || []; //start array

        var session = BotManager.getSession(sessionName);

        if (session == false) { //create new session
            console.log("session == false");
            session = await BotManager.addSesssion(sessionName);
        } else if (["CLOSED"].includes(session.state)) { //restart session
            console.log("session.state == CLOSED");
            session.state = "STARTING";
            session.status = 'notLogged';
            session.client = BotManager.initSession(sessionName);
            //  BotManager.setup(sessionName);
        } else if (["CONFLICT", "UNPAIRED", "UNLAUNCHED"].includes(session.state)) {
            console.log("client.useHere()");
            session.client.then(client => {
                client.useHere();
            });
        } else {
            console.log("session.state: " + session.state);
        }
        return session;
        return { result: "success", message: session.state, qrcode: session.qrcode };
    }//start

    static async addSesssion(sessionName) {
        var newSession = {
            name: sessionName,
            qrcode: false,
            client: false,
            status: 'notLogged',
            state: 'STARTING'
        }
        BotManager.sessions.push(newSession);
        console.log("newSession.state: " + newSession.state);

        //setup session
        newSession.client = BotManager.initSession(sessionName);
        //   BotManager.setup(sessionName);

        return newSession;
    }//addSession

    static async initSession(sessionName) {
        var session = BotManager.getSession(sessionName);
        console.log("Init Session");
        const client = await venom
            .create(
                //session
                sessionName, //Pass the name of the client you want to start the bot
                //catchQR
                (base64Qrimg, asciiQR, attempts) => {
                    console.log('Numero de tentativas para ler o qrcode: ', attempts);
                    console.log('Terminal qrcode: ', asciiQR);
                    console.log('base64 image string qrcode: ', base64Qrimg);
                    session.qrcode = base64Qrimg;
                    var matches = base64Qrimg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                        response = {};

                    if (matches.length !== 3) {
                        return new Error('Invalid input string');
                    }
                    response.type = matches[1];
                    response.data = new Buffer.from(matches[2], 'base64');

                    var imageBuffer = response;
                    require('fs').writeFile(
                        sessionName + 'out.png',
                        imageBuffer['data'],
                        'binary',
                        function (err) {
                            if (err != null) {
                                console.log(err);
                            }
                        }
                    );

                },
                ////statusFind
                (statusSession) => {
                    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled
                },
                //options
                {
                    folderNameToken: 'tokens', //folder name when saving tokens
                    mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
                    headless: true, // Headless chrome
                    devtools: false, // Open devtools by default
                    useChrome: true, // If false will use Chromium instance
                    debug: false, // Opens a debug session
                    logQR: true, // Logs QR automatically in terminal
                    browserWS: '', // If u want to use browserWSEndpoint
                    browserArgs: [''], // Parameters to be added into the chrome browser instance
                    disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
                    disableWelcome: true, // Will disable the welcoming message which appears in the beginning
                    updatesLog: true, // Logs info updates automatically in terminal
                    autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
                    createPathFileToken: false, //creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
                }
                /*browserSessionToken
                ///To receive the client's token use the function await clinet.getSessionTokenBrowser()
                {
                    WABrowserId: '"UnXjH....."',
                    WASecretBundle:
                    '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
                    WAToken1: '"0i8...."',
                    WAToken2: '"1@lPpzwC...."',
                }*/
            )
            .then((client) => {
                session.client = client;
                //prueba(client);// prueba de respuesta
                // pruebamensaje(client);
                //client.sendText('573177029929@c.us', 'pruebaaca');
            })
            .catch((erro) => {
                console.log(erro);
            });
        return session.client;

    }//initSession

    static async setup(sessionName) {
        var session = BotManager.getSession(sessionName);
        await session.client.then(client => {
            client.onStateChange(state => {
                session.state = state;
                console.log("session.state: " + state);
            });//.then((client) => BotManager.startProcess(client));
            client.onMessage((message) => {
                if (message.body === 'hi') {
                    client.sendText(message.from, 'Hello\nfriend!');
                }
            });
        });
    }//setup

    static async closeSession(sessionName) {
        var session = BotManager.getSession(sessionName);
        console.log("voy a cerrar sessionaca"+session.state);
        try {
            await session.client.close();
            console.log("voy a cerrar session1" );
        } catch (error) {
            //console.log("client.close(): " + error.message);
            await session.client.close();
            console.log("voy a cerrar session2" );
        }
        session.state = "CLOSED";
        session.client = false;
        return { result: "success", message: "CLOSED" };
    }//close

    static getSession(sessionName) {
        var foundSession = false;
        if (BotManager.sessions)
            BotManager.sessions.forEach(session => {
                if (sessionName == session.name) {
                    foundSession = session;
                    console.log('la encontre'+ foundSession);
                }
            });
        return foundSession;
    }//getSession

    static getSessions() {
        if (BotManager.sessions) {
            return BotManager.sessions;
        } else {
            return [];
        }
    }//getBotManager

    static async getQrcode(sessionName) {
        var session = BotManager.getSession(sessionName);
        if (session) {
            //if (["UNPAIRED", "UNPAIRED_IDLE"].includes(session.state)) {
            if (["UNPAIRED_IDLE"].includes(session.state)) {
                //restart session
                await BotManager.closeSession(sessionName)
                BotManager.start(sessionName);
                return { result: "error", message: session.state };
            } else if (["CLOSED"].includes(session.state)) {
                BotManager.start(sessionName);
                return { result: "error", message: session.state };
            } else { //CONNECTED
                //        if (session.status != 'isLogged') {
                return { result: "success", message: session.state, qrcode: session.qrcode };
                //      } else {
                //        return { result: "success", message: session.state };
                //  }
            }
        } else {
            return { result: "error", message: "NOTFOUND" };
        }
    } //getQrcode

    static async sendText(sessionName, number, mensaje) {
        //sessionname =undefined
        var session = BotManager.getSession(sessionName);
        if (session) {
            if (session.state == "STARTING") {
                var response = {};
                console.log(await session.client);
                await session.client.sendText(number + '@c.us', mensaje)
                    .then(res => {
                        response = {
                            result: "sucess",
                            message: res
                        };
                        console.log("Mensaje enviado");
                    }).catch(err => {
                        response = {
                            result: "error",
                            message: err
                        }
                        console.log(err);
                    });
                return response;
                //return { result: "success"  + mensaje }
                //console.log('enviarmensa si entre ' + mensaje);
            } else {
                return { result: "error", message: session.state };
                //console.log('enviarmensa no entre ' + mensaje);
            }
        } else {
            return { result: "error", message: "NOTFOUND" };
        //	console.log('enviarmensa no entre1 ' + mensaje);
        }
    }//message

    static async sendFile(sessionName, number, base64Data, fileName, caption) {
        var session = BotManager.getSession(sessionName);
        if (session) {
            if (session.state == "CONNECTED") {
                var resultSendFile = await session.client.then(async (client) => {
                    var folderName = fs.mkdtempSync(path.join(os.tmpdir(), session.name + '-'));
                    var filePath = path.join(folderName, fileName);
                    fs.writeFileSync(filePath, base64Data, 'base64');
                    console.log(filePath);
                    return await client.sendFile(number + '@c.us', filePath, fileName, caption);
                });//client.then(
                return { result: "success" };
            } else {
                return { result: "error", message: session.state };
            }
        } else {
            return { result: "error", message: "NOTFOUND" };
        }
    }//message
}
