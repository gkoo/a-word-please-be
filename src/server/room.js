const uuid = require('uuid');

const AWPGame = require('./a-word-please/awp-game.js');
const WerewolfGame = require('./werewolf/werewolfGame.js');
const User = require('./user.js');

const GAME_A_WORD_PLEASE = 1;
const GAME_WEREWOLF = 2;

const VALID_GAMES = [
  GAME_A_WORD_PLEASE,
  GAME_WEREWOLF,
];

function Room({ io, roomCode }) {
  this.broadcastToRoom = (eventName, data) => io.to(roomCode).emit(eventName, data);
  this.io = io;
  this.roomCode = roomCode;
  this.selectedGame = null;
  this.users = {};
}

Room.prototype = {
  getUserById: function(id) { return this.users[id]; },

  addUser: function(id) {
    const user = new User({ id });
    this.users[id] = user;
    if (this.getUsers().length === 1) {
      this.promoteRandomLeader();
    }
  },

  onUserDisconnect: function(id) {
    const user = this.users[id];
    const { name } = user;

    console.log(`${id} disconnected`);
    delete this.users[id];
    if (user.isLeader) {
      this.promoteRandomLeader();
    }
    if (this.game) {
      this.game.removePlayer(id);
      const connectedPlayer = Object.values(this.game.players).find(player => player.connected);
      if (!connectedPlayer) { this.game = null; }
    }
    this.broadcastToRoom('userDisconnect', id);

    if (!name) { return; }
  },

  promoteRandomLeader: function() {
    const users = this.getUsers();

    if (users.length === 0) { return; }

    const newLeader = users[0];
    newLeader.promoteToLeader();
    for (let i = 1; i < users.length; ++i) {
      users[i].unpromoteFromLeader();
    }
    this.broadcastToRoom('newLeader', newLeader.id);
  },

  getLeader: function() { return Object.values(this.users).find(user => user.isLeader); },

  setUserName: function(socket, id, name) {
    const user = this.users[id];
    user.setName(name);
    this.broadcastToRoom('newUser', user.serialize());

    if (!this.game) { return; }
    this.game.addPlayer(user);
    this.broadcastToRoom('gameData', this.game.serialize());
  },

  // returns an array of users
  getUsers: function() { return Object.values(this.users); },

  chooseGame: function(gameId) {
    if (!VALID_GAMES.includes(gameId)) { return; }
    this.selectedGame = gameId;
    this.broadcastToRoom('roomData', this.getRoomData());
  },

  startGame: function() {
    const {
      broadcastToRoom,
      io,
    } = this;
    if (!this.selectedGame) { return; }

    if (this.game) {
      this.game.newGame();
      return;
    }

    switch (this.selectedGame) {
      case GAME_A_WORD_PLEASE:
        this.game = new AWPGame(this.io, this.roomCode);
        break;
      case GAME_WEREWOLF:
        this.game = new WerewolfGame(this.io, this.roomCode);
        break;
      default:
        throw 'Unrecognized game type chosen';
    }
    this.game.setup(this.users);
  },

  nextTurn: function(userId) {
    console.log('starting next round');
    if (!this.game) { return false; }
    this.game.nextTurn();
  },

  handlePlayerAction: function(socket, data) {
    if (!this.game) { return; }
    this.game.handlePlayerAction(socket.id, data);
  },

  endGame: function(gameInitiatorId) {
    if (!this.game) { return; }
    this.game.endGame();
  },

  setPending: function() { return this.game && this.game.setPending(); },

  revealClues: function() {
    if (!this.game) { return; }
    this.game.revealCluesToGuesser();
  },

  getRoomData: function(socketId) {
    const users = {};
    const { roomCode, selectedGame } = this;
    Object.values(this.users).forEach(user => {
      users[user.id] = user.serialize();
    });
    return {
      currUserId: socketId,
      roomCode,
      selectedGame,
      users,
    };
  },

  sendRoomData: function(socket) {
    const roomData = this.getRoomData(socket.id);
    this.io.to(socket.id).emit('roomData', roomData)

    let gameData = this.game ? this.game.serialize() : { state: AWPGame.STATE_PENDING };
    this.io.to(socket.id).emit('gameData', gameData)
  },

  sendGameState: function(socketId) {
    let debugData = this.game ? this.game.serialize() : this.getRoomData(socketId);

    this.io.to(socketId).emit('debugInfo', debugData)
  },
}

module.exports = Room;
