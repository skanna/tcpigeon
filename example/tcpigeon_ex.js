/* The full example includes:
 *
 * - tcp_echo_server acting as the remote server
 * - two tcp_clients
 * 
 * edit the files according to your needs
 */

const delay = 30000;

var Tcpigeon = require('../'), 
	/* configurable options include also 
	 * - proxy_port 
	 * - proxy_addr
	 * - encoding
	 * - max_conn
	 * - logging
	 */
	p = Tcpigeon({
			remote_port : '8124',
			remote_host : '127.0.0.1',
		}),
	log = console.log;


var server = p.fly();
if (server === null) {
	log('Tcpigeon is not flying, please check logfile for errors');
	return;
}

// drop a connection
setTimeout(function() {
	p.kill('192.168.1.210');
}, 20000);


// halt server
var tm = setTimeout(function() {
	var clients = p.flock();
	log('listing connected clients:');
	for (let i=0; i<clients.length; i++) {
		log('\t' + clients[i]);
	}

	p.land();
}, delay);

p.on('carrier', (src) => {
	log('TEST: connection from %s', src);
});

p.on('post', (data) => {
	log('TEST: data received => %s', data);
});

p.on('falling', (error) => {
	log(error.message);
});

p.on('killed', (numclients) =>{
	log('connected clients: %d', numclients);
});