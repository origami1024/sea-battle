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
      <nav className="navbar navbar-dark bg-primary fixed-top my-0">
        <div className="container py-0 my-0" style={{maxHeight: "50px"}}>
          <div className="row">
            <div className="col-3 px-0 mx-0">
              <Link className="navbar-brand logoSeaBattle" to="/">
                Sea Battle
              </Link>
            </div>
            <div className="col-9 px-0 my-auto mx-0">
              {this.props.children}
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export default NavBar