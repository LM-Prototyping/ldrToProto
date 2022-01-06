import { ProcessedFile } from "../parsers/types";
import { fileToShape } from "./fileToShape";

const createFromFile = (
  { modelLines, specialElements, hingeJoints, wheels }: ProcessedFile,
  protoName: string
) => {
  const indexedFaceSet = fileToShape(modelLines, specialElements, hingeJoints, wheels);

  const proto = `
    PROTO ${protoName} [
      field SFVec3f     translation   0 0 0
      field SFRotation  rotation      0 1 0 0
      field SFString    controller    ""
    ]
    {
      Robot {
        translation IS translation
        rotation IS rotation
        controller IS controller
      ${indexedFaceSet.replace(/Solid\s+{/, "")}
    }`;

  return proto;
};

export const proto = {
  createFromFile
};
