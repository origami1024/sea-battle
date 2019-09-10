import React, { Component } from 'react'
import Board from './Board'
import './piecePositioningPart.css';


/* 
ideas:
  1. random place all ships feature
  2. races, like: pirates - 5x1 ships; normal; orcs - 3 ships 3x3

*/
export default class PiecePositioningPart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ships: [],
      dragData: {
        'offsX': 0,
        'offsY': 0
      },
      params: this.props.params, //starting quantities of each size ship, for example [4,3,2,1]
      shipElements: [],
      tmpele: undefined,
      shadowBorder: '1px dotted black',
      shadowStyle: {
        border: '1px dotted black',
        left: 0,
        width: this.props.cellSize,
        height: this.props.cellSize,
        display: 'none'
      }
    }
  }
  componentDidMount() {
    this.prepareShips(this.props.params)
  }


  randomPlacement = () => {
    alert('this doesnt work yet')
    /* does not fuken work :( 
    const tmpShips = this.state.ships

    this.setState({ships: tmpShips})

    for (let i = 0; i < tmpShips.length; i++) {
      const theShip = tmpShips[i];
      document.getElementById(theShip.id).style.left = theShip.posx * this.props.cellSize + 'px'
      document.getElementById(theShip.id).style.top = theShip.posx * this.props.cellSize + 'px'
      document.getElementById(theShip.id).classList.add('shipPlaced')
      if (theShip.orientation === 1) {
        document.getElementById(theShip.id).classList.add(`ship${theShip.length}Rotated`)
        document.getElementById(theShip.id).classList.remove(`ship${theShip.length}`)
      }
      else {
        document.getElementById(theShip.id).classList.remove(`ship${theShip.length}Rotated`)
        document.getElementById(theShip.id).classList.add(`ship${theShip.length}`)
      }
    }
    this.readyUpdate()
    */
  }

  drag = function (ev) {
    ev.dataTransfer.setData('text/plain', 'anything')//withotu this firefox doesnt do dragNdrop
    if((ev.target) && (ev.target.classList.contains('img'))) {
      console.log('inside')
      var rect = ev.target.getBoundingClientRect()
      let dragData = {
        'offsX': ev.clientX - rect.left,
        'offsY': ev.clientY - rect.top
      }
      //document.getElementsByClassName('shadow')[0].style.display = 'block'
      //console.log(document.getElementsByClassName('shadow')[0].style.display)
      //let tmpShadowStyle = {...this.state.shadowStyle, display: 'block'}
      this.setState({
        dragData,
        tmpele: ev.target//,
        //shadowStyle: {display: tmpShadowStyle}
      })
    } else ev.preventDefault()
  }
  dragOver = function(ev) {
    ev.preventDefault()
    //console.log(ev.target)
    if (this.state.tmpele !== undefined) {
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
      
      const shadowRestyling = {display: 'block'}

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
    
  }
  drop = function (ev) {
    ev.preventDefault()
    //console.log(ev.target)
    if (this.state.tmpele !== undefined) {
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
            document.getElementById(theShip).style.left = (coordsX * this.props.cellSize) + 'px'
            document.getElementById(theShip).style.top = (coordsY * this.props.cellSize) + 'px'
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
      this.setState({shadowStyle: shadowRestyling, tmpele: undefined})
      this.readyUpdate()
    }
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
    //console.log(JSON.stringify(this.state.ships))
    this.props.onReadyChange(!this.checkAllShipsPlacementReadyness(), this.state.ships)
  }
  rotateShip = (target) => {
    if (!this.props.piecesLocked) { //on ready - no pieces movement
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
    
  }
  prepareShips = params => {
    const listItems = []
    const tmpShips = []
    let tmpKey = 0
    params.forEach((quantity, j) => {
      //console.log('AAA', i)
      for (let i = 0; i < quantity; i++) {
        const tmpId = `ship${(j+1)}_${(i+1)}_${Math.floor(Math.random()*3333)}`
        listItems.push(<div key={tmpKey} className={`ship${j+1} img`} id={tmpId} draggable="true" style={{left: (3 + i) * (this.props.cellSize * 4) + 'px', top: j * this.props.cellSize + 'px'}} onClick={e=>{this.rotateShip(e.target)}}></div>)
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
        <div className="list-group-item bg-dark text-white position-relative px-0 py-2">
          <h3 className="m-0 p-0" style={{fontSize:'14px'}}>Drag &#38; drop your ships onto the board</h3>
          <button style={{position: 'absolute', top: '5px', right: '5px'}}onClick={this.randomPlacement}>Random!</button>
        </div>
        <div className="boardAndPlacer container" onDragStart={this.props.piecesLocked ? ()=>{} : ev=>{this.drag(ev)}}  onDragOver={this.props.piecesLocked ? ()=>{} : ev=>{this.dragOver(ev)}} onDrop={this.props.piecesLocked ? ()=>{} : ev=>{this.drop(ev)}}>
          <Board className="preBoard" drawObjects={0} cellSize={this.props.cellSize} notclickable={false}/>
          {this.state.shipElements}
          <div className="shadow" style={this.state.shadowStyle}>
          </div>
          
        </div>
      </div>
    )
  }
}