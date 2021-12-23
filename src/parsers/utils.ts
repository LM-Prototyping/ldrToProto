import math, { matrix } from "mathjs";
import { transformation } from "../transformation";
import { HandleLineTypeReturn, LineType, LineType1Data, Point } from "./types";

const arrayToNumber = (arr: string[]) => arr.map((n) => Number(n));
const N = Number;

export const getLineData = (line: string) => {
  const matchLineTypeRegex = /^\d+/;

  const lineTypeMatch = line.match(matchLineTypeRegex);

  if (!lineTypeMatch) {
    throw new Error("Line is empty or has no type: " + line);
  }

  const lineType = lineTypeMatch[0] as LineType;

  return handleLineType(lineType, line);
};

const handleLineType = (lineType: LineType, line: string): HandleLineTypeReturn => {
  return {
    "0": handleType1,
    "1": handleType1,
    "2": handleType2,
    "3": handleType3,
    "4": handleType4
  }[lineType](line);
};

const handleType0 = (line: string) => {
  // TODO
  return {};
};

const handleType1 = (line: string): LineType1Data => {
  const matchLineOne = new RegExp(
    `${createLineMatchRegex(1, [
      "x",
      "y",
      "z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i"
    ])}\\s+(?<fileName>[\\w\\d\\s#-/]*\\.\\w*)`
  );

  const { fileName, x, y, z, a, b, c, d, e, f, g, h, i, color } = matchLine(line, matchLineOne);

  const transformationMatrix = matrix([
    arrayToNumber([a, b, c]),
    arrayToNumber([d, e, f]),
    arrayToNumber([g, h, i])
  ]);

  return {
    fileName: fileName,
    color,
    transformationMatrix,
    coordinates: { x: N(x), y: N(y), z: N(z) }
  };
};

const handleType2 = (line: string) => {
  const matchLineTwo = new RegExp(createLineMatchRegex(2, ["x1", "y1", "z1", "x2", "y2", "z2"]));

  const { color, x1, x2, y1, y2, z1, z2 } = matchLine(line, matchLineTwo);

  return {
    color,
    A: point(x1, y1, z1),
    B: point(x2, y2, z2)
  };
};

const handleType3 = (line: string) => {
  const matchLineThree = new RegExp(
    createLineMatchRegex(3, ["x1", "y1", "z1", "x2", "y2", "z2", "x3", "y3", "z3"])
  );

  const { color, x1, x2, x3, y1, y2, y3, z1, z2, z3 } = matchLine(line, matchLineThree);

  return {
    color,
    A: point(x1, y1, z1),
    B: point(x2, y2, z2),
    C: point(x3, y3, z3)
  };
};

const handleType4 = (line: string) => {
  const matchLineThree = new RegExp(
    createLineMatchRegex(4, [
      "x1",
      "y1",
      "z1",
      "x2",
      "y2",
      "z2",
      "x3",
      "y3",
      "z3",
      "x4",
      "y4",
      "z4"
    ])
  );

  const { color, x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4 } = matchLine(line, matchLineThree);

  return {
    color,
    A: point(x1, y1, z1),
    B: point(x2, y2, z2),
    C: point(x3, y3, z3),
    D: point(x4, y4, z4)
  };
};

const createLineMatchRegex = (type: string | number, matchCoords: string[]) =>
  `^${type}\\s+(?<color>(\\d+|#[A-F\\d]{6}))${matchCoords
    .map((identifier) => `\\s+(?<${identifier}>-?\\d*\\.?\\d*(e[+-]?\\d+)?)`)
    .join("")}`;

const matchLine = (line: string, match: RegExp) => {
  const lineMatch = line.replace("\\", "/").match(match);

  if (!lineMatch || !lineMatch.groups) {
    throw new Error("line is not valid: " + line);
  }

  return lineMatch.groups as { [key: string]: string };
};

function point<T>(x: T, y: T, z: T): Point {
  return { x: N(x), y: N(y), z: N(z) };

  // return { x: N(N(x).toFixed(9)), y: N(N(y).toFixed(9)), z: N(N(z).toFixed(9)) };
}

export const line1ToString = (color: string, coord: Point, matrix: math.Matrix, fileName: string) =>
  "1 " +
  color +
  " " +
  transformation.point.toString(coord) +
  " " +
  (matrix.toArray() as number[][]).map((row) => row.map((n) => "" + n).join(" ")).join(" ") +
  " " +
  fileName;
