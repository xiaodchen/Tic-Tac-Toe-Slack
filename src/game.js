'use strict'

const StatusEnum = {
	GAME_ONGOING: 1,
	PLAYER1_WIN: 2,
	PLAYER2_WIN: 3,
	GAME_TIE: 4
};

const PlayerEnum = {
	X: 1,
	O: -1,
	EMPTY: 0
};

const cellSymbols = {
	X: ' X ',
	O: ' O ',
	EMPTY: '   '
};

function game(username1, username2, size){
	this.username1 = username1;
	this.username2 = username2;
	this.currentUser = username1;
	this.boardSize = size;

	var board = new Array(this.boardSize);
	for(var i = 0; i < this.boardSize; i++)
	{
		board[i] = new Array(this.boardSize);

		for(var j = 0; j < this.boardSize; j++)
		{
			board[i][j] = PlayerEnum.EMPTY;
		}
	}
	this.board = board;
	this.status = StatusEnum.GAME_ONGOING;
	this.cellFilledCount = 0;
	this.totalCellsCount = this.boardSize * this.boardSize;
	this.completed = false;
	return this;
}

function drawCurrentBoard(currentGame){
	var boardDrawn = '```';
	var board = currentGame.board;
	for(var i = 0; i < board.length; i++)
	{
		boardDrawn += '\n';
		for(var j = 0; j < board[i].length; j++)
		{
			boardDrawn += '|';

			switch(board[i][j])
			{
				case PlayerEnum.EMPTY:
					boardDrawn += cellSymbols.EMPTY;
					break;
				case PlayerEnum.X:
					boardDrawn += cellSymbols.X;
					break;
				case PlayerEnum.O:
					boardDrawn += cellSymbols.O;
					break;
			}
		}
		boardDrawn += '|';
	}
	boardDrawn += '```';
	return boardDrawn;
}

function getCurrentStatus(currentGame) {
	var statusString = '';
	switch(currentGame.status){
		case StatusEnum.PLAYER1_WIN:
			currentGame.completed = true;
			statusString = '\n:sparkles: This game has been won by ' + currentGame.username1;
			break;
		case StatusEnum.PLAYER2_WIN:
			currentGame.completed = true;
			statusString =  '\n:sparkles: This game has been won by ' + currentGame.username2;
			break;
		case StatusEnum.GAME_TIE:
			currentGame.completed = true;
			statusString =  '\n:angel: This game is tied';
			break;
		case StatusEnum.GAME_ONGOING:
		default:
			break;
	}

	if(currentGame.completed){
		return statusString + ' ' + drawCurrentBoard(currentGame);
	}
	else {
		return 'Current Player: <@' + currentGame.currentUser + '> ' + (currentGame.currentUser == currentGame.username1 ? '(X)' : '(O)') + '. The game is between ' + currentGame.username1 + ' (X) and ' + currentGame.username2 + ' (O) ' + drawCurrentBoard(currentGame);
	}
}

function move(payload, currentGame, rowIn, columnIn){
	var row = rowIn - 1;
	var col = columnIn - 1;

	if (currentGame.status == StatusEnum.GAME_ONGOING) {
		if(row < 0 || row >= currentGame.boardSize || col < 0 || col >= currentGame.boardSize)
		{
			return ':exclamation: Row and column must be within the board size ' + drawCurrentBoard(currentGame);
		}
		else if (currentGame.board[row][col] != PlayerEnum.EMPTY) {
			return ':exclamation: Please move to the empty board space ' + drawCurrentBoard(currentGame);
		}
		else {
			if(currentGame.currentUser == payload.user_name){
				currentGame.cellFilledCount++;
				if(currentGame.currentUser == currentGame.username1){
					currentGame.board[row][col] = PlayerEnum.X;
					currentGame.currentUser = currentGame.username2;
				}
				else {
					currentGame.board[row][col] = PlayerEnum.O;
					currentGame.currentUser = currentGame.username1;
				}

				gameCheck(currentGame);
				return getCurrentStatus(currentGame);
			}
			else {
				if(currentGame.username1 == payload.user_name ||
					currentGame.username2 == payload.user_name){
						return ':exclamation: Current player is ' + currentGame.currentUser + '. Please wait for your turn.' +
							drawCurrentBoard(currentGame);
				}
				else {
					return ':exclamation: Please wait for the current game to complete or try another channel.';
				}
			}
		}
	}
	else {
		return ':exclamation: No active game in this channel. You can start one.\n';
	}
}

function gameCheck(currentGame){
	if(currentGame.status != StatusEnum.GAME_ONGOING) {
		return;
	}

	var board = currentGame.board;
	var diagTotal = 0;
	var upDiagTotal = 0;
	/* Check horizontally and vertically */
	for (let i = 0 ; i < currentGame.boardSize ; ++i)
	{
		let rowTotal = 0;
		let colTotal = 0;
		for (let j = 0 ; j < currentGame.boardSize ; ++j) {
			rowTotal += board[i][j];
			colTotal += board[j][i];
		}

		if (rowTotal == currentGame.boardSize || colTotal == currentGame.boardSize) {
			currentGame.status = StatusEnum.PLAYER1_WIN;
			return;
		}
		else if (rowTotal == (-1) * currentGame.boardSize || colTotal == (-1) * currentGame.boardSize) {
			currentGame.status = StatusEnum.PLAYER2_WIN;
			return;
		}

		diagTotal += board[i][i];
		upDiagTotal += board[i][currentGame.boardSize - 1 - i];
	}

	/* Check for diagonals */
	if (diagTotal == currentGame.boardSize || upDiagTotal == currentGame.boardSize) {
		currentGame.status = StatusEnum.PLAYER1_WIN;
		return;
	}
	else if (diagTotal == (-1) * currentGame.boardSize || upDiagTotal == (-1) * currentGame.boardSize) {
		currentGame.status = StatusEnum.PLAYER2_WIN;
		return;
	}

	if(currentGame.totalCellsCount == currentGame.cellFilledCount){
		currentGame.status = StatusEnum.GAME_TIE;
	}
}

module.exports.game = game;
module.exports.move = move;
module.exports.getCurrentStatus = getCurrentStatus;
