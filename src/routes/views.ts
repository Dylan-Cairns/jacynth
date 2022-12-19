import express from 'express';
import * as Utils from '../db_model/utils.js';

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

viewRouter.get('/profile', (req, res) => {
  res.render('profile');
});
