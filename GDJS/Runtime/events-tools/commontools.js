/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @namespace common
 * @static
 * @private
 */
gdjs.evtTools.common = gdjs.evtTools.common || {};

/**
 * Get the value of a variable. Equivalent of variable.getAsNumber().
 * @param {gdjs.Variable} variable Variable.
 * @returns {number} Return the content of the variable as number.
 * @private
 */
gdjs.evtTools.common.getVariableNumber = function(variable) {
  return variable.getAsNumber();
};

/**
 * Get the string of a variable. Equivalent of variable.getAsString().
 * @param {gdjs.Variable} variable Variable.
 * @returns {string} Return the content of the variable as string.
 * @private
 */
gdjs.evtTools.common.getVariableString = function(variable) {
  return variable.getAsString();
};

/**
 * Check if a scene variable exist in a scene.
 * @param {gdjs.RuntimeScene} runtimeScene Scene.
 * @param {string} variableName Name of the variable.
 * @returns {boolean} Return the true is the scene variable exist.
 * @private
 */
gdjs.evtTools.common.sceneVariableExists = function(runtimeScene, variableName) {
  return runtimeScene.getVariables().has(variableName);
};

/**
 * Check if a child exist in a global variable in a scene.
 * @param {gdjs.RuntimeScene} runtimeScene Scene.
 * @param {string} variableName Name of the variable.
 * @returns {boolean} Return the true is the global variable.
 * @private
 */
gdjs.evtTools.common.globalVariableExists = function(runtimeScene, variableName) {
  return runtimeScene.getGame().getVariables().has(variableName);
};

/**
 * Check if a child exist in a variable.
 * @param {gdjs.Variable} variable Variable.
 * @param {string} childName Name of the child.
 * @returns {boolean} Return true if child exist in the variable.
 * @private
 */
gdjs.evtTools.common.variableChildExists = function(variable, childName) {
  return variable.hasChild(childName);
};

/**
 * Remove an child by a name in a variable.
 * @param {gdjs.Variable} variable Variable.
 * @param {string} childName Name of the child.
 * @returns {gdjs.Variable} Return the new variable without the child removed.
 * @private
 */
gdjs.evtTools.common.variableRemoveChild = function(variable, childName) {
  return variable.removeChild(childName);
};

/**
 * Clear the children in a variable.
 * @param {gdjs.Variable} variable Variable.
 * @private
 */
gdjs.evtTools.common.variableClearChildren = function(variable) {
  variable.clearChildren();
};

/**
 * Get the number of children in a variable.
 * @param {gdjs.Variable} variable Variable.
 * @returns {number} Return the number of childs in a variable.
 * @private
 */
gdjs.evtTools.common.getVariableChildCount = function(variable) {
  if (variable.isStructure() == false) return 0;
  return Object.keys(variable.getAllChildren()).length;
};

/**
 * Convert a string to a float.
 * @param {boolean} str Value to convert in float.
 * @returns {number} Return the value in float.
 * @private
 */
gdjs.evtTools.common.toNumber = function(str) {
  return parseFloat(str);
};

/**
 * Convert a number to a string.
 * @param {boolean} num Value to convert in string.
 * @returns {string} Return the value in string.
 * @private
 */
gdjs.evtTools.common.toString = function(num) {
  //Using String literal is fastest than using toString according to
  //http://jsperf.com/number-to-string/2 and http://jsben.ch/#/ghQYR
  return '' + num;
};

/**
 * Negate the boolean.
 * @param {boolean} bool Value to invert.
 * @returns {boolean} Value inverted.
 * @private
 */
gdjs.evtTools.common.logicalNegation = function(bool) {
  return !bool;
};

/**
 * Limit an value in a range
 * @param {number} x Value.
 * @param {number} min The minimum value.
 * @param {number} max The  maximum value.
 * @returns {number} The new value.
 */
gdjs.evtTools.common.clamp = function(x, min, max) {
  return Math.min(Math.max(x, min), max);
};

/**
 * Hyperbolic arc-cosine
 * @param {number} arg Value.
 * @returns {number} The hyperbolic arc-cosine for the value.
 */
gdjs.evtTools.common.acosh = function(arg) {
  // http://kevin.vanzonneveld.net
  // +   original by: Onno Marsman
  return Math.log(arg + Math.sqrt(arg * arg - 1));
};

/**
 * Hyperbolic arcsine
 * @param {number} arg Value.
 * @returns {number} The hyperbolic arcsine for the value.
 */
