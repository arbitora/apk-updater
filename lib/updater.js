'use strict';

var uuid = require('node-uuid'),
    winston = require('winston'),
    reader = require('./apkReader');
	
var WAIT_MULTIPLIER = 15;
var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;

var androidUpdate = {}
  , expressApp
  , routePfx
  , links = [];
  
  winston.add(winston.transports.File, {filename: 'upgrade_requests.log'});

androidUpdate.updater = function (req, res){
	
  var name = req.body.pkgname,
     version = req.body.version,
	 forced = req.body.forced,
     last = reader.last(name),
     key;

	winston.info("client asking for app: " + name);
	winston.info("client current version is: " + version);
	 
  if(last && last.version > version){
    key = name + "-" + version;
	
  	if(!links[key]){
  		links[key] = { 
  			url: routePfx + '/' + uuid.v4() + '.apk',
  			timeoutId: setTimeout(function() {

				removeRoute(expressApp, links[key].url);

  				links[key] = null;
  			}, WAIT_MULTIPLIER * SECOND)
  		};
  		expressApp.get(links[key].url, function(req, res){
			winston.info("client downloading file: " + last.filepath);
  			res.download(last.filepath);
  		});

  	}
	
    winston.info("Update for " + name + " available, version " + version + "\n" + links[key].url + "\nNew version: " + last.version + " and force update: " + forced);
    res.send("Update found\n" + links[key].url + "\n" + last.version + "\n" + forced);
	
  } else {
	  
	winston.info("No update for " + name + " - Version: " + version + " / Latest version: " + last.version );
	winston.debug("No update for " + name + " - Version: " + version + " / Latest version: " + last.version );
	//res.send("No update for " + name + " - " + version + " / Last : " + last );
  	res.sendStatus(200);
  }
};


/**
 * Enable auto apk updater for provided Express application and route.
 * @param {@Object} app parent Express application
 * @param {@String} route route prefix for current updater
 * @param {@String} repoDir path for apk directory
 */
function enable(app, route, repoDir){

	expressApp = app;
	routePfx = route;
	if(repoDir){
		reader.setRepoDir(repoDir);
	}
	app.post(route, androidUpdate.updater);

	app.get(route, function (req, res){
		res.send(reader.available());
	});
};

/**
 *	Route removal functions.
 * 
 *
*/

var util=require('util');
var _=require('underscore');

function _findRoute(path,stack) {
    var count=0;
    var routes=[];
	
    stack.forEach(function(layer) {
		if (!layer) return;
		// Path is found under route['path']
		if (layer && layer.route != undefined){
			if (layer.route['path'] === path){
				routes.push({route: layer || null, stack: stack});
				return;
			}
		}
    });
	
    return routes;
}

function findRoute(app, path) {
    var  stack;
    stack = app._router.stack;
	
    return (_findRoute(path, stack));
}

function removeRoute(app, path, method) {
    var found, route, stack, idx;
	//console.log(app._router.stack);
    found = findRoute(app, path);

    found.forEach(function(layer) {
        route = layer.route;
        stack = layer.stack;
        if (route) {
            idx = stack.indexOf(route);
            stack.splice(idx, 1);
        }
    });
	//console.log(app._router.stack);
    return true;
};


/**
 * Module exports.
 */
module.exports = {
   'enable': enable
};
