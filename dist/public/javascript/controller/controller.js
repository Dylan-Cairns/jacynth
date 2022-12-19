import { SinglePlayerGameModel } from '../model/model.js';
import { SinglePlayerView } from '../view/view.js';
export class Controller {
}
export class SinglePlayerController {
    constructor(deckType) {
        this.startGame = (layout, aiDifficulty) => {
            this.model.resetStorage();
            this.model.startGame(layout, aiDifficulty);
            this.view.enableCardHandDragging();
        };
        this.model = new SinglePlayerGameModel(deckType, 'singlePlayer');
        this.view = new SinglePlayerView(this.model.board, 'Player 1', this.model.opposPlyr.playerID);
        this.model.currPlyr.bindDrawCard(this.view.playerDrawCardCB);
        this.model.opposPlyr.bindSendCardPlayToView(this.view.nonPlayerCardPlacementCB);
        this.model.opposPlyr.bindSendTokenPlayToView(this.view.nonPlayerTokenPlacementCB);
        this.model.bindSendCardPlayToView(this.view.nonPlayerCardPlacementCB);
        this.model.bindSendTokenPlayToView(this.view.nonPlayerTokenPlacementCB);
        this.view.bindGetAvailCardSpaces(this.model.board.getAvailableSpaces);
        this.view.bindGetAvailTokenSpaces(this.model.currPlyr.getAvailableTokenSpaces);
        this.view.bindGetRemainingSpaces(this.model.board.getRemainingSpacesNumber);
        this.view.bindSendCardPlayToModel(this.model.currPlyr.playCard);
        this.view.bindSendTokenPlayToModel(this.model.currPlyr.placeToken);
        this.view.bindUndoPlayCard(this.model.currPlyr.undoPlayCard);
        this.view.bindUndoPlaceToken(this.model.currPlyr.undoPlaceToken);
        this.view.bindComputerTakeTurn(this.model.opposPlyr.computerTakeTurn);
        this.view.bindGetCardDrawFromModel(this.model.currPlyr.drawCard);
        this.view.bindGetCurrPlyrAvailTokens(this.model.currPlyr.getInfluenceTokensNo);
        this.view.bindGetOpponAvailTokens(this.model.opposPlyr.getInfluenceTokensNo);
        this.view.bindGetCurrPlyrScore(this.model.currPlyr.getScore);
        this.view.bindGetOpponentScore(this.model.opposPlyr.getScore);
        this.view.bindStartGame(this.startGame);
        this.view.bindGetControlledSpaces(this.model.board.getSpacesControlledByToken);
        this.view.bindResetStorage(this.model.resetStorage);
        this.view.bindAddRecordtoDB(this.model.addRecordtoDB);
        // if there is existing game data in local storage, restore the
        // in progress game.
        if (localStorage.getItem('layout')) {
            const tokenColor = localStorage.getItem('tokenColor') ||
                'green';
            this.view.setPlayerTokenColor(tokenColor);
            this.model.restoreGame();
            this.view.restoreGame();
        }
    }
}
