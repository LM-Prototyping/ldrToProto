export const solid = (
  transformation: string | null,
  rotation: string | null,
  elements: string[],
  boundingObject?: string
) => {
  const randomNumber = Math.floor(Math.random() * 10000);

  return `
    Solid {
        ${transformation ? "transformation " + transformation : ""}
        ${rotation ? "rotation " + rotation : ""}
        children [
            ${elements.join("\n")}
        ]
        ${boundingObject ? "boundingObject " + boundingObject : ""} 
        physics Physics {
        }
        name "${randomNumber}"
    }
`;
};
