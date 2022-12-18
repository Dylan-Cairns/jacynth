import express from 'express';
export const viewRouter = express();
viewRouter.get('/singleplayer', (req, res) => {
    res.render('game', {
        gameType: 'singleplayer',
        userID: 'guest',
        hasNick: false
    });
});
viewRouter.get('/highscores', (req, res) => {
    res.render('highscores');
});
