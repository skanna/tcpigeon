var assert = require('assert'),
	Tcpigeon = require('../'),
	net = require('net'),
	spawn = require('child_process').spawn;

describe('Tcpigeon tests', function() {
	const PORT = 8124;
	var p = null,
		srv = null,
		child = null;

	// hooks
	before(function() {
		p = Tcpigeon({
				remote_port : PORT,
				remote_host : '127.0.0.1',
		});
		
		child = spawn('nc', ['-l', '-p', PORT]);
		srv = p.fly();
	});

	after(function() {
		child.kill();
	});


	it('module instance creation', function() {
		assert(p instanceof Tcpigeon);
	});

	it('starting proxy', function() {
		assert(srv instanceof net.Server);
	});

	it('\'carrier\' event', function(done) {
		var emitted = false;

		setTimeout(function() {
			assert.ok(emitted);
			done();
		}, 1000);

		p.on('carrier', function() {
			emitted = true;
		});

		const client = net.connect({ port : 30080 });
	});	

	it('\'post\' event', function(done) {
		var emitted = false;

		setTimeout(function() {
			assert.ok(emitted);
			done();
		}, 1000);

		p.on('post', function() {
			emitted = true;
		});

		const client = net.connect({ port : 30080 }, function() {
			client.write('hello\n');
		});
	});	

	it('\'killed\' event', function(done) {
		var emitted = false;

		setTimeout(function() {
			assert.ok(emitted);
			done();
		}, 1000);

		p.on('killed', function() {
			emitted = true;
		});

		p.kill('127.0.0.1');
	});	


	it('add connection', function(done) {

		setTimeout(function() {
			var cs = p.flock();
			assert.equal(2, cs.length);
			done();			
		}, 1000);

		const client = net.connect({ port : 30080 });
	});

	it('drop connection', function(done) {

		setTimeout(function() {
			var cs = p.flock();
			assert.equal(1, cs.length);
			done();			
		}, 1000);

		p.kill('127.0.0.1');
	});

	it('proxy shutdown', function(done) {

		setTimeout(function() {
			var cs = p.flock();
			assert.equal(0, cs.length);
			done();
		}, 1000);

		p.land();
	});

});