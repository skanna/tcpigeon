const net = require('net'),
	  log = console.log

const client = net.connect({ port : 30080 }, () => {
	// 'connect' listener
	log('connected to server!');
	client.write('hello from client ONE');
});

client.on('data', (data) => {
	log(data.toString());
});

client.on('end', () => {
 	log('disconnected from server');
});

client.on('error', (err) => {
	log(err.message);
})