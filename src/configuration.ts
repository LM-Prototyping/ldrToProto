export const configuration = {
  sensors: {
    distance: {
      lookupTable: [0, 0, 0.03, 0.1, 0.1, 0.3, 2.55, 2.55, 0.012, 2.58, 255, 0],
      type: "sonar",
      numberOfRays: 5,
      aperture: 0.2618
    },
    light: {
      width: 32,
      height: 32,
      fieldOfView: 0.25
    }
  },

  brickPi: {
    required: false,
    fileName: "brickpi"
  },
  rotationalMotor: {
    maxVelocity: 20
  },
  motorDetectionColorId: 4, // do not increase
  maxSensors: 4, // do not increase
  sensorsOnPorts: [
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
  maxMotors: 4,
  motorsOnPorts: [
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
    robotConfiguration: "../ros2Workspace/src/lm_ros2_utils/resource"
  },
  plugins: {
    motor: "webots_ros2.motor_plugin.MotorPlugin",
    distance: "webots_ros2.distance_plugin.DistancePlugin",
    touch: "webots_ros2.touch_plugin.TouchPlugin",
    compass: "webots_ros2.compass_plugin.CompassPlugin",
    light: "webots_ros2.light_plugin.LightPlugin",
    clock: "webots_ros2.clock_plugin.ClockPlugin"
  },
  contactMaterial: {
    defaultMaterial: "default",
    defaultWheel: "wheel",
    wheelWithoutMotor: "no_friction_wheel"
  }
};
