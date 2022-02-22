import math, { acos, cos, matrix, pi, sin, sqrt } from "mathjs";
import { webots } from ".";
import { configuration } from "../configuration";
import { Globals } from "../global";
import { LineType3Data, LineType4Data, Point } from "../parsers/types";
import { getLineData } from "../parsers/utils";
import { performance } from "../performanceLevel";
import { transformation } from "../transformation";
import { IndexedFaceSetObjectType, SubModuleIndexedFaceSetDict } from "./types";

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

export const rotationMatrixToAngleAxis = (matrix: math.Matrix, coord: Point) => {
  const A = matrix.toArray() as number[][];

  const angle = acos((A[0][0] + A[1][1] + A[2][2] - 1) / 2);

  const p = { x: 0, y: 0, z: 0 };

  // console.log(angle, A);

  if (angle === 0) {
    console.log("CASE 0");
    return { x: 1, y: 0, z: 0, angle: 0 };
  } else if (angle.toFixed(6) === pi.toFixed(6)) {
    if (A[0][0] > A[1][1] && A[0][0] > A[2][2]) {
      p.x = sqrt(A[0][0] - A[1][1] - A[2][2] + 1) / 2;
      p.y = A[0][1] / (2 * p.x);
      p.z = A[0][2] / (2 * p.x);
      console.log("CASE 1");
    } else if (A[1][1] > A[0][0] && A[1][1] > A[2][2]) {
      console.log("CASE 2");
      p.y = sqrt(A[1][1] - A[0][0] - A[2][2] + 1) / 2;
      p.x = A[0][1] / (2 * p.y);
      p.z = A[1][2] / (2 * p.y);
    } else {
      p.z = sqrt(A[2][2] - A[0][0] - A[1][1] + 1) / 2;

      if (p.z === 0) {
        p.y = 1;
        p.x = -1;
      } else {
        p.x = A[0][2] / (2 * p.z);
        p.y = A[1][2] / (2 * p.z);
      }
      console.log("CASE 3");
    }
  } else {
    p.x = A[1][2] - A[2][1];
    p.y = A[2][0] - A[0][2];
    p.z = A[0][1] - A[1][0];
    console.log("CASE 4");
  }

  // console.log(A, p, angle);

  return { ...p, angle };
};

// Primary Axis ist der Punkt mit dem das Wheel alignen soll
// Counter Axis ist die Axe um die sich das Rad normalerweise dreht
// Coordinate ist der Koorinatenoffset des Wheels
export const getWheelRotationMatrix = (
  primaryAxis: Point,
  counterAxis: Point,
  coordinate: Point
) => {
  const { x, y, z } = transformation.point.normalize(transformation.point.toArray(counterAxis));

  const createMatrix = (angle: number) => {
    const cosA = cos(angle);
    const sinA = sin(angle);

    const oneMin = 1 - cosA;

    return matrix([
      [x * x * oneMin + cosA, y * x * oneMin - z * sinA, z * x * oneMin + y * sinA],
      [x * y * oneMin + z * sinA, y * y * oneMin + cosA, z * y * oneMin - x * sinA],
      [x * z * oneMin - y * sinA, y * z * oneMin + x * sinA, z * z * oneMin + cosA]
    ]);
  };

  // Drehung um vector diff2
  let a = { zValue: Infinity, angle: 0 };
  let b = { zValue: Infinity, angle: 2 * Math.PI };
  const priorityQueue = [
    { zValue: Infinity, angle: 0 },
    { zValue: Infinity, angle: 2 * Math.PI }
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 25; j++) {
      const angle = a.angle + (j * (b.angle - a.angle)) / 25;

      const rotationMatrix = createMatrix(angle);
      const { z: zNewPoint } = transformation.point.transform(
        transformation.point.scale(
          primaryAxis,
          matrix([
            [1000, 0, 0],
            [0, 1000, 0],
            [0, 0, 1000]
          ])
        ),
        coordinate,
        rotationMatrix
      );

      priorityQueue.push({ zValue: 10000 * zNewPoint, angle });
      priorityQueue.sort((a, b) => (a.zValue >= b.zValue ? 1 : -1));
      priorityQueue.splice(2);
    }

    a = priorityQueue[0];
    b = priorityQueue[1];
  }

  const rotMatrix = createMatrix(a.angle);

  const realTo = transformation.point.transform(primaryAxis, { x: 0, y: 0, z: 0 }, rotMatrix);

  const realFrom = {
    ...transformation.point.transform(counterAxis, { x: 0, y: 0, z: 0 }, rotMatrix),
    z: 0
  };

  // Nun von dem Rotierten Vector auf diff
  return transformation.matrix.rotation(realFrom, realTo);
};

