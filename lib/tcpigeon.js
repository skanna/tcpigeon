/*
 * tcpigeon - a simple TCP proxy implementation. 
 * It carries messages over long distances and it will generally return to its nest.
 *
 * Copyright(c) 2016 Marco Scannavini <skakko@gmail.com>
 * MIT Licensed
 */


exports.version = require( '../package' ).version;
exports.Tcpigeon = (function() {

	var net = require('net'),
		util = require('util'),
		fs = require('fs'),
		EventEmitter = require('events').EventEmitter,
		clients = [],
		local_address = '127.0.0.1',
		local_port = 30080,
		def_max_conn = 100, 

		options = {
			proxy_port  : local_port,
			proxy_addr  : local_address,
			remote_port : null, 
			remote_host : null,
			encoding    : 'utf8',
			logging     : 'file',
			max_conn    : def_max_conn 
  		}, 		

		Tcpigeon = function(opt) {
			var me = this;
			EventEmitter.call(me);

			if (!(me instanceof Tcpigeon)) return new Tcpigeon(opt);

			for (var k in options) {
				if (opt[k] === null || opt[k] === undefined) {
					opt[k] = options[k];
				}
			}

			me.conf = opt;
			me.server = net.createServer((socket) => {
				
				var src = socket.remoteAddress + ':' + socket.remotePort,
					enc = me.conf.encoding;

				socket.setEncoding(enc);
				socket.on('data', (data) => {
					var wings = new net.Socket();

					me.emit('post', data);

					log('(<<) from %s: %s - length: %d bytes', src, data.toString(enc), data.length);			

					wings.connect(parseInt(opt.remote_port), opt.remote_host, () => {
						log('(<<) %s - length: %d bytes', data.toString(enc), data.length);
						wings.write(data);				
					});

					wings.on('data', (databack) => {
						log('(>>) %s - length: %d bytes', databack.toString(enc), databack.length);
						socket.write(databack);
						log('(>>) to %s: %s - length: %d bytes', src, databack.toString(enc), databack.length);
					});

					wings.on('close', () => {
						socket.end();
					});
					
					wings.on('error', (err) => {
						log('(EE) remote error - %s', err.message);
						socket.end();
					});
					
					socket.once('cut', () => {
						wings.end();
					});
				});

				socket.on('close', () => {
					log('(--) client %s terminated', src);
					var c = clients.indexOf(socket);
					if (c !== -1) clients.splice(c, 1);					
					socket.emit('cut');
					log('(II) %d clients currently connected', clients.length);
					me.emit('killed', clients.length);
				});

				socket.on('end', () => {
					log('(--) client %s disconnected', src);
					socket.end();
				});
				
				socket.on('error', (err) => {
					log('(EE) proxy error - %s', err.message);
					socket.emit('cut');
				});
				
			});

			srv = me.server;

			srv.on('connection', (conn) => {
				var addr = conn.remoteAddress,
					port = conn.remotePort,
					source = addr + ':' + port;

				log('(++) connection from %s', source);
				clients.push(conn);
				log('(II) %d clients currently connected', clients.length);
				me.emit('carrier', source);
			});

			srv.on('error', (err) => {
				srv.close();
				me.emit('falling', err);
			});


	 		log = function() {
	 			var	conf = me.conf,
					currDate = new Date().toLocaleString(),
					line = currDate + ' - ' + util.format.apply(this, arguments) + '\n';

				if (conf.logging === 'console') {
					console.log(line);
				} else if (conf.logging === 'nolog') {
					;
				} else {
		 			fs.appendFile('./tcpigeon.log', line, (err) => {
		 				if (err) throw err;
		 			});
				}
			};	

			check = function() {
				var conf = me.conf;

				var f1 = net.isIP(conf.proxy_addr),
					f2 = isNaN(parseInt(conf.proxy_port)),
					f3 = net.isIP(conf.remote_host),
					f4 = isNaN(parseInt(conf.remote_port)),
					f5 = isNaN(parseInt(conf.max_conn)),
					msg = null;

				if (f1 === 0) {
					msg = util.format('(EE) proxy address value (%s) is not legal, please', conf.proxy_addr);
				}
				if (f2) {
					msg = util.format('(EE) proxy port value (%s) is not legal', conf.proxy_port);
				}
				if (f3 === 0) {
					msg = util.format('(EE) remote server address value (%s) is not legal', conf.remote_host);
				}
				if (f4) {
					msg = util.format('(EE) remote server port value (%s) is not legal', conf.remote_port);
				}
				if (f5) {
					conf.max_conn = def_max_conn;
					log('(WW) max connection value (%s) is not legal, using default value (%d)', conf.max_conn, def_max_conn); 
				}

				return msg;
			};

		},

		ptype = Tcpigeon.prototype;
		util.inherits(Tcpigeon, EventEmitter);


	ptype.flock = function() {
		var pigeons = [];
		for (let i=0; i< clients.length; i++) {
			var c = clients[i];
			pigeons.push(c.remoteAddress + ':' + c.remotePort);
		}
		return pigeons;
	}

	ptype.fly = function() {
		var me = this,
			server = me.server,
			conf = me.conf,
			parent = me.constructor.super_;

		var ch = check();
		if (ch === null) {
			server.listen(parseInt(conf.proxy_port), conf.proxy_addr, () => {
					log('(II) Tcpigeon Server listening to %j', server.address());
			});
			return server;

		} else {
			log(ch);
			return null; 
		}
	};

	ptype.land = function() {
		var me = this,
			server = me.server;

		for (let i=0; i<clients.length; i++) {
			clients[i].destroy();
		}
		server.close(function() {
			log('(II) Tcpigeon halted');
		});
	};

	ptype.kill = function(cli) {
		for (let i = 0; i < clients.length; i++) {
			var c = clients[i],
				cstr = c.remoteAddress;

			if (cstr === cli) {
				c.emit('cut');
				c.destroy();
				log('(--) client %s killed', cli);
				break;
			}
		}
	};

	return Tcpigeon;
})();
