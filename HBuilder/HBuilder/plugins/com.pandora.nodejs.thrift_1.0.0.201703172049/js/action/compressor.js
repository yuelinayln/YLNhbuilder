var prettydiff = require("prettydiff");

module.exports = function(config, type, source, result) {
	if (type === "js" || type === "css") {
		var args = {
	        source: source,
	        mode : "minify", //  beautify, diff, minify, parse
	        lang  : type
		};
		if(config){
			for(var p in config) { 
				args[p]=config[p]; 
			} 
		}
		result(null, {result : prettydiff(args)});
	}else{
		result(new Error("不支持压缩"+type+"文件"));
	}
};