import { transformation } from ".";
import {
  HandleLineTypeReturn,
  LineType1Data,
  LineType2Data,
  LineType3Data,
  LineType4Data,
  Point
} from "../parsers/types";

const transformPointArray = (
  pointArray: Point[],
  coordinates: Point,
  transformationMatrix: math.Matrix
) => pointArray.map((p) => transformation.point.transform(p, coordinates, transformationMatrix));

const toString = (type: number | string, color: string | number, coordinates: Point[]) =>
  [type, color, ...transformation.point.toCoordArray(coordinates)].join(" ");

export const getLinePoints = (lineType: string, lineData: HandleLineTypeReturn) => {
  switch (lineType) {
    case "2": {
      const { A, B } = lineData as LineType2Data;

      return [A, B];
    }
    case "3": {
      const { A, B, C } = lineData as LineType3Data;

      return [A, B, C];
    }
    case "4": {
      const { A, B, C, D } = lineData as LineType4Data;

      return [A, B, C, D];
    }
  }

  return undefined;
};

const transform = (
  lineType: string,
  lineData: HandleLineTypeReturn,
  { coordinates, transformationMatrix }: LineType1Data
) => {
  const { color } = lineData;

  const points = getLinePoints(lineType, lineData);

  if (!points) {
    return "";
  }

  const transformedPoints = transformPointArray(points, coordinates, transformationMatrix);

  return toString(lineType, color, transformedPoints);
};

export const line = {
  toString,
  transform,
  getLinePoints
};
