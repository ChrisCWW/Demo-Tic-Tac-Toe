import { checkWinPattern, initialGameBoard } from "@/lib/utils/GameUtils"

test('initialGameBoard - 3x3 board', () => {
    expect(initialGameBoard()).toEqual([[0,0,0],[0,0,0],[0,0,0]]);
    expect(initialGameBoard(3)).toEqual([[0,0,0],[0,0,0],[0,0,0]]);
});

test('initialGameBoard - 5x5 board', () => {
    expect(initialGameBoard(5)).toEqual([[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]);
});

test('checkWinPattern', () => {
    expect(checkWinPattern([])).toBe(0);
    expect(checkWinPattern([0,0,0,0,0])).toBe(0);
    expect(checkWinPattern([1,1,1,1,1])).toBe(1);
    expect(checkWinPattern([2,2,2,2,2])).toBe(2);
    expect(checkWinPattern([1,2,0,0,0])).toBe(0);
});