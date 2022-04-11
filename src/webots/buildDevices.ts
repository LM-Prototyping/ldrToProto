import { webots } from ".";
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
  distance,
  direction,
  auxilierDirections
}) => {
  if (!distance || !direction || !auxilierDirections) {
    return { device: "", faceSet: "" };
  }

  const transformedCoordinate = transformation.point.toReal(coordinate);

  const rotation = transformation.matrix.rotationFromCoordinates(
    transformedCoordinate,
    direction,
    auxilierDirections[1],
    auxilierDirections[0]
  );

  let rotationAngleAxis = rotationMatrixToAngleAxis(rotation);

  const device = webots.devices.sensors.touch(
    transformedCoordinate,
    rotationAngleAxis,
    getSensorConfig(Globals.sensors).name,
    distance
  );

  return {
    device,
    faceSet: deviceHintSphere(
      transformation.point.multiply(transformedCoordinate, 1.1),
      getSensorConfig(Globals.sensors).color
    ),
    portInfo: {
      type: "touch",
      ...getSensorConfig(Globals.sensors)
    }
  };
};

const lightSensor: BuildElementFunction = ({ coordinate, direction, auxilierDirections }) => {
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

  const device = webots.devices.sensors.light(
    transformedNewPoint,
    rotationAngleAxis,
    getSensorConfig(Globals.sensors).name
  );

  const realDirection = transformation.point.subtract(
    transformedNewPoint,
    transformation.point.toReal(direction)
  );

  console.log(realDirection);

  const deviceHintSpherePosition = transformation.point.add(
    transformedNewPoint,
    transformation.point.multiply(realDirection, 0.4)
  );

  const faceSet = deviceHintSphere(
    deviceHintSpherePosition,
    getSensorConfig(Globals.sensors).color
  );

  return {
    device,
    faceSet,
    portInfo: {
      type: "light",
      ...getSensorConfig(Globals.sensors)
    }
  };
};

export const webotsDevices = {
  distance: distanceSensor,
  touch: touchSensor,
  compass: compassSensor,
  light: lightSensor
};
