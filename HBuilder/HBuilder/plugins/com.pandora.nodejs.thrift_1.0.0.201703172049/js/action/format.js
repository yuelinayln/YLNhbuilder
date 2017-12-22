var js_beautify = require('js-beautify');
var prettydiff = require("prettydiff");

module.exports = function(config, type, source, result) {
	if (type === "js") {
		result(null, {result : js_beautify.js(source, config)});
	} else if (type === "css" || type === "less" || type === "scss") {
		result(null, {result : js_beautify.css(source, config)});
	} else if (type === "html") {
		result(null, {result : js_beautify.html(source, config)});
	} else if (type === "less" || type === "scss") {
		var args = {
	        source: source,
	        mode : "beautify", //  beautify, diff, minify, parse
	        lang  : 'css',
	        inchar : config.inchar,  // indent character
	        insize : config.insize    // number of indent characters per indent
		};
		if(config){
			for(var p in config) { 
				args[p]=config[p]; 
			} 
		}
		result(null, {result : prettydiff(args)});
	}else{
		result(new Error("不支持格式化"+type+"文件"));
	}
};