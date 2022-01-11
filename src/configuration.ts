export const configuration = {
  distance_sensor: {
    lookupTable: [0, 0, 0.03, 0.1, 0.1, 0.3, 2.55, 2.55, 0.012, 2.58, 255, 0],
    type: "sonar",
    numberOfRays: 5,
    aperture: 0.2618
  },
  rotational_motor: {
    maxVelocity: 20
  },
  motor_detection_color_id: 4
};
