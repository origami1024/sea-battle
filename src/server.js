//utils
//DEBUG STRING
clog = str => console.log(`[DEBUG] ${str}.`)

//websocket server

var pg = require('pg');
var pgConString = "postgres://postgres:123456@localhost:5432/seabattle";

var pgClient = new pg.Client(pgConString);
pgClient.connect();
//pgClient.query("INSERT INTO users(name, pwHash) values('Ted', 'pw')");
//CONTINUE THIS - user registration part, then user auth, then logout, then rejoin
//pgUtils
function pgReg(name, pwHash){
  clog('PGREG!!!!!')
  //check if name and pwHash is ok to put in db
  //then check with db if its unique
  //if yes - insert new user
  //send back to user that u got registered or that its failure
}


const webSoc = require('ws')
const server = new webSoc.Server({
  port: 12345
})
let users = {}
let rooms = {
  1: {gName: 'small game', open: -1, host: 'hoster1', hostID: 888, opponentName: '--empty--', hostRdy: false, openRdy: false, hostShips: [], openShips: [], battleId: -1},
  2: {gName: 'big game', host: 'blooper4', hostID: 889, open: 333, opponentName: 'derpo', hostRdy: false, openRdy: false, hostShips: [], openShips: [], battleId: -1}
}
const BATTLETURNINTERVAL = 30000 //30 seconds for testing, change later
const USERLIFECHECKERINTERVAL = 20000 //
let matches = {}
let userCounter = 1
let roomCounter = 3
let matchCounter = 1
const cmds = {
  reg: (socket, data) => {
    //check if name is unique in db
    //If so - put new user into the db
    //send back re1 'registersuccess'
    //or re2 - failure
    pgReg(data.name, data.pwHash)
  },
  lgn: (socket, data) => {
    let user = {
      socket: socket,
      uName: data.name,
      uPW: data.pw,
      inRoom: -1
    }
    clog('user with id ' + userCounter + ' logd')
    ////checkin on socket status, if user is on or not
    //here start a timer that will check on socket life
    //on user deletion - need to check rooms and battles he is in
    users[userCounter] = user
    let socketChecker = (userCounter) =>{
        setTimeout(()=>{
          clog('Checking on:' + userCounter)
          if (users[userCounter]) clog('readyState:' + users[userCounter].socket.readyState)
          
          if ((users[userCounter]) && (users[userCounter].socket.readyState === 3)) {
            users[userCounter].socket.close()
            delete users[userCounter]
            clog('socket is closed - user has been deleted:' + userCounter)
          } else socketChecker(userCounter)
          
        }, USERLIFECHECKERINTERVAL)
    }
    socketChecker(userCounter)

    userCounter += 1
    try {
      socket.send('{"cmd": "lok"}')//login ok = lok
    } catch {
      console.log('error sending at lgn')
    }
  },
  prt: () => {
    clog('prt, users.length: ' + Object.keys(users).length)
    clog(Object.keys(users).join(','))
    clog('prt, rooms.length: ' + Object.keys(rooms).length)
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
        //socket.close()
        //is the socket completely done after that? is this a memory leak?
        delete users[usr]
        clog('bingo! user found by its socket and then deleted')
        //HAVE TO DELETE ITS SOCKET SEPARATELY???
      }
    }
    
    //users = users.filter(usr=>usr.socket!==socket)
    clog('after: ' + Object.keys(users).length)
  },
  get: (socket) => {
    clog('get')
    try {
      socket.send(JSON.stringify({
        cmd: 'lst',
        rooms: rooms
      }))
    } catch {
      console.log('error sending at get')
    }
    
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
          opponentName: '--empty--',
          hostRdy: false,
          openRdy: false,
          hostShips: [],
          openShips: [],
          battleId: -1 //have battle started? -1 no, otherwise the id of the match
        }
        users[usrID].inRoom = roomCounter
        try{
          socket.send(JSON.stringify({
            cmd: 'rok', //room ok, here's ur id
            roomID: roomCounter,
            roomName: cmd.gName,
          }))
        } catch {
          console.log('ERROR sending at cre')
        }
        
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
              try {
                users[rooms[users[usrID].inRoom].open].socket.send('{"cmd": "ler", "why": "Host left the room"}')
                users[rooms[users[usrID].inRoom].open].inRoom = -1
              } catch {
                console.log('ERROR sending at lea1')
              }
            }
            //delete the instance
            delete rooms[users[usrID].inRoom]
            clog('room deleted')
          } else {
              //its not the host, open the space
              clog('nonhost left a room')
              rooms[users[usrID].inRoom].open = -1
              //send host info that the dud left
              try {
                users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
                  cmd: 'ole'//opponent left
                }))
              } catch {
                console.log('ERROR sending at lea2')
              }
            
            }
            users[usrID].inRoom = -1
          try {
            socket.send('{"cmd": "ler"}')
          } catch {
            console.log('ERROR sending at ler')
          }
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
      try {
        socket.send(JSON.stringify({
          cmd: 'jok',
          rid: cmd.rid,
          roomData: {...rooms[cmd.rid], hostShips: undefined}
        }))
      } catch {
        console.log('ERROR sending at joi1')
      }
      
      //send to host that he got joind by smn
      try {
        users[rooms[cmd.rid].hostID].socket.send(JSON.stringify({
          cmd: 'jnd',
          joinerID: usrID,
          joinerName: users[usrID].uName
        }))
      } catch {
        console.log('ERROR sending at joi2')
      }
      
      
    } else {
      clog('Joi.Cp1Fail')
      try {
        socket.send(JSON.stringify({
          cmd: 'jno',
          why: 'you are too weak and ugly for this room'
        }))
      } catch {
        console.log('ERROR sending at joi3')
      }
      
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
        try {
          users[rooms[users[usrID].inRoom].open].socket.send('{"cmd": "ler", "why": "Host keked you"}')
          users[rooms[users[usrID].inRoom].open].inRoom = -1
        } catch {
          console.log('ERROR sending at kik1')
        }
        //change room
        rooms[users[usrID].inRoom].open = -1
        rooms[users[usrID].inRoom].opponentName = '--empty--'
        rooms[users[usrID].inRoom].openRdy = false
        rooms[users[usrID].inRoom].openShips = []
        //send to host, kek success
        try {
          socket.send(JSON.stringify({
            cmd: 'ole'
          }))
        } catch {
          console.log('ERROR sending at kik2')
        }
        
      }
    }
  },
  lmg: (socket, cmd, usrID) => {
    clog('lmg')
    //send local chat message to room
    //check if the sender is in the room
    if ((users[usrID]) && (users[usrID].inRoom !== -1) && (rooms[users[usrID].inRoom].open !== -1) ) {
      if (rooms[users[usrID].inRoom].hostID === usrID) {
        try{
          users[rooms[users[usrID].inRoom].open].socket.send(JSON.stringify({
            cmd: 'rmg',
            msg: cmd.msg
          }))
        } catch {
          console.log('ERROR sending at lmg1')
        }
        
      } else
      if (rooms[users[usrID].inRoom].open === usrID) {
        try {
          users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
            cmd: 'rmg',
            msg: cmd.msg
          }))
        } catch {
          console.log('ERROR sending at lmg1')
        }
        
      }
    }
  },
  gmg: (socket, cmd, usrID) => {
    clog('gmg')
    //send global chat message to everyone not in room
    //check if the sender is not in room
    if ((users[usrID]) && (users[usrID].inRoom === -1)) {
      //if user exists and isnt in the room
      //loop through all users
      //clog(JSON.stringify(users))
      for (usr in users) {
        clog(users[usr] === users[usrID])
        if ((users[usr] !== users[usrID]) && (users[usr].inRoom === -1)) {
          //is not the sender, and is not in the room, send him
          try{
            users[usr].socket.send(JSON.stringify({
              cmd: 'mgg',
              sender: users[usrID].uName,
              msg: cmd.msg
            }))
          } catch {
            console.log('ERROR sending at gmg')
          }
        }
      }
    }
  },
  all: (socket, usrID) => {
    //get all users
    clog('all')
    let tmp = []
    for (key in users) {
      tmp.push({ uID: key, uName: users[key].uName, inRoom: users[key].inRoom})
    }
    console.log(tmp)
    try {
      socket.send(JSON.stringify({
        cmd: 'her',
        uList: tmp,
      }))
    } catch {
      console.log('error at all')
    }
  },
  ggo: (socket, cmd, usrID) => {
    //start the game
    //check if the user is host
    if (rooms[users[usrID].inRoom].hostID === usrID) {
      //check if there is opponent
      if (rooms[users[usrID].inRoom].open !== -1) {
        //create new match on server
        let tmpPlayers = {}
        tmpPlayers[usrID] = {
          //id: usrID, its in the key
          ships: rooms[users[usrID].inRoom].hostShips,
          hits: [], //player's attacks! maybe make a matrix with 0, and fill in the 1s, or just put hits for now, and send them all each time
          thisTurnHit: undefined, //if undefined - havent done the turn
          turnsSkipped: 0 //if >5 then battle is lost
        }
        tmpPlayers[rooms[users[usrID].inRoom].open] = {
          //id: rooms[users[usrID].inRoom].open,
          ships: rooms[users[usrID].inRoom].openShips,
          hits: [],
          thisTurnHit: undefined, //if undefined - havent done the turn
          turnsSkipped: 0
        }
        matches[matchCounter] = {
          //need a way to describe dead ships to see if a player has lost
          //in the room there should be tag - if in staging or in battle
          players: tmpPlayers,
          matchName: '',
          turn: 0,
          turnTimer: undefined
        }

        //change the room info
        rooms[users[usrID].inRoom].battleId = matchCounter
        
        //start the turn timer! reset on sendin nxt
        let tmpMC = matchCounter 
        matches[matchCounter].turnTimer = setInterval(function(){
          turnSkip(tmpMC)
        }, BATTLETURNINTERVAL)

        matchCounter += 1      
        //send to both - 'new' and the match info, that players will have to synchronize with
        //actually there is nothing to send at this point, so...
        let tmpMatchInfo1 = {
          ourHits: [],
          opponentsHits: [],
          ourThisTurnHit: [],
          opponentThisTurnHit: [],
          battleName: rooms[users[usrID].inRoom].gName,
          opponentName: users[rooms[users[usrID].inRoom].open].uName,
          turn: 0
        }
        let tmpMatchInfo2 = {
          ourHits: [],
          opponentsHits: [],
          ourThisTurnHit: [],
          opponentThisTurnHit: [],
          battleName: rooms[users[usrID].inRoom].gName,
          opponentName: users[usrID].uName,
          turn: 0
        }
        try {
          users[rooms[users[usrID].inRoom].hostID].socket.send(JSON.stringify({
            cmd:'new',
            data: tmpMatchInfo1
          }))
        } catch {
          console.log('ERROR sending to player 1 at ggo')
        }
        try {
          users[rooms[users[usrID].inRoom].open].socket.send(JSON.stringify({
            cmd:'new',
            data: tmpMatchInfo2
          }))
        } catch {
          console.log('ERROR sending to player 2 at ggo')
        }
        


      }
      
    }
  },
  rdy: (socket, cmd, usrID) => {
    //player in room is rdy

    //check if dude is in the room
    
    if (users[usrID].inRoom && users[usrID].inRoom!== -1) {
      //TODO: CHECK THAT SHIPS DATA IS GOOD
      //TODO: TRANSFER LESS DATA - NO SHIP IDS AND STUFF
      //first figure out if its host or open
      let tmpUserStatus = undefined
      let tmpOpponentIDMeta = undefined
      if (rooms[users[usrID].inRoom].hostID === usrID) {
        tmpUserStatus = 'host'
        tmpOpponentIDMeta = 'open'
      } else
      if (rooms[users[usrID].inRoom].open === usrID) {
        tmpUserStatus = 'open'
        tmpOpponentIDMeta = 'hostID'
      }
      if (tmpUserStatus !== undefined) {
        //put ships and readystate in the room data
        rooms[users[usrID].inRoom][tmpUserStatus + 'Ships'] = cmd.ships
        rooms[users[usrID].inRoom][tmpUserStatus + 'Rdy'] = cmd.ready
      }
      //if there is other player in the room, send him the notification
      if (tmpOpponentIDMeta !== undefined && rooms[users[usrID].inRoom][tmpOpponentIDMeta] !== -1) {
        try{
          users[rooms[users[usrID].inRoom][tmpOpponentIDMeta]].socket.send(JSON.stringify({
            cmd: 'ord',
            ord: cmd.ready
          }))
        } catch {
          console.log('ERROR sending to opponent at rdy')
        }
      }
      
    }
  },
  trn: (socket, cmd, usrID) => {
    //receive turn data
    console.log(cmd.hit)

    //check if user exists and is in battle
    //check if battle exists
    if ((users[usrID]) && (users[usrID].inRoom !== -1) && (rooms[users[usrID].inRoom].battleId !== -1) && (rooms[users[usrID].inRoom].battleId in matches)) {
      
      //second check if hit already written for that player
      if (matches[rooms[users[usrID].inRoom].battleId].players[usrID].thisTurnHit === undefined) {
        //put it into the game data
        matches[rooms[users[usrID].inRoom].battleId].players[usrID].thisTurnHit = cmd.hit;
        matches[rooms[users[usrID].inRoom].battleId].players[usrID].hits.push(cmd.hit)
        //clog('CP 1 DOWN (IN THE TRN)')
        
        //check if both players made turn,
        let opponentId = rooms[users[usrID].inRoom].hostID === usrID ? rooms[users[usrID].inRoom].open : rooms[users[usrID].inRoom].hostID
        if ((matches[rooms[users[usrID].inRoom].battleId].players[usrID].thisTurnHit !== undefined) && (matches[rooms[users[usrID].inRoom].battleId].players[opponentId].thisTurnHit !== undefined)) {
          clog('CHECKPOINT IN TURN!')
          //change match data accordingly - +1 turn, current hit data = undefined for both
          matches[rooms[users[usrID].inRoom].battleId].turn += 1
          //--need to check if battle is over - cuz all ships killed
          /////////////////////////////////////
          //send out new turn to each (with data)
          sendTurnToBoth(rooms[users[usrID].inRoom].battleId)
          
          //reset the timer
          clearInterval(matches[rooms[users[usrID].inRoom].battleId].turnTimer)

          let tmpMC = rooms[users[usrID].inRoom].battleId 
          matches[rooms[users[usrID].inRoom].battleId].turnTimer = setInterval(function(){
          turnSkip(tmpMC)
        }, BATTLETURNINTERVAL)
        }
      } else {clog('trn: player is sending hit data for same turn repeatedly!')}

    }
  },
  ong: (socket, cmd) => {
    //answer to ping
    //with if in room, if logged
    //also needs to send ping each few mins
  },
  sur: (socket, cmd, usrID) => {
    //surrender the game, leave to lobby
  }
  //

}
//server inititated to other client:
///1. room got disbanded by host
///5. player joined ur room
///2. you got kicked by host
///3. receive local chat message
///4. other player in room got rdy
///5. turn results each turn - when both players do the turn, send back to both

