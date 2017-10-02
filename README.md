# Tcpigeon

[![NPM](https://nodei.co/npm/tcpigeon.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/tcpigeon/)

[![Build Status](https://travis-ci.org/skanna/tcpigeon.svg?branch=master)](https://travis-ci.org/skanna/tcpigeon)

``` 
     _
\. _(9> 
 \==_) 	
 -\'= 
```
>It carries messages over long distances and it will generally return to its nest.
```
 _      
<6)_ ,/  
 (_==/    
  =\'- 
```

Tcpigeon is a simple transparent TCP proxy implementation you can use for debugging purposes. It acts as a *mitm* entity which intercepts, logs and delivers TCP messages from client(s) to server in both directions.

###### Use cases 

- You wrote a communication protocol and you need to verify the data exchanged between source and destination.
- You have to inspect the payload of every TCP message sent by two end-points.   

This is the scenario:

```
                              <===> client 1
remote server <===> TCPIGEON  <===> client 2
                              ...
                              <===> client n
```


## Install

npm:

`$ npm install tcpigeon [-g]`

or clone the repository:

`git clone https://github.com/skanna/tcpigeon.git`

## Require

```
var Tcpigeon = require('tcpigeon'); 
```

See [examples](example/).

## Tests

If you don't have ```mocha``` installed you need to install devDependecies:

```
$ cd tcpigeon
$ npm install
```
 
Run tests:

```
$ npm test
```

## Options

```javascript
options = {
	proxy_port  : 30080,          // proxy port
	proxy_addr  : '127.0.0.1',    // proxy address
	remote_port : null,           // remote server port - mandatory
	remote_host : null,           // remote server host - mandatory
	encoding    : 'utf8',         // character encoding
	logging     : 'file',         // log type
	max_conn    : 100             // max allowed connections
}
```

- `remote_port` and `remote_host` are **mandatory**, the other parameters have default values as shown.
- `encoding` can assume the same values as in the [Buffer](https://nodejs.org/dist/latest/docs/api/buffer.html#buffer_buffers_and_character_encodings) module.
- `logging` possible values are: "file" (default), "console" or "nolog".
- The `max_conn` value should be equal to the remote server capacity, at least.

## Methods

```javascript
// Run proxy
Tcpigeon#fly(Object tcpigeon_options) : net.Server

// Stop proxy
Tcpigeon#land() : undefined

// Drop a connection to the specified client, returns the number of connected clients
Tcpigeon#kill(ip_address) : undefined

// Returns the list of the open sockets in the form 'ip_address:port'
Tcpigeon#flock() : Array
```

The `fly` method returns `null` in case of configuration error (wrong option).

## Events

Custom events:

```javascript
// new connection - a pigeon can fly
// source format is ip_address:port
'carrier' : function(String source)

// a pigeon has a new message for you
'post'    : function(String message) 

// a pigeon was killed :(
'killed'  : function(Number clients)

// error - no more flying pigeons 
'falling' : function(Object Error)
```

## Logging

Each line is preceded by a datetime value and a symbol that categorizes it. Use these symbols to spot:

- **(EE)** errors 
- **(WW)** warnings 
- **(II)** general informations 
- **(++)** new connections 
- **(--)** disconnections  
- **(<<)** client to server direction
- **(>>)** server to client direction 

The length of every message is printed too.

example:

```
9/28/2017, 3:48:43 PM - (II) Tcpigeon Server listening to {"address":"127.0.0.1","family":"IPv4","port":30080}
9/28/2017, 3:48:51 PM - (++) connection from 127.0.0.1:51313
9/28/2017, 3:48:51 PM - (II) 1 clients currently connected
9/28/2017, 3:48:51 PM - (<<) from 127.0.0.1:51313: client ONE - length: 10 bytes
9/28/2017, 3:48:51 PM - (<<) client ONE - length: 10 bytes
9/28/2017, 3:48:51 PM - (>>) client ONE - length: 10 bytes
9/28/2017, 3:48:51 PM - (>>) to 127.0.0.1:51313: client ONE - length: 10 bytes
```

## Acknowledgements

Coding style is inpired to the modules written by @rootslab :+1: (have a look!!)

Thank you for giving me a lot of precious suggestions!
