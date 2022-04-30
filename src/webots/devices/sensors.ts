import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";
import { Rotation } from "../types";

import { configuration } from "../../configuration";
import { webots } from "..";

const buildDistanceSensor = (t: Point, rotation: Rotation, name: string) => {
  const { lookupTable, type, numberOfRays, aperture } = configuration.sensors.distance;

  return `
    DistanceSensor {
      translation ${transformation.point.toString(t)}
      rotation ${transformation.point.toString(rotation as Point)} ${rotation.angle}
      name "${name}"
      lookupTable [${lookupTable.join(" ")}]
      type "${type}"
      numberOfRays ${numberOfRays}
      aperture ${aperture}
    }
`;
};

const buildTouchSensor = (t: Point, rotation: Rotation, name: string, distance: Point) => {
  if (!distance) {
    return "";
  }

  return `
    TouchSensor {
      name "${name}"
      boundingObject ${webots.elements.transform(
        t,
        rotation,
        webots.elements.geometry.box(transformation.point.multiply(distance, 0.0004))
      )}
    }
`;
};

const buildCompassSensor = (t: Point, rotation: Rotation, name: string) => {
  return `
    Compass {
      translation ${transformation.point.toString(t)}
      rotation ${transformation.point.toString(rotation as Point)} ${rotation.angle}
      zAxis FALSE
      name "${name}"
    }
  `;
};

const buildLightSensor = (t: Point, rotation: Rotation, name: string) => {
  const { fieldOfView, width, height } = configuration.sensors.light;

  return `
    Camera {
      translation ${transformation.point.toString(t)}
      rotation ${transformation.point.toString(rotation as Point)} ${rotation.angle}
      fieldOfView ${fieldOfView}
      width ${width}
      height ${height}
      name "${name}"
    }
  `;
};

export const sensors = {
  distance: buildDistanceSensor,
  touch: buildTouchSensor,
  compass: buildCompassSensor,
  light: buildLightSensor
};
