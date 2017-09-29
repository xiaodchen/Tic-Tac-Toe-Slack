'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const config = require('./config');
const controller = require('./controller');
const slackapi = require('./tttslackapi');

var app = express();

slackapi.checkSlackAPIauth();

var globalTicTacToeObject = {};
globalTicTacToeObject.gameList = {};

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => { res.send('\n teststestst \n') })

app.post('/commands/tictactoe', (req, res) => {
  var payload = req.body
  console.log(payload)

  if (!payload || payload.token !== config('TICTACTOE_COMMAND_TOKEN')) {
    res.status(401).end('Warning: the Slack slash token is wrong')
    return
  }

  var msg = '';
  if (payload.text.toLowerCase().includes('start')) {
    msg = controller.start(globalTicTacToeObject, payload);
  }
  else if (payload.text.toLowerCase() == 'end') {
    msg = controller.end(globalTicTacToeObject, payload);
  }
  else if (payload.text.toLowerCase().includes('move')) {
    msg = controller.move(globalTicTacToeObject, payload);
  }
  else if (payload.text.toLowerCase() == 'status') {
    msg = controller.status(globalTicTacToeObject, payload);
  }
  else {
    msg = controller.help(payload);
  }
  res.set('content-type', 'application/json');
  res.status(200).json(msg);
  return;
})

app.listen(config('PORT'), (err) => {
  if (err) throw err

  console.log('jinniniinin')
  //console.log(`tictactoe LIVES on PORT ${config('PORT')}`)
})
