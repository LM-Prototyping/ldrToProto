import { webots } from ".";
import { configuration } from "../configuration";
import { Globals } from "../global";
import { BuildElementFunction } from "../lego/types";
import { transformation } from "../transformation";
import { getSensorConfig } from "../utils";
import { deviceHintSphere, rotationMatrixToAngleAxis } from "./utils";

const distanceSensor: BuildElementFunction = ({ coordinate, direction, auxilierDirections }) => {
  if (!direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedNewPoint = transformation.point.toReal(coordinate);

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
    getSensorConfig(Globals.sensors).name
  );

  const faceSet = deviceHintSphere(transformedNewPoint, getSensorConfig(Globals.sensors).color);

  return {
    device,
    faceSet,
    portInfo: {
      type: "distance",
      ...getSensorConfig(Globals.sensors)
    }
  };
};

const compassSensor: BuildElementFunction = ({ coordinate, direction, auxilierDirections }) => {
  if (!direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedNewPoint = transformation.point.toReal(coordinate);

  const faceSet = deviceHintSphere(transformedNewPoint, getSensorConfig(Globals.sensors).color);

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
    getSensorConfig(Globals.sensors).name
  );

  return {
    device,
    faceSet: faceSet,
    portInfo: {
      type: "compass",
      ...getSensorConfig(Globals.sensors)
    }
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
    getSensorConfig(Globals.sensors).name,
    distance
  );

  return {
    device,
    faceSet: deviceHintSphere(
      transformation.point.multiply(transformedCoordinate, 1.01),
      getSensorConfig(Globals.sensors).color
    ),
    portInfo: {
      type: "touch",
      ...getSensorConfig(Globals.sensors)
    }
  };
};

export const webotsDevices = {
  distance: distanceSensor,
  touch: touchSensor,
  compass: compassSensor
};
