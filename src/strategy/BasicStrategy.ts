import { stringify } from "querystring";
import {
  closestFood,
  coordInDirection,
  distance,
  findEnemyReachablePoints,
  findHidePoints,
  findKillPoints,
  findValidDirections,
  sameCoord,
  simulateBoard,
} from "../functions/BoardFunctions";
import { reachableCells } from "../functions/ReachableCells";
import { Direction } from "../types/strategy";
import { DirectionResult, Strategy } from "../types/strategyTypes";
import { GameState, MoveResponse } from "../types/types";

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

        if (reachablePoints < 10 || hidePoints < 0) {
          return {
            direction,
            points: reachable + hidePoints,
          };
        }

        if (killPoints > 0 || enemyReachablePoints > 0) {
          return {
            direction,
            points: reachable + killPoints + enemyReachablePoints,
          };
        }

        return {
          direction,
          points: reachable + foodPoints,
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

    if (gameState.turn === 0) {
      return { move: nextMove.direction.toLocaleLowerCase(), shout: "glhf" };
    }

    return { move: nextMove.direction.toLocaleLowerCase() };
  }
}
