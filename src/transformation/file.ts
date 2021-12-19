import { matrix } from "mathjs";
import { transformation } from ".";
import { LineType1Data } from "../parsers/types";
import { getLineData } from "../parsers/utils";

const transform = (file: string[], transformationData: LineType1Data) => {
  const transformedFile = file.map((l) => {
    const lineTypeMatch = l.match(/^\d+/);

    if (!lineTypeMatch) {
      return "";
    }

    return transformation.line.transform(lineTypeMatch[0], getLineData(l), transformationData);
  });

  return transformedFile;
};

const toReal = (file: string[]) =>
  transform(file, {
    coordinates: { x: 0, y: 0, z: 0 },
    transformationMatrix: matrix([
      [0.0004, 0, 0],
      [0, -0.0004, 0],
      [0, 0, -0.0004]
    ])
  } as LineType1Data);

export const file = {
  transform,
  toReal
};
