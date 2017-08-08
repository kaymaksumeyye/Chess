import React from 'react'
import ReactDOM from 'react-dom'
import ReactScrollbar from 'react-scrollbar-js'
import ChessBoard from './ChessBoard'
import io from 'socket.io-client'
require('../css/game.css');

class Game extends React.Component {
  constructor() {
    super();
    this.t = true;
    this.back = false;
    this.activeCharacter;
    this.activeLocation = [];
    this.passMatrix = [];
    this.moveMatrix = [];
    this.endClick = {"character": [], "location": [], "move": []};
    this.state = {"chessBoardMatrix": [], "piecesMove": []};
    this.img = null;
    this.color;
    this.ex = 1;
    this.schema = {
      "nameChessPieces": [["rook", "+"],["knight", "-"],["bishop", "+"],["queen", "+"],["king", "-"],["pawn", "-"]],
      "imgBlack": [9820, 9822, 9821, 9819, 9818,9821, 9822, 9820, 9823],
      "imgWhite": [9814, 9816, 9815, 9813, 9812, 9815, 9816, 9814, 9817],
      "move": { "pawn": [[1, 0], [2, 0], [-1, 0], [-2, 0]],
                "rook": [[1, 0], [-1, 0], [0, 1], [0, -1]],
                "knight": [[2, -1], [2, 1], [-2, -1], [-2, 1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
                "bishop": [[-1, -1], [-1, 1], [1, -1], [1, 1]],
                "king": [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]],
                "queen": [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]]
              }
    };
    this.arrayRender();
  }

  componentDidMount () {
    this.socket = io('/');
    this.socket.on('message', message => {
      this.setState({ chessBoardMatrix: message })
    })
  }

  setEx(i) {
    if(i % 8 == 0) {
      if(this.t == true) {
         this.ex = 1;
         this.t = false;
      }
      else {
        this.ex = 2;
        this.t = true;
      }
    }
  }

  setColor(i) {
     this.setEx(i);
     if((this.ex + i) % 2 == 0)
          this.color = "brown";
     else
          this.color = "pink";
  }

  setImg(imgColor,i,ex,indis1,indis2) {
    var array = [this.schema[imgColor][this.schema[imgColor].length-1], this.schema[imgColor][i - ex * 7/6]];
    if(i >= ex && i < this.schema[imgColor].length + 7 + ex){
          if(i >= this.schema[imgColor].length + ex - 1)
            this.img = array[indis1];
          else
            this.img = array[indis2];
     }
  }

  arrayRender() {
    var valuesMatrix = [];
    var updatedMatrix = this.state.chessBoardMatrix;
    var json;
      for(var i = 0; i <= 64; i++) {
         if(i % 8 == 0 && i != 0) {
           updatedMatrix.push(valuesMatrix);
           valuesMatrix = [];
         }
         this.setColor(i);
         if(i < 16)
           this.setImg("imgBlack", i, 0, 0, 1);
         else if(i >= 48)
           this.setImg("imgWhite", i, 48, 1, 0);
         else
           this.img = null;
         json = {color: this.color,
                 border: "1px solid #999",
                 character: this.img };
         valuesMatrix.push(json);
     }
    //this.setState({chessBoardMatrix:updatedMatrix});
  }

  findCharacter() {
    var k;
    var t = true;
    var img = this.pieceColor(this.activeCharacter);
    this.schema[img].forEach(function(value, i) {
        if(this.activeCharacter == value && t == true) {//sorun:k==8 olduğunda
          if(i > this.schema["nameChessPieces"].length - 2)
           k = i-3;
          else
            k = i;
          t = false;
        }
    }.bind(this));
    return k;
  }

  pieceColor(character) {
    if(character != null && character >= 9818 && character <= 9823)
      return "imgBlack";
    else if(character != null && character >= 9812 && character <= 9817)
      return "imgWhite";
    else
      return "";
  }

