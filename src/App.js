import React, { Component } from 'react';
import './AppExtended.css';
import Board from './Board'
import PiecePositioningPart from './PiecePositioningPart'
import NavBar from './NavBar'
import ProfileControl from './ProfileControl'
import ChatForm from './ChatForm'
import BattleBoard from './BattleBoard'



class StartTimer {
  constructor(props) {
    this.props = props
    this.state = {
      c: 1
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


//CONSTANTS
const TURNTIMER = 30

class App extends Component {
  constructor(props) {
    super(props)
    this.opponentsBoard = React.createRef()
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
        chatLog: '...',
        opponentRdy: false
      },
      battle: {
        battleState: undefined,
        battleName: 'battle without a name',
        battleid: -1,
        opponentID: -1,
        opponentName: '--empty--',
        turn: -1,
        chatLog: '',
        ourHits: [
          {x:1, y:1},
          {x:1, y:2},
          {x:1, y:3},
          {x:5, y:7}
        ],
        opponentsHits: []
        //own field, enemy field
      },
      //ready button in prebattle
      readyLock: true,
      readyBox: false,
      //ships: [],
      ships: [{"id":"ship1_1_105","length":1,"posx":7,"posy":0,"orientation":false},{"id":"ship1_2_787","length":1,"posx":7,"posy":4,"orientation":false},{"id":"ship1_3_3233","length":1,"posx":7,"posy":2,"orientation":false},{"id":"ship2_1_1294","length":2,"posx":0,"posy":0,"orientation":false},{"id":"ship2_2_1946","length":2,"posx":4,"posy":7,"orientation":false},{"id":"ship2_3_2365","length":2,"posx":7,"posy":6,"orientation":true},{"id":"ship3_1_1838","length":3,"posx":3,"posy":0,"orientation":false},{"id":"ship3_2_1476","length":3,"posx":0,"posy":7,"orientation":false},{"id":"ship4_1_2690","length":4,"posx":0,"posy":2,"orientation":true}], //draw ships in canvas? //draw ships from props???,
      globalChatLog: '',
      curHit: undefined, //[x, y]
      turnCountdown: TURNTIMER,
      turnCountdownTimer: undefined
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
          this.state.globalChatLog = []
          if (data.roomID && data.roomName) {
            console.log('roomID and gName exist')
            this.setState({
              room: {roomID: data.roomID, roomName: data.roomName, ishost: 1, opponentID: -1, opponentName: '--empty--',  chatLog: '', opponentRdy: false},
              readyBox: false
            })
            this.changeSubStage('gameLobby')
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
          this.state.globalChatLog = []
          if (data.rid && data.roomData.gName) {
            console.log('roomID and gName exist')
            this.setState({
              room: {roomID: data.rid, roomName: data.roomData.gName, ishost: 2, opponentName: data.roomData.host, opponentID: data.roomData.hostID,  chatLog: '', opponentRdy: data.roomData.hostRdy},
              readyBox: false
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
              room: {...this.state.room, opponentName: '--empty--', opponentID: -1, opponentRdy: false}
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
        if (data.cmd === 'mgg') {
          //global msg
          if ((data.msg) && (data.sender)) {
            this.addGlobalMsg(data.sender, data.msg)
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
          this.tim.start(1)
          //on0 do the change of substage, but here do all the states perhaps
          //
          let newTimer = setInterval(this.cdTimer, 1000);
          this.setState({turnCountdownTimer: newTimer})
          console.log('cp new', data.data.battleName)
          console.log(JSON.stringify(this.state.ships))
          this.setState({battle: {
            battleState: 'turn', //waiting for the turn, other possible values - undefined and 'wait'
            battleName: data.data.battleName,
            opponentName: data.data.opponentName
          }})
        } else 
        if (data.cmd === 'nxt') {
          //new turn
          //set the data
          console.log('cp nxt')
          this.setState({
            battle: {
              ...this.state.battle,
              battleState: 'turn',
              turn: data.data.turn,
              ourHits: data.data.ourHits,
              opponentsHits: data.data.opponentsHits
            }
          })
          this.opponentsBoard.current.resetSelectedInside()
          if (data.data.ourThisTurnHit === undefined) {console.log('WE SKIPPED A TURN!')}
          if (data.data.opponentThisTurnHit === undefined) {console.log('OPPONENT SKIPPED A TURN!')}
          console.log('ourhits in nxt: ', data.data.ourHits)
          console.log('opnntshits in nxt: ', data.data.opponentsHits)
          this.setState({turnCountdown: TURNTIMER})
        } else 
        if (data.cmd === 'ord') {
          this.setState({room:{...this.state.room,opponentRdy: data.ord}})
        }
      } else {
        console.log('Some msg from server, but without cmd')
        console.log(data)
      }
    }
    
  }
  cdTimer = e=> {
    this.setState({turnCountdown : this.state.turnCountdown - 1})
  }
  queryLaunchGame = e => {
    //ggo
    console.log(this.state.room.ishost === 1)
    console.log(this.state.room.roomID !== -1)
    console.log(this.state.room.opponentID !== -1)
    console.log(this.state.readyBox !== false)
    console.log(this.state.room.opponentRdy !== false)
    if ((this.state.room.ishost === 1) && (this.state.room.roomID !== -1) && (this.state.room.opponentID !== -1) && (this.state.readyBox === true) && (this.state.room.opponentRdy === true)){
      
      this.ws.send(JSON.stringify({cmd: 'ggo'}))

    } else {
      alert('Cant launch, someone is not ready!')
      console.log('smth wrong')
    }
  }
  addRoomMsg = (who, msg) => {
    let tmpStr = this.state.room.chatLog + `${who}:  ${msg}\n`
    this.setState({
      room: {...this.state.room, chatLog: tmpStr}
    })
  }
  sendRoomMsg = val => {
    //e.preventDefault()
    //this.addRoomMsg('you', this.state.tmpRoomMsg)
    this.addRoomMsg('you', val)
    this.ws.send(JSON.stringify({cmd: 'lmg', msg: val}))
    //this.setState({tmpRoomMsg: ''})
  }
  addGlobalMsg = (who, msg) => {
    let tmpStr = this.state.globalChatLog + `${who}:  ${msg}\n`
    this.setState({
      globalChatLog: tmpStr
    })
  }
  sendGlobalMsg = val => {
    this.addGlobalMsg('you', val)
    this.ws.send(JSON.stringify({cmd: 'gmg', msg: val}))
  }
  kekOpponent = () => {
    //if no opponent, say blabla
    if (this.state.room.ishost === 1) {
      if (this.state.room.opponentID !== -1) {
        //kek the butstard
        this.ws.send(JSON.stringify({cmd: 'kik'}))
        this.setState({room:{...this.state.room,opponentRdy: false}})
      } else {
        alert('slot 2 is empty')
      }
    } else {
      alert('you are not host')
    }
  }
  setReady = (ready, ships) => {
    this.setState({readyLock: ready, ships,})
    //console.log('on ready this.state.ships.length', this.state.ships.length)
  }
  toggleReady = () => {
    //first of all make a limit to get ready/unready only once per 5 second in the client
    if ((this.state.stage === 'logged') && (this.state.substage === 'gameLobby')) {
      //maybe add more dependencies, like if in the room etc, though all that needed to be duplicate checked on server
      //console.log(this.state.ships)
      //alert(this.state.readyBox)

      //deleting some props in the ships before sending
      let tmpShips = !this.state.readyBox ? Object.assign({}, this.state.ships) : []
      for (var i = 0, len = tmpShips.length; i < len; i++) {
        delete tmpShips[i].initPosx
        delete tmpShips[i].initPosy
        delete tmpShips[i].status
      }
      //console.log(tmpShips)
      this.ws.send(JSON.stringify({
        cmd: 'rdy',
        ships: tmpShips,
        ready: !this.state.readyBox
      }))
      //console.log('readyBox ',!this.state.readyBox)
      this.setState({readyBox: !this.state.readyBox})
    }
  }
  doLogin = (uName, uPW) => {
    this.ws.send(JSON.stringify({cmd: 'lgn', name: uName, pw: uPW}))
  }
  doLogout = () => {
    this.setState({globalChatLog: []})
    this.ws.send(JSON.stringify({cmd: 'out'}))
    console.log('current stage:', this.state.stage)
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
    //console.log('clickRoomList')
    this.setState({rDActiveIndex: room})
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
          <span style={{width:"40%"}} className="py-0">{rooms[room].gName}</span>
          <span style={{width:"30%"}} className="py-0">{rooms[room].host}</span>
          {/*<span style={{width:"20%"}} className="py-0"><a href={"userinfo?user=" + rooms[room].hostID } target={'_blanc'} style={{width:"20%", color: 'black'}}>{rooms[room].host}</a></span>*/}
          <span style={{width:"15%"}} className="py-0">
          {
            rooms[room].open === -1
            ?  <span className="badge badge-primary badge-pill">1/2</span>
            :  <span className="badge badge-primary badge-pill">2/2</span>
          }
          </span>
          <span style={{width:"15%"}} className="py-0">
            {rooms[room].battleId === -1 ? "staging" : "battle"}
          </span>
        </div>
      )
    }
    return tmpList
  }

  setHitData = hit => {
    this.setState({curHit:hit})
  }
  doTurn = () => {
    //check own battle state
    if (this.state.battle.battleState === 'turn'){
      if (this.state.curHit !== undefined) {
        this.setState({battle:{...this.state.battle, battleState : 'wait'}})
        //send hit data to the server
        this.ws.send(JSON.stringify({
          cmd: 'trn',
          hit: this.state.curHit
        }))
      } else {alert('pick a turn!')}
    } else {
      alert('wait till the turn has ended... ' + this.state.battle.battleState)
    }
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
      <div className="App container">
        <NavBar>
          <ProfileControl ref={(node)=>{this.PControl = node}} onProfileChange={this.onProfileChange} stage={this.state.stage} onLogin={this.doLogin} onLogout={this.doLogout}/>
          {/*<button onClick={e=>{this.ws.send(JSON.stringify({cmd:"prt"}))}}>prt</button>*/}
        </NavBar>
        {(this.state.stage === 'logged')
          ? (this.state.substage === 'battle') //battle
            ? <section className="main battle container">
                <div className="list-group-item bg-dark text-white p-1">{this.state.battle.battleName}, turn: {this.state.battle.turn}, turn timer: {this.state.turnCountdown + " seconds"}</div>
                <div className="battleView d-flex justify-content-around border mb-1 pt-1">
                  {/*in the battleboard props - whether to show ships, hits*/}
                  <BattleBoard className="col" title={this.state.user.name} ships={this.state.ships} hits={this.state.battle.opponentsHits} notclickable={true} cellSize={30} color={"seagreen"}/>
                  <div className="col border">
                    <p className="blinkingText p-5">{this.state.battle.battleState === 'turn' ? 'it is your turn, make it happen!' : 'wait till your opponent makes his turn!'}</p>
                  </div>
                  <BattleBoard className="col" ref={this.opponentsBoard} title={this.state.battle.opponentName} onHit={this.setHitData} hits={this.state.battle.ourHits} notclickable={this.state.battle.battleState!=='turn'} cellSize={30} color={"black"} textColor={"white"}/>
                </div>
                <div className="battleControls mb-1 border">
                  <p className="list-group-item bg-dark text-white p-1">battle controls</p>
                  <div className="battleControls__wrapper p-1">
                    <button className="btn btn-outline-primary mx-1 py-1 px-2" onClick={this.doTurn}>make the turn</button>
                    <button className="btn btn-outline-primary mx-1 py-1 px-2">surrender</button>
                  </div>
                </div>
                <ChatForm title="room chat" sendRoomMsg={val=>{this.sendRoomMsg(val)}} newLog={this.state.room.chatLog}/>
                <button onClick={e=>{this.setState({battle: {chatLog: this.state.battle.chatLog + '\ntrolo'}})}}>testChatF</button>
              </section>
            : (this.state.substage === '') //general lobby
              ? <section className="main container p-0">
                  <div className="row m-0 p-0">
                    <div className="mainMain col-9 col-sm-10 px-1 px-sm-2 px-md-3">
                      <div className="roomsControl d-flex py-1 px-2 list-group-item bg-dark text-white mb-1">
                        <button onClick={this.queryGLRefresh} className="btn btn-primary">Refresh</button>
                        <span className="input-group" style={{paddingLeft: "10px", width: "350px"}}>
                          <input type="text" className="roomsControl__roomInput form-control" value={this.state.gamename} onChange={e=>{this.setState({gamename: e.target.value})}} />
                          <div className="input-group-append">
                            <button onClick={this.queNewRoom} className="btn btn-primary">New</button>
                          </div>
                        </span>
                        <span style={{paddingLeft: "10px"}}>
                        {
                          this.state.joining
                          ?  <span>JOINING...</span>
                          :  <button className="btn btn-primary" onClick={this.queryjoinRoom} disabled={!(this.state.rDActiveIndex in this.state.roomsData)}>Join</button>
                        }
                        </span>
                      </div>
                      <div className="list-group mb-2">
                        <div className="gamesListHeader list-group-item bg-dark text-white py-0" style={{width:"100%", display:'flex'}}>
                          <span style={{width:"40%"}} className="py-1">game name</span>
                          <span style={{width:"30%"}} className="py-1">host</span>
                          <span style={{width:"15%"}} className="py-1">players</span>
                          <span style={{width:"15%"}} className="py-1">modes</span>
                        </div>
                        <div className="gamesListView">
                          {rooms}
                        </div>
                      </div>
                      <ChatForm title="Global chat" sendRoomMsg={val=>{this.sendGlobalMsg(val)}} newLog={this.state.globalChatLog} style={{marginTop: 'auto'}}/>
                    </div>
                    <aside className="col-3 col-sm-2 m-0 p-0 h-auto bg-dark rounded">
                      <h3 className="small gamesListHeader list-group-item bg-dark text-white p-1">playerlist - from ws (based on active sockets) : nn</h3>
                      <ul className="list-group" style={{maxHeight: "90vh", overflowY: 'auto', overflowX: 'hidden'}}>{onlineDudes}</ul>
                    </aside>
                  </div>
                  
                </section>
              : (this.state.substage === 'gameLobby') //prebattle / room lobby prestart
                ? <section className="main container p-0 m-0">
                    <div className="list-group-item bg-dark text-white p-1">Room <strong>{this.state.room.roomName}</strong> : {this.state.room.roomID}</div>
                    <div className="d-flex border mb-1">
                      <div className="d-flex flex-column w-50">
                        <div className="gameLobby__playerLine" style={{display:'flex', order: order[0]}}>
                          <span className="w-50 py-1">{this.state.user.name}</span>
                          <span className={`w-50 custom-control custom-checkbox py-1 ${this.state.readyBox ? "bg-success" :"bg-warning"}`}>
                            <div className="custom-control custom-checkbox p-0">
                              <input className="custom-control-input rdyOrNot" onChange={this.toggleReady} disabled={false/*this.state.readyLock*/} type="checkbox" id="gameLobby__readyCB" checked={this.state.readyBox}/>
                              <label className="custom-control-label rdyOrNot" htmlFor="gameLobby__readyCB">
                                {this.state.readyBox ? 'Ready' : 'Not ready'}
                              </label>
                            </div>
                          </span>
                        </div>
                        <div className="gameLobby__playerLine" style={{display:'flex', order: order[1]}}>
                          <span className="w-50 py-1">{this.state.room.opponentName}</span>
                          <span className={`rdyOrNot w-50 py-1 ${this.state.room.opponentRdy ? "bg-success" :"bg-warning"}`}>{this.state.room.opponentRdy ? 'Ready' : 'Not ready'}</span>
                        </div>
                      </div>
                      <div className="d-flex w-50">
                        <button className="btn btn-outline-primary m-0 m-md-1" onClick={this.leaveRoom}>leave room</button>
                        {//<input onChange={this.toggleReady} disabled={false/*this.state.readyLock*/} type="checkbox" id="gameLobby__readyCB" checked={this.state.readyBox}/>
                        //<label htmlFor="gameLobby__readyCB">ready</label>*/
                        }
                        <div className="d-inline m-0">
                          <button className="btn btn-outline-primary m-0 m-md-1 py-1 py-md-2" onClick={this.kekOpponent} disabled={this.state.room.ishost !== 1}>kick out</button>
                          <button className="btn btn-outline-primary m-0 m-md-1 py-1 py-md-2" onClick={this.queryLaunchGame} disabled={this.state.room.ishost !== 1}>launch</button>  
                        </div>
                      </div>
                    </div>
                    
                    <PiecePositioningPart params={[3,3,2,1]} cellSize={30} onReadyChange={this.setReady} piecesLocked={this.state.readyBox}/>
                    <ChatForm title="room chat" sendRoomMsg={val=>{this.sendRoomMsg(val)}} newLog={this.state.room.chatLog}/>
                  </section>
                : <div>something else</div>
            : <div>something else huh</div>
        }
      </div>
    );
  }
}

export default App;
