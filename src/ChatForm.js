import React, { Component } from 'react'

import './chatForm.css';

export default class ChatForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tmpRoomMsg: '',
      chatLog: ''
    }
  }
  submitExternal = e => {
    e.preventDefault()
    this.props.sendRoomMsg(this.state.tmpRoomMsg)
    this.setState({tmpRoomMsg: ''})
  }
  
  componentDidUpdate() {
    if (this.ta) {
      this.ta.scrollTop = this.ta.scrollHeight
    }
  }
  componentWillReceiveProps({newLog}) {
    this.setState({chatLog: newLog})
  }
  //1-1(props), 3-2(transfer the scrolling func; what to do with the internal things getting chatlog and sending tmpthing)
  //methods - send msg from tmpRoomMsg from state on submit
  //        - populate the chatLog, when server sends shit this direction
  render () {
    return (
      <form className="chatForm container p-0 d-flex flex-column" onSubmit={this.submitExternal}>
        <div className="list-group-item bg-dark text-white p-1">{this.props.title || 'local chat'}</div>
        <textarea readOnly ref={(node) =>{this.ta=node}} className="chatForm__output col-12" value={this.state.chatLog}/>
        <div className="d-flex">
          <div className="col-10 p-0">
            <input type="text" className="w-100 p-1" value={this.state.tmpRoomMsg} onChange={e=>{this.setState({tmpRoomMsg: e.target.value})}}/>
          </div>
          <div className="col-2 px-1 py-0">
            <input type="submit" value="send" className="w-100 btn py-0 h-100 chatForm__btnSend"/>
          </div>
          
          
        </div>
      </form>
    )
  }
}