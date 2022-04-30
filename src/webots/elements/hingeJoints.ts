import { configuration } from "../../configuration";
import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";

export const hingeJoint = (
  axis: Point,
  connectionAnchor: Point,
  endPoint: string,
  isMotor: boolean | string
) => {
  const { maxVelocity } = configuration.rotationalMotor;

  return `
    HingeJoint {
      jointParameters HingeJointParameters {
        axis ${transformation.point.toArray(axis).join(" ")}
        anchor ${transformation.point
          .addVarianceToArray(
            transformation.point.roundArray(transformation.point.toArray(connectionAnchor))
          )
          .join(" ")}
      }
      ${
        isMotor
          ? `
          device [
            RotationalMotor {
              name "${isMotor}"
              maxVelocity ${maxVelocity}
            }
            PositionSensor {
              name "${isMotor}_position"
              noise 0.0174
            }
          ]
        `
          : ""
      }
      endPoint ${endPoint}
    }
`;
};
