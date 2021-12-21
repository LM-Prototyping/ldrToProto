export const solid = (
  transformation: string | null,
  rotation: string | null,
  shape: string,
  ...rest: string[]
) => {
  const randomNumber = Math.floor(Math.random() * 10000);

  return `
    Solid {
        ${transformation ? "transformation " + transformation : ""}
        ${rotation ? "rotation " + rotation : ""}
        children [
            DEF Shape_${randomNumber} ${shape}
            ${rest.join("\n")}
        ]
        boundingObject USE Shape_${randomNumber}
        physics Physics {
        }
        name "${randomNumber}"
    }
`;
};
