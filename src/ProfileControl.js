import React, { Component } from 'react'


class ProfileControl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentState: this.props.stage,
      userField: '',
      pwField: '',
      user: {
        name: null,
        pw: null
      }
    }
  }
  onUChange = e => {
    this.setState({userField: e.target.value})
  }
  onPWChange = e => {
    this.setState({pwField: e.target.value})
  }
  signOut = e => {
    this.props.onLogout()
    this.setState({
      user: {name: null, pw: null},
      currentState: 'login',
      userField: '',
      pwField: ''
    }, e => {
      this.props.onProfileChange(this.state.currentState, this.state.user.name)
      console.log(this.props.stage)
    })
  }
  signIn = e => {
    //todo - check if info is correct
    //then send it to server to check if user exist, and wait for response
    //for now just log in
    e.preventDefault() //no need cuz react does it by def?
    this.props.onLogin(this.state.userField, this.state.pwField)
  }
  sInCB = status => {
    if (status === 'ok') {
      this.setState({
        user: {name: this.state.userField, pw: this.state.pwField},
        currentState: 'logged',
        userField: '',
        pwField: '' 
      }, e => {
        this.props.onProfileChange(this.state.currentState, this.state.user.name)
      })
    }
    
  }
  render() {
    //render 1 of 3 conditions
    if (this.state.currentState === 'login') {
      return (
        <form className="profileControlLogin" onSubmit={this.signIn}>
          <input className="small m-1 px-1" type="text" value={this.state.userField} onChange={this.onUChange} placeholder="username" />
          <input className="small m-1 px-1" type="text" value={this.state.pwField} onChange={this.onPWChange} placeholder="password" />
          <input type="submit" className="btn btn-dark btn-sm"  value="Sign In" />
        </form>
      )
    }
    if (this.state.currentState === 'logged') {
      return (
        <div className="profileControlLogout">
          <button className="btn btn-dark btn-sm m-1">profile({this.state.user.name})</button>
          <button className="btn btn-dark btn-sm m-1" onClick={this.signOut}>logout</button>
      </div>
      )
    }
    return (
      <div>login error</div>
    )
  }
}

export default ProfileControl;