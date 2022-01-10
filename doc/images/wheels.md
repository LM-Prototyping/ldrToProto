# Wheels

Wheels are the only parts for which bounding objects are generated.

## Supported wheels

Values for radius and height are in cm.

| <img src="./images/22253c02.png" alt="22253c02" /> | **22253c02** <br>height: _2.8_ <br>radius: _2.48_  | <img src="./images/22253c01.png" alt="22253c01" />   | **22253c01** <br>height: _3_ <br>radius: _2.8_     |
| -------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| <img src="./images/6595c02.png" alt="6595c02" />   | **6595c02** <br>height: _2.8_ <br>radius: _2.48_   | <img src="./images/6595c01.png" alt="6595c01" />     | **6595c01** <br>height: _3_ <br>radius: _2.8_      |
| <img src="./images/22969c02.png" alt="22969c02" /> | **22969c02** <br>height: _6_ <br>radius: _5.2_     | <img src="./images/22969c01.png" alt="22969c01" />   | **22969c01** <br>height: _6_ <br>radius: _5.2_     |
| <img src="./images/56903c01.png" alt="56903c01" /> | **56903c01** <br>height: _0.75_ <br>radius: _1.17_ | <img src="./images/2695c01.png" alt="2695c01" />     | **2695c01** <br>height: _1.3_ <br>radius: _2.18_   |
| <img src="./images/56904c01.png" alt="56904c01" /> | **56904c01** <br>height: _1.4_ <br>radius: _2.15_  | <img src="./images/56145c01.png" alt="56145c01" />   | **56145c01** <br>height: _2.65_ <br>radius: _2.15_ |
| <img src="./images/56908c01.png" alt="56908c01" /> | **56908c01** <br>height: _3.8_ <br>radius: _4.1_   | <img src="./images/56908c02.png" alt="56908c02" />   | **56908c02** <br>height: _4_ <br>radius: _4.1_     |
| <img src="./images/2996c01.png" alt="2996c01" />   | **2996c01** <br>height: _4_ <br>radius: _3.44_     | <img src="./images/44772c02.png" alt="44772c02" />   | **44772c02** <br>height: _4_ <br>radius: _5.3_     |
| <img src="./images/44293.png" alt="44293" />       | **44293** <br>height: _1.4_ <br>radius: _1.84_     | <img src="./images/15038c01.png" alt="15038c01" />   | **15038c01** <br>height: _4_ <br>radius: _5.3_     |
| <img src="./images/88517c01.png" alt="88517c01" /> | **88517c01** <br>height: _1.8_ <br>radius: _5_     | <img src="./images/32004bc01.png" alt="32004bc01" /> | **32004bc01** <br>height: _2.3_ <br>radius: _3.4_  |

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
