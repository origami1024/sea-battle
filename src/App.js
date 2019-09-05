import React, { Component } from 'react';
import './App.css';
import Board from './Board'
import PiecePositioningPart from './PiecePositioningPart'
import NavBar from './NavBar'
import ProfileControl from './ProfileControl'
import ChatForm from './ChatForm'


class StartTimer {
  constructor(props) {
    this.props = props
    this.state = {
      c: 6
    }
  }
  start = t => {
    this.state.c = t
    setTimeout(this.onTick, 1000)
  }
  onTick = e => {
    if (this.state.c > 1) {
      let tmp = this.state.c - 1
      this.state.c = tmp
      this.props.onTickExternal(this.state.c)
      setTimeout(this.onTick, 1000)
    } else {
      this.props.on0()
    }
  }
  render() {
    return (
      <div>timer</div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'login', //starting should be 'login'
      substage: '',   //starting should be ''
      user: {name: null},
      onlineUsersList: {},
      gamesList: [],
      roomsData: [],
      rDActiveIndex: -1,
      gamename: 'another game',
      joining: false,
      tmpRoomMsg: '',
      room: {
        roomID: null,
        roomName: '',
        ishost: 1,
        opponentID: -1,
        opponentName: '--empty--',
        chatLog: '...'
      },
      battle: {
        battleName: '--empty--',
        battleid: -1,
        opponentID: -1,
        opponentName: '--empty--',
        chatLog: ''
        //own field, enemy field
      },
      //ready button in prebattle
      readyLock: true,
      readyBox: false,
      ships: []
    }

    this.tim = new StartTimer({onTickExternal: c=>{this.addRoomMsg('*', c + ' sec to start')}, on0: e=>{this.changeSubStage('battle')}})
    //ref={node=>this.tim=node} onTickExternal={c=>{this.addRoomMsg('*', c + ' sec to start')}} on0={e=>{this.changeSubStage('battle')}}/>

    //this.ws = new WebSocket('ws://localhost:12345')
    this.ws = new WebSocket(`ws://${window.location.hostname}:12345`)
    this.ws.onmessage = e => {
      let data = {}
      try {
        data = JSON.parse(e.data)
      } catch {
        console.log(' some erra ')
      }
      console.log(e.data)
      console.log('cp22')
      
      if ('cmd' in data) {
        if (data.cmd === 'lok') {
          this.PControl.sInCB('ok')
        } else
        if (data.cmd === 'lst') {
          console.log('lst')
          this.setState({rDActiveIndex: -1, roomsData: data.rooms})
          //this.setState({rDActiveIndex: -1, roomsData: Object.assign({}, ...Object.keys(data.rooms).map(k => {data.rooms[k]['active'] = false; return ({[k]: data.rooms[k]})}))})
          //console.log(data.rooms)
          //Object.assign({}, ...Object.keys(obj).map(k => ({[k]: obj[k] * obj[k]})))
        } else
        if (data.cmd === 'rok') {
          console.log('room ok')
          console.log(data)
          if (data.roomID && data.roomName) {
            console.log('roomID and gName exist')
            this.setState({
              room: {roomID: data.roomID, roomName: data.roomName, ishost: 1, opponentID: -1, opponentName: '--empty--',  chatLog: ''}
            })
            this.changeSubStage('gameLobby')
            console.log('cp87')
            console.log(this.state.stage)
          }
        } else
        if (data.cmd === 'ler') {
          //leave room
          this.setState({
            substage: '',
            joining: false,
            room: {
              roomID: null,
              roomName: '',
              ishost: 1,
              opponentID: -1,
              opponentName: '--empty--',
              chatLog: ''
            }
          }, ()=>{this.queryGLRefresh()})
          if (data.why) {
            alert(data.why)
          }
        } else
        if (data.cmd === 'jok') {
          console.log('jok cmd')
          //fill lobby with data
          //change state to in the lobby
          if (data.rid && data.roomData.gName) {
            console.log('roomID and gName exist')
            this.setState({
              room: {roomID: data.rid, roomName: data.roomData.gName, ishost: 2, opponentName: data.roomData.host, opponentID: data.roomData.hostID,  chatLog: ''}
            })
            this.changeSubStage('gameLobby')
            console.log('cp87')
          }
        } else
        if (data.cmd === 'jnd') {
          console.log('jnd')
          if ((this.state.room.ishost) && (this.state.room.ishost === 1)) {
            this.setState({
              room: {...this.state.room, opponentName: data.joinerName, opponentID: data.joinerID}
            })
            this.addRoomMsg('*', data.joinerName + ' joined the room')
          }
        } else
        if (data.cmd === 'ole') {
          if ((this.state.room.ishost) && (this.state.room.ishost === 1)) {
            this.addRoomMsg('*', this.state.room.opponentName + ' left the room')
            this.setState({
              room: {...this.state.room, opponentName: '--empty--', opponentID: -1}
            })
          }  else {
            console.log('error: nonhost received info that is supposed for a host')
          }
        } else
        if (data.cmd === 'jno') {
          console.log(data.cmd)
          //server says cant join :(, as opposed to 'jok'
          this.setState({
            joining: false,
            room: {
              roomID: null,
              roomName: '',
              ishost: 1,
              opponentID: -1,
              opponentName: '--empty--',
              chatLog: ''
            }
          }, ()=>{this.queryGLRefresh()})
          if (data.why) {
            alert(data.why)
          }
        } else
        if (data.cmd === 'rmg') {
          //room msg
          if (data.msg) {
            this.addRoomMsg(this.state.room.opponentName,data.msg)
          }
        } else
        if (data.cmd === 'her') {
          //online user list for general lobby arrived
          console.log('her! ')
          if (data.uList) {
            console.log(data.uList)
            this.setState({onlineUsersList: data.uList})
          }
        } else
        if (data.cmd === 'new') {
          //game starts
          //do 5-4-3-2-1
          
          //get on with basic interface
          //current game state object
          //
          this.tim.start(6)
          //on0 do the change of substage, but here do all the states perhaps

        }
      } else {
        console.log('Some msg from server, but without cmd')
        console.log(data)
      }
    }
    
  }

