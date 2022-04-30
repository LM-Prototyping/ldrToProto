import { configuration } from "../../configuration";

export const solid = (
  transformation: string | null,
  rotation: string | null,
  elements: string[],
  boundingObject?: string,
  { isWheel, isMotor }: { isWheel: boolean; isMotor: boolean } = { isMotor: false, isWheel: false }
) => {
  const randomNumber = Math.floor(Math.random() * 10000);

  const getContactMaterialName = () => {
    const { defaultMaterial, defaultWheel, wheelWithoutMotor } = configuration.contactMaterial;

    if (!isWheel) {
      return defaultMaterial;
    }

    if (isMotor) {
      return defaultWheel;
    }

    return wheelWithoutMotor;
  };

  return `
    Solid {
        name "${randomNumber}"
        ${transformation ? "transformation " + transformation : ""}
        ${rotation ? "rotation " + rotation : ""}
        children [
            ${elements.join("\n")}
        ]
        contactMaterial "${getContactMaterialName()}"
        ${boundingObject ? "boundingObject " + boundingObject : ""} 
        physics Physics {
        }
    }
`;
};
