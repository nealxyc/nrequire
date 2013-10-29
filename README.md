nrequire v0.2
========

A Node-style require() for browsers.

### Usage
In `hello.js`

    exports.hi = function(){
    	return "Hello world!" ;
    };
    
Then in your `index.html`

    <script src="nrequire.js"></script>
    <script>
    var hello = require("./hello.js");
    console.log(hello.hi());
    </script>
	
### Change Log
***
#### v0.2
* Added configuration options 'useCache', ''
* Detects jQuery and uses jQuery.ajax if found.
* [CommonJS Module 1.0](http://wiki.commonjs.org/wiki/Modules/1.0) compatible
* Built-in web server for testing.
	



