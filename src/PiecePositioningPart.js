import React, { Component } from 'react'
import Board from './Board'
import './piecePositioningPart.css';



export default class PiecePositioningPart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ships: [],
      dragData: {
        'offsX': 0,
        'offsY': 0
      },
      cellSize: this.props.cellSize,
      params: this.props.params, //starting quantities of each size ship, for example [4,3,2,1]
      shipElements: []
    }
  }
  componentDidMount() {
    this.prepareShips(this.props.params)
  }
  rotateShip = () => {}
  prepareShips = params => {
    const listItems = []
    const tmpShips = []
    let tmpKey = 0
    params.forEach((quantity, i) => {
      for (let j = 1; j <= quantity; j++) {
        const tmpId = `ship${(j+1)*(i+1)+Math.random(333)}`
        listItems.push(
          <div key={tmpKey} className={`ship${j} img`} id={tmpId} draggable="true" style={{left: (3 + i) * (this.props.cellSize * 4) + 'px', top: j * this.props.cellSize + 'px'}} onClick={this.rotateShip}>
          </div>
        )
        tmpKey += 1
        tmpShips.push({
          id: tmpId,
          length: j + 1,
          posx: (2 + i) * 4,
          posy: j,
          initPosx: (3 + i) * 4,
          initPosy: j,
          orientation: false,
          status: 0
        })
        
      }
    });
    this.setState({ships: tmpShips, shipElements: listItems})
  }
  render() {
    return(
      //Board is going to basically be a background drawing in all this? even hover effects have to be on top of ships in this?
      <div className="partWrapper">
        <h3>Place your ships onto the board</h3>
        <div className="boardAndPlacer container">
          <div className="shadow">
          </div>
          <Board className="preBoard" drawObjects={0} cellSize={this.props.cellSize} notclickable={false}/>
          {this.state.shipElements}
          
        </div>
      </div>
    )
  }
}