var express = require("express"),
	swig = require("swig"),
	app = express(),
	fs  = require('fs'),
	STATIC_URL= '/static/',
	TEMPLATE_DIR='';

var APP_PORT = 9009;

const fileExists = require("file-exists");
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('api/db.json')
const middlewares = jsonServer.defaults()
const ContextProcessor = {};

var STATIC_ROOT = __dirname + "/source/static/";
var TEMPLATE_DIR = __dirname + "/source/templates/";

var API_PORT = 3000;
server.use(middlewares)
server.use(router)

const API_URL = `http://localhost:${API_PORT}/`;

server.listen(API_PORT, () => {
	console.log("JSON Server running => "+API_URL);
})




// Swig Render Config and Functions
function makeid(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 8; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

function get_range_funtion(input) {
	var data = [];
	var length = input; // user defined length
	for(var i = 0; i < length; i++) {
		data.push("-");
	}
	return data
}

function get_len_funtion(objeto) {
	let _objeto = (objeto || [])
	return _objeto.length
}

function cycle_funtion(input,index_loop) {
	index_loop = parseInt(index_loop);
	var data_cycle = input.split(",");
	var index_cycle = index_loop % data_cycle.length;
	return data_cycle[index_cycle] // user defined length
}

swig.setFilter("get_range", get_range_funtion);
swig.setFilter("length", get_len_funtion);


swig.setDefaults({
	cache: {
		get: function (key) {},
		set: function (key, val) { }
	},
	loader: swig.loaders.fs('./source/templates/'),
	locals: {
		API_URL:API_URL,
		STATIC_URL : STATIC_URL,
		BUILD_ID : makeid()
	}
});

function renderTemplate(path_tmplt) {
	//console.log("render => ",path_tmplt)
	if(path_tmplt === ''){
		path_tmplt = 'index.html';
	}
	path_to_template = path_tmplt;
	if(path_tmplt.endsWith(".html")) {
		path_to_template = TEMPLATE_DIR+path_tmplt;
		if (fileExists.sync(path_to_template)) {
			//console.log("Compilando /templates/"+path_tmplt+" to response;");
			return swig.renderFile(TEMPLATE_DIR+path_tmplt, ContextProcessor)
		}
	}else{
		if(path_tmplt.endsWith("/")) {
			path_to_template = TEMPLATE_DIR+path_tmplt+"index.html";
			path_tmplt+="index.html";
		}else{
			path_to_template = TEMPLATE_DIR+path_tmplt+".html";
		}
		if (fileExists.sync(path_to_template)) {
			//console.log("Compilando /templates/"+path_tmplt+" to response;");
			return swig.renderFile(path_to_template, ContextProcessor);
		}
	}
	console.log("Template Not Found!! -> ",path_to_template);
	return swig.renderFile(TEMPLATE_DIR+"handlers/404.html");
}

//console.log("Path "+STATIC_URL+" points to -> ",STATIC_ROOT);
app.use(STATIC_URL,express.static(STATIC_ROOT,{
	index: false
}));

app.get("/favicon\.ico", function (req, res) {
	res.redirect(STATIC_URL+"icon.png");
	return;
});

app.get("/robots\.txt", function (req, res) {
	res.send('');
	return;
});
app.get("*", function (req, res) {
	if(!req.path.startsWith("/static/")){
		if (req.path.startsWith("/app/")) {
			res.send(renderTemplate(req.path.replace("/app/","")));
			return;
		}else if(req.path.startsWith("/templates/")){
			res.send(renderTemplate(req.path.replace("/templates/","")));
			return;
		}else{
			res.send(renderTemplate(req.path.replace("/","")));
			return;
		}
	}else{
		res.status(404).send(renderTemplate("handlers/404.html"));
	}
});

app.listen(APP_PORT);
console.log("HTTP Server running => "+
			`http://localhost:${APP_PORT}/`);