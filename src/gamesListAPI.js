var express = require('express');
var cors = require('cors')
var app = express();
var port = 23456;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port);
console.log('Server started! At http://localhost:' + port);

let gamesList = [{gName: 'small game', numplayers: 1, gameID: 1},{gName: 'big game', numplayers: 7, gameID: 2}]
let gameNum = 3

//send list
app.post('/api/gamesList',  cors(), function(req, res) {
  console.log('client!')
  res.send(gamesList)
})

//put create game obj with uniq id, then put it in list, then send back the id
app.post('/api/createGame',  cors(), function(req, res) {
  console.log('createGame! ' + req.body.gameName)
  //res.send(gamesList)
})

//on gamestart, delete it from gamelist
//send back ok
app.post('/api/startGame',  cors(), function(req, res) {
  //console.log('createGame! ' + req.body.gameName)
  //res.send(gamesList)
})
