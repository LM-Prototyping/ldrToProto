import { webots } from ".";
import { lego } from "../lego";
import { DeviceInfo, DeviceInfoDict, SpecialElement } from "../lego/types";
import { LineType1Data, LineType3Data, LineType4Data, Point } from "../parsers/types";
import { getLineData } from "../parsers/utils";
import { transformation } from "../transformation";
import { elements } from "./elements";
import { IndexedFaceSetObjectType, SubModuleIndexedFaceSetDict } from "./types";
import { hexColorToBaseColorString, rotationMatrixToAngleAxis } from "./utils";

const roundPoint = ({ x, y, z }: Point) => ({
  x: Number(x.toFixed(5)),
  y: Number(y.toFixed(5)),
  z: Number(z.toFixed(5))
});

export const createIndexedFaceSetFromFile = (file: string[], specialElements: SpecialElement[]) => {
  //
  const objects = {} as SubModuleIndexedFaceSetDict;

  for (const line of file) {
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
        objects[color].coordIndex.push([indexA, indexB, indexC, indexD, "-1"].join(" "));
        objects[color].coordIndex.push([indexD, indexC, indexB, indexA, "-1"].join(" "));

        // objects[color].coordIndex.push([indexC, indexB, indexA, "-1"].join(" "));
        // objects[color].coordIndex.push([indexD, indexC, indexA, "-1"].join(" "));
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

  const faceSets = [] as string[];

  for (const color of Object.keys(objects)) {
    const baseColorString = hexColorToBaseColorString(color);

    const shape = elements.shape(
      webots.elements.appearance.pbr(baseColorString),
      webots.elements.geometry.indexedFaceSet(objects[color])
    );

    faceSets.push(shape);
  }

  if (specialElements && specialElements.length > 0) {
    for (const elementIndex in specialElements) {
      console.log("Special Element", elementIndex);

      const { line, name, rotation: rotationMatrix } = specialElements[elementIndex];

      const { transformationMatrix, coordinates } = getLineData(line) as LineType1Data;

      if (!lego.elements.special.devices[name]) {
        continue;
      }

      const { basePosition, buildElement } = lego.elements.special.devices[name] as DeviceInfo;

      let rotation = rotationMatrixToAngleAxis(rotationMatrix);

      const newPoint = transformation.point.transform(
        basePosition,
        coordinates,
        transformationMatrix
      );

      const transformedNewPoint = transformation.point.toReal(newPoint);

      const { x, y, z } = basePosition;

      const newPoint2 = transformation.point.transform(
        { x, y, z: z - 40 },
        coordinates,
        transformationMatrix
      );

      console.log(transformationMatrix, coordinates, {
        x: newPoint2.x - newPoint.x,
        y: newPoint.y - newPoint2.y,
        z: newPoint.z - newPoint2.z
      });

      // console.log(newPoint, newPoint2);

      // rotation = transformation.point.rotate(
      //   { x: 1, y: 0, z: 0 },
      //   { x: newPoint2.x - newPoint.x, y: newPoint.y - newPoint2.y, z: newPoint.z - newPoint2.z }
      // );

      faceSets.push(buildElement(transformedNewPoint, rotation, "test_sensor_" + elementIndex));
    }
  }

  return faceSets.length > 1
    ? `
    Group {
      children [
        ${faceSets.join("\n")}
      ]
    }
  `
    : faceSets[0];
};
