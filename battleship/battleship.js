class Ship {
  constructor(length){
    this.length = length;
    this.hits = 0;
  }

  hit(){
    this.hits++;
  }

  isSunk(){
    return this.hits >= this.length;
  }
}

class Gameboard {
  constructor(size = 10) {
    this.size = size;
    this.board = Array(size).fill(null).map(() => Array(size).fill(null));
    this.ships = [];
    this.missedAttacks = [];
  }

  placeShip(ship, x, y, direction) {
    if (direction === 'horizontal') {
      for (let i = 0; i < ship.length; i++) {
        this.board[y][x + i] = ship;
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < ship.length; i++) {
        this.board[y + i][x] = ship;
      }
    }
    this.ships.push(ship);
  }

  receiveAttack(x, y) {
    const target = this.board[y][x];
    if (target) {
      target.hit();
      this.board[y][x] = 'hit';
      return true;
    } else {
      this.missedAttacks.push([x, y]);
      this.board[y][x] = 'miss';
      return false;
    }
  }

  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }
}

class Player {
  constructor(name, isComputer = false) {
    this.name = name;
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
  }

  makeMove(opponentGameboard, x, y) {
    if (this.isComputer) {
      let move;
      do {
        move = this.getRandomMove();
      } while (!opponentGameboard.receiveAttack(...move));
    } else {
      opponentGameboard.receiveAttack(x, y);
    }
  }

  getRandomMove() {
    return [
      Math.floor(Math.random() * this.gameboard.size),
      Math.floor(Math.random() * this.gameboard.size)
    ];
  }
}

class Game {
  constructor() {
    this.player1 = new Player("Player 1");
    this.player2 = new Player("Computer", true);
    this.currentPlayer = this.player1;
  }

  startGame() {

    this.setupBoards();

    while (!this.isGameOver()) {
      this.takeTurn();
      this.switchPlayer();
    }

    console.log(`${this.getWinner().name} wins!`);
  }

  setupBoards() {

    this.player1.gameboard.placeShip(new Ship(3), 1, 1, "horizontal");
    this.player1.gameboard.placeShip(new Ship(2), 4, 4, "vertical");


    this.player2.gameboard.placeShip(new Ship(3), 0, 0, "horizontal");
    this.player2.gameboard.placeShip(new Ship(2), 3, 3, "vertical");
  }

  takeTurn() {
    const x = prompt(`${this.currentPlayer.name}, enter x coordinate:`);
    const y = prompt(`${this.currentPlayer.name}, enter y coordinate:`);
    this.currentPlayer.makeMove(
      this.getOpponent().gameboard,
      parseInt(x),
      parseInt(y)
    );
  }

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }

  getOpponent() {
    return this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }

  isGameOver() {
    return (
      this.player1.gameboard.allShipsSunk() ||
      this.player2.gameboard.allShipsSunk()
    );
  }

  getWinner() {
    return this.player1.gameboard.allShipsSunk() ? this.player2 : this.player1;
  }
}

class UI {
  constructor(playerBoardElement, computerBoardElement) {
    this.playerBoardElement = playerBoardElement;
    this.computerBoardElement = computerBoardElement;
  }

  renderBoard(gameboard, boardElement, isPlayer = false) {
    boardElement.innerHTML = ''; // Clear the board
    for (let y = 0; y < gameboard.size; y++) {
      for (let x = 0; x < gameboard.size; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (gameboard.board[y][x] === 'hit') {
          cell.classList.add('hit');
        } else if (gameboard.board[y][x] === 'miss') {
          cell.classList.add('miss');
        } else if (isPlayer && gameboard.board[y][x] instanceof Ship) {
          cell.classList.add('ship');
        }

        boardElement.appendChild(cell);
      }
    }
  }

  attachEventListeners(game, computerBoardElement) {
    computerBoardElement.addEventListener('click', (e) => {
      const x = e.target.dataset.x;
      const y = e.target.dataset.y;

      if (x !== undefined && y !== undefined) {
        game.currentPlayer.makeMove(game.getOpponent().gameboard, parseInt(x), parseInt(y));
        this.renderBoard(game.player1.gameboard, this.playerBoardElement, true);
        this.renderBoard(game.player2.gameboard, this.computerBoardElement);
        
        if (game.isGameOver()) {
          alert(`${game.getWinner().name} wins!`);
          computerBoardElement.removeEventListener('click', arguments.callee);
        } else {
          game.switchPlayer();
        }
      }
    });
  }
}

const game = new Game();
game.setupBoards();

const playerBoardElement = document.getElementById('player-board');
const computerBoardElement = document.getElementById('computer-board');
const ui = new UI(playerBoardElement, computerBoardElement);

ui.renderBoard(game.player1.gameboard, playerBoardElement, true);

ui.renderBoard(game.player2.gameboard, computerBoardElement);

ui.attachEventListeners(game, computerBoardElement);


game.startGame();
