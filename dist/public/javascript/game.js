import { SinglePlayerController } from './controller/controller.js';
import { MainMenuHandler, ScoresHandler } from './view/utils.js';
const mainMenuHandler = new MainMenuHandler(false);
const scoresHandler = new ScoresHandler();
const controller = new SinglePlayerController('basicDeck');
