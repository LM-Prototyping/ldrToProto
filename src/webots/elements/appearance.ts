const pbr = (color: string) => {
  return `appearance PBRAppearance {
        ${color}
        roughness 1
        metalness 0
    }`;
};

export const appearance = {
  pbr
};
