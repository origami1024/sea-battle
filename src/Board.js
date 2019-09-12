import React, { Component } from 'react'
import ship1 from './ship1.png'
import ship1r from './ship1Rotated.png'
import ship2 from './ship2.png'
import ship2r from './ship2Rotated.png'
import ship3 from './ship3.png'
import ship3r from './ship3Rotated.png'
import ship4 from './ship4.png'
import ship4r from './ship4Rotated.png'


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
      hitMarks: [
        {x:0,
          y:0}
      ],
      selectedCell: null,
      ctx: null
    }
  }

  drawBoard = (w, h, cSize, ctx, ix=0, iy=0, color="lightblue", textColor="black") => {
    ctx.fillStyle = color
    ctx.strokeStyle = "gray"
    ctx.lineWidth = 2
    ctx.fillRect(0,0,(w+1)*cSize,(h+1)*cSize)
    for (let x = 0; x < w; x++) { 
      for (let y = 0; y < h; y++) {
        ctx.strokeRect(ix + x*cSize, iy + y*cSize,cSize, cSize)
      }   
    }
    ctx.lineWidth = 1
    ctx.font = "16px Arial"
    let letters = 'abcdefghij'
    for (let x = 0; x < w; x++) {
      ctx.strokeStyle = textColor
      ctx.strokeText(letters[x], (x+0.25)*cSize, (h+0.75)*cSize)
    }
    for (let y = 0; y < h; y++) {
      ctx.strokeStyle = textColor
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
      if ((cellX<this.state.w) && (cellY<this.state.h)) {
        this.setState({selectedCell: [cellX, cellY]})
      }
      this.props.onHit([cellX, cellY])
    }
  }
  drawShips = ctx => {
    //console.log('DRAWING SHIPS IN BOARD!')
    this.props.ships.forEach(shp => {
      /*console.log('ship:' + shp.id)
      ctx.strokeStyle = "black"
      ctx.strokeText(shp.id, shp.posx*this.props.cellSize, shp.posy*this.props.cellSize)*/
      let ori = shp.orientation ? 0 : 1
      ctx.drawImage(shp.orientation? this.state.imagesR[`img${shp.length}`]: this.state.images[`img${shp.length}`], shp.posx*this.props.cellSize, shp.posy*this.props.cellSize, this.props.cellSize + this.props.cellSize*((shp.length - 1)*ori), this.props.cellSize + this.props.cellSize*((shp.length - 1)*(1 - ori)))
    })
  }
  drawHits = ctx => {
    this.props.hits.forEach(hit => {
      ctx.strokeStyle = "red"
      ctx.lineWidth = 9
      ctx.beginPath()
      ctx.moveTo(hit.x * this.props.cellSize, hit.y * this.props.cellSize)
      ctx.lineTo(this.props.cellSize + hit.x * this.props.cellSize, this.props.cellSize + hit.y * this.props.cellSize)
      ctx.moveTo(this.props.cellSize + hit.x * this.props.cellSize, hit.y * this.props.cellSize)
      ctx.lineTo(hit.x * this.props.cellSize, this.props.cellSize + hit.y * this.props.cellSize)
      ctx.stroke()
      ctx.lineWidth = 3
    })
  }
  drawSelected = (ctx, selected) => {
    if (selected != null) {
      ctx.strokeStyle = "orange"
      ctx.strokeRect(selected[0] * this.props.cellSize, selected[1] * this.props.cellSize, this.props.cellSize, this.props.cellSize)
      ctx.strokeStyle = "gray"
    }
  }
  drawAll = e => {
    if (this.img){
      this.drawBoard(this.state.w, this.state.h, this.props.cellSize, this.state.ctx, 0, 0, this.props.color, this.props.textColor)
      if (this.props.drawShips) {
        this.drawShips(this.state.ctx)
      }
      if (this.props.drawHits) {
        this.drawHits(this.state.ctx)
      }
      this.drawSelected(this.state.ctx, this.state.selectedCell || null)
    }
  }
  componentDidMount() {
    //console.log('Board compDidMount')
    const canvas = this.refs.canvas
    this.img = new Image();
    this.img.src = ship1
    this.setState({ctx: canvas.getContext("2d")} )
    //this.img.onload = this.drawAll

    let img1 = new Image();
    img1.src = ship1
    let img1r = new Image();
    img1r.src = ship1r
    let img2 = new Image();
    img2.src = ship2
    let img2r = new Image();
    img2r.src = ship2r

    let img3 = new Image();
    img3.src = ship3
    let img3r = new Image();
    img3r.src = ship3r
    let img4 = new Image();
    img4.src = ship4
    let img4r = new Image();
    img4r.src = ship4r

    const images = {
      img1 : img1,
      img2 : img2,
      img3 : img3,
      img4 : img4
    }
    const imagesR = {
      img1: img1r,
      img2: img2r,
      img3: img3r,
      img4: img4r
    }
    img4r.onload = this.drawAll
    this.setState({images, imagesR})
    //this.setState({img: this.refs.image})
  }
  componentWillMount() {
    
  }
  componentDidUpdate() {
    this.drawAll()
  }
  render() {
    //console.log('board rendered')
    return(
      <canvas ref="canvas" width={(this.state.w+1)*this.props.cellSize} height={(this.state.h+1)*this.props.cellSize} onClick={this.onClick} style={{cursor: "pointer"}}/>
    )
  }
}