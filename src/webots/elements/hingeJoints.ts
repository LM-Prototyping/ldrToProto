import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";

export const hingeJoint = (axis: Point, connectionAnchor: Point, endPoint: string) => `
    HingeJoint {
        jointParameters HingeJointParameters {
            axis ${transformation.point.toArray(axis).join(" ")}
            anchor ${transformation.point.toArray(connectionAnchor).join(" ")}
        }
        endPoint ${endPoint}
    }
`;
