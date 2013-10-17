nrequire v0.01
========

A Node-style require() for browsers.

### Usage
In helloworld.js
	//In helloworld.js
	exports.hi = function(){
		return "Hello world!" ;
	};
Then in your main.js
	var helloworld = require("./helloworld.js");
	console.log(helloworld.hi());
	
	



