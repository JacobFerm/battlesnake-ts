import { BasicStrategy } from "../strategy/BasicStrategy";
import { Direction } from "../types/strategy";
import { boardState, fakeYourHealth } from "./GameStateGenerator";

describe('Common scenarios', () => {

  const strategy = new BasicStrategy();

  test('avoid self', () => {
    const gameState = boardState(`
      .....
      ..432
      ..501
      ..6..
      .....`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.DOWN);
  });

  test('avoid wall up', () => {
    const gameState = boardState(`
      ....0
      ....1
      ....2
      .....
      .....`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.LEFT);
  });

  test('avoid wall down', () => {
    const gameState = boardState(`
      .....
      .....
      ....2
      ....1
      ....0`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.LEFT);
  });

  test('avoid wall left', () => {
    const gameState = boardState(`
      .....
      .....
      .....
      .....
      012..`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.UP);
  });

  test('avoid wall right', () => {
    const gameState = boardState(`
      .....
      .....
      .....
      .....
      ..210`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.UP);
  });

  test('avoid other snake', () => {
    const gameState = boardState(`
      .....
      .BA..
      .C012
      .D...
      .....`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.DOWN);
  });

  test('go for food', () => {
    const gameState = boardState(`
      .....
      ..0..
      ..1..
      ..2.*
      ..3..`
    );

    fakeYourHealth(gameState, 5);
    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.RIGHT);
  });

  test('avoid trapping yourself', () => {
    const gameState = boardState(`
      .0.......
      .1.......
      32.......
      4........
      .........`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.RIGHT);
  });

  test('follow tail in narrow spaces', () => {
    const gameState = boardState(`
      5..0..
      4321..
      ...DCB
      ...E.A
      ......`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.LEFT);
  });

  test('(optional) choose most available space', () => {
    const gameState = boardState(`
      ...0....
      ...1....
      5432BCDE
      6...A..F
      789.....`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.RIGHT);
  });

  test('(optional) kill other snake', () => {
    const gameState = boardState(`
      ........
      ......0.
      ......1A
      ...5432B
      ......DC`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.RIGHT);
  });


  test('prefer center', () => {
    const gameState = boardState(`
      ........
      ........
      0.......
      1.......
      2......`
    );

    const nextMove = strategy.nextMove(gameState);
    expect(nextMove.move).toBe(Direction.RIGHT);
  });
});