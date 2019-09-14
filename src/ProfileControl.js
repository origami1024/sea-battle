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
        <form className="profileControlLogin row p-2 m-0 rounded-pill bg-dark justify-content-center" onSubmit={this.signIn}>
          <div className="col-4 p-0 m-0 px-1">
            <input className="small px-1 w-100" type="text" value={this.state.userField} onChange={this.onUChange} placeholder="username" />
          </div>
          <div className="col-4 p-0 m-0 px-1">
            <input className="small px-1 w-100" type="text" value={this.state.pwField} onChange={this.onPWChange} placeholder="password" />
          </div>
          <div className="offset-1 col-3 p-0 m-0 ml-2">
            <input type="submit" className="w-100 btn btn-outline-primary btn-sm"  value="Sign In" />
          </div>
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