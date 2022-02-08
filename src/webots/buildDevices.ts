import { webots } from ".";
import { configuration } from "../configuration";
import { Globals } from "../global";
import { BuildElementFunction } from "../lego/types";
import { transformation } from "../transformation";
import { deviceHintSphere, rotationMatrixToAngleAxis } from "./utils";

const distanceSensor: BuildElementFunction = ({ coordinate, direction }) => {
  if (!direction) {
    return { device: "", faceSet: "" };
  }

  const transformedNewPoint = transformation.point.toReal(coordinate);
  const transformedDir = transformation.point.toReal(direction);

  const rot = transformation.matrix.rotation(
    { x: 1, y: 0, z: 0 },
    transformation.point.subtract(transformedNewPoint, transformedDir)
  );
  let rotation = rotationMatrixToAngleAxis(rot, coordinate);

  const device = webots.devices.sensors.distance(
    transformedNewPoint,
    rotation,
    configuration.sensors[Globals.sensors].name
  );

  const faceSet = deviceHintSphere(
    transformedNewPoint,
    configuration.sensors[Globals.sensors].color
  );

  return {
    device,
    faceSet,
    portInfo: { type: "distance", ...configuration.sensors[Globals.sensors] }
  };
};

const touchSensor: BuildElementFunction = ({ coordinate, rotation, distance, direction }) => {
  if (!rotation || !distance || !direction) {
    return { device: "", faceSet: "" };
  }

  const transformedCoordinate = transformation.point.toReal(coordinate);

  const transformedNewPoint = transformation.point.toReal(coordinate);
  const transformedDir = transformation.point.toReal(direction);

  const rot = transformation.matrix.rotation(
    { x: 1, y: 0, z: 0 },
    transformation.point.subtract(transformedNewPoint, transformedDir)
  );
  let rotS = rotationMatrixToAngleAxis(rot, coordinate);

  const device = webots.devices.sensors.touch(
    transformedCoordinate,
    rotS,
    configuration.sensors[Globals.sensors].name,
    distance
  );

  const faceSet = [];

  faceSet.push(
    webots.elements.transform(
      transformedDir,
      rotS,
      webots.elements.shape(
        webots.elements.appearance.pbr("baseColor 1 1 1"),
        `geometry ${webots.elements.geometry.sphere(0.005)}`
      )
    )
  );

  faceSet.push(
    webots.elements.transform(
      transformedCoordinate,
      rotS,
      webots.elements.shape(
        webots.elements.appearance.pbr("baseColor 1 0 0"),
        `geometry ${webots.elements.geometry.sphere(0.005)}`
      )
    )
  );

  return {
    device,
    faceSet: faceSet.join(""),
    portInfo: { type: "touch", ...configuration.sensors[Globals.sensors] }
  };
};

export const webotsDevices = {
  distance: distanceSensor,
  touch: touchSensor
};
