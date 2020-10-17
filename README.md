### WppBot Api

Es una api sencilla basada en *Venom* la cual trabaja mediante urls los
procesos, tiene la posibilidad de manejar multiples sesiones.

#### Requisitos
    
    - NodeJs
    - Venom, para instalar ejecutar: npm i --save venom-bot

#### Iniciando con WppBot

Primero que nada se debe instalar las dependencias, haciendo uso del comando:
    
    npm install --save

Primero se debe agregar el script a la referencia
        
    const BotManager = require('./App/botmanager');

Luego necesitamos crear una instancia de la clase
        
    let bot = new BotManager(sesionName); // en caso de no querer iniciar con una sesion, colocar null

Por último solo hace falta iniciar el bot

    bot.sessionName = 'SesionMarketing';
    bot.init();i

#### Clase BotManager
- *constructor*
    El constructor recive un único parámetro el cual corresponde al nombre de
    la sesion a abrir

- *setListener*
    La función setListener recibe por parámetro el nombre de la función
    a subscribir y la dicha función, las funciones disponibles son:

        - qrReady       => Esta dunción se llama cuando el codigo QR está listo
        - error         => Esta función se llama cuando ocurre algún error
        - session       => Esta función se llama cuando la sesion se ha creado
        - close         => Esta función se llama cuando una sesion ha sido cerrada
        - receiveMsg    => Esta función se llama cuando se ha recibido un mensaje
        - sendMsg       => Esta función se llama cuando se ha enviado un mensaje

    Ejemplo: 
        
        bot.setListener('close', (name) => {
            console.log('La sesion ' + name + ' ha sido cerrada');
        });

- *Detalles de los eventos*
    
    - qrReady       => Esta función recibe un único parámetro el cual es el código qr en base64
        (qrBase64) => {}
    - error         => Esta función recibe como parámetro los detalles del error
        (err) => {};
    - session       => Esta función recibe el nombre de la sesion y el objeto del cliente
        (name, cli) => {};
    - receiveMsg    => Esta funcion recibe como parámetro el nombre, el número que envió el mensaje y el objeto mensaje
        (name, num, msg) => {};
    - sendMsg       => Esta función recibe como parámetro el nombre de la sesion y el objeto de respuesta
        (name, response) => {};
    - close         => Esta función recibe como parámetro el nombre de la sesion cerrada
        (name) => {};

- *getClient*
    Esta función recibe el nombre de la sesion que se debe buscar, devolviendo
    el objeto cliente, ejemplo:
        
        let client = bot.getClient('SesionMarketing');

- *setClient*
    Esta función agrega a una lista la sesion que se le asigne, ejemplo:
        
        bot.setClient('SesionMarketing', client);

- *closeClient*
    Esta función cierra la sesion con el nombre indicado, ejemplo:
        
        bot.closeClient('SesionMarketing');

- *sendMsg*
    Esta función se encarga de enviar un mensaje de texto, reciviendo como parámetro el nombre de la sesion, el numero destinatario y el mensaje a enviar

        bot.sendMsg('SesionMarketing', '370000666', 'Buenos Dias');

- *sendFile*
    Esta función se encarga de enviar un archivo a un contacto, reciviendo como parámetro el nombre de la sesion, el numero del contacto, el archivo en base64, el nombre del archivo y el mensaje que irá con la imagen, ejemplo:

        bot.sendFile('SesionMarketing', '370000666', imageBase64, 'nombredeimagen', 'Este es nuestro producto en oferta');

## Please report all bugs and problems
#### Thanks for install this tool, for see more visit [my web](https://sergioribera.com) (Very soon I will add an app store)
#### Made with the <3 by [SergioRibera](https://sergioribera.com)
