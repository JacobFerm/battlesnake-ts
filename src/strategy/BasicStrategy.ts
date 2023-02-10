import {
  closestFood,
  coordInDirection,
  distance,
  isEdge,
  isOutside,
  isSnakePart,
} from "../functions/BoardFunctions";
import { reachableCells } from "../functions/ReachableCells";
import { boardState } from "../tests/GameStateGenerator";
import { Direction, Outcome } from "../types/strategy";
import { DirectionResult, Strategy } from "../types/strategyTypes";
import { GameState, MoveResponse } from "../types/types";

export class BasicStrategy implements Strategy {
  nextMove(gameState: GameState): MoveResponse {
    const head = gameState.you.body[0];
    const center = {
      x: gameState.board.width / 2,
      y: gameState.board.height / 2,
    };

    // Loop over all possible direction and evualtate it
    const directionResults: Array<DirectionResult> = Object.values(
      Direction
    ).map((direction: Direction) => {
      const nextCoord = coordInDirection(head, direction);
      const isOutofBounds = isOutside(nextCoord, gameState.board);
      const isSnake = isSnakePart(nextCoord, gameState.board);
      const distanceToCenter = distance(nextCoord, center);
      const reachable = reachableCells(gameState.board, nextCoord);

      const closeFood = closestFood(nextCoord, gameState.board);
      const foodDistance = closeFood ? distance(nextCoord, closeFood) : 0;

      let outcome = Outcome.ALIVE;
      if (isOutofBounds || isSnake) {
        outcome = Outcome.DEAD;
      }

      // Collect data to use for sorting
      const health = gameState.you.health;
      const foodPoints = health < 30 ? health - foodDistance * 10 : 0;
      const centerPoints = -(distanceToCenter * distanceToCenter);
      const edgePoints = isEdge(nextCoord, gameState.board) ? -30 : 0;
      const reachablePoints = reachable;

      const points = foodPoints + centerPoints + edgePoints + reachablePoints;

      return {
        direction,
        outcome,
        points,
      };
    });

    // Filter out all safe moves
    const safeMoves = directionResults.filter(
      ({ direction, outcome, points }) => outcome == Outcome.ALIVE
    );
    if (safeMoves.length == 0) {
      console.log(
        `MOVE ${gameState.turn}: No safe moves detected! Moving down`
      );
      return { move: "down" };
    }

    // Sort you safe moves any way you like
    const nextMove = safeMoves.sort((a, b) => {
      return b.points - a.points;
    })[0];

    console.log(`MOVE ${gameState.turn}: ${nextMove.direction}`);
    return { move: nextMove.direction.toLocaleLowerCase() };
  }
}
