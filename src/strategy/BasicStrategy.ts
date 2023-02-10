import { stringify } from "querystring";
import {
  closestFood,
  coordInDirection,
  distance,
  findValidDirections,
  sameCoord,
} from "../functions/BoardFunctions";
import { reachableCells } from "../functions/ReachableCells";
import { Direction } from "../types/strategy";
import { DirectionResult, Strategy } from "../types/strategyTypes";
import {
  Battlesnake,
  Board,
  Coord,
  GameState,
  MoveResponse,
} from "../types/types";

const copyBoard = (board: Board): Board => {
  return JSON.parse(JSON.stringify(board)) as Board;
};

const simulateBoard = (nextCoord: Coord, gameState: GameState): Board => {
  const newBoard = copyBoard(gameState.board);
  const youSnake = newBoard.snakes.find(
    (snake) =>
      snake.head.x === gameState.you.head.x &&
      snake.head.y === gameState.you.head.y
  );
  youSnake?.body.unshift(nextCoord);
  youSnake?.body.pop();
  return newBoard;
};

const findMaxReachableCells = (head: Coord, board: Board): number => {
  const asdf = findValidDirections(head, board).map((direction) => {
    const nextCoord = coordInDirection(head, direction);
    return reachableCells(board, nextCoord);
  });
  return Math.max(...asdf);
};

const findHidePoints = (
  nextCoord: Coord,
  enemySnakes: Battlesnake[],
  youLength: number,
  board: Board
): number => {
  let points = 0;
  enemySnakes.forEach((snake) => {
    const enemyHeadClose = findValidDirections(snake.body[0], board).some(
      (dir) => sameCoord(nextCoord, coordInDirection(snake.body[0], dir))
    );
    if (enemyHeadClose && snake.body.length >= youLength) {
      points -= 100;
    }
  });
  return points;
};

const findKillPoints = (
  nextCoord: Coord,
  enemySnakes: Battlesnake[],
  youLength: number,
  board: Board
): number => {
  let points = 0;
  enemySnakes.forEach((snake) => {
    const enemyHeadClose = findValidDirections(snake.body[0], board).some(
      (dir) => sameCoord(nextCoord, coordInDirection(snake.body[0], dir))
    );
    if (enemyHeadClose && snake.body.length < youLength) {
      points += points + 40;
    }
  });
  return points;
};

const findEnemyReachablePoints = (
  enemySnakes: Battlesnake[],
  board: Board,
  nextBoard: Board
): number => {
  let points = 0;
  enemySnakes.forEach((snake) => {
    const before = findMaxReachableCells(snake.head, board);
    const after = findMaxReachableCells(snake.head, nextBoard);

    if (after < before / 2) {
      points = points + 100;
    }
  });
  return points;
};

export class BasicStrategy implements Strategy {
  nextMove(gameState: GameState): MoveResponse {
    const head = gameState.you.body[0];
    const enemySnakes = gameState.board.snakes.filter(
      (snake) => !sameCoord(snake.head, head)
    );

    const validDirections: Direction[] = findValidDirections(
      head,
      gameState.board
    );

    // Loop over all possible direction and evualtate it
    const directionResults: Array<DirectionResult> = validDirections.map(
      (direction: Direction) => {
        const nextCoord = coordInDirection(head, direction);
        const nextBoard = simulateBoard(nextCoord, gameState);

        const reachable = reachableCells(gameState.board, nextCoord);
        const closeFood = closestFood(nextCoord, gameState.board);
        const foodDistance = closeFood ? distance(nextCoord, closeFood) : 0;

        const hidePoints = findHidePoints(
          nextCoord,
          enemySnakes,
          gameState.you.length,
          gameState.board
        );

        const killPoints = findKillPoints(
          nextCoord,
          enemySnakes,
          gameState.you.length,
          gameState.board
        );

        const foodPoints =
          gameState.board.height * gameState.board.width -
          foodDistance * foodDistance;
        const reachablePoints = reachable;
        const enemyReachablePoints = findEnemyReachablePoints(
          enemySnakes,
          gameState.board,
          nextBoard
        );

        if (reachable < 10) {
          return {
            direction,
            points: reachable + hidePoints,
          };
        }

        const points =
          foodPoints +
          reachablePoints +
          hidePoints +
          killPoints +
          enemyReachablePoints;

        return {
          direction,
          points,
        };
      }
    );

    if (directionResults.length == 0) {
      console.log(
        `MOVE ${gameState.turn}: No safe moves detected! Moving down`
      );
      return { move: "down" };
    }

    // Sort you safe moves any way you like
    const nextMove = directionResults.sort((a, b) => {
      return b.points - a.points;
    })[0];

    console.log(`MOVE ${gameState.turn}: ${nextMove.direction}`);
    return { move: nextMove.direction.toLocaleLowerCase() };
  }
}