  competitorCharacter(competitor) {
    var competitorColor = this.pieceColor(competitor);
    var activeCharacterColor = this.pieceColor(this.activeCharacter);
    if(activeCharacterColor != competitorColor && competitorColor != "" && activeCharacterColor != "")
      return true;
    else
      return false;
  }

  inDirectionNoCharacter(coordinate) {
    for(var i = 0; i < this.passMatrix.length; i++) {
      if(this.passMatrix[i] == coordinate)
        return false;
    }
    return true;
  }

  setMoveMatrix(direction, coordinate) {
    if(this.inDirectionNoCharacter(direction)) {
        this.moveMatrix.push(coordinate);
    }
  }

  pawnToTakePiece(direction, resultForOtherCharacters){
    var result = false;
    var possibleDirections = [[-1, 1], [-1, -1], [1, -1], [1, 1]];
    if(this.isCharacterPawn(this.activeCharacter))
      possibleDirections.forEach(function(value) {
        if(value[0] == direction[0] && value[1] == direction[1])
          result = true;
      }.bind(this));
    else
      result = resultForOtherCharacters;
    return result;
  }

  callSetMoveMatrixMethod(cell, direction, coordinate){
    if(cell.character == null && !this.pawnToTakePiece(direction, false)) {
      this.setMoveMatrix(direction, coordinate);
    }
    else if(this.competitorCharacter(cell.character) && this.pawnToTakePiece(direction, true)) {
      this.setMoveMatrix(direction, coordinate);
      this.passMatrix.push(direction);
    }
    else
      this.passMatrix.push(direction);
  }

  addAndRemove(location, ex, characterName) {
    var coordinatex, coordinatey;
    for(var i = 0; i < this.schema.move[characterName].length; i++) {
      coordinatex = location[0] + this.schema.move[characterName][i][0] * ex;
      coordinatey = location[1] + this.schema.move[characterName][i][1] * ex;
      if(coordinatex >= 0 && coordinatey >= 0 && coordinatex < this.state.chessBoardMatrix.length && coordinatey < this.state.chessBoardMatrix[0].length )
        this.callSetMoveMatrixMethod(this.state.chessBoardMatrix[coordinatex][coordinatey], this.schema.move[characterName][i], [coordinatex, coordinatey]);
    }
  }

  reverse(location, endCharacter) {
    var ex = 1;
    this.passMatrix = [];
    this.moveMatrix = [];
    do {
      this.addAndRemove(location, ex, endCharacter[0]);
      ex++;
    } while(endCharacter[1] == "+" && ex < this.state.chessBoardMatrix.length);
  }

  //karakter hareket ettikten sonra karakterin döndürülmesi veya karakter piyon ise ve karşı takımın son karesine ulaştı ise piyon artık vezir olmalıdır.
  promotePaw(coordinate) {
    var character = this.endClick.character[1];
    if(this.isCharacterPawn(this.endClick.character[1])) {
      if(coordinate[0] == 0 || coordinate[0] == 7) {
        if(this.pieceColor(this.endClick.character[1]) == "imgBlack")
          character = 9819;
        else
            character = 9813;
      }
    }
    return character;
  }

  setPiecesMove(coordinate) {
    var move = this.state.piecesMove;
    move.push([coordinate, this.endClick.location]);
    this.setState({piecesMove: move});
  }

  move(x, y){
    this.setPiecesMove([x, y]);
    var updatedMatrix = this.state.chessBoardMatrix;
    this.setBorderColor(this.moveMatrix, "1px solid #999");
    updatedMatrix[x][y].character = this.promotePaw([x,y]);
    updatedMatrix[this.endClick.location[0]][this.endClick.location[1]].character = null;
    this.setState({chessBoardMatrix: updatedMatrix});
  }

  controlPawn(imgName,coordinateX) {
    if(imgName == "imgBlack") {
      if(coordinateX != 1)
        return true;
    }
    else {
      if(coordinateX != 6)
        return true;
    }
    return false;
  }

