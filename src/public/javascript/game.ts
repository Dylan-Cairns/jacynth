import { SinglePlayerController } from './controller/controller.js';
import { MainMenuHandler } from './view/utils.js';

const mainMenuHandler = new MainMenuHandler(false);

const controller = new SinglePlayerController('basicDeck');