  queryLaunchGame = e => {
    //ggo
    console.log(this.state.room.ishost === 1)
    console.log(this.state.room.roomID !== -1)
    console.log(this.state.room.opponentID !== -1)
    if ((this.state.room.ishost === 1) && (this.state.room.roomID !== -1) && (this.state.room.opponentID !== -1)){
      //check if both are ready in futur
      this.ws.send(JSON.stringify({cmd: 'ggo'}))

    } else {
      console.log('smth wrong')
    }
  }
  addRoomMsg = (who, msg) => {
    let tmpStr = this.state.room.chatLog + `\n ${who}:  ${msg}`
    this.setState({
      room: {...this.state.room, chatLog: tmpStr}
    })
  }
  sendRoomMsg = val => {
    //e.preventDefault()
    //this.addRoomMsg('you', this.state.tmpRoomMsg)
    this.addRoomMsg('you', val)
    console.log('1')
    this.ws.send(JSON.stringify({cmd: 'lmg', msg: val}))
    //this.setState({tmpRoomMsg: ''})
  }
  kekOpponent = () => {
    //if no opponent, say blabla
    if (this.state.room.ishost === 1) {
      if (this.state.room.opponentID !== -1) {
        //kek the butstard
        this.ws.send(JSON.stringify({cmd: 'kik'}))
      } else {
        alert('slot 2 is empty')
      }
    } else {
      alert('you are not host')
    }
  }
  setReady = (ready, ships) => {
    this.setState({readyLock: ready, ships,})
    console.log('on ready this.state.ships.length', this.state.ships.length)
  }
  toggleReady = () => {
    //first of all make a limit to get ready/unready only once per 5 second in the client
    if ((this.state.stage === 'logged') && (this.state.substage === 'gameLobby')) {
      //maybe add more dependencies, like if in the room etc, though all that needed to be duplicate checked on server
      console.log('TROLOLO')
      console.log(JSON.stringify(this.state.ships))
      //console.log(this.state.ships)
      //alert(this.state.readyBox)
      
      this.ws.send(JSON.stringify({
        cmd: 'rdy',
        ships: this.state.ships,
        ready: !this.state.readyBox
      }))
      this.setState({readyBox: !this.state.readyBox})
    }
  }
  doLogin = (uName, uPW) => {
    this.ws.send(JSON.stringify({cmd: 'lgn', name: uName, pw: uPW}))
  }
  doLogout = () => {
    this.ws.send(JSON.stringify({cmd: 'out'}))
  }
  changeSubStage = subS => {
    this.setState({substage: subS})
  }
  queNewRoom = e => {
    if ((this.state.stage === 'logged') && (this.state.substage === '') && (this.state.gamename.length>2)) {
      this.ws.send(JSON.stringify({
        cmd: 'cre',
        gName: this.state.gamename,
        host: this.state.user.name
      }))
      console.log('queNewRoom')
    } else {
      alert('erra')
    }
  }
  leaveRoom = e => {
    if ((this.state.stage === 'logged') && (this.state.substage === 'gameLobby')) {
      console.log('leaving cp')
      this.ws.send(JSON.stringify({
        cmd: 'lea'
      }))
    }
  }
  queryjoinRoom = e =>{
    //e.target.dataset.roomid
    console.log('joining room')
    if ((this.state.stage === 'logged') && (this.state.rDActiveIndex in this.state.roomsData)) {
      this.setState({joining: true})
      this.ws.send(JSON.stringify({
        cmd: 'joi',
        rid: this.state.rDActiveIndex//e.target.dataset.roomid
      }))
    }
    
  }

