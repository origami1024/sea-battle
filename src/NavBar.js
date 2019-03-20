import React, { Component } from 'react';
import {Link} from 'react-router-dom';



class NavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'rorf'
    }
  }
  onLoginNav = e => {
    this.setState({stage: 'battle'})
    console.log('cp1')
  }
  render() {
    return(
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            Sea Battle
          </Link>
          {this.props.children}
        </div>
      </nav>
    )
  }
}

export default NavBar