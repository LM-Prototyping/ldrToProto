import { Point } from "../../parsers/types";
import { transformation } from "../../transformation";
import { Rotation } from "../types";

export const transform = (coordinate: Point, rotation: Rotation, children: string) => `
    Transform {
        translation ${transformation.point
          .roundArray(transformation.point.toArray(coordinate))
          .join(" ")}
        rotation ${Object.values(rotation).join(" ")}
        children [
            ${children}
        ]
    }
    
`;
