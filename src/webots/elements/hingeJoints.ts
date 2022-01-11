import { configuration } from "../../configuration";
import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";

export const hingeJoint = (
  axis: Point,
  connectionAnchor: Point,
  endPoint: string,
  isMotor: boolean | string
) => {
  const { maxVelocity } = configuration.rotational_motor;

  return `
    HingeJoint {
      jointParameters HingeJointParameters {
        axis ${transformation.point.toArray(axis).join(" ")}
        anchor ${transformation.point.toArray(connectionAnchor).join(" ")}
      }
      ${
        isMotor
          ? `
          device [
            RotationalMotor {
              name "${isMotor}"
              maxVelocity ${maxVelocity}
            }
          ]
        `
          : ""
      }
      endPoint ${endPoint}
    }
`;
};
