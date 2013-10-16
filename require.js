/**
 * 
 * @author Neal Xiong	
 */


(function(global){
	var isNull = function(obj){
		return obj == undefined ;
	};
	/**
	 * Returns the current dir name which is the url path of the current page
	 */
	var getDirname = function(path){
		if(!path && global && global.location){
			path = window.location.href ;
		}
		if(path){
			var lastSlash = path.lastIndexOf("/");
			return path.substring(0, lastSlash) + "/"; //Not including the last slash
		}else{
			// ???
			return ".";
		}
	};
	
	var JS_EXTENSION = ".js";
	var require;
	
	/**
	 * 
	 */
	var require = function(module){
		var _require = require ;
		/*
		 * Needs to handle:
		 * 	1. New module to load
		 * 	2. Module already in cache
		 * 	3. Module is half-way loaded and in stack
		 * 	4. Module in cache but needs reload.
		 * */
		var dirname ;
		if(_stack.length > 0){
			//TODO not sure if it's correct yet
			dirname = _stack[_stack.length - 1]._dirname ;
		}else{
			dirname = getDirname();
		}
		var id = _moduleIdResolver(dirname, module);
		if (id in _cache && _conf["useCache"]){
			//Already in cache
			return _cache[id].exports;
		}
		
		if(id in _stack.modNames){
			//TODO half way loaded module
			//if(_stack[_stack.length - 1].)
		}
		
		_stack.push({name: id, _dirname: getDirname(id)});
		
		//New module to load
		var script = _ajaxGet(id);//synchronized get
		if(isNull(script)){
			//TODO Re-try other paths?
		}
		
		var exports = _evalText(script);
		
		//cache the loaded module
		var mod = _stack.pop();
		mod.exports = exports ;
		if(_conf["useCache"]){
			_cache[mod.name] = mod ;
		}
		//Assert mod.name == id ???
		
		return exports ;
	};
	var _cache = require.cache = {}
		, _stack = require.stack = [];
	
	_stack.modNames = {};//un-ordered module names that are in _stack
	
	_stack.push = function(elem){
		Array.prototype.push.call(this, elem);
		this.modNames[elem.name] = true;
	};
	
	_stack.pop = function(){
		var o = Array.prototype.pop.call(this);
		delete this.modNames[o.name];
		return o ;
	};
	
	/**
	 * Configuration
	 */
	var _conf = {
			"useStrict": true,
			"useCache": true
	};
	var _config = require.config = function(k, v){
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
	 */
	var _moduleIdResolver = require.moduleIdResolver = function(dirname, moduleId){
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
	
	var _create = require.createModule = function(moduleId){
		var mod = {
				//_filename: moduleId,
				_dirname: getDirname(moduleId),
				id: moduleId,
				name: moduleId
		};
		
	};
	
	var _evalText = require.eval = function(text){
		var module = {"exports": {}};
		try{
			//TODO more variables? __filename ? __dirname ?
			text = ( _conf["useStrict"] ? "\"use strict\";": "" ) + text ;
			var func = new Function("module", "exports", "require", text);
			func.apply(null, [module, module["exports"], require]);
		}catch(e){
			//
//			console.error("" + e);
			throw new Error("Evaluation failed: " + e.message);
		}
		var _exports = module["exports"] ;
		if (_exports != null){
			return _exports ;
		}else{
			return {};
		}
	};
	
	var _ajaxGet = require.ajaxGet = function(resource, async, successFn, notFoundFn){
		//Default is async == false
		async = async ? true: false ;
		
		var xmlhttp;
		if (global.ActiveXObject){
			xmlhttp=new global.ActiveXObject("Microsoft.XMLHTTP");
		}
		else {
			xmlhttp=new global.XMLHttpRequest();
		}
		var txt = undefined ;
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
//						var err = new Error("Module not found: " + resource);
//						err.httpStatus = 404 ;
//						throw err; 
					  }else{
						  if(notFoundFn) notFoundFn();
					  }
				}
			}
		};
		xmlhttp.open("GET", resource, async);
		xmlhttp.send();
		
		return txt ;
	};
	
	var module;
	//Exports "require" to global/module
	global.require = (module|| {}).exports = require ;
})(this);
