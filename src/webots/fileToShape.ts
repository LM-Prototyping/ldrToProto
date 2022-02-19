import { webots } from ".";
import { configuration } from "../configuration";
import { Globals } from "../global";
import { lego } from "../lego";
import { DeviceInfo, PortInfo } from "../lego/types";
import { HingeJoint } from "../parsers/dependencyGraph/types";
import { performance } from "../performanceLevel";
import { transformation } from "../transformation";
import { Sensor, Wheel } from "../types";
import { elements } from "./elements";
import {
  deviceHintSphere,
  getFaceSetPointsFromFile,
  getWheelRotationMatrix,
  hexColorToBaseColorString,
  rotationMatrixToAngleAxis
} from "./utils";

export const fileToShape = (
  file: string[],
  specialElements: Sensor[],
  hingeJoints: HingeJoint[] = [],
  wheels: Wheel[]
) => {
  const faceSetPointsObject = getFaceSetPointsFromFile(file);

  // ####### FACE SET ########
  // Die unterschiediedlichen FaceSets erstellen. Für jede Farbe ein Set
  const faceSets = [] as string[];

  for (const color of Object.keys(faceSetPointsObject)) {
    const baseColorString = hexColorToBaseColorString(color);

    const shape = elements.shape(
      webots.elements.appearance.pbr(baseColorString),
      webots.elements.geometry.indexedFaceSet(faceSetPointsObject[color])
    );

    faceSets.push(shape);
  }

  const devices = [] as string[];

  const devicesOnPorts = [] as PortInfo[];

  // ####### SENSORS ########
  // Die unterschiedlichen Sensoren erstellen und zum Set hinzufügen
  if (specialElements && specialElements.length > 0) {
    for (const elementIndex in specialElements) {
      console.log("Special Element", elementIndex);

      const { name } = specialElements[elementIndex];

      if (!lego.elements.special.devices[name]) {
        continue;
      }

      if (Globals.sensors >= configuration.max_sensors) {
        console.log(
          "Model contains more than",
          configuration.max_sensors,
          "sensors, which is not allowed"
        );
        continue;
      }

      const { buildElement } = lego.elements.special.devices[name] as DeviceInfo;

      const { device, faceSet, portInfo } = buildElement(specialElements[elementIndex]);

      devices.push(device);
      faceSets.push(faceSet);
      if (portInfo) {
        devicesOnPorts.push(portInfo);
      }

      Globals.sensors += 1;
    }
  }

  // ####### HINGE JOINTS ########
  const hingeJointsAsString = [] as string[];
  for (const hinge of hingeJoints) {
    const { modelLines, sensors, hingeJoints, element, wheels, isMotor } = hinge;
    const { element: endPoint, devicesOnPorts: inlinePortInfo } = fileToShape(
      modelLines,
      sensors,
      hingeJoints,
      wheels
    );

    if (inlinePortInfo) {
      devicesOnPorts.push(...inlinePortInfo);
    }

    const { coordinate, rotation } = element;

    if (!rotation) {
      continue;
    }

    const anchor = transformation.point.toReal(coordinate);

    let motorName: boolean | string = false;

    if (isMotor && Globals.motors < configuration.max_motors) {
      motorName = configuration.motors[Globals.motors].name;
      faceSets.push(deviceHintSphere(anchor, configuration.motors[Globals.motors].color));
      devicesOnPorts.push({ type: "motor", ...configuration.motors[Globals.motors] });
      Globals.motors += 1;
    } else if (Globals.motors >= configuration.max_motors) {
      console.log(
        "Model contains more than",
        configuration.max_motors,
        "motors, which is not allowed"
      );
    }

    console.log("Adding Hinge Joint at", coordinate, anchor);

    // console.log(rotation, coordinate);
    const rotatedAxis = transformation.point.transform({ x: 1, y: 0, z: 0 }, coordinate, rotation);
    // console.log(rotatedAxis);
    const hingeJoint = webots.elements.hingeJoint(
      transformation.point.subtract(rotatedAxis, coordinate),
      anchor,
      endPoint,
      motorName
    );
    hingeJointsAsString.push(hingeJoint);
  }

  // ####### WHEELS ########
  // // Ein Element kann immer nur ein einziges Bounding Object haben
  if (wheels.length > 1) {
    console.log(
      "Objekt hat mehr als ein Wheel. Wenn in einem Modell mehrere Wheels sind kann das BoundingObject nicht korrekt erstellt werden."
    );
  }
  const wheelsAsString = [] as string[];
  for (const wheel of wheels) {
    const { coordinate, height, radius, direction, auxilierDirection } = wheel;

    if (!direction || !auxilierDirection) {
      console.log("RETURNING ");
      continue;
    }

    const primaryAxis = transformation.point.toReal(
      transformation.point.subtract(coordinate, direction)
    );
    const counterAxis = transformation.point.toReal(
      transformation.point.subtract(coordinate, auxilierDirection)
    );

    const realCoordinates = transformation.point.toReal(coordinate);

    const rotationMatrix = getWheelRotationMatrix(primaryAxis, counterAxis, realCoordinates);

    const rotationString = rotationMatrixToAngleAxis(rotationMatrix, coordinate);

    const cylinder = webots.elements.geometry.cylinder(height * 0.01, radius * 0.01);

    wheelsAsString.push(webots.elements.transform(realCoordinates, rotationString, cylinder));

    if (performance.shouldReplaceWheels()) {
      faceSets.push(
        webots.elements.transform(
          realCoordinates,
          rotationString,
          webots.elements.shape(
            webots.elements.appearance.pbr(hexColorToBaseColorString(configuration.wheelColor)),
            `geometry ${cylinder}`
          )
        )
      );
    }

    break;
  }

  // Wenn das Object keine Wheels und keinen Touch Sensor hat wird auch kein Bounding object erstellt
  // -> Damit Hinge Joints richtig funktionieren muss trotzdem ein Bounding Object hinzugefügt werden
  // Mittelpunkte aller Punkte wird berechnet und an diese Stelle wird kleiner Würfel gelegt
  if (wheels.length <= 0) {
    // TODO check for Touch Sensor

    // console.log(faceSetPointsObject);
    let pointSum = { x: 0, y: 0, z: 0 };
    let pointsAmount = 0;

    // Für jede Farbe
    for (const color of Object.values(faceSetPointsObject)) {
      for (const point of Object.keys(color)) {
        if (point === "maxIndex" || point === "coordIndex") {
          continue;
        }
        // console.log(color);
        // console.log(point);

        const [x, y, z] = point.split(" ").map((n) => Number(n));

        pointSum = transformation.point.add(pointSum, { x, y, z });
        pointsAmount++;
      }
    }

    const mean = {
      x: pointSum.x / pointsAmount,
      y: pointSum.y / pointsAmount,
      z: pointSum.z / pointsAmount
    };

    wheelsAsString.push(
      webots.elements.transform(
        mean,
        { x: 0, y: 0, z: 0, angle: 0 },
        webots.elements.geometry.box({ x: 0.01, y: 0.01, z: 0.01 })
      )
    );
  }

  const solid = webots.elements.solid(
    null,
    null,
    [faceSets.join("\n"), devices.join("\n"), hingeJointsAsString.join("\n")],
    wheelsAsString.join("\n")
  );

  return { element: solid, devicesOnPorts };
};
