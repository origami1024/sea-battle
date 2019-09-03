import React, { Component } from 'react'
import Board from './Board'
import './piecePositioningPart.css';



export default class PiecePositioningPart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      //wat?
    }
  }
  render() {
    return(
      <div className="partWrapper">
        <h3>Place your ships onto the board</h3>
        <div className="boardAndPlacer container">
          <Board className="preBoard" drawObjects={0} cellSize={25} notclickable={false}/>
          <div className="shipFactory">
            empty now
          </div>
        </div>
      </div>
    )
  }
}