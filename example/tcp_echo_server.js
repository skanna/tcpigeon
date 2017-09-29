/*
 * TCP echo server - multiple connections are allowed
 */

const HOST = '127.0.0.1',
	  PORT = 8124;

var net = require('net'),
	proc = require('process'),
	log = console.log,
	clients = [];

process.on('SIGINT', halt);

function echo(socket) {
	var src = socket.remoteAddress + ':' + socket.remotePort;
	socket.setEncoding('utf8');

	socket.on('data', (data) => {
		log('received: %s', data.toString());
	});

	socket.on('end', () => { 
		log('client %s disconnected', src);
		socket.end(); 
	});

	socket.on('close', () => {
		log('%s closing connection', src);
		var k = clients.indexOf(socket);
		if (k !== -1) clients.splice(k, 1);
	});

	socket.on('error', (err) => {
		log(err);
		socket.destroy();
	});

	socket.pipe(socket);
}

function halt() {
	for (let i=0; i<clients.length; i++) {
		clients[i].destroy();
	}
	echo_server.close(() => {
		log('\necho server exiting: %d connections dropped', clients.length);
		process.exit();
	});
}

var echo_server = net.createServer(echo);

echo_server.on('connection', (socket) => {
	var src = socket.remoteAddress + ':' + socket.remotePort; 
	log('client %s connected', src);
	clients.push(socket); 
});

echo_server.on('error', halt);

echo_server.listen(PORT, HOST, () => {
	log('Echo Server listening to %j', echo_server.address());
});


