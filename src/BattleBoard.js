import React, { Component } from 'react'
import Board from './Board'


/* 
ideas:
  shiny animations on hover and click
*/
export default class BattleBoard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ships: [{"id":"ship1_1_105","length":1,"posx":7,"posy":0,"orientation":false},{"id":"ship1_2_787","length":1,"posx":7,"posy":4,"orientation":false},{"id":"ship1_3_3233","length":1,"posx":7,"posy":2,"orientation":false},{"id":"ship2_1_1294","length":2,"posx":0,"posy":0,"orientation":false},{"id":"ship2_2_1946","length":2,"posx":4,"posy":7,"orientation":false},{"id":"ship2_3_2365","length":2,"posx":7,"posy":6,"orientation":true},{"id":"ship3_1_1838","length":3,"posx":3,"posy":0,"orientation":false},{"id":"ship3_2_1476","length":3,"posx":0,"posy":7,"orientation":false},{"id":"ship4_1_2690","length":4,"posx":0,"posy":2,"orientation":true}], //draw ships in canvas? //draw ships from props???
      hits: [
        {x:1, y:1},
        {x:1, y:2},
        {x:1, y:3},
        {x:5, y:7}
      ] //with hits too? or do we need to update the hits? should we need to update the ships after prebattle too?
    }
  }
  render() {
    return(
      <div className="partWrapper mb-0">
        <div className="list-group-item bg-dark text-white p-1">{this.props.title || '--empty--'}</div>
        <Board className="ownBoard" ships={this.state.ships || []} hits={this.state.hits || []} drawShips={1} drawHits={1} cellSize={this.props.cellSize} notclickable={false} color={this.props.color}/>
      </div>
    )
  }
}