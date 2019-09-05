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
      shipElements: [],
      tmpele: undefined,
      shadowBorder: '1px dotted black',
      shadowStyle: {
        border: '1px dotted black',
        left: 0,
        width: this.props.cellSize,
        height: this.props.cellSize,
      }
    }
  }
  componentDidMount() {
    this.prepareShips(this.props.params)
  }
  drag = function (ev) {
    if((ev.target) && (ev.target.classList.contains('img'))) {
      var rect = ev.target.getBoundingClientRect()
      let dragData = {
        'offsX': ev.clientX - rect.left,
        'offsY': ev.clientY - rect.top
      }
      this.setState({
        dragData,
        tmpele: ev.target
      })
    }
  }
  dragOver = function(ev) {
    ev.preventDefault()

    let finalX = (ev.clientX - document.getElementsByClassName('boardAndPlacer')[0].getBoundingClientRect().left - this.state.dragData['offsX'])
    let finalY = (ev.clientY - document.getElementsByClassName('boardAndPlacer')[0].getBoundingClientRect().top - this.state.dragData['offsY'])

    let floorerX = finalX % this.props.cellSize
    if (floorerX > (this.props.cellSize / 2)) floorerX = - (this.props.cellSize - floorerX)
    let floorerY = finalY % this.props.cellSize
    if (floorerY > (this.props.cellSize / 2)) floorerY = - (this.props.cellSize - floorerY)

    let gridX = (finalX - floorerX)
    let gridY = (finalY - floorerY)
    let coordsX = gridX / this.props.cellSize
    let coordsY = gridY / this.props.cellSize
    
    let theShip = this.state.tmpele.id
    
    const shadowRestyling = {}

    for (let i = this.state.ships.length - 1; i >= 0; i--) {
      if (this.state.ships[i].id===theShip) {
        if ((coordsX+(this.state.ships[i].orientation ? 0 : this.state.ships[i].length - 1)<8) && (coordsX>=0) && (coordsY+(this.state.ships[i].orientation ? this.state.ships[i].length - 1 : 0)<8) && (coordsY>=0)) {
          shadowRestyling['border'] = '1px dotted lime'
          //console.log('noice')
          let collide = false
          for (let ii = this.state.ships.length - 1; ii >= 0; ii--) {
            if ((this.state.ships[ii].status === 1) && (ii !== i)) {
              collide = collide || this.shipPlacementCollisionCheck({
                posx: coordsX,
								posy: coordsY,
								length: this.state.ships[i].length,
								orientation: this.state.ships[i].orientation
              }, this.state.ships[ii])
            }
          }
          if (collide) {
            shadowRestyling['border'] = '1px dotted red'
            //this.setState({shadowBorder: '1px dotted red'})
          }
        } else {
          if ((coordsX>8) || (coordsY>8)) {
            shadowRestyling['border'] = '1px dotted green'
          } else {
            shadowRestyling['border'] = '1px dotted red'
          }
        }
      }
    }

    shadowRestyling['left'] = gridX + 'px'
    shadowRestyling['top'] = gridY + 'px'
    shadowRestyling['width'] = window.getComputedStyle(this.state.tmpele).width
    shadowRestyling['height'] = window.getComputedStyle(this.state.tmpele).height
    this.setState({shadowStyle: shadowRestyling})
  }
  drop = function (ev) {
    ev.preventDefault()

    let finalX = (ev.clientX - document.getElementsByClassName('boardAndPlacer')[0].getBoundingClientRect().left - this.state.dragData['offsX'])
    let finalY = (ev.clientY - document.getElementsByClassName('boardAndPlacer')[0].getBoundingClientRect().top - this.state.dragData['offsY'])

    let floorerX = finalX % this.props.cellSize
    if (floorerX > (this.props.cellSize / 2)) floorerX = - (this.props.cellSize - floorerX)
    let floorerY = finalY % this.props.cellSize
    if (floorerY > (this.props.cellSize / 2)) floorerY = - (this.props.cellSize - floorerY)

    let gridX = (finalX - floorerX)
    let gridY = (finalY - floorerY)
    let coordsX = gridX / this.props.cellSize
    let coordsY = gridY / this.props.cellSize

    let theShip = this.state.tmpele.id
    for (let i = this.state.ships.length - 1; i >= 0; i--) {
      if (this.state.ships[i].id===theShip) {
        if ((coordsX+(this.state.ships[i].orientation ? 0 : this.state.ships[i].length - 1)<8) && (coordsX>=0) && (coordsY+(this.state.ships[i].orientation ? this.state.ships[i].length - 1 : 0)<8) && (coordsY>=0)) {
          let collide = false
          for (let ii = this.state.ships.length - 1; ii >= 0; ii--) {
            if ((this.state.ships[ii].status === 1) && (ii !== i)) {
              collide = collide || this.shipPlacementCollisionCheck({
								posx: coordsX,
								posy: coordsY,
								length: this.state.ships[i].length,
								orientation: this.state.ships[i].orientation
							}, this.state.ships[ii])
            }
          }
          if (!collide) {
            const tmpShips = this.state.ships
            tmpShips[i].status = 1
            tmpShips[i].posx = coordsX
            tmpShips[i].posy = coordsY
            this.setState({ships: tmpShips})
            /*
              here I am changing style of the potentially dynamically 
              rendered div again! Watch me bro
            */
           document.getElementById(theShip).style.left = (coordsX * this.state.cellSize) + 'px'
           document.getElementById(theShip).style.top = (coordsY * this.state.cellSize) + 'px'
           document.getElementById(theShip).classList.add('shipPlaced')
          }
        } else {
          if ((coordsX>8) || (coordsY>8)) {
            const tmpShips = this.state.ships
            tmpShips[i].status = 0
            this.setState({ships: tmpShips})

            document.getElementById(theShip).style.left = gridX + 'px'
           document.getElementById(theShip).style.top = gridY + 'px'
           document.getElementById(theShip).classList.remove('shipPlaced')
          }
        }
      }
    }
    const shadowRestyling = {}
    shadowRestyling['display'] = 'none'
    this.setState({shadowStyle: shadowRestyling})

    this.readyUpdate()
  }

  shipPlacementCollisionCheck = function (dragged, placed) {
    //dragged and placed are both ships from the array
    //first lay out the points to check
    let draggedShip = {}
    draggedShip.Xstart = dragged.posx
    draggedShip.Ystart = dragged.posy
    draggedShip.Xend = dragged.orientation ? dragged.posx : dragged.posx + dragged.length - 1
    draggedShip.Yend = dragged.orientation ? dragged.posy + dragged.length - 1 : dragged.posy
    //console.log('dragged:', draggedShip)
    let placedShip = {}
    placedShip.Xstart = placed.posx
    placedShip.Ystart = placed.posy
    placedShip.Xend = placed.orientation ? placed.posx : placed.posx + placed.length - 1
    placedShip.Yend = placed.orientation ? placed.posy + placed.length - 1 : placed.posy
    //console.log('placed:', placedShip)
    let placedSpace = {
      Xstart: placedShip.Xstart - 1,
      Ystart: placedShip.Ystart - 1,
      Xend: placedShip.Xend + 1,
      Yend: placedShip.Yend + 1,
    }
    //console.log('pSpace:', placedSpace)
    return ((draggedShip.Xstart<=placedSpace.Xend) && 
      (draggedShip.Xend>=placedSpace.Xstart) &&
      (draggedShip.Ystart<=placedSpace.Yend) &&
      (draggedShip.Yend>=placedSpace.Ystart))
  }
  //do this on ship drop
  checkAllShipsPlacementReadyness = () => {
    //check status of each ship
    let ready = true
    for (let index = 0; index < this.state.ships.length; index++) {
      if (this.state.ships[index].status === 0) {
        ready = false
        break
      }
    }
    return  ready
  }
  readyUpdate = () => {
    this.props.onReadyChange(!this.checkAllShipsPlacementReadyness())
  }
  rotateShip = (target) => {
    for (let i = this.state.ships.length - 1; i >= 0; i--) {
      if (this.state.ships[i].id===target.id) {
        const propperOri = !this.state.ships[i].orientation
        //this.state.ships[i].orientation = !this.state.ships[i].orientation
        //dafuq is this, u cant change orientation like this
        const tmpShips = this.state.ships
        tmpShips[i].orientation = propperOri
        this.setState({ships: tmpShips})
        const l = this.state.ships[i].length
        target.classList.toggle(`ship${l}`)
				target.classList.toggle(`ship${l}Rotated`)
        
        //here check on collision and crossing the borders
        let coordsX = this.state.ships[i].posx
        let coordsY = this.state.ships[i].posy
        let dump = false
        if ((coordsX+(propperOri ? 0 : l - 1)<8) && (coordsX>=0) && (coordsY+(propperOri ? l - 1 : 0)<8) && (coordsY>=0)) {
          //inside the board
          for (let ii = this.state.ships.length - 1; ii >= 0; ii--) {
						if ((this.state.ships[ii].status === 1) && (ii !== i)) {
							dump = dump || this.shipPlacementCollisionCheck({
                posx: coordsX,
								posy: coordsY,
								length: l,
								orientation: propperOri
              }, this.state.ships[ii])
						}
		  		}
        } else {
          dump = true
          //is not inside the board
        }
        if (dump) {
          const tmpShips2 = this.state.ships
          tmpShips[i].posx = this.state.ships[i].initPosx
          tmpShips[i].posy = this.state.ships[i].initPosy
          this.setState({ships: tmpShips2})
					target.style.left = this.state.ships[i].initPosx * this.props.cellSize + 'px'
					target.style.top = this.state.ships[i].initPosy * this.props.cellSize + 'px'
					target.classList.remove('shipPlaced')
        }

      }
    }
  }
  prepareShips = params => {
    const listItems = []
    const tmpShips = []
    let tmpKey = 0
    params.forEach((quantity, j) => {
      //console.log('AAA', i)
      for (let i = 0; i < quantity; i++) {
        const tmpId = `ship${(j+1)*(i+1)+Math.random(333)}`
        listItems.push(
          <div key={tmpKey} className={`ship${j+1} img`} id={tmpId} draggable="true" style={{left: (3 + i) * (this.props.cellSize * 4) + 'px', top: j * this.props.cellSize + 'px'}} onClick={e=>{this.rotateShip(e.target)}}>
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
    console.log("lilength:",listItems.length)
    this.setState({ships: tmpShips, shipElements: listItems})
  }
  render() {
    return(
      //Board is going to basically be a background drawing in all this? even hover effects have to be on top of ships in this?
      <div className="partWrapper">
        <h3>Place your ships onto the board</h3>
        <button onClick={this.readyUpdate}>temporary btn - change ready state</button>
        <div className="boardAndPlacer container" onDragStart={ev=>{this.drag(ev)}} onDragOver={ev=>{this.dragOver(ev)}} onDrop={ev=>{this.drop(ev)}}>
          
          <Board className="preBoard" drawObjects={0} cellSize={this.props.cellSize} notclickable={false}/>
          {this.state.shipElements}
          <div className="shadow" style={this.state.shadowStyle}>
          </div>
          
        </div>
      </div>
    )
  }
}