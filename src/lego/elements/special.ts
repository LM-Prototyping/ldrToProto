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
  55969: {
    type: "sensor",
    name: "Light Sensor",
    internalName: "light_sensor"
  },
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
      z: -75
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
      z: -75
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
  light_sensor: {
    basePosition: {
      x: 0,
      y: -45,
      z: -60
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
    buildElement: webotsDevices.light
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
