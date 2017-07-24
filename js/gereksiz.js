import React from 'react'
import ReactDOM from 'react-dom'
require('./game.css')

class Game extends React.Component {
  constructor(){
    super();
    this.t=true;
    this.back=false;
    this.activeCharacter;
    this.activeLocation=[];
    this.passMatrix=[];
    this.moveMatrix=[];
    this.endClick={"character":[], "location":[]};
    this.state={matrix:[], lostPieces:[]};
    this.img=null;
    this.color;
    this.ex=1;
    this.schema = {
      "nameChessPieces":[["rook","+"],["knight","-"],["bishop","+"],["queen","+"],["king","-"],["pawn","-"]],
      "imgBlack": [9820, 9822, 9821, 9819, 9818,9821, 9822, 9820, 9823],
      "imgWhite": [9814, 9816, 9815, 9812, 9813, 9815, 9816, 9814, 9817],
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
          this.color="pink";
     }
     else
          this.color="brown";
  }

  setImg(imgColor,i,ex,indis1,indis2){
    var array=[this.schema[imgColor][this.schema[imgColor].length-1],this.schema[imgColor][i-ex*7/6]];
    if(i>=ex && i < this.schema[imgColor].length+7+ex){
          if(i>=this.schema[imgColor].length+ex-1){
            this.img=array[indis1];
          }
          else
            this.img=array[indis2];
     }
  }

  arrayRender(){
    var valuesMatrix=[];
    var updatedMatrix = this.state.matrix;
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
    //this.setState({matrix:updatedMatrix});
  }

  findCharacter(){
    var k;
    var t=true;
    var img=pieceColor(this.activeCharacter);
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
    if(character>=9818 && character<=9823)
      return "imgWhite";
    else
      return "imgBlack";
  }

  competitorCharacter(competitor){
    if(this.pieceColor(this.activeCharacter) != this.pieceColor(competitor)){
      return true;
    }
    else{
      return false;
    }
  }

  characterNull(coordinate){
    var pass=true;
    for(var i=0;i<this.passMatrix.length;i++){
      if(this.passMatrix[i]==coordinate)
        pass=false;
    }
    return pass;
  }

  tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,coordinate, border,x,y){
    if(this.characterNull(coordinate)){
      if(border=="3px solid yellow"){
        this.moveMatrix.push([x,y]);
      }
      cell.border=border;
    }
    return cell;
  }

  //isMovedSides=gidilebilecekYerlerVeGidilemeyecekYonlerTespiti
  isMovedSides(cell,direction,border,x,y){
    if(cell.character==null){
      cell=this.tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,direction,border,x,y);
    }
    else if(this.competitorCharacter(cell.character)){
      cell=this.tasinGidebilecegiKonumlariToplaVeBorderAtamasi(cell,direction,border,x,y);
      this.passMatrix.push(direction);
    }
    else
      this.passMatrix.push(direction);
    return cell;
  }

  addAndRemove(x,y,ex,characterName,border){
    var coordinatex, coordinatey;
    var updatedMatrix = this.state.matrix;
    for(var i=0; i<this.schema.move[characterName].length;i++){
      coordinatex=x+this.schema.move[characterName][i][0]*ex;
      coordinatey=y+this.schema.move[characterName][i][1]*ex;
      if(coordinatex>=0 && coordinatey>=0 && coordinatex<this.state.matrix.length && coordinatey<this.state.matrix[0].length )
        updatedMatrix[coordinatex][coordinatey]=this.isMovedSides(updatedMatrix[coordinatex][coordinatey],this.schema.move[characterName][i],border,coordinatex,coordinatey);
      this.setState({matrix:updatedMatrix});
    }
  }

  reverse(x,y,endCharacter,border){
    var ex=1;
    this.passMatrix=[];
    this.moveMatrix=[];
    do{
      this.addAndRemove(x,y,ex,endCharacter[0],border);
      ex++;
    }while(endCharacter[1]=="+" && ex< this.state.matrix.length);
  }

  move(x,y){
    var updatedMatrix = this.state.matrix;
    this.reverse(this.endClick.location[0],this.endClick.location[1],this.endClick.character,"1px solid #999");
    updatedMatrix[x][y].character=this.endClick.character[2];
    updatedMatrix[this.endClick.location[0]][this.endClick.location[1]].character=null;
    //this.setState({matrix:updatedMatrix});
  }

  controlPawn(imgName,coordinateX){
    if(imgName=="imgBlack"){
      if(coordinateX!=1)
        return true;
    }
    else{
      if(coordinateX!=6)
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

  handleClick(x,y){
    var k;
    this.activeLocation=[x,y];
    if(this.moveableLocation(x,y)){
      this.move(x,y);
    }
    else{
      this.activeCharacter=this.state.matrix[x][y].character;
      if(this.activeCharacter!=null){
        k=this.findCharacter();
        /*if(this.activeCharacter<=9817){
          k=this.findCharacter(this.activeCharacter,"imgWhite");
          //pawn hareketi için
          if(this.activeCharacter==9817)
            if(this.controlPawn("imgWhite",x))
              this.schema.move.pawn=[[-1,0]];
            else
              this.schema.move.pawn=[[-1,0],[-2,0]];
        }
        else{
          k=this.findCharacter(this.activeCharacter,"imgBlack");
          //pawn hareketi için
          if(this.activeCharacter==9823)
            if(this.controlPawn("imgBlack",x))
              this.schema.move.pawn=[[1,0]];
            else
              this.schema.move.pawn=[[1,0],[2,0]];
        }*/
        if(this.endClick.location[0]!=null){
          this.reverse(this.endClick.location[0],this.endClick.location[1],this.endClick.character,"1px solid #999");
         }
        if(this.endClick.location[0]!=x || this.endClick.location[1]!=y || this.back){
          this.reverse(x,y,this.schema["nameChessPieces"][k],"3px solid yellow");
          this.back=false;
        }
        else
          this.back=true;
        this.endClick.character=[this.schema["nameChessPieces"][k][0],this.schema["nameChessPieces"][k][1],this.activeCharacter];
        this.endClick.location=[x,y];
      }
    }
  }



  draw(){
    var boards=this.state.matrix.map(function(sq,i){
       return sq.map(function(s,j){
        if(s.character!=null)
           return <button className="square" onClick={(x,y)=>this.handleClick(i,j)} style = {{backgroundColor: s.color,border:s.border}}>{String.fromCharCode(s.character)}
              </button>
         else
           return <button className="square" onClick={(x,y)=>this.handleClick(i,j)} style = {{backgroundColor: s.color, border:s.border}}>
               </button>
       }.bind(this));
     }.bind(this));
    return boards.map(function(tmp){
      return  <div className="board-row"> {tmp}</div>

    });
  }

  render(){
    return <div>
          {this.draw()}
          </div>
  }
}
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
