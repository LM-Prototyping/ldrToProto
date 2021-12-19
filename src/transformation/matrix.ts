import math, { cross, dot, matrix as mathJsMatrix, pi } from "mathjs";
import { transformation } from ".";
import { LineType1Data, Point } from "../parsers/types";
import { getLineData } from "../parsers/utils";
import { Rotation } from "../webots/types";
import { point } from "./point";

/*
 *  Transformiert eine line mit type 1 um die entsprechende Matrix und die Koordniaten
 *  Finde eine Matrix die die Rotationsmatrix tmA und tmB vereint.
 *  Zuerst wird um tmA rotiert, dann um tmB
 *  Die Koordinaten können einfach über die bekannte Punkttransformation berechnet
 *  werden
 */
const transform = (line: string, coordB: Point, tmB: math.Matrix) => {
  const {
    transformationMatrix: tmA,
    coordinates: coordA,
    color,
    fileName
  } = getLineData(line) as LineType1Data;

  const newCoordinates = transformation.point.transform(coordA, { x: 0, y: 0, z: 0 }, tmA);
  const transformedCoord = transformation.point.add(newCoordinates, coordB);

  const vectorA = { x: 1, y: 0, z: 0 };

  // Vector nach der rotation mit tmA
  const tmARotation = transformation.point.transform(vectorA, { x: 0, y: 0, z: 0 }, tmA);

  // Vector nach der Rotation mit tmB
  const tmBRotation = transformation.point.transform(tmARotation, { x: 0, y: 0, z: 0 }, tmB);
  const tmBRotation_2 = transformation.point.transform(
    { ...tmARotation, z: tmARotation.z + 1 },
    { x: 0, y: 0, z: 0 },
    tmB
  );

  const newRotationMatrix = rotation(vectorA, {
    x: tmBRotation_2.x - tmBRotation.x,
    y: tmBRotation.y - tmBRotation_2.y,
    z: tmBRotation.z - tmBRotation_2.z
  }).toArray() as number[][];

  //   console.log("MATRIX", coordA);

  return (
    "1 " +
    color +
    " " +
    transformation.point.toString(transformedCoord) +
    " " +
    newRotationMatrix.map((row) => row.map((n) => "" + n).join(" ")).join(" ") +
    " " +
    fileName
  );
};

const ldrToWebots = (transformationMatrix: math.Matrix, coordinates: Point) => {
  const basePoint = { x: 1, y: 0, z: 0 };
  const fromPoint = transformation.point.transform(basePoint, coordinates, transformationMatrix);
  const toPoint = transformation.point.transform(
    { ...basePoint, z: basePoint.z - 1 },
    coordinates,
    transformationMatrix
  );

  console.log(transformationMatrix, coordinates, {
    x: toPoint.x - fromPoint.x,
    y: fromPoint.y - toPoint.y,
    z: fromPoint.z - toPoint.z
  });

  const rotationMatrix = rotation(basePoint, {
    x: toPoint.x - fromPoint.x,
    y: fromPoint.y - toPoint.y,
    z: fromPoint.z - toPoint.z
  });

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

  console.log(fromPointArray, toPointArray, rotationMatrix);

  return rotationMatrix;
};

export const matrix = {
  transform,
  ldrToWebots,
  rotation
};
