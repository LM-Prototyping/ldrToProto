import math from "mathjs";
import { FileNodeDict, LineType1Data, Point } from "../../parsers/types";
import { getLineData, line1ToString } from "../../parsers/utils";
import { transformation } from "../../transformation";
import { webots } from "../../webots";
import {
  DeviceInfoDict,
  FileNodeWithSpecialElementsDict,
  PartTypeDict,
  SpecialElement
} from "../types";

export const parts: PartTypeDict = {
  ms1040: {
    type: "sensor",
    name: "Accelerometer",
    internalName: "accelerometer"
  },
  ms1038: {
    type: "sensor",
    name: "Color Sensor",
    internalName: "color_sensor"
  },
  64892: {
    type: "sensor",
    name: "Color Sensor/ Color Lamp",
    internalName: "color_sensor_color_lamp"
  },
  ms1034: {
    type: "sensor",
    name: "Compass Sensor",
    internalName: "compass_sensor"
  },
  ms1044: {
    type: "sensor",
    name: "Gyroskop",
    internalName: "gyroskop"
  },
  ms1042: {
    type: "sensor",
    name: "Infrared Sensor",
    internalName: "infrared_sensor"
  },
  55969: {
    type: "sensor",
    name: "Light Sensor",
    internalName: "light_sensor"
  },
  ms1048: {
    type: "sensor",
    name: "RFID Sensor",
    internalName: "rfid_sensor"
  },
  55963: {
    type: "sensor",
    name: "Sound Sensor",
    internalName: "sound_sensor"
  },
  62840: {
    type: "sensor",
    name: "Temperatur Sensor",
    internalName: "temperatur_sensor"
  },
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
  53787: {
    type: "motor",
    name: "NXT Motor",
    internalName: "nxt_motor"
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
  }
};

export const extractFromDependecyGraph = (dependencyGraph: FileNodeDict) => {
  const newGraph = {} as FileNodeWithSpecialElementsDict;

  for (const node of Object.values(dependencyGraph)) {
    const { name, file } = node;

    newGraph[name] = { ...node, specialElements: [] as SpecialElement[] };

    for (const line of file.split("\n")) {
      const lineMatch = line.match(
        /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
      );

      if (!lineMatch || !lineMatch.groups) {
        continue;
      }

      const { fileName } = lineMatch.groups;

      if (parts[fileName]) {
        const { name: specialElementName, type, internalName } = parts[fileName];

        console.log(
          "Found special element: ",
          specialElementName,
          "of type: ",
          type,
          "in submodel",
          name
        );

        const { transformationMatrix, coordinates } = getLineData(line) as LineType1Data;

        const realRotationMatrix = transformation.matrix.ldrToWebots(
          transformationMatrix,
          coordinates
        );

        // console.log(transformationMatrix, realRotationMatrix);

        newGraph[name].specialElements.push({
          name: internalName,
          line: line,
          rotation: realRotationMatrix
        });
      }
    }
  }

  return newGraph;
};

const transformArray = (
  specialElements: SpecialElement[],
  coordinates: Point,
  transformationMatrix: math.Matrix
) => {
  const newSpecialElements = [] as SpecialElement[];

  for (const element of specialElements) {
    const { name, line, rotation } = element;

    const newLine = transformation.matrix.transform(line, coordinates, transformationMatrix);

    // newSpecialElements.push({ name, line: newLine });
    newSpecialElements.push(element);
  }

  return newSpecialElements;
};

export const special = {
  ...parts,
  devices: partsDeviceInfo,
  extractFromDependecyGraph,
  transformArray
};