  moveableLocation(location) {
    var result =false;
    this.moveMatrix.forEach( (value) => {
      if(value[0] == location[0] && value[1] == location[1])
        result = true;
    })
    return result;
  }

  isCharacterPawn(character) {
    if(character == 9817 || character == 9823)
      return true;
    else
      return false;
  }

  getPawnMoveDirection(imgName) {
    if(imgName == "imgWhite")
      return [[-1,0], [-1,-1], [-1,1]];
    else
      return [[1,0], [1,-1], [1,1]];
  }

  getPawnFirstMoveDirection(imgName) {
    if(imgName == "imgWhite")
      return [[-1,0], [-2,0], [-1,-1], [-1,1]];
    else
      return [[1,0], [2,0], [1,-1], [1,1]];
  }

  //pyonun hareket yönleri schemaya set edilmesi
  setSchemaPawnMoveDirection(x, character) {
    var imgName = this.pieceColor(character);
    if(this.controlPawn(imgName, x))
      this.schema.move.pawn = this.getPawnMoveDirection(imgName);
    else
      this.schema.move.pawn = this.getPawnFirstMoveDirection(imgName);
  }

  setEndClickCharacterAndLocation(k, coordinate) {
    this.endClick.character = [this.schema["nameChessPieces"][k], this.activeCharacter];
    this.endClick.location = coordinate;
    this.endClick.move = this.moveMatrix;
  }

  callReverseMethod(location, k) {
    this.reverse(location, this.schema["nameChessPieces"][k]);
    if(this.endClick.location[0] != location[0] || this.endClick.location[1] != location[1] || this.back){
      this.setBorderColor(this.endClick.move, "1px solid #999")
      this.setBorderColor(this.moveMatrix, "3px solid yellow");
      this.back = false;
    }
    else {
      this.back = true;
      this.setBorderColor(this.moveMatrix, "1px solid #999");
    }
  }

  setBorderColor(moveMatrix, border) {
    var updatedMatrix = this.state.chessBoardMatrix;
    for ( var i = 0; i < moveMatrix.length; i++) {
       updatedMatrix[moveMatrix[i][0]][moveMatrix[i][1]].border=border;
    }
    this.setState({chessBoardMatrix: updatedMatrix});
  }

  handleClick(x, y) {
    var k;
    this.activeLocation = [x, y];
    if(this.moveableLocation([x, y])) {
      this.move(x, y);
      this.moveMatrix = [];
    }
    else {
      this.activeCharacter = this.state.chessBoardMatrix[x][y].character;
      if(this.activeCharacter != null) {
        k = this.findCharacter();
        if(this.isCharacterPawn(this.activeCharacter))
          this.setSchemaPawnMoveDirection(x, this.activeCharacter);
        this.callReverseMethod([x, y], k);
        this.setEndClickCharacterAndLocation(k, [x, y]);
      }
    }
    this.socket.emit('message', this.state.chessBoardMatrix);
  }

  drawPiecesMove() {
    const columns = ['a','b','c','d','e','f','g','h'];
    return this.state.piecesMove.map(function(newAndOldCoordinate, indis) {
      return <div>
        <div>
          {indis+1}. {columns[newAndOldCoordinate[1][1]]}{newAndOldCoordinate[1][0] + 1}    ___    {columns[newAndOldCoordinate[0][1]]}{newAndOldCoordinate[0][0] + 1}
        </div>
      </div>
    });
  }

  render() {
    const myScrollbar = {
      width: 200,
      height: 300,
    };
    return <div>
            <ChessBoard chessBoardMatrix = {this.state.chessBoardMatrix} onClick = {(x,y) => this.handleClick(x,y)} />
            <div className = "colored-pieces">
            <h1> YOU MOVE </h1>
              <ReactScrollbar style = {myScrollbar}>
                <div className = "should-have-a-children scroll-me move">
                  {this.drawPiecesMove()}
                </div>
              </ReactScrollbar>
            </div>
          </div>
    }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

export default Game;
