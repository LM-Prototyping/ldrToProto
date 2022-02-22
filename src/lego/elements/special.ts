import math from "mathjs";
import { LineType1Data, Point } from "../../parsers/types";
import { getLineData } from "../../parsers/utils";
import { transformation } from "../../transformation";
import { LegoElement, Sensor } from "../../types";
import { webotsDevices } from "../../webots/buildDevices";
import { DeviceInfoDict, PartTypeDict } from "../types";

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
    direction: {
      x: 0,
      y: 0,
      z: -40
    },
    buildElement: webotsDevices.distance
  },
  touch_sensor: {
    basePosition: {
      x: 0,
      y: -40,
      z: -80
    },
    direction: { x: 0, y: 0, z: 0 },
    buildElement: webotsDevices.touch
  },
  compass_sensor: {
    basePosition: {
      x: 0,
      y: -40,
      z: -90
    },
    direction: {
      x: 0,
      y: 0,
      z: -40
    },
    auxilierDirections: [
      {
        x: 0,
        y: -20,
        z: 0
      },
      { x: 20, y: 0, z: 0 }
    ],
    buildElement: webotsDevices.compass
  },
  technic_pin: {
    basePosition: {
      x: 1,
      y: 0,
      z: 0
    },
    direction: {
      x: 0,
      y: 0,
      z: 1
    },
    buildElement: (s: Sensor) => ({ device: "", faceSet: "" })
  }
};

// export const extractFromDependecyGraph = (dependencyGraph: FileNodeDict) => {
//   const newGraph = {} as FileNodeWithSpecialElementsDict;

//   for (const node of Object.values(dependencyGraph)) {
//     const { name, file } = node;

//     newGraph[name] = {
//       ...node,
//       specialElements: [] as SpecialElement[],
//       connections: [] as ConnectionElement[],
//       wheels: [] as WheelElement[]
//     };

//     for (const line of file.split("\n")) {
//       const lineMatch = line.match(
//         /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
//       );

//       if (!lineMatch || !lineMatch.groups) {
//         continue;
//       }

//       const { fileName } = lineMatch.groups;

//       const { transformationMatrix, coordinates, color } = getLineData(line) as LineType1Data;

//       if (specialParts[fileName]) {
//         const { name: specialElementName, type, internalName } = specialParts[fileName];

//         console.log(
//           "Found special element: ",
//           specialElementName,
//           "of type: ",
//           type,
//           "in submodel",
//           name
//         );
//         const { basePosition } = lego.elements.special.devices[internalName];

//         if (internalName === specialParts[53793].internalName) {
//           // Touch sensor

//           // Search for all green connectors
//           const connectors = [];
//           let rotationMatrix = transformationMatrix;
//           for (const line of file.split("\n")) {
//             const lineMatch = line.match(
//               /^1\s+(#[A-Fa-f\d]{6}|\d+)\s+(-?\d*.?\d*\s+){12}(?<fileName>[\w\d#-_\//]*)\./
//             );

//             if (!lineMatch || !lineMatch.groups) {
//               continue;
//             }

//             const { fileName } = lineMatch.groups;

//             if (!specialParts[fileName] || specialParts[fileName].internalName !== "technic_pin") {
//               continue;
//             }

//             const {
//               transformationMatrix: tM,
//               coordinates,
//               color
//             } = getLineData(line) as LineType1Data;

//             // Color must be green for touch sensor
//             if (color !== "2") {
//               continue;
//             }

//             connectors.push(coordinates);
//             rotationMatrix = tM;
//           }

//           if (connectors.length != 4) {
//             console.log("Specifying bounding object for touch sensor only works with 4 pins");
//             continue;
//           }

//           // Connectors müssen immer in einer oberen ecke starten und dann die andere obere ecke nehmen
//           const sizeX = transformation.point.distance(connectors[0], connectors[1]);
//           const sizeZ = transformation.point.distance(connectors[0], connectors[3]);

//           const center = transformation.point.subtract(
//             coordinates,
//             transformation.point.add(
//               connectors[2],
//               transformation.point.multiply(
//                 transformation.point.subtract(connectors[2], connectors[0]),
//                 0.5
//               )
//             )
//           );

