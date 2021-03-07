const express = require('express')
const app = express()
const server = require('http').createServer(app)
const cors = require("cors") ;
const io = require('socket.io')(server,{

    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
}
)
const socketManage = require('./socketManage')(io)
const PORT = process.env.PORT || 9000
const path = require('path')


io.on('connection', socketManage )
// In dev mode just hide hide app.uss(... ) below
// app.use( express.static(path.join(__dirname, '../build')))
app.use(cors()) ;
server.listen( PORT, () => console.log('App was start at port : ' + PORT ))
