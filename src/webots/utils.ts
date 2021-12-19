import math, { acos, pi, sqrt } from "mathjs";

const hexToInt = (i: string) => parseInt(i, 16);

export const hexToRgb = (hex: string) => {
  const matchHexNumbers = new RegExp(
    "^#" + ["r", "g", "b"].map((c) => `(?<${c}>[A-Fa-f\\d]{2})`).join("")
  );

  const hexNumbersMatch = hex.match(matchHexNumbers);

  if (!hexNumbersMatch || !hexNumbersMatch.groups) {
    return undefined;
  }

  const { g, r, b } = hexNumbersMatch.groups;

  return { r: hexToInt(r), g: hexToInt(g), b: hexToInt(b) };
};

export const hexColorToBaseColorString = (hex: string) => {
  const colors = hexToRgb(hex);

  if (!colors) {
    return "";
  }

  const { r, g, b } = colors;

  return "baseColor " + [r, g, b].map((i) => i / 256).join(" ");
};

export const rotationMatrixToAngleAxis = (matrix: math.Matrix) => {
  const A = matrix.toArray() as number[][];

  const angle = acos((A[0][0] + A[1][1] + A[2][2] - 1) / 2);

  const p = { x: 0, y: 0, z: 0 };

  if (angle === 0) {
    return { x: 0, y: 1, z: 0, angle: 0 };
  } else if (angle.toFixed(6) === pi.toFixed(6)) {
    if (A[0][0] > A[1][1] && A[0][0] > A[2][2]) {
      p.x = sqrt(A[0][0] - A[1][1] - A[2][2] + 1) / 2;
      p.y = A[0][1] / (2 * p.x);
      p.z = A[0][2] / (2 * p.x);
    } else if (A[1][1] > A[0][0] && A[1][1] > A[2][2]) {
      p.y = sqrt(A[1][1] - A[0][0] - A[2][2] + 1) / 2;
      p.x = A[0][1] / (2 * p.y);
      p.z = A[1][2] / (2 * p.y);
    } else {
      p.z = sqrt(A[2][2] - A[0][0] - A[1][1] + 1) / 2;
      p.x = A[0][2] / (2 * p.z);
      p.y = A[1][2] / (2 * p.z);
    }
  } else {
    p.x = A[2][1] - A[1][2];
    p.y = A[0][2] - A[2][0];
    p.z = A[1][0] - A[0][1];
  }

  return { ...p, angle };
};
