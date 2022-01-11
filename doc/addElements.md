# Add elements

In this document you will find a description of how to add new wheels and sensors to the parser.

## General

Even tho the design of all elements will be converted only a few elements have a special characteristic and can be used by the robot in webots. A list of all usable elements can be found [here](#TODO)

## Add wheels

You can easily add new wheel by adding a new object to the `wheels.ts` file. You can find the wheels file by following this directory: [/src/lego/elements/wheels.ts](#TODO).
You will find a big object in here:

```typescript
const wheelParts: WheelPartDict = {
  "22253c02": {
    coordinate: { x: 0, y: 0, z: 0 },
    radius: 2.48,
    height: 2.8
  },
  ...
}
```

Each wheel is a single objects with a `coodinate`, `radius` and `height` property.

```typescript
interface Wheel {
  coordinate: Point;
  radius: number;
  height: number;
}
```

The key is the id of the wheel and the name of the wheels .data file. The coordinate property denotes the origin of the wheel component inside the .data file.

To add a new wheel simply add a new wheel object to the already existing _wheelParts_-object:

```typescript
const wheelParts: WheelPartDict = {
  ...,
  [wheelId]: {
    coordinate: <Offset of wheels origin>,
    radius: <Wheels radius>,
    height: <Wheels height>
  }
}
```