gdjs.evtTools.common.asinh = function(arg) {
  // http://kevin.vanzonneveld.net
  // +   original by: Onno Marsman
  return Math.log(arg + Math.sqrt(arg * arg + 1));
};

/**
 * Hyperbolic arctangent
 * @param {number} arg Value.
 * @returns {number} The hyperbolic arctangent for the value.
 */
gdjs.evtTools.common.atanh = function(arg) {
  // http://kevin.vanzonneveld.net
  // +   original by: Onno Marsman
  return 0.5 * Math.log((1 + arg) / (1 - arg));
};

/**
 * Hyperbolic cosine
 * @param {number} arg Value.
 * @returns {number} The hyperbolic cosine for the value.
 */
gdjs.evtTools.common.cosh = function(arg) {
  return (Math.exp(arg) + Math.exp(-arg)) / 2;
};

/**
 * Hyperbolic sine
 * @param {number} arg Value.
 * @returns {number} The hyperbolic sine for the value.
 */
gdjs.evtTools.common.sinh = function(arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / 2;
};

/**
 * Hyperbolic tangent
 * @param {number} arg Value.
 * @returns {number} The hyperbolic tangent for the value.
 */
gdjs.evtTools.common.tanh = function(arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
};

/**
 * Cotangent
 * @param {number} arg Value.
 * @returns {number} The cotangent for the value.
 */
gdjs.evtTools.common.cot = function(arg) {
  return 1 / Math.tan(arg);
};

/**
 * Cosecant
 * @param {number} arg Value.
 * @returns {number} The cosecant for the value.
 */
gdjs.evtTools.common.csc = function(arg) {
  return 1 / Math.sin(arg);
};

/**
 * Secant
 * @param {number} arg Value.
 * @returns {number} The secant for the value.
 */
gdjs.evtTools.common.sec = function(arg) {
  return 1 / Math.cos(arg);
};

/**
 * Base-10 logarithm
 * @param {number} arg Value.
 * @returns {number} The base-10 logarithm for the value.
 */
gdjs.evtTools.common.log10 = function(arg) {
  return Math.log(arg) / Math.LN10;
};

/**
 * Base-2 logarithm
 * @param {number} arg Value.
 * @returns {number} The base-2 logarithm for the value.
 */
gdjs.evtTools.common.log2 = function(arg) {
  return Math.log(arg) / Math.LN2;
};

/**
 * Sign of a number, check if the value is positive, negative or zero.
 * @param {number} arg Value.
 * @returns {number} Return the sign for the value (1,-1 or 0).
 */
gdjs.evtTools.common.sign = function(arg) {
  if (arg === 0) return 0;

  return arg > 0 ? +1 : -1;
};

/**
 * Cube root
 * @param {number} x Value.
 * @returns {number} Return the cube root for the value.
 */
gdjs.evtTools.common.cbrt = function(x) {
  return Math.pow(x, 1 / 3);
};

/**
 * Nth root
 * @param {number} x Base value.
 * @param {number} n Exponent value.
 * @returns {number} Return the nth root for the value.
 */
gdjs.evtTools.common.nthroot = function(x, n) {
  return Math.pow(x, 1 / n);
};

/**
 * Modulus for the values.
 * @param {number} x Dividend Value.
 * @param {number} y Divisor Value.
 * @returns {number} Return the remainder for the values.
 */
gdjs.evtTools.common.mod = function(x, y) {
  return x - y * Math.floor(x / y);
};

/**
 * Difference between two angles
 * @param {number} angle1 First angle.
 * @param {number} angle2 Second angle
 * @returns {number} Return the difference of the angles.
 */
gdjs.evtTools.common.angleDifference = function(angle1, angle2) {
  return gdjs.evtTools.common.mod(gdjs.evtTools.common.mod(angle1 - angle2, 360.0) + 180.0, 360.0) - 180.0;
};

/**
 * Linearly interpolate a to b by x
 * @param {number} a Start value.
 * @param {number} b End value.
 * @param {number} x The interpolation value between a and b.
 * @returns {number} Return the difference of the angles.
 */
gdjs.evtTools.common.lerp = function(a, b, x) {
  return a + (b - a) * x;
};

/**
 * Truncate a number
 * @param {number} x Value.
 * @returns {number} Return the value without decimals.
 */
gdjs.evtTools.common.trunc = function(x) {
  return x | 0;
};
