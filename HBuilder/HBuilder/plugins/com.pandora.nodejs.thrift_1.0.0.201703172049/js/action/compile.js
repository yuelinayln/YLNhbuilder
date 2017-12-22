var less = require("less");
var sass = require('node-sass');

module.exports = function(config, type, source, result) {
	if (type === "less") {
		less.render(source, config, function(e, output) {
			if (e) {
				result(null, {
					error : e.message,
					line : e.line + "",
					column : e.column + ""
				});
			} else {
				result(null, {
					result : output.css
				});
			}
		});
	} else if (type === "scss") {
		config.data = source;
		sass.render(config, function(e, output) {
			if (e) {
				result(null, {
					error : e.message,
					line : e.line + "",
					column : e.column + ""
				});
			} else {
				result(null, {
					result : output.css.toString()
				});
			}
		});
	}else{
		result(new Error("不支持编译"+type+"文件"));
	}
};