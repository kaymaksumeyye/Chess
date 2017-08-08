const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));
app.use(webpackDevMiddleware(webpack(webpackConfig)));
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  io.sockets.in(req.body.socketId).emit('someevent', req.body);
  res.send(`
           <Response>
            <Message>Thanks for texting!</Message>
           </Response>
           `);
})

io.on('connection', socket => {
  socket.on('message', body => {
    socket.broadcast.emit('message', body);
  })
})

server.listen(3000, () => {
  console.log("server runnig");
})
