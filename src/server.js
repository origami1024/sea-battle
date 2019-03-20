//utils
//DEBUG STRING
clog = str => console.log(`[DEBUG] ${str}.`)

//websocket server

const webSoc = require('ws')
const server = new webSoc.Server({
  port: 12345
})
let users = {}
let rooms = {
  1: {gName: 'small game', open: -1, host: 'hoster1', hostID: 888, opponentName: '--empty--'},
  2: {gName: 'big game', host: 'blooper4', hostID: 889, open: 333, opponentName: 'derpo'}
}
let matches = {}
let userCounter = 1
let roomCounter = 3
const cmds = {
  lgn: (socket, data) => {
    let user = {
      socket: socket,
      //uID: userCounter, uID is key in dic
      uName: data.name,
      uPW: data.pw,
      inRoom: -1
    }
    clog('user with id ' + userCounter + ' logd')
    users[userCounter] = user
    userCounter += 1
    socket.send('{"cmd": "lok"}')//login ok = lok
  },
  prt: () => {
    clog('prt, users.length: ')
    clog(Object.keys(users).length)
    clog(Object.keys(users).join(','))
    clog('prt, rooms.length: ')
    clog(Object.keys(rooms).length)
    clog(Object.keys(rooms).join(','))
    clog('prt, all userIDs: ')
    for (x in users) {
      clog(x)
    }
  },
  out: (socket) => {
    clog('out')
    //delete the user
    clog('before: ' + Object.keys(users).length)
    for (usr in users) {
      if (users[usr].socket === socket) {
        delete users[usr]
        clog('bingo!')
      }
    }
    
    //users = users.filter(usr=>usr.socket!==socket)
    clog('after: ' + Object.keys(users).length)
  },
  get: (socket) => {
    clog('get')
    socket.send(JSON.stringify({
      cmd: 'lst',
      rooms: rooms
    }))
  },
  cre: (socket, cmd, usrID) => {
    clog('cre')//create room
    //first check if socket registered
    if (usrID !== -1) {
      //check if the player already in a room
      if (users[usrID].inRoom === -1) {
        rooms[roomCounter] = {
          gName: cmd.gName,
          open: -1,
          host: cmd.host,
          hostID: usrID,
          opponentName: '--empty--'
        }
        users[usrID].inRoom = roomCounter
        socket.send(JSON.stringify({
          cmd: 'rok', //room ok, here's ur id
          roomID: roomCounter,
          roomName: cmd.gName,
        }))
        roomCounter += 1
      }
    } else {
      clog('no usrID in users')
    }
  },
  lea: (socket, cmd, usrID) => {
    //leave the room
    clog('lea')
    //check if socket registered
    if (usrID !== -1) {
      //check if that user is in a game
      if (users[usrID].inRoom && users[usrID].inRoom!== -1) {
        clog('cp ok, dud is in a room')
        if (users[usrID].inRoom in rooms) {
          clog('users room found!!!cp335')
          if (rooms[users[usrID].inRoom].hostID === usrID) {
            //its the host, disband the room
            clog('host left a room')
            //first check if there is the other dud
            if (rooms[users[usrID].inRoom].open !== -1) {
              clog('some dud gon get keked')
              // there is the other dud
              //kek the other dud out
              users[rooms[users[usrID].inRoom].open].socket.send('{"cmd": "ler", "why": "Host left the room"}')
              users[rooms[users[usrID].inRoom].open].inRoom = -1
            }
            //delete the instance
            delete rooms[users[usrID].inRoom]
            clog('room deleted')
          } else {
            //its not the host, open the space
            clog('nonhost left a room')
            rooms[users[usrID].inRoom].open = -1
            //send host info that the dud left
            users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
              cmd: 'ole'//opponent left
            }))
          }
          users[usrID].inRoom = -1
          socket.send('{"cmd": "ler"}')
         
        } else {
          clog('error, user trying to exit nonexistent room')
        }

      }
    }
  },
  joi: (socket, cmd, usrID) => {
    clog('joi')
    //join room by its id
    //2 players max
    //check if is open and if user exists //check if not host
    if ((usrID !== -1) && (cmd.rid in rooms) && (rooms[cmd.rid].open === -1) && (usrID !== rooms[cmd.rid].hostID) && (users[rooms[cmd.rid].hostID])) {
      clog('Joi.Cp1')
      //rooms open gets rewritten
      rooms[cmd.rid].open = usrID
      //duds inRoom gets rewr
      users[usrID].inRoom = cmd.rid
      //send back that dud joined succesfully
      socket.send(JSON.stringify({
        cmd: 'jok',
        rid: cmd.rid,
        roomData: rooms[cmd.rid]
      }))
      //send to host that he got joind by smn
      users[rooms[cmd.rid].hostID].socket.send(JSON.stringify({
        cmd: 'jnd',
        joinerID: usrID,
        joinerName: users[usrID].uName
      }))
      
    } else {
      clog('Joi.Cp1Fail')
      socket.send(JSON.stringify({
        cmd: 'jno',
        why: 'you are too weak and ugly for this room'
      })) //maybe add why: 'reasons'...
    }

  },
  kik: (socket, cmd, usrID) => {
    //kick the other player by host from his room
    //check if the kicking user is in the room and is the host of it
    if ((users[usrID].inRoom !== -1) && (rooms[users[usrID].inRoom].hostID === usrID)) {
      clog('kik: in room, and host')
      //check if opponent exist
      if (rooms[users[usrID].inRoom].open !== -1) {
        //send to dud that he is keked
        users[rooms[users[usrID].inRoom].open].socket.send('{"cmd": "ler", "why": "Host keked you"}')
        users[rooms[users[usrID].inRoom].open].inRoom = -1
        //change room
        rooms[users[usrID].inRoom].open = -1
        rooms[users[usrID].inRoom].opponentName = '--empty--'
        //send to host, kek success
        socket.send(JSON.stringify({
          cmd: 'ole'
        }))
      }
    }
  },
  lmg: (socket, cmd, usrID) => {
    clog('lmg')
    //send local chat message to room
    //check if the sender is in the room
    if ((users[usrID]) && (users[usrID].inRoom !== -1) && (rooms[users[usrID].inRoom].open !== -1) ) {
      if (rooms[users[usrID].inRoom].hostID === usrID) {
        users[rooms[users[usrID].inRoom].open].socket.send(JSON.stringify({
          cmd: 'rmg',
          msg: cmd.msg
        }))
      } else
      if (rooms[users[usrID].inRoom].open === usrID) {
        users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
          cmd: 'rmg',
          msg: cmd.msg
        }))
      }
    }
  },
  rdy: (socket, usrID) => {
    //player in room is rdy
    //skip it for now
  },
  ggo: (socket, cmd, usrID) => {
    //start the game
    //check if the user is host
    if (rooms[users[usrID].inRoom].hostID === usrID) {
      //check if there is opponent
      if (rooms[users[usrID].inRoom].open !== -1) {
        //create new match on server
        let match = {
          players: [
            {
              id: -1,
              border: [],
              enemyBorder: [],
              currnetTurn: ''
            },
            {
              id: -1,
              border: [],
              enemyBorder: [],
              currnetTurn: ''
            }
          ],
          matchName: '',
          turn: 0,
        }
        //send to both - 'new' and the match info, that players will have to synchronize with
        users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
          cmd:'new'
        }))
        users[rooms[users[usrID].inRoom].open].socket.send(JSON.stringify({
          cmd:'new'
        }))
      }
      
    }
  },
  trn: (socket, cmd) => {
    //receive turn data
    //put it into the game data
    //if both players made turn, send out new turn
  },
  ong: (socket, cmd) => {
    //answer to ping
    //with if in room, if logged
  },
  sur: (socket, cmd, usrID) => {
    //surrender the game, leave to lobby
  }


}
//server inititated to other client:
///1. room got disbanded by host
///5. player joined ur room
///2. you got kicked by host
///3. receive local chat message
///4. other player in room got rdy
///5. turn results each turn
///6. ping request when battle is going on

clog('Server started')
clog('--------------')

server.on("connection", socket => {
  //socket.id = server.getUniqueID();
  clog('User connected: ')
  socket.on("message", data => {
    clog('data receiveed')
    clog(data)
    let cmd = {cmd: null}
    try {
      cmd = JSON.parse(data)
    } catch (e) {
      //ignore
    }
    if (cmd.cmd in cmds) {
      let usrID = -1
      for (usr in users) {
        if (users[usr].socket === socket) {
          usrID = usr
        }
      }
      cmds[cmd.cmd](socket, cmd, usrID)
    } else {
      clog('unknown command')
      clog(cmd.cmd)
    }
    
    
  })
})