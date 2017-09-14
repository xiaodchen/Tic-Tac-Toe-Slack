'use strict'

const slack = require('slack')
const config = require('./config')

var teamUsersList = {};
function fetchTeamUserList(){
    slack.users.list({
        token: config('SLACK_API_TOKEN')
    }, function (err, data) {
        for(var i = 0; i < data.members.length; i++){
            teamUsersList[data.members[i].name] = data.members[i].id;
        }
    });
}

function checkSlackAPIauth(){
    if (config('SLACK_API_TOKEN')) {
        slack.auth.test({
            token: config('SLACK_API_TOKEN')
        }, function(err, data){
            fetchTeamUserList();
        });
    }
}

function isUserExist(channelId, opponent){
    var isUserFound = true;

    if (teamUsersList != null) {
        if (teamUsersList[opponent] != null) {
                slack.channels.info({
                    token: config('SLACK_API_TOKEN'),
                    channel: channelId
                }, function (err, data) {
                    var indexVal = data.channel.members.indexOf(teamUsersList[opponent]);
                    if(indexVal >= 0){
                        isUserFound = true;
                    }
                    else{
                        isUserFound = false;
                    }
                });

        }
        else {
            isUserFound = false;
        }
    }
    else {
        isUserFound = true;
    }

    return isUserFound;
}

module.exports.isUserExist = isUserExist;
module.exports.checkSlackAPIauth = checkSlackAPIauth;
