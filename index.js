var express = require('express');
var net = require('net');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var port = 3000; //process.env.PORT || 
var router = express.Router();

var bodyParser = require('body-parser');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var msgs = [];
// Supports multiple client chat application
// Keep a pool of sockets ready for everyone
// Avoid dead sockets by responding to the 'end' event
var tcpClients = [];

// /api/receive-msg
/*
router.post('/receive-msg', function(req, res) {
    var msg = req.body.message;
    //console.log("incoming request: " + msg);
    io.emit("io-socket", msg);
    res.json({ data: JSON.stringify(msgs),
    					 code: 200 });
});
*/

// Routing
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', router);


io.on('connection', function(socket) {
  //console.log('WEB CLIENT user connected');
  //serverToFrontend('WEB CLIENT user connected');

  socket.on('disconnect', function(){
   //console.log('WEB CLIENT user disconnected');
   //serverToFrontend('WEB CLIENT user disconnected');
  });

  socket.on('io-socket', function(json_str){
	    io.emit('io-socket', json_str);
      sendToAllTCPclients(json_str);
  });
});
		
http.listen(port, function(){
  console.log('Http listening on :' + port);
});


function socketToFrontend(json_str) {
  io.sockets.emit("io-socket", json_str);
}

function serverToFrontend(msg) {
   io.sockets.emit("io-server", msg);
}

function encodeToByteArray(data) {
  return Buffer.from(data); // uses utf-8
}

function sendToAllTCPclients(msg) {
  var encoded = encodeToByteArray(msg);
  for (var i = 0; i < tcpClients.length; i++) {
    tcpClients[i].write(encoded);
  }
}

// =============================================================================================================
// CODE ABOVE SUPPORT CLIENT APPLICATION CONNECTION USING SOCKETS THROUGH TCP
// =============================================================================================================

function handleNewTCPconnection(net_socket) {
  net_socket.name = net_socket.remoteAddress + ":" + net_socket.remotePort;
  // Add the new client socket connection to the array of
  // tcpClients
  tcpClients.push(net_socket);
  serverToFrontend("New TCP connection: " + net_socket.name);
}
// Create a TCP socket listener
var tcpSocketListener = net.Server(function (net_socket) {
     handleNewTCPconnection(net_socket);
    
    // 'data' is an event that means that a message was just sent by the 
    // client application
    net_socket.on('data', function (msg_sent) {
        var buff = Buffer.from(msg_sent);
        var decodedStr = buff.toString('utf8');
        //console.log(decodedStr);
        //json.parse ??
        socketToFrontend(decodedStr);

        // if want to forward the message to all tcp clients, uncomment:
        /*
        // Loop through all of our tcpClients and send the data
        for (var i = 0; i < tcpClients.length; i++) {
          // Don't send the data back to the original sender
          if (tcpClients[i] == net_socket) // don't send the message to yourself
              continue;
          // Write the msg sent by chat client
          tcpClients[i].write(buff);
        }
        */
    });
    // Use splice to get rid of the socket that is ending.
    // The 'end' event means tcp client has disconnected.
    net_socket.on('end', function () {
        //console.log("a c# client has left.");
        var i = tcpClients.indexOf(net_socket);
        serverToFrontend("TCP client disconnected: "+ tcpClients[i].name);
        tcpClients.splice(i, 1);
    });
});

tcpSocketListener.listen(3080);
console.log('Tcp waiting at http://localhost:3080');