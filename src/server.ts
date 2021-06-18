import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { Card, Decktet } from './public/javascript/model/decktet.js';
import { BoardSpace } from './public/javascript/model/gameboard.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// middleware
app.use(express.static(path.join(__dirname, 'public')));

// routes

app.get('/', (req, res) => {
  res.sendFile('/public/game.html', { root: __dirname });
});

// socket.io

type roomDataObject = {
  roomName: string;
  layoutSpaces: string[] | undefined;
  layoutCards: Card[];
  p1Connected: boolean;
  p1ready: boolean;
  p2Connected: boolean;
  p2ready: boolean;
  cardDeck: Decktet | undefined;
};

const roomsGameData = [] as roomDataObject[];

io.on('connection', (socket) => {
  console.log('a user connected');

  let currRoomNo = 0;
  let foundRoom = false;
  let room = io.sockets.adapter.rooms.get(`room-${currRoomNo}`);

  while (!foundRoom) {
    room = io.sockets.adapter.rooms.get(`room-${currRoomNo}`);
    // go to next room if current room is full.
    if (room && room.size === 2) {
      currRoomNo++;
      // if room already has 1 player: check if the game already started.
      // if so, go to next room. otherwise join as player 2.
    } else if (
      room &&
      room.size === 1 &&
      roomsGameData[currRoomNo] &&
      roomsGameData[currRoomNo].p2ready == true
    ) {
      currRoomNo++;
    } else {
      // otherwise, the room is empty, or only has 1 player & has not been started.
      // we can join the room.
      foundRoom = true;
    }
  }

  console.log(`join room-${currRoomNo}`);
  socket.join(`room-${currRoomNo}`);
  room = io.sockets.adapter.rooms.get(`room-${currRoomNo}`);

  let playerID: 'Player1' | 'Player2';

  const deck = new Decktet('basicDeck');

  socket.on('getPlayerID', () => {
    console.log(roomsGameData[currRoomNo]);
    console.log('room variable: ', room);
    console.log('socket.rooms', socket.rooms);
    if (!roomsGameData[currRoomNo] || (room && room.size === 1)) {
      playerID = 'Player1';
      // if the game data obj doesn't exist create it. Or overwrite the existing
      // object if we are the first player in the game room.
      roomsGameData[currRoomNo] = {
        roomName: `room-${currRoomNo}`,
        layoutSpaces: undefined,
        layoutCards: [],
        p1Connected: true,
        p1ready: false,
        p2Connected: false,
        p2ready: false,
        cardDeck: deck
      };
    } else {
      playerID = 'Player2';
      roomsGameData[currRoomNo].p2Connected = true;
    }
    socket.emit('recievePlayerID', playerID);
  });

  // draw cards for the starting layout. they will be sent later once the
  // playerReady command is recieved from both players
  socket.on('createStartingLayout', (layoutArr) => {
    console.log('getStartingLayout called');
    // if this is the first player initiated call to this method,
    // draw the cards for the layout. Otherwise ignore it.
    if (!roomsGameData[currRoomNo].layoutSpaces) {
      console.log('drawing cards & generating layout');
      roomsGameData[currRoomNo].layoutSpaces = layoutArr;
      layoutArr.forEach((spaceID: BoardSpace) => {
        const card = roomsGameData[currRoomNo].cardDeck?.drawCard();
        if (!card) return;
        roomsGameData[currRoomNo].layoutCards?.push(card);
      });
    }
  });

  const drawCardCB = (playerID: 'Player1' | 'Player2') => {
    console.log('drawCard called');
    const card = roomsGameData[currRoomNo].cardDeck?.drawCard();
    if (!card) return;
    io.to(`room-${currRoomNo}`).emit('recieveCardDraw', card.getId(), playerID);
  };

  // respond to player request to draw a card
  socket.on('drawCard', drawCardCB);

  socket.on('playerReady', (currPlyrID: 'Player1' | 'Player2') => {
    // Send players the current room number to display in the UI
    io.to(`room-${currRoomNo}`).emit('connectToRoom', currRoomNo);
    if (currPlyrID === 'Player1') {
      roomsGameData[currRoomNo].p1ready = true;
    } else {
      roomsGameData[currRoomNo].p2ready = true;
    }
    // if both players are ready, start the game!
    if (
      roomsGameData[currRoomNo].p1ready &&
      roomsGameData[currRoomNo].p2ready
    ) {
      // send initial layout
      roomsGameData[currRoomNo].layoutSpaces?.forEach(
        (spaceID: string, idx) => {
          if (roomsGameData[currRoomNo].layoutCards.length === 0) return;
          const card = roomsGameData[currRoomNo].layoutCards[idx];
          if (!card) return;
          io.to(`room-${currRoomNo}`).emit(
            'recieveLayoutCard',
            card.getId(),
            spaceID
          );
        }
      );
      // draw 3 cards for each player
      [0, 0, 0].forEach((ele) => drawCardCB('Player1'));
      io.to(`room-${currRoomNo}`).emit('enableP1CardDragging');
      [0, 0, 0].forEach((ele) => drawCardCB('Player2'));
    }
  });

  socket.on('sendPlayerMove', (playerID, cardID, SpaceID, TokenSpaceID) => {
    console.log('socket emit sendPlayerMove method recieved by server');
    console.log(playerID, cardID, SpaceID, TokenSpaceID);
    socket
      .to(`room-${currRoomNo}`)
      .emit('recievePlayerMove', playerID, cardID, SpaceID, TokenSpaceID);
  });

  socket.on('disconnect', () => {
    console.log(`${playerID} disconnected`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));