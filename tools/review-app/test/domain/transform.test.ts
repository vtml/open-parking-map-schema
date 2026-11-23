import { describe, expect, it } from "vitest";
import { alignOverlay } from "../../src/domain/transform";

function close(actual: [number, number], expected: [number, number]) {
  expect(actual[0]).toBeCloseTo(expected[0], 6);
  expect(actual[1]).toBeCloseTo(expected[1], 6);
}

describe("overlay alignment", () => {
  it("maps two control points with rotation, scale and translation", () => {
    const aligned = alignOverlay([
      { image: [0, 0], map: [10, 5] },
      { image: [2, 0], map: [10, 9] },
    ]);
    close(aligned.apply([0, 0]), [10, 5]);
    close(aligned.apply([2, 0]), [10, 9]);
    close(aligned.apply([0, 2]), [6, 5]);
  });

  it("maps three control points with a full affine transform", () => {
    const aligned = alignOverlay([
      { image: [0, 0], map: [1, 2] },
      { image: [1, 0], map: [3, 2] },
      { image: [0, 1], map: [1, 4] },
    ]);
    close(aligned.apply([0, 0]), [1, 2]);
    close(aligned.apply([1, 0]), [3, 2]);
    close(aligned.apply([0, 1]), [1, 4]);
    close(aligned.apply([1, 1]), [3, 4]);
  });

  it("rejects fewer than two points and collinear triples", () => {
    expect(() => alignOverlay([{ image: [0, 0], map: [0, 0] }])).toThrow(/two or three/i);
    expect(() =>
      alignOverlay([
        { image: [0, 0], map: [0, 0] },
        { image: [1, 0], map: [2, 0] },
        { image: [2, 0], map: [4, 0] },
      ]),
    ).toThrow(/collinear/i);
  });
});
