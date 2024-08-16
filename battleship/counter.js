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
    // Place ships for both players
    this.setupBoards();

    // Begin the game loop
    while (!this.isGameOver()) {
      this.takeTurn();
      this.switchPlayer();
    }

    console.log(`${this.getWinner().name} wins!`);
  }

  setupBoards() {
    // Setup player 1
    this.player1.gameboard.placeShip(new Ship(3), 1, 1, "horizontal");
    this.player1.gameboard.placeShip(new Ship(2), 4, 4, "vertical");

    // Setup player 2 (Computer)
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

const game = new Game();
game.startGame();