const roundPoint = ({ x, y, z }: Point) => {
  const accuracy = performance.shouldRoundPoints() ? configuration.performance.pointAccuracy : 5;

  return {
    x: Number(x.toFixed(accuracy)),
    y: Number(y.toFixed(accuracy)),
    z: Number(z.toFixed(accuracy))
  };
};

export const getFaceSetPointsFromFile = (file: string[]) => {
  // Zuerst die File in reale Coordinaten transformieren und dann parsen
  const fileToReal = transformation.file.toReal(file);

  // Jetzt die File parsen und dabei unnötige Koordinaten entfernen
  // und verschiedene Sets für unterschiedliche Farben erstellen
  const objects = {} as SubModuleIndexedFaceSetDict;

  for (const line of fileToReal) {
    let lineData = undefined;
    try {
      lineData = getLineData(line);
    } catch (e) {
      continue;
    }

    const lineTypeMatch = line.match(/^\d+/);

    if (!lineTypeMatch) {
      continue;
    }

    const { color } = lineData;

    if (!objects[color]) {
      objects[color] = { maxIndex: 0, coordIndex: [] } as IndexedFaceSetObjectType;
    }

    let maxIndex = objects[color].maxIndex;

    const lineType = lineTypeMatch[0];

    switch (lineType) {
      case "4": {
        const { color, A, B, C, D } = lineData as LineType4Data;
        const aAsString = transformation.point.toString(roundPoint(A));
        const bAsString = transformation.point.toString(roundPoint(B));
        const cAsString = transformation.point.toString(roundPoint(C));
        const dAsString = transformation.point.toString(roundPoint(D));

        let indexA = objects[color][aAsString];
        if (indexA === null || indexA === undefined) {
          indexA = maxIndex;
          objects[color][aAsString] = maxIndex;
          maxIndex++;
        }
        let indexB = objects[color][bAsString];
        if (indexB === null || indexB === undefined) {
          indexB = maxIndex;
          objects[color][bAsString] = maxIndex;
          maxIndex++;
        }
        let indexC = objects[color][cAsString];
        if (indexC === null || indexC === undefined) {
          indexC = maxIndex;
          objects[color][cAsString] = maxIndex;
          maxIndex++;
        }
        let indexD = objects[color][dAsString];
        if (indexD === null || indexD === undefined) {
          indexD = maxIndex;
          objects[color][dAsString] = maxIndex;
          maxIndex++;
        }
        // objects[color].coordIndex.push([indexA, indexB, indexC, indexD, "-1"].join(" "));
        objects[color].coordIndex.push([indexA, indexB, indexC, "-1"].join(" "));
        objects[color].coordIndex.push([indexC, indexD, indexA, "-1"].join(" "));
        // objects[color].coordIndex.push([indexD, indexC, indexB, indexA, "-1"].join(" "));

        objects[color].coordIndex.push([indexC, indexB, indexA, "-1"].join(" "));
        objects[color].coordIndex.push([indexA, indexD, indexC, "-1"].join(" "));
        break;
      }
      case "3": {
        const { color, A, B, C } = lineData as LineType3Data;
        const aAsString = transformation.point.toString(roundPoint(A));
        const bAsString = transformation.point.toString(roundPoint(B));
        const cAsString = transformation.point.toString(roundPoint(C));

        let indexA = objects[color][aAsString];
        if (indexA === null || indexA === undefined) {
          indexA = maxIndex;
          objects[color][aAsString] = maxIndex;
          maxIndex++;
        }

        let indexB = objects[color][bAsString];
        if (indexB === null || indexB === undefined) {
          indexB = maxIndex;
          objects[color][bAsString] = maxIndex;
          maxIndex++;
        }

        let indexC = objects[color][cAsString];
        if (indexC === null || indexC === undefined) {
          indexC = maxIndex;
          objects[color][cAsString] = maxIndex;
          maxIndex++;
        }

        objects[color].coordIndex.push([indexA, indexB, indexC, "-1"].join(" "));
        objects[color].coordIndex.push([indexC, indexB, indexA, "-1"].join(" "));

        break;
      }
    }

    objects[color].maxIndex = maxIndex;
  }

  return objects;
};

export const deviceHintSphere = (coordinate: Point, color: string) =>
  webots.elements.transform(
    coordinate,
    { x: 0, y: 0, z: 0, angle: 0 },
    webots.elements.shape(
      webots.elements.appearance.pbr(hexColorToBaseColorString(color)),
      `geometry ${webots.elements.geometry.sphere(0.003)}`
    )
  );
