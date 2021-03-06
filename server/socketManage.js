const events = require('../src/events')
const methods = require('./methods')
let users = {}
let chatsList = ['Community']
let communityChat = methods.createChat()
let chats = [ communityChat ]

module.exports = io => socket => {
    
    socket.on( events.IS_USER, ( nickname, cb ) => {
        console.log("methods.createUSer")
      /*   methods.isUser( users, nickname ) ? cb({ isUser: false, user: "zaibi" }) : */
        cb({ isUser: false, user: methods.createUser( nickname, socket.id )})
    }) 
    
    socket.on( events.NEW_USER, user => {
        console.log("methods.newUSer")
        users = methods.addUsers( users, user )
        socket.user = user
        io.emit( events.NEW_USER, { newUsers: users })
    })

    socket.on( events.INIT_CHATS, cb => {
        console.log("methods.initchats")
        cb(chats)
    })

    socket.on( events.LOGOUT, () => {
        // console.log("user logged out")
        users = methods.delUser( users, socket.user.nickname )
        io.emit( events.LOGOUT, { newUsers: users, outUser: socket.user.nickname}  )
    })

    socket.on( 'disconnect', () => {
        // console.log("disconnected")
        if( socket.user ){
            users = methods.delUser( users, socket.user.nickname )
            io.emit( events.LOGOUT, { newUsers: users, outUser: socket.user.nickname} )
        }
    })

    socket.on( events.MESSAGE_SEND, ({ channel, msg }) => {
        // console.log("methods.createMessage")
        let message = methods.createMessage( msg, socket.user.nickname )
        io.emit( events.MESSAGE_SEND, ({ channel, message }))
    })

    socket.on( events.TYPING, ({ channel, isTyping }) => {
        // console.log("methods.istyping")
        socket.user && io.emit( events.TYPING, { channel, isTyping, sender: socket.user.nickname })
    })

    socket.on( events.P_MESSAGE_SEND, ({ receiver, msg }) => {
       
        if( socket.user ){
            
            let sender = socket.user.nickname
            let message = methods.createMessage( msg, sender )
            socket.to( receiver.socketId ).emit( events.P_MESSAGE_SEND, { channel:sender, message })
            socket.emit( events.P_MESSAGE_SEND, { channel: receiver.nickname, message })
        }
    })

    socket.on( events.P_TYPING, ({ receiver, isTyping}) => {
        let sender = socket.user.nickname
        socket.to( receiver ).emit( events.P_TYPING, { channel: sender, isTyping })
    })

    socket.on( events.CHECK_CHANNEL, ({ channelName, channelDescription }, cb ) => {
        if( methods.isChannel( channelName, chatsList ) ){
            cb( true )
        } else {
            let newChat = methods.createChat({ name: channelName, description: channelDescription })
            chatsList.push( channelName )
            chats.push( newChat )
            io.emit( events.CREATE_CHANNEL, newChat )
            cb( false )
        }
    })
}

