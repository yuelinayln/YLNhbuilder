var acorn = require('acorn-jsx');

module.exports = function(config, type, source, result) {
    if(type === "js") {
        try {
        	config.plugins = {jsx: true};
            acorn.parse(source, config);
            result(null, {});
        } catch(err) {
        	var message = err.message.replace(" (" + err.loc.line + ":" + err.loc.column + ")", "");
            result(null,{
                offset: (err.pos).toString(),
                length: (err.raisedAt - err.pos).toString(),
                line: (err.loc.line).toString(),
                column: (err.loc.column).toString(),
                message: message
            });
        }
    } else {
        result(new Error("不支持格式化" + type + "文件"));
    }
};