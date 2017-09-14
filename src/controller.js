'use strict'

const _ = require('lodash');
const config = require('./config');
const game = require('./game');

const slack = require('./tttslackapi');

const msgDefaults = {
  response_type: 'in_channel',
  username: 'TicTacToebot'
};

const attachmentDefaults = {
    title: 'TicTacToe',
    color: '#2FA44F',
    mrkdwn_in: ['text']
};

function help(payload) {
    var attachment = _.defaults({
        text: '`/ttt start [userName] [boardSize]` - Challenge a user to a new game, default is 3X3\n' +
              '`/ttt status` - Get the status of the current game\n' +
              '`/ttt move [row] [column]` - Play the move (the row and column index starting with 1)\n' +
              '`/ttt end` - End the current game\n' +
              '`/ttt help` - Help'
    }, attachmentDefaults);
    return _.defaults({
      channel: payload.channel_name,
      attachments: [attachment]
    }, msgDefaults);
}

function start(globalTicTacToeObject, payload) {
    var gameList = globalTicTacToeObject.gameList;
    var tokens = payload.text.split(" ");

    var attachment = _.defaults({}, attachmentDefaults);
    if (payload.channel_id in gameList && !gameList[payload.channel_id].completed)
    {
        var currentGame = gameList[payload.channel_id];
        attachment.text = ':exclamation: ' + payload.channel_name + ' channel already has an active game' +
          ' between ' + currentGame.username1 + ' and ' + currentGame.username2 +
          '\n A channel can only have one game being played.';
    }
    else if(tokens.length < 2)
    {
        attachment.text = ':exclamation: Please include the username of your opponent';
    }
    else
    {
        var opponent = tokens[1];
        if (opponent.startsWith('@')) {
            opponent = opponent.substring(1);
        }

        if(!slack.isUserExist(payload.channel_id, opponent)) {
            attachment.text = ':exclamation:' + payload.channel_name + ' channel does not include that user.';
        }
        else if (payload.user_name == opponent) {
            attachment.text = ':exclamation:' + ' Please choose a user in this channel other than yourself.';
        }
        else {
            var boardSize = 3;
            if (tokens.length > 2 && !isNaN(tokens[2])) {
                boardSize = parseInt(tokens[2]);
            }
            gameList[payload.channel_id] = new game.game(payload.user_name, opponent, boardSize);
            var currentGame = gameList[payload.channel_id];
            attachment.text = game.getCurrentStatus(currentGame);
        }
    }

    return _.defaults({
      channel: payload.channel_name,
      attachments: [attachment]
    }, msgDefaults);
}

function status(globalTicTacToeObject, payload) {
    var gameList = globalTicTacToeObject.gameList;
    var attachment = _.defaults({}, attachmentDefaults);
    if (payload.channel_id in gameList)
    {
        var currentGame = gameList[payload.channel_id];
        attachment.text = game.getCurrentStatus(currentGame);
    }
    else
    {
        attachment.text = ':game_die: No active game in this channel. You can start one!';
    }

    return _.defaults({
      channel: payload.channel_name,
      attachments: [attachment]
    }, msgDefaults);
}

function end(globalTicTacToeObject, payload) {
    var gameList = globalTicTacToeObject.gameList;
    var attachment = _.defaults({}, attachmentDefaults);
    if (payload.channel_id in gameList) {
        var currentGame = gameList[payload.channel_id];
        attachment.text = ':black_square_for_stop: End the current game between ' + currentGame.username1 + ' and ' + currentGame.username2;

        delete gameList[payload.channel_id];
    }
    else {
        attachment.text = ':exclamation: No active game to end in this channel';
    }

    return _.defaults({
      channel: payload.channel_name,
      attachments: [attachment]
    }, msgDefaults);
}

function move(globalTicTacToeObject, payload) {
    var gameList = globalTicTacToeObject.gameList;
    var tokens = payload.text.split(" ");

    var attachment = _.defaults({}, attachmentDefaults);
    if (payload.channel_id in gameList)
    {
        if(tokens.length < 3 || isNaN(tokens[1]) || isNaN(tokens[2])){
            attachment.text = ':exclamation: Please enter a row and column';
        }
        else
        {
            var currentGame = gameList[payload.channel_id];
            var row = parseInt(tokens[1]);
            var column = parseInt(tokens[2]);
            attachment.text = game.move(payload, currentGame, row, column);
        }
    }
    else
    {
        attachment.text = ':exclamation: No active game in this channel';
    }

    return _.defaults({
      channel: payload.channel_name,
      attachments: [attachment]
    }, msgDefaults);
}

module.exports.end = end;
module.exports.help = help;
module.exports.move = move;
module.exports.start = start;
module.exports.status = status;
