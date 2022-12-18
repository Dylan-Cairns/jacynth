import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { SocketServer } from './routes/socket.js';
import { rest } from './routes/rest.js';
// import { authRouter } from './routes/auth.js';
import { viewRouter } from './routes/views.js';
// configuration
// dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set('views', path.join(__dirname, 'views'));
console.log(path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');
// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static('assets/favicon.ico'));
app.use(express.json());
//console.log(process.env.NODE_ENV);
//redirect http to https
// app.use(function (request, response, next) {
//   if (process.env.NODE_ENV != 'development' && !request.secure) {
//     return response.redirect('https://' + request.headers.host + request.url);
//   }
//   next();
// });
// view routes
app.use('/', viewRouter);
// rest api routes
app.use('/rest', rest);
// socket.io server
const sockServer = new SocketServer(io);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
