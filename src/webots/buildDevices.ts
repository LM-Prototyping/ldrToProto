import { webots } from ".";
import { configuration } from "../configuration";
import { Globals } from "../global";
import { BuildElementFunction } from "../lego/types";
import { transformation } from "../transformation";
import { deviceHintSphere, rotationMatrixToAngleAxis } from "./utils";

const distanceSensor: BuildElementFunction = ({ coordinate, direction, auxilierDirections }) => {
  if (!direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedNewPoint = transformation.point.toReal(coordinate);
  const transformedDir = transformation.point.toReal(direction);

  // const rot = transformation.matrix.rotation(
  //   { x: 1, y: 0, z: 0 },
  //   transformation.point.subtract(transformedNewPoint, transformedDir)
  // );
  const rotation = transformation.matrix.rotationFromCoordinates(
    transformedNewPoint,
    direction,
    auxilierDirections[1],
    auxilierDirections[0]
  );

  let rotationAngleAxis = rotationMatrixToAngleAxis(rotation);

  const device = webots.devices.sensors.distance(
    transformedNewPoint,
    rotationAngleAxis,
    configuration.sensors[Globals.sensors % 4].name
  );

  const faceSet = deviceHintSphere(
    transformedNewPoint,
    configuration.sensors[Globals.sensors % 4].color
  );

  return {
    device,
    faceSet,
    portInfo: { type: "distance", ...configuration.sensors[Globals.sensors % 4] }
  };
};

const compassSensor: BuildElementFunction = ({ coordinate, direction, auxilierDirections }) => {
  if (!direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedNewPoint = transformation.point.toReal(coordinate);

  const faceSet = deviceHintSphere(
    transformedNewPoint,
    configuration.sensors[Globals.sensors % 4].color
  );

  const rotation = transformation.matrix.rotationFromCoordinates(
    transformedNewPoint,
    direction,
    auxilierDirections[1],
    auxilierDirections[0]
  );

  let rotationAngleAxis = rotationMatrixToAngleAxis(rotation);

  const device = webots.devices.sensors.compass(
    transformedNewPoint,
    rotationAngleAxis,
    configuration.sensors[Globals.sensors % 4].name
  );

  return {
    device,
    faceSet: faceSet,
    portInfo: { type: "compass", ...configuration.sensors[Globals.sensors % 4] }
  };
};

const touchSensor: BuildElementFunction = ({
  coordinate,
  rotation,
  distance,
  direction,
  auxilierDirections
}) => {
  if (!rotation || !distance || !direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedCoordinate = transformation.point.toReal(coordinate);

  const rotation2 = transformation.matrix.rotationFromCoordinates(
    transformedCoordinate,
    direction,
    auxilierDirections[1],
    auxilierDirections[0]
  );

  let rotationAngleAxis = rotationMatrixToAngleAxis(rotation2);

  const device = webots.devices.sensors.touch(
    transformedCoordinate,
    rotationAngleAxis,
    configuration.sensors[Globals.sensors % 4].name,
    distance
  );

  return {
    device,
    faceSet: deviceHintSphere(
      transformedCoordinate,
      configuration.sensors[Globals.sensors % 4].color
    ),
    portInfo: { type: "touch", ...configuration.sensors[Globals.sensors] }
  };
};

export const webotsDevices = {
  distance: distanceSensor,
  touch: touchSensor,
  compass: compassSensor
};
