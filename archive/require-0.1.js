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
	var getDirname = function(){
		if (global && global.location){
			var href = global.location.href ;
			if(href){
				var lastSlash = href.lastIndexOf("/");
				return href.substring(0, lastSlash) + "/"; //Not including the last slash
			}
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
		if (id in _cache){
			//Already in cache
			return _cache[id];
		}
		
		if(id in _stack.modNames){
			//TODO half way loaded module
			//if(_stack[_stack.length - 1].)
		}
		
		//New module to load
		var script = _ajaxGet(id);//synchronized get
		if(isNull(script)){
			//TODO Re-try other paths?
		}
		
		var exports = _evalText(script);
		//cache the loaded module
		_cache[id] = exports ;
		return exports ;
	};
	var _cache = require.cache = {}
		, _stack = require.stack = [];
	
	_stack.modNames = {};//un-ordered module names that are in _stack
	
	/**
	 * Configuration
	 */
	var _conf = {
			"useStrict": true
	};
	var _config = require.config = function(k, v){
		if(k && typeof v !== undefined){
			_conf[k] = v ;
		}
		return _conf[k];
	};
	
	/**
	 * Relative moduleId can start with '.' or '..'
	 * No '.js' at the end
	 */
	var _moduleIdResolver = require.moduleIdResolver = function(dirname, moduleId){
		//Relative moduleId can start with '.' or '..'
		// No '.js' at the end
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
			//Appends '.js' to the end if it moduleId doesn't have it
			moduleId += moduleId.lastIndexOf(JS_EXTENSION) != (moduleId.length - JS_EXTENSION.length)? JS_EXTENSION:"" ;
		}else{
			// Oct 11, 2013. For now _moduleIdResolver("tool.js") => "tool.js"
			//moduleId is undefined or ""
			//TODO throw new Error("No module identifier.");
		}
		return moduleId ;
	};
	
	var _load = require.loadModule = function(moduleId){
		var mod = {
				_filename: moduleId,
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
		if (_exports != null && Object.getOwnPropertyNames(_exports).length > 0){
			return _exports ;
		}else{
			return {};
		}
	};
	
	var _ajaxGet = require.ajaxGet = function(resource, async, successFn, notFoundFn){
		//Default is async == false
		async = async ? true: false ;
		
		var xmlhttp;
		if (window.XMLHttpRequest){
			xmlhttp=new XMLHttpRequest();
		}
		else {
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		var txt = undefined ;
		xmlhttp.onreadystatechange = function() {
			if(this.readyState == 4){
				if(this.status == 200){
					if(!async){
						  txt = xmlhttp.responseText;
					  }else{
						  if(successFn) successFn(xmlhttp.responseText) ;
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
