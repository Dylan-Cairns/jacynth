var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
export const viewRouter = express();
viewRouter.get('/', (req, res) => {
    res.render('home');
});
viewRouter.get('/singleplayer', (req, res) => {
    res.render('game', {
        gameType: 'singleplayer',
        userID: 'guest',
        hasNick: false
    });
});
viewRouter.get('/multiplayer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // if user is logged in, check if they have chosen a nickname yet.
    let userID = 'guest';
    let hasNick = true;
    res.render('game', {
        gameType: 'multiplayer',
        userID: userID,
        hasNick: hasNick
    });
}));
viewRouter.get('/highscores', (req, res) => {
    res.render('highscores');
});
