import React, { Component } from 'react';
import ship1 from './ship1.png';

export default class Canvas extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: 8,
      h: 8,
      cellSize: this.props.cellSize,
      objects: [
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
      selectedCell: null,
      ctx: null
    }
  }

  drawBoard = (w, h, cSize, ctx, ix=0, iy=0, color="lightblue", selected=null) => {
    ctx.fillStyle = color
    ctx.strokeStyle = "gray"
    ctx.fillRect(0,0,w*cSize,h*cSize)
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
  }

  onClick = e => {
    //calculate cell coordinates where the click happened
    if (!this.props.notclickable) {
      let localX = e.pageX - e.target.offsetLeft
      let localY = e.pageY - e.target.offsetTop
      let cellX = ~~(localX / this.state.cellSize)
      let cellY = ~~(localY / this.state.cellSize)
      this.setState({selectedCell: [cellX, cellY]})
    }
    
  }
  drawShips = e => {
    if (this.img){
      this.drawBoard(this.state.w, this.state.h, this.state.cellSize, this.state.ctx, 0, 0, this.props.color, this.state.selectedCell)
      if (this.props.drawObjects) {
        this.state.objects.forEach( obj =>
          this.state.ctx.drawImage(this.img, obj.x*this.state.cellSize, obj.y*this.state.cellSize, this.state.cellSize + this.state.cellSize*(obj.size*obj.ori), this.state.cellSize + this.state.cellSize*(obj.size*(1 - obj.ori)))
        )
      }
    }
  }
  componentDidMount() {
    console.log('compDidMount')
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
    console.log('rendered')
    return(
      <div style={{border: "1px solid black", display: "inline-block", padding: "5px 0", width: '400px'}}>
        <canvas ref="canvas" width={this.state.w*this.state.cellSize} height={this.state.h*this.state.cellSize} onClick={this.onClick} />
        
      </div>
    )
  }
}