//           newGraph[name].specialElements.push({
//             name: internalName,
//             rotation: transformation.matrix.transform(
//               matrix([
//                 [1, 0, 0],
//                 [0, 0, -1],
//                 [0, 1, 0]
//               ]),
//               rotationMatrix
//             ),
//             coordinate: transformation.point.transform(center, coordinates, transformationMatrix),
//             distance: { x: sizeX, z: sizeZ, y: 20 }
//           });

//           continue;
//         }

//         switch (type) {
//           case "sensor": {
//             const { basePosition, direction } = lego.elements.special.devices[internalName];

//             if (!direction) {
//               continue;
//             }

//             newGraph[name].specialElements.push({
//               name: internalName,
//               // transformation.matrix.transform(
//               rotation: transformationMatrix, // transformation.matrix.transform(
//               //   matrix([
//               //     [1, 0, 0],
//               //     [0, 0, -1],
//               //     [0, 1, 0]
//               //   ]),
//               //   transformationMatrix
//               // ),
//               coordinate: transformation.point.transform(
//                 basePosition,
//                 coordinates,
//                 transformationMatrix
//               ),
//               direction: transformation.point.transform(
//                 transformation.point.add(basePosition, direction),
//                 coordinates,
//                 transformationMatrix
//               )
//             });
//             break;
//           }
//           case "connection": {
//             newGraph[name].connections.push({
//               rotation: transformation.matrix.transform(
//                 matrix([
//                   [1, 0, 0],
//                   [0, 0, -1],
//                   [0, 1, 0]
//                 ]),
//                 transformationMatrix
//               ),
//               coordinate: transformation.point.transform(
//                 basePosition,
//                 coordinates,
//                 transformationMatrix
//               ),
//               isMotor: color === "4"
//             });
//           }
//         }
//       }

//       if (wheels[fileName]) {
//         const { height, radius, coordinate } = wheels[fileName];

//         newGraph[name].wheels.push({
//           rotation: transformation.matrix.transform(
//             matrix([
//               [1, 0, 0],
//               [0, 0, -1],
//               [0, 1, 0]
//             ]),
//             transformationMatrix
//           ),
//           coordinate: transformation.point.transform(coordinate, coordinates, transformationMatrix),
//           height,
//           radius
//         });
//       }
//     }
//   }

//   return newGraph;
// };

const transformBasePosition = (lines: string[], basePosition: Point) =>
  lines.reduce((all, curr) => {
    const { transformationMatrix, coordinates } = getLineData(curr) as LineType1Data;

    return transformation.point.transform(all, coordinates, transformationMatrix);
  }, basePosition);

const transformArray = <T extends LegoElement[]>(
  specialElements: T,
  coordinates: Point,
  transformationMatrix: math.Matrix
) => {
  const newSpecialElements = [] as unknown as T;

  for (const element of specialElements) {
    const {
      coordinate: oldCoordinate,
      direction: oldDirection,
      rotation: oldRotation,
      auxilierDirections,
      // rotation,
      ...rest
    } = element as Sensor;

    newSpecialElements.push({
      ...rest,
      ...(oldRotation
        ? {
            rotation: transformation.matrix.transform(oldRotation, transformationMatrix)
          }
        : {}),
      ...(oldDirection
        ? {
            direction: transformation.point.transform(
              oldDirection,
              coordinates,
              transformationMatrix
            )
          }
        : {}),
      ...(auxilierDirections && auxilierDirections.length > 0
        ? {
            auxilierDirections: auxilierDirections.map((auxilierDirection) =>
              transformation.point.transform(auxilierDirection, coordinates, transformationMatrix)
            )
          }
        : {}),
      coordinate: transformation.point.transform(oldCoordinate, coordinates, transformationMatrix)
    });
  }

  return newSpecialElements;
};

export const special = {
  ...specialParts,
  devices: partsDeviceInfo,
  // extractFromDependecyGraph,
  transformArray,
  transformBasePosition
};
