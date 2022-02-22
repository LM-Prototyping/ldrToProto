import math, { cross, dot, matrix as mathJsMatrix, multiply, pi } from "mathjs";
import { transformation } from ".";
import { Point } from "../parsers/types";
import { point } from "./point";

/*
 *  Transformiert eine line mit type 1 um die entsprechende Matrix und die Koordniaten
 *  Finde eine Matrix die die Rotationsmatrix tmA und tmB vereint.
 *  Zuerst wird um tmA rotiert, dann um tmB
 *  Die Koordinaten können einfach über die bekannte Punkttransformation berechnet
 *  werden
 */
const transform = (newTrans: math.Matrix, rotationMatrix: math.Matrix): math.Matrix =>
  multiply(newTrans, rotationMatrix);

const ldrToWebots = (transformationMatrix: math.Matrix, coordinates: Point) => {
  const basePoint = {
    x: 0,
    y: -45,
    z: -80
  };
  const fromPoint = transformation.point.transform(basePoint, coordinates, transformationMatrix);
  const toPoint = transformation.point.transform(
    { ...basePoint, y: basePoint.y - 1 },
    coordinates,
    transformationMatrix
  );

  console.log(fromPoint, toPoint);

  const rotationMatrix = rotation(fromPoint, toPoint);

  return rotationMatrix;
};

const rotation = (from: Point, to: Point): math.Matrix => {
  const fromPointArray = point.toArray(point.normalize(point.toArray(from)));
  const toPointArray = point.toArray(point.normalize(point.toArray(to)));

  const { x, y, z } = point.fromArray(cross(fromPointArray, toPointArray) as number[]);

  if ([x, y, z].includes(NaN)) {
    return mathJsMatrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
  }

  const cosA = dot(fromPointArray, toPointArray);

  const k = 1.0 / (1.0 + cosA);

  if (cosA === -1) {
    // Wenn cosA === -1 ist dann wird einmal um die y Achse gedreht
    // Rotationsmatrix um Y von pi zurück geben
    return mathJsMatrix([
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, -1]
    ]);
  }

  const rotationMatrix = mathJsMatrix([
    [x * x * k + cosA, y * x * k - z, z * x * k + y],
    [x * y * k + z, y * y * k + cosA, z * y * k - x],
    [x * z * k - y, y * z * k + x, z * z * k + cosA]
  ]);

  return rotationMatrix;
};

const rotationFromCoordinates = (offset: Point, x: Point, y: Point, z: Point) => {
  const createMatrixVector = (vec: Point) =>
    transformation.point.toArray(
      transformation.point.normalizePoint(
        transformation.point.subtract(offset, transformation.point.toReal(vec))
      )
    );

  return mathJsMatrix([createMatrixVector(x), createMatrixVector(y), createMatrixVector(z)]);
};

export const matrix = {
  transform,
  ldrToWebots,
  rotation,
  rotationFromCoordinates
};
