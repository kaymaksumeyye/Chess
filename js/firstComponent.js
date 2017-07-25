import React from 'react'
import ReactDOM from 'react-dom'
require('./game.css')

class Game extends React.Component {
  constructor(){
    super();
    this.t=true;
    this.back=false;
    this.control=true;
    this.activeCharacter;
    this.activeLocation=[];
    this.passMatrix=[];
    this.moveMatrix=[];
    this.endClick={"character":[], "location":[]};
    this.state={chessBoardMatrix:[], piecesMove:[]};
    this.img=null;
    this.color;
    this.ex=1;
    this.schema = {
      "nameChessPieces":[["rook","+"],["knight","-"],["bishop","+"],["queen","+"],["king","-"],["pawn","-"]],
      "imgBlack": [9820, 9822, 9821, 9819, 9818,9821, 9822, 9820, 9823],
      "imgWhite": [9814, 9816, 9815, 9813, 9812, 9815, 9816, 9814, 9817],
      "move":{"pawn":[[1, 0], [2, 0],[-1, 0], [-2, 0]],
              "rook":[[1,0],[-1,0],[0,1],[0,-1]],
              "knight":[[2,-1],[2,1],[-2,-1],[-2,1],[1,2],[1,-2],[-1,2],[-1,-2]],
              "bishop":[[-1,-1],[-1,1],[1,-1],[1,1]],
              "king":[[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]],
              "queen":[[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]]
             }
    };
    this.arrayRender();
  }

  setEx(i){
    if(i%8==0){
      if(this.t==true){
         this.ex=1;
         this.t=false;
      }
      else{
        this.ex=2;
        this.t=true;
      }
    }
  }

  setColor(i){
     this.setEx(i);
     if((this.ex+i)%2==0){
          this.color="brown";
     }
     else
          this.color="pink";
  }

  setImg(imgColor,i,ex,indis1,indis2){
    var array=[this.schema[imgColor][this.schema[imgColor].length-1],this.schema[imgColor][i-ex*7/6]];
    if(i>=ex && i<this.schema[imgColor].length+7+ex){
          if(i>=this.schema[imgColor].length+ex-1){
            this.img=array[indis1];
          }
          else
            this.img=array[indis2];
     }
  }

  arrayRender(){
    var valuesMatrix=[];
    var updatedMatrix=this.state.chessBoardMatrix;
    var json;
      for(var i=0;i<=64;i++){
         if(i%8==0 && i!=0){
           updatedMatrix.push(valuesMatrix);
           valuesMatrix=[];
         }
         this.setColor(i);
         if(i<16)
           this.setImg("imgBlack",i,0,0,1);
         else if(i>=48)
           this.setImg("imgWhite",i,48,1,0);
         else
           this.img=null;
         json={color:this.color,
               border: "1px solid #999",
               character:this.img};
         valuesMatrix.push(json);
     }
    //this.setState({chessBoardMatrix:updatedMatrix});
  }

  findCharacter(){
    var k;
    var t=true;
    var img=this.pieceColor(this.activeCharacter);
    this.schema[img].forEach(function(value,i){
        if(this.activeCharacter==value && t==true){//sorun:k==8 olduğunda
          if(i>this.schema["nameChessPieces"].length-2)
           k= i-3;
          else
            k=i;
           t=false;
        }
    }.bind(this));
    return k;
  }

  pieceColor(character){
    if(character!=null && character>=9818 && character<=9823)
      return "imgBlack";
    else if(character!=null && character>=9812 && character<=9817)
      return "imgWhite";
    else
      return "";

  }

  competitorCharacter(competitor){
    var activeCharacterColor=this.pieceColor(this.activeCharacter);
    var competitorColor=this.pieceColor(competitor);
    if(activeCharacterColor!=competitorColor && competitorColor!="" && activeCharacterColor!="")
      return true;
    else
      return false;
  }

  inDirectionNoCharacter(coordinate){
    for(var i=0;i<this.passMatrix.length;i++){
      if(this.passMatrix[i]==coordinate)
        return false;
    }
    return true;
  }

  tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,coordinate, border,x,y){
    if(this.inDirectionNoCharacter(coordinate)){
      if(border=="3px solid yellow"){
        this.moveMatrix.push([x,y]);
      }
      cell.border=border;
    }
    return cell;
  }

  pawnToTakePiece(direction,resultForOtherCharacters){
    var possibleDirections=[[-1,1],[-1,-1],[1,-1],[1,1]];
    var result=false;
    if(this.isCharacterPawn())
      possibleDirections.forEach(function(value){
        if(value[0]==direction[0] && value[1]==direction[1])
          result=true;
      }.bind(this));
    else
      result=resultForOtherCharacters;
    return result;
  }

  //isMovedSides=gidilebilecekYerlerVeGidilemeyecekYonlerTespiti
  isMovedSides(cell,direction,border,x,y){
    if(cell.character==null && !this.pawnToTakePiece(direction,false)){
      cell=this.tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,direction,border,x,y);
    }
    else if(this.competitorCharacter(cell.character) && this.pawnToTakePiece(direction,true)){
      cell=this.tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,direction,border,x,y);
      this.passMatrix.push(direction);
    }
    else
      this.passMatrix.push(direction);
    return cell;
  }

  addAndRemove(location,ex,characterName,border){
    var coordinatex, coordinatey;
    var updatedMatrix = this.state.chessBoardMatrix;
    for(var i=0; i<this.schema.move[characterName].length;i++){
      coordinatex=location[0]+this.schema.move[characterName][i][0]*ex;
      coordinatey=location[1]+this.schema.move[characterName][i][1]*ex;
      if(coordinatex>=0 && coordinatey>=0 && coordinatex<this.state.chessBoardMatrix.length && coordinatey<this.state.chessBoardMatrix[0].length )
        updatedMatrix[coordinatex][coordinatey]=this.isMovedSides(updatedMatrix[coordinatex][coordinatey],this.schema.move[characterName][i],border,coordinatex,coordinatey);
      this.setState({chessBoardMatrix:updatedMatrix});
    }
  }

  reverse(location,endCharacter,border){
    var ex=1;
    this.passMatrix=[];
    this.moveMatrix=[];
    do{
      this.addAndRemove(location,ex,endCharacter[0],border);
      ex++;
    }while(endCharacter[1]=="+" && ex< this.state.chessBoardMatrix.length);
  }

  setPiecesMove(coordinate){
    var move=this.state.piecesMove;
    move.push([coordinate,this.endClick.location]);
    this.setState({piecesMove:move});
  }
  move(x,y){
    var updatedMatrix = this.state.chessBoardMatrix;
    this.setPiecesMove([x,y]);
    this.reverse(this.endClick.location, this.endClick.character[0],"1px solid #999");
    updatedMatrix[x][y].character=this.endClick.character[1];
    updatedMatrix[this.endClick.location[0]][this.endClick.location[1]].character=null;

    //this.setState({chessBoardMatrix:updatedMatrix});
  }

  controlPawn(imgName,coordinateX){
    if(imgName == "imgBlack"){
      if(coordinateX != 1)
        return true;
    }
    else{
      if(coordinateX != 6)
        return true;
    }
    return false;
  }

  moveableLocation(x,y){
    for(var i=0;i<this.moveMatrix.length;i++){
      if(this.moveMatrix[i][0]==x && this.moveMatrix[i][1]==y){
        return true;
      }
    }
    return false;
  }

  isCharacterPawn(){
    if(this.activeCharacter == 9817 || this.activeCharacter == 9823)
      return true;
    else
      return false;
  }

  getPawnMoveDirection(imgName){
    if(imgName == "imgWhite")
      return [[-1,0],[-1,-1],[-1,1]];
    else
      return [[1,0],[1,-1],[1,1]];
  }

  getPawnFirstMoveDirection(imgName){
    if(imgName == "imgWhite")
      return [[-1,0],[-2,0],[-1,-1],[-1,1]];
    else
      return [[1,0],[2,0],[1,-1],[1,1]];
  }
  //pyonun hareket yönleri schemaya set edilmesi
  setSchemaPawnMoveDirection(x,character){
    var imgName = this.pieceColor(character);
    if(this.controlPawn(imgName,x))
      this.schema.move.pawn=this.getPawnMoveDirection(imgName);
    else
      this.schema.move.pawn=this.getPawnFirstMoveDirection(imgName);
  }

  setEndClickCharacterAndLocation(k,coordinate){
    this.endClick.character=[this.schema["nameChessPieces"][k],this.activeCharacter];
    this.endClick.location=coordinate;
  }

  callReverseMethod(location,k){//düzelte yapılması gerek
    if(this.endClick.location[0] != location[0] || this.endClick.location[1] != location[1] || this.back){
      if(this.endClick.location[0] != null){
        this.setSchemaPawnMoveDirection(this.endClick.location[0],this.endClick.character[1]);
        this.reverse(this.endClick.location, this.endClick.character[0], "1px solid #999");
        this.setSchemaPawnMoveDirection(location[0],this.activeCharacter);
      }
      this.reverse(location, this.schema["nameChessPieces"][k], "3px solid yellow");
      this.back=false;
    }
    else{
      this.back=true;
      this.reverse(this.endClick.location, this.endClick.character[0], "1px solid #999");
    }
  }

  handleClick(x,y){
    var k;
    this.activeLocation=[x,y];
    if(this.moveableLocation(x,y)){
      this.move(x,y);
    }
    else{
      this.activeCharacter=this.state.chessBoardMatrix[x][y].character;
      if(this.activeCharacter!=null){
        k=this.findCharacter();
        if(this.isCharacterPawn())
          this.setSchemaPawnMoveDirection(x,this.activeCharacter);
        this.callReverseMethod([x,y],k);
        this.setEndClickCharacterAndLocation(k,[x,y]);
      }
    }
  }

  drawPiecesMove(){
    const columns=['a','b','c','d','e','f','g','h'];
    return this.state.piecesMove.map(function(newAndOldCoordinate,indis){
      return <div>{indis+1}.  {columns[newAndOldCoordinate[1][1]]}{newAndOldCoordinate[1][0]+1}    -----    {columns[newAndOldCoordinate[0][1]]}{newAndOldCoordinate[0][0]+1}
      </div>
    });
  }

  drawChessBoard(){
    var boards=this.state.chessBoardMatrix.map(function(sq,i){
       return sq.map(function(s,j){
        if(s.character!=null)
           return <button className="square" onClick={(x,y)=>this.handleClick(i,j)} style = {{backgroundColor: s.color,border:s.border}}>{String.fromCharCode(s.character)}
              </button>
         else
           return <button className="square" onClick={(x,y)=>this.handleClick(i,j)} style = {{backgroundColor: s.color, border:s.border}}>
               </button>
       }.bind(this));
     }.bind(this));
    return boards.map(function(tmp,indis){
      return  <div className="board-row"> {tmp} <div className="chess-board">  {indis+1} </div> </div>

    });
  }

  columnPrintScreen(){
    const columns=['A','B','C','D','E','F','G','H'];
    return columns.map(function(value){
      return <div className="chess-board"> {value}
      </div>
    });
  }

  render(){
    return <div>
            <div className="chess-board">
              {this.drawChessBoard()}
              {this.columnPrintScreen()}
            </div>
              <h1> YOU MOVE </h1>
            <div className="colored-pieces">
              {this.drawPiecesMove()}
            </div>
          </div>
  }
}
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
