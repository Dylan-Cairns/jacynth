import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io';

import { viewRouter } from './routes/views.js';

// configuration

// dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
console.log(path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');

// middleware

app.use(express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static('assets/favicon.ico'));
app.use(express.json());

// view routes
app.use('/', viewRouter);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