///6. ping request to see if socket dropped??? on timer?


////some separate functions
function turnSkip(battleId) {
  console.log('battleId in the timer:', battleId)
  console.log('GLOBAL MATCHCOUNTER: ', matchCounter)
  let tmpPlayers = Object.keys(matches[battleId].players)
  //add skipped turn to the dudes with undefined
  if (matches[battleId].players[tmpPlayers[0]].thisTurnHit === undefined) {
    matches[battleId].players[tmpPlayers[0]].turnsSkipped += 1
  }
  if (matches[battleId].players[tmpPlayers[1]].thisTurnHit === undefined) {
    matches[battleId].players[tmpPlayers[1]].turnsSkipped += 1
  }
  //set the battle data for both players
  matches[battleId].turn += 1
  //send nxt to both
  sendTurnToBoth(battleId)
  
  //this timer should be reset on the trn, if both players make it
}


function sendTurnToBoth(battleId) {
  let tmpPlayers = Object.keys(matches[battleId].players)
  let tmpMatchInfo1 = {
    ourHits: matches[battleId].players[tmpPlayers[0]].hits,
    opponentsHits: matches[battleId].players[tmpPlayers[1]].hits,
    ourThisTurnHit: matches[battleId].players[tmpPlayers[0]].thisTurnHit,
    opponentThisTurnHit: matches[battleId].players[tmpPlayers[1]].thisTurnHit,
    turn: matches[battleId].turn
  }
  let tmpMatchInfo2 = {
    ourHits: matches[battleId].players[tmpPlayers[1]].hits,
    opponentsHits: matches[battleId].players[tmpPlayers[0]].hits,
    ourThisTurnHit: matches[battleId].players[tmpPlayers[1]].thisTurnHit,
    opponentThisTurnHit: matches[battleId].players[tmpPlayers[0]].thisTurnHit,
    turn: matches[battleId].turn
  }
  
  try {
    //matches[battleId].players[tmpPLayer[0]]
    users[tmpPlayers[0]].socket.send(JSON.stringify({
      cmd:'nxt',
      data: tmpMatchInfo1
    }))
  } catch {
    console.log('ERROR sending to player1 at sendTurnToBoth')
  }
  try {
    //matches[battleId].players[tmpPLayer[0]]
    users[tmpPlayers[1]].socket.send(JSON.stringify({
      cmd:'nxt',
      data: tmpMatchInfo2
    }))
  } catch {
    console.log('ERROR sending to player2 at sendTurnToBoth')
  }
  matches[battleId].players[tmpPlayers[0]].thisTurnHit = undefined
  matches[battleId].players[tmpPlayers[1]].thisTurnHit = undefined

  //--need to set the timer to skip the turn, that will be reset on the next mutual trn command
}

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
      clog('error parsing data')
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