/**
 * Created by Dieter Beelaert on 22/04/2014.
 */

/*--- Server setup ---*/
var express = require('express');
var server = express();
var request = require('request');
server.use('/wwwroot',express.static(__dirname + '/wwwroot'));
server.listen(80);


server.get('/',function(req,res){
   res.render('../wwwroot/Views/index.ejs');
});

/*--- proxy the request for the JSON string (chrome security issues ...) ---*/
server.get('/getList',function(req,res){
    var options = {"url": 'http://bayareabikeshare.com/stations/json/'};
     request.get(options,function(err,response,body){
     }).pipe(res);
})



