import { Direction } from "../types/strategy";
import { Battlesnake, Board, Coord, GameState } from "../types/types";
import { reachableCells } from "./ReachableCells";

export function coordInDirection(start: Coord, direction: Direction): Coord {
  switch (direction) {
    case Direction.UP:
      return { x: start.x, y: start.y + 1 };
    case Direction.RIGHT:
      return { x: start.x + 1, y: start.y };
    case Direction.DOWN:
      return { x: start.x, y: start.y - 1 };
    case Direction.LEFT:
      return { x: start.x - 1, y: start.y };
  }
}

export function isSnakePart(coord: Coord, board: Board): boolean {
  return board.snakes.some((snake: Battlesnake) => {
    for (let i = 0; i < snake.body.length - 1; i++) {
      if (sameCoord(snake.body[i], coord)) {
        return true;
      }
    }
    return false;
    // return snake.body.some((bodyPart: Coord) => sameCoord(bodyPart, coord));
  });
}

export function findValidDirections(head: Coord, board: Board): Direction[] {
  return Object.values(Direction).filter((direction: Direction) => {
    const nextCoord = coordInDirection(head, direction);
    const isOutofBounds = isOutside(nextCoord, board);
    const isSnake = isSnakePart(nextCoord, board);
    return !(isOutofBounds || isSnake);
  });
}

export function isOutside(coord: Coord, board: Board): boolean {
  return (
    coord.y < 0 ||
    coord.x < 0 ||
    coord.x >= board.width ||
    coord.y >= board.height
  );
}

export function isEdge(coord: Coord, board: Board): boolean {
  return (
    coord.y === 0 ||
    coord.x === 0 ||
    coord.x === board.width ||
    coord.y === board.height
  );
}

export function sameCoord(coord1: Coord, coord2: Coord) {
  return coord1.x == coord2.x && coord1.y == coord2.y;
}

export function closestFood(head: Coord, board: Board): Coord | null {
  if (board.food.length == 0) {
    return null;
  }
  return board.food.sort((a, b) => distance(a, head) - distance(b, head))[0];
}

export function distance(coord1: Coord, coord2: Coord): number {
  return Math.abs(coord1.x - coord2.x) + Math.abs(coord2.y - coord1.y);
}

export const copyBoard = (board: Board): Board => {
  return JSON.parse(JSON.stringify(board)) as Board;
};

export const simulateBoard = (
  nextCoord: Coord,
  gameState: GameState
): Board => {
  const newBoard = copyBoard(gameState.board);
  const youSnake = newBoard.snakes.find((snake) =>
    sameCoord(snake.head, gameState.you.head)
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

export const findTotalHidePoints = (
  nextCoord: Coord,
  enemySnakes: Battlesnake[],
  youLength: number,
  board: Board,
  nextBoard: Board
): number => {
  let points = findHidePoints(nextCoord, enemySnakes, youLength, board);

  if (points) return points;

  const asdf = findValidDirections(nextCoord, nextBoard).map((direction) => {
    const nextCoord2 = coordInDirection(nextCoord, direction);
    return findHidePoints(nextCoord2, enemySnakes, youLength, nextBoard);
  });

  return Math.max(...asdf) / 2;
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

export const findTotalKillPoints = (
  nextCoord: Coord,
  enemySnakes: Battlesnake[],
  youLength: number,
  board: Board,
  nextBoard: Board
): number => {
  let points = findKillPoints(nextCoord, enemySnakes, youLength, board);

  if (points) return points;

  const asdf = findValidDirections(nextCoord, nextBoard).map((direction) => {
    const nextCoord2 = coordInDirection(nextCoord, direction);
    return findHidePoints(nextCoord2, enemySnakes, youLength, nextBoard);
  });

  return Math.max(...asdf) / 2;
};

export const findEnemyReachablePoints = (
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
