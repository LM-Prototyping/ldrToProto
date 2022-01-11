import math, { matrix } from "mathjs";
import { lego } from "..";
import { FileNodeDict, LineType1Data, Point } from "../../parsers/types";
import { getLineData } from "../../parsers/utils";
import { transformation } from "../../transformation";
import { webots } from "../../webots";
import { Rotation } from "../../webots/types";
import {
  BaseElement,
  ConnectionElement,
  DeviceInfoDict,
  FileNodeWithSpecialElementsDict,
  PartTypeDict,
  SpecialElement,
  WheelElement
} from "../types";
import { wheels } from "./wheels";

export const specialParts: PartTypeDict = {
  // ms1040: {
  //   type: "sensor",
  //   name: "Accelerometer",
  //   internalName: "accelerometer"
  // },
  // ms1038: {
  //   type: "sensor",
  //   name: "Color Sensor",
  //   internalName: "color_sensor"
  // },
  // 64892: {
  //   type: "sensor",
  //   name: "Color Sensor/ Color Lamp",
  //   internalName: "color_sensor_color_lamp"
  // },
  ms1034: {
    type: "sensor",
    name: "Compass Sensor",
    internalName: "compass_sensor"
  },
  // ms1044: {
  //   type: "sensor",
  //   name: "Gyroskop",
  //   internalName: "gyroskop"
  // },
  // ms1042: {
  //   type: "sensor",
  //   name: "Infrared Sensor",
  //   internalName: "infrared_sensor"
  // },
  // 55969: {
  //   type: "sensor",
  //   name: "Light Sensor",
  //   internalName: "light_sensor"
  // },
  // ms1048: {
  //   type: "sensor",
  //   name: "RFID Sensor",
  //   internalName: "rfid_sensor"
  // },
  // 55963: {
  //   type: "sensor",
  //   name: "Sound Sensor",
  //   internalName: "sound_sensor"
  // },
  // 62840: {
  //   type: "sensor",
  //   name: "Temperatur Sensor",
  //   internalName: "temperatur_sensor"
  // },
  53793: {
    type: "sensor",
    name: "Touch Sensor",
    internalName: "touch_sensor"
  },
  53792: {
    type: "sensor",
    name: "Ultrasonic Sensor",
    internalName: "ultrasonic_sensor"
  },
  3673: {
    type: "connection",
    name: "Technic Pin",
    internalName: "technic_pin"
  }
};

// Base position is in LDU
const partsDeviceInfo: DeviceInfoDict = {
  ultrasonic_sensor: {
    basePosition: {
      x: 0,
      y: -45,
      z: -80
    },
    buildElement: webots.devices.sensors.distance
  },
  touch_sensor: {
    basePosition: {
      x: 0,
      y: -40,
      z: -90
    },
    buildElement: webots.devices.sensors.touch
  },
  technic_pin: {
    basePosition: {
      x: 1,
      y: 0,
      z: 0
    },
    buildElement: (transform: Point, rotation: Rotation, name: string) => ""
  }
};

export const extractFromDependecyGraph = (dependencyGraph: FileNodeDict) => {
  const newGraph = {} as FileNodeWithSpecialElementsDict;

  for (const node of Object.values(dependencyGraph)) {
    const { name, file } = node;

    newGraph[name] = {
      ...node,
      specialElements: [] as SpecialElement[],
      connections: [] as ConnectionElement[],
      wheels: [] as WheelElement[]
    };

    for (const line of file.split("\n")) {
      const lineMatch = line.match(
        /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
      );

      if (!lineMatch || !lineMatch.groups) {
        continue;
      }

      const { fileName } = lineMatch.groups;

      const { transformationMatrix, coordinates, color } = getLineData(line) as LineType1Data;

      if (specialParts[fileName]) {
        const { name: specialElementName, type, internalName } = specialParts[fileName];

        console.log(
          "Found special element: ",
          specialElementName,
          "of type: ",
          type,
          "in submodel",
          name
        );
        const { basePosition } = lego.elements.special.devices[internalName];

        switch (type) {
          case "sensor": {
            newGraph[name].specialElements.push({
              name: internalName,
              // transformation.matrix.transform(
              rotation: transformation.matrix.transform(
                matrix([
                  [1, 0, 0],
                  [0, 0, -1],
                  [0, 1, 0]
                ]),
                transformationMatrix
              ),
              coordinate: transformation.point.transform(
                basePosition,
                coordinates,
                transformationMatrix
              )
            });
            break;
          }
          case "connection": {
            newGraph[name].connections.push({
              rotation: transformation.matrix.transform(
                matrix([
                  [1, 0, 0],
                  [0, 0, -1],
                  [0, 1, 0]
                ]),
                transformationMatrix
              ),
              coordinate: transformation.point.transform(
                basePosition,
                coordinates,
                transformationMatrix
              ),
              isMotor: color === "4"
            });
          }
        }
      }

      if (wheels[fileName]) {
        const { height, radius, coordinate } = wheels[fileName];

        newGraph[name].wheels.push({
          rotation: transformation.matrix.transform(
            matrix([
              [1, 0, 0],
              [0, 0, 1],
              [0, -1, 0]
            ]),
            transformationMatrix
          ),
          coordinate: transformation.point.transform(coordinate, coordinates, transformationMatrix),
          height,
          radius
        });
      }
    }
  }

  return newGraph;
};

const transformBasePosition = (lines: string[], basePosition: Point) =>
  lines.reduce((all, curr) => {
    const { transformationMatrix, coordinates } = getLineData(curr) as LineType1Data;

    return transformation.point.transform(all, coordinates, transformationMatrix);
  }, basePosition);

const transformArray = <T extends BaseElement[]>(
  specialElements: T,
  coordinates: Point,
  transformationMatrix: math.Matrix
) => {
  const newSpecialElements = [] as unknown as T;

  for (const element of specialElements) {
    const { coordinate: oldCoordinate, rotation, ...rest } = element;

    const newRotationMatrix = transformation.matrix.transform(transformationMatrix, rotation);

    // newSpecialElements.push({ name, line: newLine });
    newSpecialElements.push({
      ...rest,
      rotation: newRotationMatrix,
      coordinate: transformation.point.transform(oldCoordinate, coordinates, transformationMatrix)
    });
  }

  return newSpecialElements;
};

export const special = {
  ...specialParts,
  devices: partsDeviceInfo,
  extractFromDependecyGraph,
  transformArray,
  transformBasePosition
};
