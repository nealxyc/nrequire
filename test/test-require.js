

/**
 * Testing require.js
 */

var test = new Test();

test.testModuleIdResovler = function(){
	var fd = "/";
	var func = require.moduleIdResolver.bind(require);
	eq("/myfile.js", func(fd, "./myfile"));
	eq("/myfile.js", func(fd, "./myfile.js"));
	
	fd = "/my/folder/" ;
	eq("/my/myfile.js", func(fd, "../myfile.js"));
	eq("/my/myfile.js", func(fd, "../myfile"));
	
	eq("http://www.myserver.com/myfile.js", func(fd, "http://www.myserver.com/myfile.js"));
	eq("mymodule.js", func(fd, "mymodule"));
	
	fd = "http://www.myhost.com/";
	eq("mymodule.js", func(fd, "mymodule"));//Might change in the future
	eq("http://www.myhost.com/mymodule.js", func(fd, "./mymodule"));
	eq("http://www.myhost.com/f/g/h/mymodule.js", func(fd, "./f/g/h/mymodule"));
	
	try{
		func(fd, null);
		fail("Expect error of no module id found.");
	}catch(e){
		assertNotNull(e);
	}
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

test.testStack = function(){
	var stack = require.stack;
	assertNotNull(stack);
	eq(0, stack.length);
	stack.push({name: "file1"});
	eq(1, stack.length);
	assertTrue(stack.modNames["file1"]);
	
	var f = stack.pop();
	eq("file1", f.name)
	eq(0, stack.length);
	assertNull(stack.modNames["file1"]);
};

test.testCache = function(){
	require.config("useCache", false);
	var mod1 = require("./tool.js");
	assertNotNull(mod1);
	var mod2 = require("./tool.js");
	assertNotNull(mod2);
	//Not the same because cache is diabled, both require calls eval so different object.
	assertFalse(mod1 === mod2);
	
	require.config("useCache", true);
	var mod1 = require("./tool.js");
	assertNotNull(mod1);
	var mod2 = require("./tool.js");
	assertNotNull(mod2);
	eq(mod1, mod2);
};

test.testInnerRequire = function(){
	var num = require("./dir/num.js");
	assertEquals(2, num);
	
	assertTrue(require("./dir/result.js").result);
};

test.testRequireLoop = function(){
//	var num = require("./dir/require-loop1.js");
//	assertEquals(1, num);
};

//test.testFail = function(){
//	fail("Yea! It failed!");
//};

//log.writeToBody = true;
TestRunner.run(test);