  onProfileChange = (currentStage, uname) => {
    this.setState({stage: currentStage, user: {name: uname}}, e=>{
      //drop from lobby and battle
      this.queryGLRefresh()
      
      console.log(this.state.user)
    })
  }
  queryGLRefresh = e => {
    this.ws.send(JSON.stringify({
      cmd:"get"
    }))
    this.queryOURefresh()
  }
  queryOURefresh = e => {
    this.ws.send(JSON.stringify({
      cmd:"all"
    }))
  }
  clickRoomList = room => {
    console.log('clickRoomList')
    this.setState({rDActiveIndex: room})
    /*
    let tmpRoom = this.state.roomsData
    console.log(tmpRoom)
    for (let key in tmpRoom) {
      if (key !== room) {
        tmpRoom[key].active = false
      } else {
        tmpRoom[key].active = !tmpRoom[key].active
      }
    }
    this.setState({roomsData:{ ...this.state.roomsData}})*/
  }

  prepareOnlineDudes = list => {
    let tmpList = [] 
    for (let key in list) {
      tmpList.push(
        <li key={key} className="list-group-item list-group-item-action" style={{padding: '3px 0'}}>
          <a href={"userinfo?user=" + list[key].uID } target={'_blanc'}>{list[key].uName}</a>
        </li>
      )
    }
    return tmpList
  }
  refreshGamesList = rooms => {
    let tmpList = []
    for (let room in rooms) {
      tmpList.push(
        <div key={room} style={{width:"100%", display:'flex', padding: '3px 0', cursor: 'pointer'}} className={ this.state.rDActiveIndex === room ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action" } onClick={e=>{this.clickRoomList(room)}} onDoubleClick={this.queryjoinRoom}>
          <span style={{width:"30%"}} className="py-0">{rooms[room].gName}</span>
          <span style={{width:"20%"}} className="py-0">{rooms[room].host}</span>
          {/*<span style={{width:"20%"}} className="py-0"><a href={"userinfo?user=" + rooms[room].hostID } target={'_blanc'} style={{width:"20%", color: 'black'}}>{rooms[room].host}</a></span>*/}
          <span style={{width:"20%"}} className="py-0">
          {
            rooms[room].open === -1
            ?  <span className="badge badge-primary badge-pill">1/2</span>
            :  <span className="badge badge-primary badge-pill">2/2</span>
          }
          </span>
        </div>
      )
    }
    return tmpList
  }
  componentDidUpdate() {
    if (this.ta) {
      this.ta.scrollTop = this.ta.scrollHeight
    }
  }
  componentDidMount() {
    
    
  }
  render() {
    const rooms = this.refreshGamesList(this.state.roomsData)
    const order = [this.state.room.ishost, this.state.room.ishost % 2]
    const onlineDudes = this.prepareOnlineDudes(this.state.onlineUsersList)
    return (
      <div className="App">
        <NavBar>
          <ProfileControl ref={(node)=>{this.PControl = node}} onProfileChange={this.onProfileChange} stage={this.state.stage} onLogin={this.doLogin} onLogout={this.doLogout}/>
          <button onClick={e=>{this.ws.send(JSON.stringify({cmd:"prt"}))}}>prt</button>
        </NavBar>
        {(this.state.stage === 'logged')
          ? (this.state.substage === 'battle') //battle
            ? <section className="main battle">
                <div>{this.state.battle.battleName} : {this.state.battle.battleid}</div>
                <div className="battleView d-flex justify-content-around">
                  <div>
                    <div>{this.state.user.name || '--empty--'}</div>
                    <Board className="ownBoard" drawObjects={1} cellSize={25}/>
                  </div>
                  <div>
                    <div>{this.state.battle.opponentName}</div>
                    <Board className="enemyBoard" drawObjects={0} cellSize={25} color={"black"}/>
                  </div>
                </div>
                <div className="battleControls container">
                  <div>battle controls</div>
                  <button>shoot(making a turn)</button>
                  <button>surrender</button>
                </div>
                <ChatForm sendRoomMsg={val=>{alert(val)}} newLog={this.state.battle.chatLog}/>
                <button onClick={e=>{this.setState({battle: {chatLog: this.state.battle.chatLog + '\ntrolo'}})}}>testChatF</button>
              </section>
            : (this.state.substage === '') //general lobby
              ? <section className="main container d-flex p-0">
                  <div className="mainMain col-10">
                    <div className="roomsControl d-flex py-2">
                      <button onClick={this.queryGLRefresh}>Refresh roomlist</button>
                      <span style={{paddingLeft: "10px"}}>
                        <input type="text" value={this.state.gamename} onChange={e=>{this.setState({gamename: e.target.value})}} />
                        <button onClick={this.queNewRoom}>Make new room</button>
                      </span>
                      <span style={{paddingLeft: "10px"}}>
                      {
                        this.state.joining
                        ?  <span>JOINING...</span>
                        :  <button onClick={this.queryjoinRoom} disabled={!(this.state.rDActiveIndex in this.state.roomsData)}>Join selected room</button>
                      }
                      </span>
                    </div>
                    <div className="list-group mb-2">
                      <div className="gamesListHeader list-group-item bg-dark text-white py-0" style={{width:"100%", display:'flex'}}>
                        <span style={{width:"30%"}} className="py-1">game name</span>
                        <span style={{width:"20%"}} className="py-1">host</span>
                        <span style={{width:"20%"}} className="py-1">players</span>
                        <span style={{width:"20%"}} className="py-1">modes</span>
                      </div>
                      <div className="gamesListView">
                        {rooms}
                      </div>
                    </div>
                    <ChatForm title="Global chat" sendRoomMsg={val=>{alert(val)}} newLog={'fix this later'} style={{marginTop: 'auto'}}/>
                  </div>
                  <aside className="col-2 m-0 p-0 h-auto bg-dark rounded" style={{maxHeight: "80vh", overflow: "hidden"}}>
                    <h3 className="small gamesListHeader list-group-item bg-dark text-white p-1">playerlist - from ws (based on active sockets) : nn</h3>
                    <ul className="list-group">{onlineDudes}</ul>
                  </aside>
                </section>
              : (this.state.substage === 'gameLobby')
                ? <section className="main container">
                    <div className="">Room <strong>{this.state.room.roomName}</strong> : {this.state.room.roomID}</div>
                    <div className="d-flex">
                      <div className="d-flex flex-column">
                        <div className="gameLobby__playerLine" style={{width:"600px", display:'flex', order: order[0]}}>
                          <span style={{width:"20%"}} className="py-1">{this.state.user.name}</span>
                          <span style={{width:"20%"}} className="py-1">red</span>
                          <span style={{width:"20%"}} className="py-1 bg-warning">Not ready</span>
                        </div>
                        <div className="gameLobby__playerLine" style={{width:"600px", display:'flex', order: order[1]}}>
                          <span style={{width:"20%"}} className="py-1">{this.state.room.opponentName}</span>
                          <span style={{width:"20%"}} className="py-1">green</span>
                          <span style={{width:"20%"}} className="py-1 bg-warning">Not ready</span>
                        </div>
                      </div>
                      <div>
                        <button onClick={this.leaveRoom}>leave the room</button>
                        
                        <input onClick={this.toggleReady} disabled={this.state.readyLock} type="checkbox" id="gameLobby__readyCB" value={this.state.readyBox}/>
                        <label htmlFor="gameLobby__readyCB">ready</label>
                        {/*<button onClick={this.toggleReady} disabled={this.state.readyLock}>ready toggle</button>*/}
                        <button onClick={this.kekOpponent} disabled={this.state.room.ishost !== 1}>kick out</button>
                        <button onClick={this.queryLaunchGame} disabled={this.state.room.ishost !== 1}>launch</button>  
                      </div>
                    </div>
                    
                    <PiecePositioningPart params={[3,3,2,1]} cellSize={30} onReadyChange={this.setReady}/>
                    <ChatForm sendRoomMsg={val=>{this.sendRoomMsg(val)}} newLog={this.state.room.chatLog}/>
                  </section>
                : <div>something else</div>
            : <div>something else huh</div>
        }
      </div>
    );
  }
}

export default App;
