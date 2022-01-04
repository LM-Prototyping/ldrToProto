import math, {
  matrix,
  add as addVectors,
  multiply,
  round,
  sin,
  acos,
  sqrt,
  MathJsChain,
  pi,
  cross,
  dot,
  cos
} from "mathjs";
import { transformation } from ".";
import { Point } from "../parsers/types";
import { Rotation } from "../webots/types";

const toVector = (point: Point) => {
  const { x, y, z } = point;

  return matrix([x, y, z]);
};

const add = (a: Point, b: Point) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

const subtract = (a: Point, b: Point) => ({ x: b.x - a.x, y: b.y - a.y, z: b.z - a.z });

const toArray = ({ x, y, z }: Point) => [x, y, z];

const fromArray = (point: number[]) => ({ x: point[0], y: point[1], z: point[2] });

const toCoordArray = (points: Point[]) =>
  points.reduce((all, p) => [...all, ...toArray(p)], [] as number[]);

const toString = (point: Point) => toArray(point).join(" ");

const transform = (point: Point, coordinateOffset: Point, transformationMatrix: math.Matrix) => {
  const offsetMatrix = toVector(coordinateOffset);

  const vector = toVector(point);

  return transformation.vector.toPoint(
    round(addVectors(multiply(transformationMatrix, vector), offsetMatrix) as math.Matrix, 9)
  );
};

const distance = (a: Point, b: Point) => length([b.x - a.x, b.y - a.y, b.z - a.z]);

const scale = (point: Point, transformationMatrix: math.Matrix) => {
  return transform(point, { x: 0, y: 0, z: 0 }, transformationMatrix);
};

const toReal = (point: Point) =>
  scale(
    point,
    matrix([
      [0.0004, 0, 0],
      [0, 0, 0.0004],
      [0, -0.0004, 0]
    ])
  );

const length = (arr: number[]) => sqrt(arr.reduce((all, n) => all + n * n, 0));

const normalize = (point: number[]) => {
  const l = length(point);

  return fromArray(point.map((c) => c / l));
};

const normalizePoint = (point: Point) => normalize(toArray(point));

const rotate = (from: Point, to: Point): Rotation => {
  const fromPointArray = toArray(normalize(toArray(from)));
  const toPointArray = toArray(normalize(toArray(to)));

  // console.log(fromPointArray, toPointArray, cross(fromPointArray, toPointArray) as number[]);

  const { x, y, z } = fromArray(cross(fromPointArray, toPointArray) as number[]);

  const cosA = dot(fromPointArray, toPointArray);

  const k = 1.0 / (1.0 + cosA);

  // console.log(cosA, k);

  if (cosA === -1) {
    return { x: 0, y: 1, z: 0, angle: pi };
  }

  const rotationMatrix = matrix([
    [x * x * k + cosA, y * x * k - z, z * x * k + y],
    [x * y * k + z, y * y * k + cosA, z * y * k - x],
    [x * z * k - y, y * z * k + x, z * z * k + cosA]
  ]);

  console.log(fromPointArray, toPointArray, rotationMatrix);

  const A = rotationMatrix.toArray() as number[][];

  // console.log(rotationMatrix);

  const angle = acos((A[0][0] + A[1][1] + A[2][2] - 1) / 2);
  // console.log(angle);

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
    // If `theta in (0, pi)`
    p.x = A[2][1] - A[1][2];
    p.y = A[0][2] - A[2][0];
    p.z = A[1][0] - A[0][1];
  }

  return { ...p, angle };
  // console.log(A, angle);
  // const ex = (A[2][1] - A[1][2]) / (2 * sin(angle));
  // const ey = (A[0][2] - A[2][0]) / (2 * sin(angle));
  // const ez = (A[2][1] - A[1][2]) / (2 * sin(angle));
  // return { ...norm({ x: ex || 0, y: ey || 1, z: ez || 0 }), angle };
};

export const point = {
  toVector,
  toArray,
  fromArray,
  toCoordArray,
  toString,
  transform,
  subtract,
  scale,
  toReal,
  rotate,
  distance,
  normalizePoint,
  add,
  normalize
};
