var express = require('express'), 
	bodyParser = require('body-parser'),
    app = express(),
	router = express.Router();
	
	
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.use('/anyUpdateServerRoute', router);

var apkUpdater = require ('./lib/updater');
apkUpdater.enable(app, '/anyUpdateServerRoute', 'myAPK');

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
