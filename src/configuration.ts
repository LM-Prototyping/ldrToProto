export const configuration = {
  distance_sensor: {
    lookupTable: [0, 0, 0.03, 0.1, 0.1, 0.3, 2.55, 2.55, 0.012, 2.58, 255, 0],
    type: "sonar",
    numberOfRays: 5,
    aperture: 0.2618
  },
  brickPi: {
    required: true,
    fileName: "brickpi"
  },
  compass_sensor: {
    lookupTable: [],
    resolution: -1
  },
  rotational_motor: {
    maxVelocity: 20
  },
  motor_detection_color_id: 4, // do not increase
  max_sensors: 4, // do not increase
  sensors: [
    {
      name: "PORT_1",
      color: "#16a34a"
    },
    {
      name: "PORT_2",
      color: "#2563eb"
    },
    {
      name: "PORT_3",
      color: "#dc2626"
    },
    {
      name: "PORT_4",
      color: "#fde047"
    }
  ],
  max_motors: 4,
  motors: [
    {
      name: "PORT_A",
      color: "#f97316"
    },
    {
      name: "PORT_B",
      color: "#64748b"
    },
    {
      name: "PORT_C",
      color: "#7e22ce"
    },
    {
      name: "PORT_D",
      color: "#7f1d1d"
    }
  ],
  performance: {
    pointAccuracy: 2 // Between 2 and 4
  },
  wheelColor: "#333333",
  directories: {
    legoPartsLibrary: {
      basePath: "../legoParts",
      dirs: ["/parts", "/p"],
      colors: "/LDConfig.ldr"
    },
    webots: "../webotsWorkspace",
    robotConfiguration: "../ros2Workspace/src/brickpi3_ros2/configuration"
  }
};

