import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";
import { Rotation } from "../types";

import { configuration } from "../../configuration";

const buildDistanceSensor = (t: Point, rotation: Rotation, name: string) => {
  const { lookupTable, type, numberOfRays, aperture } = configuration.distance_sensor;

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

const buildTouchSensor = (t: Point, rotation: Rotation, name: string) => `
`;

const buildCompassSensor = (t: Point, rotation: Rotation, name: string) => `
`;

export const sensors = {
  distance: buildDistanceSensor,
  touch: buildTouchSensor,
  compass: buildCompassSensor
};
