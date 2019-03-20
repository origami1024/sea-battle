import React, { Component } from 'react'

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
      <form className="chatWrapper container" onSubmit={this.submitExternal}>
        <div className="">{this.props.title || 'local chat'}</div>
        <textarea readOnly ref={(node) =>{this.ta=node}} className="col-12" style={{height: "120px", resize: "none"}} value={this.state.chatLog}/>
        <input type="text" className="col-10" value={this.state.tmpRoomMsg} onChange={e=>{this.setState({tmpRoomMsg: e.target.value})}}/>
        <input type="submit" value="send" className="col-2"/>
      </form>
    )
  }
}