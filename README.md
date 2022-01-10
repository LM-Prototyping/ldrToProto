# LDR To Proto parser

This program parses an _.ldr_ or _.mdr_ file, which are created by an LEGO Brickbuilder like [LeoCAD](#TODO), into an usable .proto file. The .proto file will be saved inside the specified Webots directory and can be directly used inside of webots.

It is desired to create robot protos out of already designed Mindstorm NXT robots.

> This program is not desired to handle complex robots. This is because webots only supports a certain level of complexity. What is possible and what is not can be found [here](#TODO)

## Installation

For using this program you need to have node and npm already set up. How you can install both of them is described [here](#TODO).

To install all the required dependencies run: `npm i`

## Usage

To start the parsing process just run:

```bash
npm start --
```

With the following argumnts:

| `-f <path to ldr or mdr file>` | Path to the file you want to parse                                          |
| ------------------------------ | --------------------------------------------------------------------------- |
| `-p <proto name>`              | Custom name of the resulting proto. Defaults to `LegoMindstormRoboterProto` |
| `-w <path to webots project>`  | Path to the webots project in which you want to use the proto               |

#### Example usage

```bash
npm start -- -f ../LeoCAD/foo.ldr -w ../webotsProject/
```

Will take the file `foo.ldr`, parses it and saved the resulting _.proto_ inside the proto directory of `webotsProject`.

## Supported elements

This program is especially designed to parse robots consisting out of NXT components. However, new components can be added with relative ease. How to add new components, line the newer Mindstorm EV3 components, can be found [here](#TODO).

Currently this program supports a number of different wheels, the NXT rotational Motor and a lot of the NXT sensors.

### Wheels

## How it works

## Add new elements

## Possibilities
