import React from 'react'

class ChessBoard extends React.Component {

  renderColumns(chessBoardMatrix, onClick) {
    return chessBoardMatrix.map(function(sq, i){
       return sq.map(function(s,j){
        if(s.character != null)
           return <button className = "square" onClick = {() => onClick(i,j)} style = {{backgroundColor: s.color,border:s.border}}>{String.fromCharCode(s.character)}
              </button>
         else
           return <button className = "square" onClick = {() => onClick(i,j)} style = {{backgroundColor: s.color, border:s.border}}>
               </button>
       }.bind(this));
    }.bind(this));
  }

  renderBoard(columns) {
    return columns.map(function(tmp, indis){
      return  <div className = "board-row"> {tmp}
                <div className = "chess-board">  {indis+1}
                </div>
              </div>
    }.bind(this));
  }

  drawChessBoard(){
    var columns = this.renderColumns(this.props.chessBoardMatrix, this.props.onClick);
    var board = this.renderBoard(columns);

    return <div>
            {board}
            {this.columnPrintScreen()}
           </div>
  }

  columnPrintScreen() {
    const columns = ['A','B','C','D','E','F','G','H'];
    return columns.map(function(value){
      return <div className = "chess-board"> {value}
      </div>
    });
  }

  render(){
    return <div className = "chess-board">
            {this.drawChessBoard()}
           </div>
  }
}
module.exports = ChessBoard;
