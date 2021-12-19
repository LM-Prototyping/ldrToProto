export const shape = (...elements: string[]) => `
    Shape {
        ${elements.join("\n")}
    }
`;
