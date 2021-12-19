/*
 *  Alle Dateien die Elementen dieser Liste matchen werden beim parsen der .Dat files übersprungen
 *
 *  Das führt dazu, dass der Parser schneller durchläuft und weniger Vertices und edges entstehen.
 *  Das Bounding object in Webots wird dadurch kleiner, Berechnungen können schneller durchgeführt
 *  werden und die Systemanforderungen sinken.
 *
 *  Alle Teile sind Teile die sehr viele Edges und Vertices haben aber nicht notwendig sind für die
 *  Simulation. Dazu gehören zb die Female Kabelanschlüsse von Sensoren und Motoren und die Pegholes
 *  (Löcher für Verbindungen zwischen LEGO Bauteilen) von Bauteilen
 */

const partsToIgnore = [
  "54732", // Kabelanschluss
  "54725c01" // Wheel von LEGO NXT Motor
  //   "peghole" // Löcherk
];

const ignoreRegExp = new RegExp("(" + partsToIgnore.join("|") + ")");

export const ignore = {
  ...partsToIgnore,
  regexp: ignoreRegExp
};
