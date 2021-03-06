'use strict';

var PlayerModel = require('./player');
var observableProps = require('./../game/observable-properties');

function RoomModel(options) {
  this.factory = options.factory;
  this.actions = options.actions;
  this.emitterQueue = options.emitterQueue;
  this.notifications = options.notifications;

  observableProps.defineProperties(this, {
    game: null,
    users: [],
    clientUsers: [],

    turn: this.getTurn,
    myTurn: this.isMyTurn,
    players: this.getPlayers,
    currentPlayer: this.getCurrentPlayer,
    thisPlayer: this.getThisPlayer,
    thisPlayerOrEmpty: this.getThisPlayerOrEmpty,
    otherPlayers: this.getOtherPlayers,
    otherPlayersOrdered: this.getOtherPlayersOrdered
  });
}

RoomModel.prototype.getTurn = function() {
  return (this.game && this.game.turn) || 0;
};

RoomModel.prototype.isMyTurn = function() {
  var game = this.game || {};
  var currentPlayer = game.currentPlayer || {};
  var thisPlayerId = this.thisPlayer && this.thisPlayer.id;

  return currentPlayer.id === thisPlayerId;
};

RoomModel.prototype.getPlayers = function() {
  var users = this.users;
  var game = this.game;

  if (game) {
    return game.players.map(player => {
      var user = users.find(_user => _user.id === player.id);

      user = user || {
        id: player.id,
        username: '',
        name: '',
        avatarUrl: ''
      };

      return new PlayerModel(user, player);
    });
  } else {
    return users.map(user => {
      var ply = this.factory.createPlayer({
        id: user.id
      });
      return new PlayerModel(user, ply);
    });
  }
};

RoomModel.prototype.getCurrentPlayer = function() {
  var game = this.game || {};
  var currentPlayer = game.currentPlayer || {};
  var currentPlayerId = currentPlayer.id || null;

  if (currentPlayerId) {
    return this.players.find(player => player.id === currentPlayerId);
  } else {
    return null;
  }
};

RoomModel.prototype.getThisPlayer = function() {
  if (!this.clientUsers.length) {
    return;
  }

  var userId;

  if (this.clientUsers.length === 1) {
    userId = this.clientUsers[0];
    return this.players.find(player => player.id === userId);
  }

  var game = this.game || {};
  var currentPlayer = game.currentPlayer || {};
  var currentPlayerId = currentPlayer.id || null;

  if (!currentPlayerId) {
    return;
  }

  userId = this.clientUsers.find(id => id === currentPlayerId);

  if (!userId) {
    return;
  }

  return this.players.find(player => player.id === userId);
};

RoomModel.prototype.getThisPlayerOrEmpty = function() {
  var player = this.getThisPlayer();

  if (!player) {
    var user = {
      id: '',
      username: '',
      name: '',
      avatarUrl: ''
    };
    var ply = this.factory.createPlayer({
      id: user.id
    });
    player = new PlayerModel(user, ply);
  }

  return player;
};

RoomModel.prototype.getOtherPlayers = function() {
  var thisPlayerId = this.thisPlayer && this.thisPlayer.id;

  return this.players.filter(function(player) {
    return player.id !== thisPlayerId;
  });
};

RoomModel.prototype.getOtherPlayersOrdered = function() {
  var thisPlayerId = this.thisPlayer && this.thisPlayer.id;
  var thisPlayer = false;
  var players1 = [];
  var players2 = [];

  this.players.forEach(function(player) {
    if (player.id === thisPlayerId) {
      thisPlayer = true;
    } else {
      if (thisPlayer) {
        players1.push(player);
      } else {
        players2.push(player);
      }
    }
  });

  return players1.concat(players2);
};

module.exports = RoomModel;
