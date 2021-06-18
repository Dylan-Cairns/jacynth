import { GameBoard } from './gameboard.js';
import { Decktet } from './decktet.js';
import { Player_MultiPlayer, Player_SinglePlayer, Player_ComputerPlayer } from './player.js';
const SOLITAIRE_BOARD_DIMENSIONS = 4;
const TWOPLAYER_BOARD_DIMENSIONS = 6;
export const BOARD_LAYOUTS = {
    razeway: ['x0y0', 'x1y1', 'x2y2', 'x3y3', 'x4y4', 'x5y5'],
    towers: ['x1y1', 'x4y1', 'x1y4', 'x4y4'],
    oldcity: ['x2y0', 'x4y1', 'x0y2', 'x5y3', 'x1y4', 'x3y5'],
    solitaire: ['x0y0', 'x0y3', 'x0y3', 'x3y3']
};
export class GameModel {
    constructor(layout, deckType) {
        const dimensions = layout === 'solitaire'
            ? SOLITAIRE_BOARD_DIMENSIONS
            : TWOPLAYER_BOARD_DIMENSIONS;
        this.board = new GameBoard(dimensions);
        this.deck = new Decktet(deckType);
    }
    bindSendCardPlayToView(sendCardPlaytoView) {
        this.sendCardPlaytoView = sendCardPlaytoView;
    }
}
export class SinglePlayerGameModel extends GameModel {
    constructor(layout, deckType) {
        super(layout, deckType);
        this.currPlyr = new Player_SinglePlayer('Player1', this.board, this.deck);
        this.opposPlyr = new Player_ComputerPlayer('Computer', this.board, this.deck, 'Player1');
    }
    startGame(layout) {
        this.createLayout(this.board, this.deck, layout);
        this.currPlyr.drawStartingHand();
        this.opposPlyr.drawStartingHand();
    }
    createLayout(board, deck, layout) {
        const handleInitialPlacementCB = (spaceID) => {
            const card = deck.drawCard();
            const space = this.board.getSpace(spaceID);
            board.setCard(spaceID, card);
            if (this.sendCardPlaytoView)
                this.sendCardPlaytoView(card, space);
        };
        const layourArr = BOARD_LAYOUTS[layout];
        layourArr.forEach((spaceID) => handleInitialPlacementCB(spaceID));
    }
}
export class MultiplayerGameModel extends GameModel {
    constructor(layout, deckType, socket, currPlyrID) {
        super(layout, deckType);
        this.socket = socket;
        const dimensions = layout === 'solitaire'
            ? SOLITAIRE_BOARD_DIMENSIONS
            : TWOPLAYER_BOARD_DIMENSIONS;
        this.board = new GameBoard(dimensions);
        this.deck = new Decktet(deckType);
        socket.on('recieveLayoutCard', (cardID, spaceID) => {
            console.log('cardid', cardID);
            const space = this.board.getSpace(spaceID);
            if (!cardID || !space)
                return;
            const card = this.deck.getCardByID(cardID);
            if (!card)
                return;
            this.board.setCard(spaceID, card);
            if (this.sendCardPlaytoView)
                this.sendCardPlaytoView(card, space);
        });
        this.currPlyr = new Player_MultiPlayer(currPlyrID, this.board, this.deck, this.socket);
        const opposingPlyr = currPlyrID === 'Player1' ? 'Player2' : 'Player1';
        this.opposPlyr = new Player_MultiPlayer(opposingPlyr, this.board, this.deck, this.socket);
        const layoutArr = BOARD_LAYOUTS[layout];
        socket.emit('createStartingLayout', layoutArr);
    }
    drawStartingHands() {
        this.currPlyr.drawStartingHand();
        this.opposPlyr.drawStartingHand();
    }
}
