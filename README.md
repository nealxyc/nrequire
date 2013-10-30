nRequire v0.2.0
========

A NodeJS-style require() for browsers.

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
#### v0.2.0
* Added configuration options 'useCache', 'useStrict'.
* Detects jQuery and uses jQuery.ajax if found.
* [CommonJS Module 1.0](http://wiki.commonjs.org/wiki/Modules/1.0) compatible
* Built-in web server for testing.
	



