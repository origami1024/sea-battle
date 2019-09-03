import React, { Component } from 'react';
import ship1 from './ship1.png';

/*
  what should be the board component
  1. draw the canvas of the board itself
  2. draw the numbers and letters to mark the lines and rows
  3. animation on mouse move - crossing line on line - can be turned on/off for some boards

  4. canvas ships in the battle?
  5. canvas hit marks
  6. animation of hit

  ships should be handled in separate component at the point of placement

*/


export default class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: 8,
      h: 8,
      ships: [
        {
          size: 4,
          x: 3,
          y: 0,
          ori: 0
        },
        {
          size: 3,
          x: 1,
          y: 6,
          ori: 1
        },
        {
          size: 2,
          x: 6,
          y: 4,
          ori: 1
        }
      ],
      hitMarks: [
        {x:0,
          y:0}
      ],
      selectedCell: null,
      ctx: null
    }
  }

  drawBoard = (w, h, cSize, ctx, ix=0, iy=0, color="lightblue", selected=null) => {
    ctx.fillStyle = color
    ctx.strokeStyle = "gray"
    ctx.fillRect(0,0,(w+1)*cSize,(h+1)*cSize)
    for (let x = 0; x < w; x++) { 
      for (let y = 0; y < h; y++) {
        if ((selected !== null) && (x === selected[0]) && (y === selected[1])) {
          ctx.strokeStyle = "red"
          ctx.strokeRect(ix + x*cSize, iy + y*cSize,cSize, cSize)
          ctx.strokeStyle = "gray"
        } else {
          ctx.strokeRect(ix + x*cSize, iy + y*cSize,cSize, cSize)
        }
      }   
    }
    let letters = 'abcdefghij'
    for (let x = 0; x < w; x++) {
      ctx.strokeStyle = "black"
      ctx.strokeText(letters[x], (x+0.25)*cSize, (h+0.75)*cSize)
    }
    for (let y = 0; y < h; y++) {
      ctx.strokeStyle = "black"
      ctx.strokeText(y, (w+0.5)*cSize, (y+0.75)*cSize)
    }
  }

  onClick = e => {
    //calculate cell coordinates where the click happened
    if (!this.props.notclickable) {
      let localX = e.pageX - e.target.offsetLeft
      let localY = e.pageY - e.target.offsetTop
      let cellX = ~~(localX / this.props.cellSize)
      let cellY = ~~(localY / this.props.cellSize)
      this.setState({selectedCell: [cellX, cellY]})
    }
    
  }
  drawShips = e => {
    if (this.img){
      this.drawBoard(this.state.w, this.state.h, this.props.cellSize, this.state.ctx, 0, 0, this.props.color, this.state.selectedCell)
      if (this.props.drawObjects) {
        this.state.ships.forEach( obj =>
          this.state.ctx.drawImage(this.img, obj.x*this.props.cellSize, obj.y*this.props.cellSize, this.props.cellSize + this.props.cellSize*(obj.size*obj.ori), this.props.cellSize + this.props.cellSize*(obj.size*(1 - obj.ori)))
        )
      }
    }
  }
  componentDidMount() {
    //console.log('Board compDidMount')
    const canvas = this.refs.canvas
    this.img = new Image();
    this.img.src = ship1
    this.setState({ctx: canvas.getContext("2d")} )
    this.img.onload = this.drawShips
    //this.setState({img: this.refs.image})
  }
  componentWillMount() {
    
  }
  componentDidUpdate() {
    this.drawShips()
  }
  render() {
    console.log('board rendered')
    return(
      <canvas ref="canvas" width={(this.state.w+1)*this.props.cellSize} height={(this.state.h+1)*this.props.cellSize} onClick={this.onClick} />
    )
  }
}