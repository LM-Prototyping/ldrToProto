import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";
import { Rotation } from "../types";

const buildDistanceSensor = (t: Point, rotation: Rotation, name: string) => `
    DistanceSensor {
        translation ${transformation.point.toString(t)}
        rotation ${transformation.point.toString(rotation as Point)} ${rotation.angle}
        name "${name}"
        lookupTable [
            0 0 0.03
            0.1 0.1 0.3
            2.55 2.55 0.012
            2.58 255 0
        ]
        type "sonar"
        numberOfRays 5
        aperture 0.2618
    }

`;

export const sensors = {
  distance: buildDistanceSensor
};
