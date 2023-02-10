import {
  closestFood,
  coordInDirection,
  distance,
  findValidDirections,
  isOutside,
  isSnakePart,
  sameCoord,
} from "../functions/BoardFunctions";
import { reachableCells } from "../functions/ReachableCells";
import { Direction, Outcome } from "../types/strategy";
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
        const reachable = reachableCells(gameState.board, nextCoord);

        const closeFood = closestFood(nextCoord, gameState.board);
        const foodDistance = closeFood ? distance(nextCoord, closeFood) : 0;

        let headPoints = 0;
        enemySnakes.forEach((snake) => {
          const enemyHeadClose = findValidDirections(
            snake.body[0],
            gameState.board
          ).some((dir) =>
            sameCoord(nextCoord, coordInDirection(snake.body[0], dir))
          );
          if (enemyHeadClose) {
            if (snake.body.length >= gameState.you.length) {
              headPoints = headPoints - 100;
            } else {
              headPoints = headPoints + 40;
            }
          }
        });

        const foodPoints = 100 - foodDistance * foodDistance;
        const reachablePoints = reachable;

        const points = foodPoints + reachablePoints + headPoints;

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
