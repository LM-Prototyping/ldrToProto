import { Globals } from "./global";

const shouldRemoveIgnoreFiles = () => Globals.performanceLevel >= 1;
const shouldApplyColorToFile = () => Globals.performanceLevel < 2;
const shouldReplaceWheels = () => Globals.performanceLevel >= 3;
const shouldRoundPoints = () => Globals.performanceLevel >= 4;

export const performance = {
  shouldRemoveIgnoreFiles,
  shouldApplyColorToFile,
  shouldRoundPoints,
  shouldReplaceWheels
};
