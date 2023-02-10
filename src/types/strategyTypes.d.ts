import { GameState } from "./types";

export interface Strategy {
  nextMove(gameState: GameState): MoveResponse;
}

export type DirectionResult = {
  direction: Direction;
  points: number;
};
