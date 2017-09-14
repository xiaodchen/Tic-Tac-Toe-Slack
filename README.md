# tictactoe at slack channel

```shell
X|O|X
O|X|O
X|O|X
```

### Supported `/ttt` commands to play tictactoe at slack channel

- `/ttt` or `/ttt help` - Help
- `/ttt start [opponent username] [board size]` - Challenge a user to a new game
- `/ttt status` - Get the status of the current game
- `/ttt move [row] [column]` - Play the move
- `/ttt end` - End the current game

### Install

```shell
$ npm install
```

### Configure

```shell
NODE_ENV=development
PORT=3000
```
### Run

```shell
$ npm start

tictactoe LIVES on PORT 3000
```

Visit [localhost:3000](http://localhost:3000).

