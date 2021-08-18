import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

interface IClickable {
  onClick: (/*event: React.MouseEvent<HTMLButtonElement>*/e: any) => void;
}

interface IProps extends IClickable {
  value: string | null;
  isWinningTile: boolean;
}

/*
interface IState {
  value: string | null;
}
*/

/*
interface IBoardState {
  xIsNext: boolean;
  squares: Array<string | null>;
}
*/

interface IBoardProp {
  squares: (string | null)[];
  movePos: number | null;
  moveNo: number;
  winningArray: number[]
}

interface IGameState {
  history: Array<IBoardProp>;
  xIsNext: boolean;
  stepNumber: number;
  isAsc: boolean;
}

/* 
class Square extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    return (
      <button className="square" onClick={this.props.onClick}>
        {this.props.value}
      </button>
    );
  }
}
*/

function Square(props: IProps) {
  return (
    <button className={"square" + (props.isWinningTile ? " winning-tile" : "")} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component<IBoardProp & IClickable, /*IBoardState*/ {}> {
  // constructor(props: any) {
  //   super(props);
  //   this.state = {
  //     squares: Array<string | null>(9).fill(null),
  //     xIsNext: true
  //   };
  // }

  renderSquare(i: number, winningArray: number[]) {
    return (
      <Square
        value={this.props.squares[i]}
        isWinningTile={winningArray.indexOf(i) >= 0}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(i: number) {
    let elementList: JSX.Element[] = [];

    for(let c = 0; c < 3; c++) {
      elementList.push(this.renderSquare(3 * i + c, this.props.winningArray));
    }

    return (
      <div className="board-row">
        {elementList}
      </div>
    );
  }

  // handleClick(i: number) {
  //   const squares = this.props.squares.slice();
  //   if (calculateWinner(squares) || squares[i]) {
  //     return;
  //   }
  //   squares[i] = this.state.xIsNext ? 'X' : 'O';
  //   this.setState({
  //     squares: squares,
  //     xIsNext: !this.state.xIsNext,
  //   });
  // }

  render() {
    // const winner = calculateWinner(this.state.squares);
    // let status;

    // if (winner) {
    //   status = `Winner: ${winner}`;
    // } else {
    //   status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    // }

    let elementList: JSX.Element[] = [];

    for(let r = 0; r < 3; r++) {
      elementList.push(this.renderRow(r));
    }

    return (
      // <div>
      //   {/* <div className="status">{status}</div> */}
      //   <div className="board-row">
      //     {this.renderSquare(0)}
      //     {this.renderSquare(1)}
      //     {this.renderSquare(2)}
      //   </div>
      //   <div className="board-row">
      //     {this.renderSquare(3)}
      //     {this.renderSquare(4)}
      //     {this.renderSquare(5)}
      //   </div>
      //   <div className="board-row">
      //     {this.renderSquare(6)}
      //     {this.renderSquare(7)}
      //     {this.renderSquare(8)}
      //   </div>
      // </div>
      <div>
        {elementList}
      </div>
    );
  }
}

class Game extends React.Component<{}, IGameState> {
  constructor(props: any) {
    super(props);;
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        movePos: null,
        moveNo: 0,
        winningArray: []
      }],
      xIsNext: true,
      stepNumber: 0,
      isAsc: true
    };
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const squares = history[history.length - 1].squares.slice();
    let result = calculateWinner(squares);
    if (result.winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat({
        squares: squares,
        movePos: i,
        moveNo: history.length,
        winningArray: calculateWinner(squares).winningArray
      }),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length
    });
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  sortHistory() {
    this.setState({
      isAsc: !this.state.isAsc
    });
  }
  
  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);
    const displayHistory = this.state.history.slice();

    displayHistory.sort((a, b) => this.state.isAsc ? a.moveNo - b.moveNo : b.moveNo - a.moveNo)

    const moves = displayHistory.map((step, move) => {
      const desc = step.moveNo ? `Go to move #${step.moveNo} (${step.movePos ? step.movePos % 3 : 0}, ${step.movePos ? Math.floor(step.movePos / 3) : 0})` : 'Go to game start';
      return (
        <li key={step.moveNo}>
          <button onClick={() => this.jumpTo(step.moveNo)}>{step.moveNo === this.state.stepNumber ? <b>{desc}</b> : desc }</button>
        </li>
      )
    })

    let status;
    if (result.winner) {
      status = `Winner: ${result.winner}`;
    } else if(current.squares.indexOf(null) > 0) {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    } else {
      status = "Draw!";
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} movePos={current.movePos} moveNo={current.moveNo} winningArray={current.winningArray} onClick={(i) => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.sortHistory()}>Sort</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares: Array<string | null>): { winner: string | null, winningArray: Array<number> } {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < winningLines.length; i++) {
    const [a, b, c] = winningLines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningArray: [a, b, c]
      };
    }
  }

  return {
    winner: null,
    winningArray: []
  };
}
// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
