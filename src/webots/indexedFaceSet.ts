import { matrix } from "mathjs";
import { webots } from ".";
import { lego } from "../lego";
import { specialParts } from "../lego/elements/special";
import { DeviceInfo, DeviceInfoDict, SpecialElement, WheelElement } from "../lego/types";
import {
  HingeJointElement,
  LineType1Data,
  LineType3Data,
  LineType4Data,
  Point
} from "../parsers/types";
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

export const createIndexedFaceSetFromFile = (
  file: string[],
  specialElements: SpecialElement[],
  hingeJoints: HingeJointElement[] = [],
  wheels: WheelElement[]
) => {
  //

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

  // Die unterschiediedlichen FaceSets erstellen. Für jede Farbe ein Set
  const faceSets = [] as string[];

  for (const color of Object.keys(objects)) {
    const baseColorString = hexColorToBaseColorString(color);

    const shape = elements.shape(
      webots.elements.appearance.pbr(baseColorString),
      webots.elements.geometry.indexedFaceSet(objects[color])
    );

    faceSets.push(shape);
  }

  const devices = [] as string[];

  // Die unterschiedlichen Sensoren erstellen und zum Set hinzufügen
  if (specialElements && specialElements.length > 0) {
    for (const elementIndex in specialElements) {
      console.log("Special Element", elementIndex);

      const { coordinate, name, rotation: rotationMatrix } = specialElements[elementIndex];

      if (!lego.elements.special.devices[name]) {
        continue;
      }

      const { buildElement } = lego.elements.special.devices[name] as DeviceInfo;

      const realMatrix = transformation.matrix.ldrToWebots(rotationMatrix, coordinate);

      let rotation = rotationMatrixToAngleAxis(realMatrix, coordinate);

      const transformedNewPoint = transformation.point.toReal(coordinate);

      devices.push(buildElement(transformedNewPoint, rotation, "test_sensor_" + elementIndex));
    }
  }

  const hingeJointsAsString = [] as string[];
  for (const hinge of hingeJoints) {
    const { modelLines, specialElements, hingeJoints, elementInfo, wheels } = hinge;
    const endPoint = createIndexedFaceSetFromFile(modelLines, specialElements, hingeJoints, wheels);

    const { coordinate, rotation } = elementInfo;
    console.log(rotation, coordinate);
    const rotatedAxis = transformation.point.transform({ x: 1, y: 0, z: 0 }, coordinate, rotation);
    console.log(rotatedAxis);
    const hingeJoint = webots.elements.hingeJoint(
      transformation.point.subtract(rotatedAxis, coordinate),
      transformation.point.toReal(coordinate),
      endPoint
    );
    hingeJointsAsString.push(hingeJoint);
  }

  // Ein Element kann immer nur ein einziges Bounding Object haben
  if (wheels.length > 1) {
    console.log(
      "Objekt hat mehr als ein Wheel. Wenn in einem Modell mehrere Wheels sind kann das BoundingObject nicht korrekt erstellt werden."
    );
  }
  const wheelsAsString = [] as string[];
  for (const wheel of wheels) {
    const { coordinate, rotation, height, radius } = wheel;
    console.log(rotation, coordinate);
    const rotationString = rotationMatrixToAngleAxis(rotation, coordinate);
    console.log(rotationString);

    const element = webots.elements.transform(
      transformation.point.toReal(coordinate),
      rotationString,
      webots.elements.geometry.cylinder(height * 0.01, radius * 0.01)
    );
    wheelsAsString.push(element);

    break;
  }

  const solid = webots.elements.solid(
    null,
    null,
    [faceSets.join("\n"), devices.join("\n"), hingeJointsAsString.join("\n")],
    wheelsAsString.join("\n")
  );

  // Jetzt HingeJoint Elemente erstellen

  return solid;
};
