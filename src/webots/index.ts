import { devices } from "./devices";
import { elements } from "./elements";
import { proto } from "./proto";
import { createRobot } from "./robot";

export const webots = {
  elements,
  devices,
  proto,
  robot: createRobot
};
