

/**
 * Testing require.js
 */

var test = new Test();

test.testModuleIdResovler = function(){
	var fd = "/";
	var func = require.moduleIdResolver.bind(require);
	eq("/./myfile.js", func(fd, "./myfile"));
	eq("/./myfile.js", func(fd, "./myfile.js"));
	
	fd = "/my/folder/" ;
	eq("/my/folder/../myfile.js", func(fd, "../myfile.js"));
	eq("/my/folder/../myfile.js", func(fd, "../myfile"));
	
	eq("http://www.myserver.com/myfile.js", func(fd, "http://www.myserver.com/myfile.js"));
	eq("mymodule.js", func(fd, "mymodule"));
};

test.testAjaxGet = function(){
	
	//sync get
	eq("var a = \"src1.js\" ;",require.ajaxGet("src1.js", false));
	
	//async callbacks
	isNull(require.ajaxGet("src1.js", true, function(txt){
		eq("var a = \"src1.js\" ;",txt);
	}));
	
	//
	isNull(require.ajaxGet("src2.js", true, function(txt){
		
	}, function(){
		log.log("file not found: src2.js");
	}));

};

test.testEval = function(){
	var txt = require.ajaxGet("tool.js");
	var obj = require.eval(txt);
	eq(1, Object.getOwnPropertyNames(obj).length);
	eq("function", typeof obj["isNull"]);
	
	assertTrue(obj.isNull(undefined));
	
	//test use strict
	require.config("useStrict", false);
	obj = require.eval("myName = 'myName';");
	eq("myName", window["myName"]);
	
	require.config("useStrict", true);
	var err;
	try{
		obj = require.eval("myName2 = 'myName2';");
	}catch(e){
		err = e;
	}
	assertNotNull(err);
	
};

test.testRequire = function(){
	var tool = require("./tool.js");
	assertNotNull(tool);
	assertNotNull(tool.isNull);
	assertTrue(tool.isNull(null));
	
	var tool2 = require("../tool2.js");
	assertNotNull(tool2);
	assertNotNull(tool2.isNull);
	assertTrue(tool2.isNull(null));
	
	var tool3 = require("./dir/tool3.js");
	assertNotNull(tool3);
	assertNotNull(tool3.isNull);
	assertTrue(tool3.isNull(null));
	
	// The following is not the behavior by design and might change in the future.
	var tool = require("tool.js");
	assertNotNull(tool);
	assertNotNull(tool.isNull);
	assertTrue(tool.isNull(null));
};

//log.writeToBody = true;
TestRunner.run(test);