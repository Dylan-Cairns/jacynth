import { GameBoard } from './gameboard.js';
import { Card, Decktet, DeckType } from './decktet.js';
import {
  PlayerID,
  Player_MultiPlayer,
  Player_SinglePlayer,
  Player_ComputerPlayer,
  SendCardPlaytoViewCB,
  SendTokenPlayToViewCB,
  AIDifficulty
} from './player.js';
import { io, Socket } from 'socket.io-client';
import { auth } from 'express-openid-connect';
import { stringify } from 'querystring';

export type GameType = 'multiPlayer' | 'singlePlayer' | 'solitaire';
export type Layout = 'razeway' | 'towers' | 'oldcity' | 'solitaire';
export const BOARD_LAYOUTS = {
  razeway: ['x0y0', 'x1y1', 'x2y2', 'x3y3', 'x4y4', 'x5y5'],
  towers: ['x1y1', 'x4y1', 'x1y4', 'x4y4'],
  oldcity: ['x2y0', 'x4y1', 'x0y2', 'x5y3', 'x1y4', 'x3y5'],
  solitaire: ['x0y0', 'x0y3', 'x0y3', 'x3y3']
};

const SOLITAIRE_BOARD_DIMENSIONS = 4;
const TWOPLAYER_BOARD_DIMENSIONS = 6;

export class GameModel {
  board: GameBoard;
  deck: Decktet;
  gameType: GameType;
  layout: Layout | undefined;
  sendCardPlaytoView: SendCardPlaytoViewCB | undefined;
  sendTokenPlaytoView: SendTokenPlayToViewCB | undefined;

  constructor(deckType: DeckType, gameType: GameType) {
    this.board = new GameBoard(TWOPLAYER_BOARD_DIMENSIONS);
    this.deck = new Decktet(deckType);
    this.gameType = gameType;
  }

  bindSendCardPlayToView(sendCardPlaytoView: SendCardPlaytoViewCB) {
    this.sendCardPlaytoView = sendCardPlaytoView;
  }

  bindSendTokenPlayToView(sendTokenPlayToView: SendTokenPlayToViewCB) {
    this.sendTokenPlaytoView = sendTokenPlayToView;
  }
}

export class SinglePlayerGameModel extends GameModel {
  currPlyr: Player_SinglePlayer;
  opposPlyr: Player_ComputerPlayer;
  constructor(deckType: DeckType, gameType: GameType) {
    super(deckType, gameType);

    this.currPlyr = new Player_SinglePlayer(
      'Player 1',
      gameType,
      this.board,
      this.deck
    );
    this.opposPlyr = new Player_ComputerPlayer(
      'Computer',
      gameType,
      this.board,
      this.deck,
      'Player 1',
      this.currPlyr.getInfluenceTokensNo,
      this.currPlyr.placeToken,
      this.currPlyr.undoPlaceToken
    );
  }

  public startGame(layout: Layout, aiDifficulty: AIDifficulty = 'easyAI') {
    this.createLayout(this.deck, layout);
    this.currPlyr.drawStartingHand();
    this.opposPlyr.drawStartingHand();
    this.opposPlyr.aiDifficulty = aiDifficulty;
  }

  public restoreGame() {
    this.restoreLayout();
    this.restorePlayedMoves();
    this.currPlyr.restoreHand();
    this.opposPlyr.restoreHand();
    this.opposPlyr.aiDifficulty = localStorage.getItem(
      'difficulty'
    ) as AIDifficulty;
    this.deck.restoreDeck(this.currPlyr.playerID, this.opposPlyr.playerID);
    this.board.resolveInflunceForEntireBoard();
  }

  public resetStorage = () => {
    localStorage.removeItem('layout');
    localStorage.removeItem('playedCards');
    localStorage.removeItem('movesArr');
    localStorage.removeItem('undoMoves');
    localStorage.removeItem('turnStatus');
    localStorage.removeItem(`Player 1-hand`);
    localStorage.removeItem(`Computer-hand`);
  };

  private restorePlayedMoves() {
    // check if local save data exists. If so, add the cards and tokens
    // to the board in the same order as originally played.
    const movesJSON = localStorage.getItem('movesArr');
    if (movesJSON) {
      const movesArr = JSON.parse(movesJSON);
      for (let idx = 0; idx < movesArr.length; idx++) {
        const obj = movesArr[idx];
        if (obj.cardToPlay) {
          const card = this.deck.getCardByID(obj.cardToPlay)!;
          const space = this.board.getSpace(obj.spaceToPlaceCard)!;
          this.board.setCard(obj.spaceToPlaceCard, card);
          if (this.sendCardPlaytoView) this.sendCardPlaytoView(card, space);
        } else if (obj.spaceToPlaceToken) {
          const space = this.board.getSpace(obj.spaceToPlaceToken)!;

          if (this.currPlyr.playerID === obj.playerID) {
            this.currPlyr.restoreTokenPlay(obj.spaceToPlaceToken);
          } else {
            this.opposPlyr.restoreTokenPlay(obj.spaceToPlaceToken);
          }

          if (this.sendTokenPlaytoView)
            this.sendTokenPlaytoView(space, obj.playerID);
        }
      }
    }
  }

  private createLayout(deck: Decktet, layout: Layout) {
    this.layout = layout;
    const layoutStorArr = [] as { cardID: string; spaceID: string }[];

    const handleInitialPlacementCB = (spaceID: string) => {
      const card = deck.drawCard()!;
      const space = this.board.getSpace(spaceID)!;
      this.board.setCard(spaceID, card);
      if (this.sendCardPlaytoView) this.sendCardPlaytoView(card, space);
      // add card info to array which will be saved in local storage
      layoutStorArr.push({ cardID: card.getId(), spaceID: spaceID });
    };

    const layoutArr = BOARD_LAYOUTS[layout];
    layoutArr.forEach((spaceID) => handleInitialPlacementCB(spaceID));

    //save layout info to local storage
    localStorage.setItem('layout', JSON.stringify(layoutStorArr));
  }

  private restoreLayout() {
    // check for stored layout info
    const layoutJSON = localStorage.getItem('layout');
    this.layout = localStorage.getItem('layoutChoice') as Layout;
    if (layoutJSON) {
      const layoutArr = JSON.parse(layoutJSON);
      layoutArr.forEach((obj: { cardID: string; spaceID: string }) => {
        const card = this.deck.getCardByID(obj.cardID)!;
        const space = this.board.getSpace(obj.spaceID)!;
        this.board.setCard(obj.spaceID, card);
        if (this.sendCardPlaytoView) this.sendCardPlaytoView(card, space);
      });
    }
  }

  public addRecordtoDB = async () => {
    // user1 ID will either be guest or authenticated user ID.
    // that determination is handled server side,
    // so user1ID is not added here.
    const gameResults = {
      user1Score: this.currPlyr.getScore(),
      user2ID: this.opposPlyr.aiDifficulty,
      user2Score: this.opposPlyr.getScore(),
      layout: this.layout
    };

    (async () => {
      try {
        const response = await fetch('/rest/storeSPGameResult', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'post',
          body: JSON.stringify(gameResults)
        });

        const message = await response;
        console.log(message);
      } catch (error) {
        console.log(error);
      }
    })();
  };
}
