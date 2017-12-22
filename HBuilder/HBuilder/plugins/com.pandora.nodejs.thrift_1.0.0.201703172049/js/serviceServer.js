var thrift = require("thrift");
var NodeService = require("./rpc/Service");
var ttypes = require("./rpc/service_types");
var format = require("./action/format");
var compressor = require("./action/compressor");
var compile = require("./action/compile");
var syntaxCheck = require("./action/syntax-check");

var port = 9090;
if(process.argv.length>2){
	port = process.argv[2];
}
var server = thrift.createServer(NodeService, {
	execute : function(request, result) {
		try {
			var action = null;
			if(request.action === "format"){
				action = format;
			}else if(request.action === "compressor"){
				action = compressor;
			}else if(request.action === "compile"){
				action = compile;
			}else if(request.action === "syntax_check"){
				action = syntaxCheck;
			}
			if(action){
				var config = request.config?JSON.parse(request.config):null;
				action(config, request.type, request.content, result);
			}
		} catch (e) {
			console.error(e);
			result(e, null)
		}
	},
}).on('error', function(err){
	console.error(err);
	if(err.code == "ENOTFOUND"){
		server.listen(port, "localhost");
	}else{
    	console.error("node server 异常退出");
    	process.exit(1);
	}
}).on('listening', function(){
	var address = server.address();
	console.log("create Server listen " + address.address +":" + address.port);
});;
server.listen(port, "127.0.0.1");
