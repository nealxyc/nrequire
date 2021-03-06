/**
 * 
 * @author Neal Xiong	
 */

(function(global){
	/** @private */
	var isNull = function(obj){
		return obj == undefined ;
	};
	/**
	 * Returns the current dir name which is the url path of the current page
	 * @private
	 */
	var getDirname = function(path){
		if(!path && global && global.location){
			path = window.location.href ;
		}
		if(path){
			var lastSlash = path.lastIndexOf("/");
			return path.substring(0, lastSlash) + "/";
		}else{
			// ???
			return ".";
		}
	};
	/** @constant */
	var JS_EXTENSION = ".js";
	var require;
	require = function(moduleId){
		/*
		 * Needs to handle:
		 * 	1. New module to load
		 * 	2. Module already in cache
		 * 	3. Module is half-way loaded and in stack
		 * 	4. Module in cache but needs reload.
		 * */
		var dirname ;
		if(_stack.length > 0){
			dirname = _stack.peek()._dirname ;
		}else{
			dirname = getDirname();
		}
		var id = _moduleIdResolver(dirname, moduleId);
		if (id in _cache && _conf["useCache"]){
            //Already in cache
			return _cache[id].exports;
		}

        var module = _create(id);
		if(id in _stack.modNames){
            //Return immediately to resolve require loop
            return _stack[_stack.modNames[id]].exports ;
		}
		
		_stack.push(module);
		
		//New module to load
		var script = _ajaxGet(id);//synchronized get
		if(isNull(script)){
			//TODO Re-try other paths?
			throw Error("Module file is not found: " + id);
		}
		
		_evalText(script, module);
		
		//cache the loaded module
		var mod = _stack.pop();// mod should pointing to the same object as module
		if(_conf["useCache"]){
			_cache[mod.id] = mod ;
		}
		
		return mod.exports ;
	};
	
	/**
	 * @private @memberOf require
	 */
	var _cache = require.cache = {}
		, _stack = require.stack = [];
	/**
	 * 
	 * @memberOf _stack
	 */
	_stack.modNames = {};//un-ordered module names that are in _stack
	/**
	 * 
	 * @memberOf _stack
	 */
	_stack.push = function(elem){
		Array.prototype.push.call(this, elem);
		this.modNames[elem.id] = this.length - 1;
	};
	
	/**
	 * 
	 * @memberOf _stack
	 */
	_stack.pop = function(){
		var o = Array.prototype.pop.call(this);
		delete this.modNames[o.id];
		return o ;
	};
	
	/**
	 * 
	 * @memberOf _stack
	 */
	_stack.peek = function(){
		if(this.length == 0){
			return null ;
		}
		return this[this.length - 1];
	};
	
	/**
	 * Configuration
	 * @private
	 * @field
	 */
	var _conf = {
			"useStrict": true,
			"useCache": true
	};
	/** @memberOf require */
	require.config = function(k, v){
		if(k && typeof v !== undefined){
			_conf[k] = v ;
		}
		return _conf[k];
	};
	/**
	 * Relative moduleId can start with '.' or '..'
	 * '.js' at the end is omittable
	 * @param dirname The current directory. It will be used when moduleId is a relative path.
	 * @param moduleId The module file path
	 * @memberOf require
	 */
	require.moduleIdResolver = function(dirname, moduleId){
		//Relative moduleId can start with '.' or '..'
		// '.js' at the end is omittable
		if(moduleId){
			moduleId = moduleId.trim();
			//TODO Supports backslash(\) as delimiter as well?
			var terms = moduleId.split("/");
			if(terms[0] == "." || terms[0] == ".."){
				moduleId = dirname + moduleId;
			}else{
				//Absolute path
				//TODO Goes through lib path
				//moduleId = moduleId;
			}
			//Appends '.js' to the end if moduleId doesn't have it
			moduleId += moduleId.lastIndexOf(JS_EXTENSION) != (moduleId.length - JS_EXTENSION.length)? JS_EXTENSION:"" ;
			
			//Normalize moduleId
			terms = moduleId.split("/");
			var normalizedTerms = [];
			for(i in terms){
				var term = terms[i];
				switch(term){
					case "..":
						if(isNull(normalizedTerms.pop())){
							//TODO exception?
							//Bad file path
						}
					case ".":
						continue;
						default:
							normalizedTerms.push(term);
				}
			}
			moduleId = normalizedTerms.join("/");			
		}else{
			// Oct 11, 2013. For now _moduleIdResolver("tool.js") => "tool.js"
			//moduleId is undefined or ""
			throw new Error("No module identifier.");
		}
		return moduleId ;
	};
	var _moduleIdResolver = require.moduleIdResolver ;
	
	/** @memeberOf require */
	var _create = require.createModule = function(moduleId){
		var dirname = getDirname(moduleId);
		var filename = moduleId.replace(dirname, "");
		return {
			id: moduleId,
			_dirname: dirname,
            _filename: filename,
            exports: {}
		};
	};

	/**
	 * @private
	 */
	var _evalText = require.evalScript = function(text, module){
		try{
			//TODO more variables? 
			//TODO use local variables to override window, document, etc?
			text = ( _conf["useStrict"] ? "\"use strict\";": "" ) + text ;
			var func = new Function("module", "exports", "require", text);
			// Within the script 'this' refer to the current module object
			func.apply(module, [module, module["exports"], require]);
		}catch(e){
			throw new Error("Evaluation failed: " + e.message);
		}
	};
	
	var _ajaxGet = require.ajaxGet = function(resource, async, successFn, notFoundFn){
		//Default is async == false
		async = async ? true: false ;
		var txt = undefined;
		if(global.jQuery && global.jQuery.ajax){
			global.jQuery.ajax({
			    url: resource,
			    async: async,
			    success: function(data, statusText, jqXHR){
			          txt = data ;
			          successFn ? successFn(data): "";
			        },
			    error: function(data, statusText, jqXHR){
			        if(statusText === "404" && notFoundFn)
			          notFoundFn();
			    },
			    //We don't want jQuery to execute the script for us.
			    dataType: "text"
			});
		}else{
			var xmlhttp;
			if (global.ActiveXObject){
				xmlhttp=new global.ActiveXObject("Microsoft.XMLHTTP");
			}
			else {
				xmlhttp=new global.XMLHttpRequest();
			}
			xmlhttp.onreadystatechange = function() {
				if(this.readyState == 4){
					if(this.status == 200){
						if(!async){
							try{
								txt = xmlhttp.responseText;
							}catch(e){
								//
								txt = "";
							}
							  
						  }else{
							  if(successFn){
								  var t = "";
								  try{
										t = xmlhttp.responseText;
									}catch(e){
										//
										t = "";
									}
									successFn(t) ;
							  }
						  }
					}
					else{
						if(!async){
//							var err = new Error("Module not found: " + resource);
//							err.httpStatus = 404 ;
//							throw err; 
						  }else{
							  if(notFoundFn) notFoundFn();
						  }
					}
				}	
			};
			xmlhttp.open("GET", resource, async);
			xmlhttp.send();
		}
		return txt ;
	};
	
	var module;
	//Exports "require" to global/module
	global.require = (module|| {}).exports = require ;
})(this);
