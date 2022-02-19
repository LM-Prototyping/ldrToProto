const createFromFile = (roboter: string, protoName: string) => {
  const proto = `
    PROTO ${protoName} [
      field SFVec3f     translation   0 0 0
      field SFRotation  rotation      0 1 0 0
      field SFString    controller    "<extern>"
    ]
    {
      Robot {
        translation IS translation
        rotation IS rotation
        controller IS controller
      ${roboter.replace(/Robot\s+{/, "")}
    }`;

  return proto;
};

export const proto = {
  createFromFile
};
