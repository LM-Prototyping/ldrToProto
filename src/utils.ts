import Table from "cli-table";
import yaml from "js-yaml";
import fs from "fs";

import { PortInfo } from "./lego/types";
import { configuration } from "./configuration";

export const printDevicesOverview = (devicesOnPorts: PortInfo[]) => {
  console.log("Overview of used devices and ports:");

  const table = new Table({ head: ["Type", "Port", "Color"] });

  const rows = devicesOnPorts.map(({ name, type, color }) => [type, name, color]);

  table.push(...rows);
  console.log(table.toString());
};

export const writeDeviceInfoYaml = (devicesOnPorts: PortInfo[], robotName: string) => {
  const yamlAsString = yaml.dump({ devices: devicesOnPorts, name: robotName });

  fs.writeFileSync(
    configuration.directories.robotConfiguration + "/" + robotName + ".yaml",
    yamlAsString
  );
};

