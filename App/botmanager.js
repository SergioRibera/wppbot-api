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

    constructor(_sessionName){
        this.emiter = new eventos.EventEmitter();
        
        this.client = [];
    }

    setListener(name, func){
        this.emiter.on(name, func);
    }

    init(sessionName) {
        this.ven = venom
            .create(sessionName,
            (base64Qr, asciiQR) => {
                this.emiter.emit('qrReady', base64Qr);
            })
            .then(_c => {
                this.setClient(this.sessionName, _c);
            })
            .catch(err => {
                this.emiter.emit('error', err);
            });
    }
    
    getClient(name){
        return this.client.find(x => x.name == name).cli;
    }
    setClient(name, cli){
        this.client.push({name:name, cli: cli});
        this.emiter.emit('session', name, cli);
        cli.onMessage(msg => this.emiter.emit('receiveMsg', name, msg.from, msg));
    }
    closeClient(name){
        this.getClient(name).close();
        this.emiter.emit('close', name);
    }

    sendMsg(name, number, msg) {
        this.getClient(name).sendText(number, msg)
            .then(res => this.emiter.emit('sendMsg', res))
            .catch(err => this.emiter.emit('error', err));
    }

    sendFile(name, number, base64File, nameFile, msg = null){
        this.getClient(name).sendFile(number+'@c.us', base64File, nameFile, msg)
            .then(res => this.emiter.emit('sendMsg', name, res))
            .catch(err => this.emiter.emit('error', err));
    }
}
