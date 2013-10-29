nrequire v0.2
========

A Node-style require() for browsers.

### Usage
In `helloworld.js`

    exports.hi = function(){
    	return "Hello world!" ;
    };
    
Then in your `main.js`

    var helloworld = require("./helloworld.js");
    console.log(helloworld.hi());
	
### Change Log
***
#### v0.2
* Added configuration options 'useCache', ''
* Detects jQuery and uses jQuery.ajax if found.
* [CommonJS Module 1.0](http://wiki.commonjs.org/wiki/Modules/1.0) compatible
* Built-in web server for testing.
	



