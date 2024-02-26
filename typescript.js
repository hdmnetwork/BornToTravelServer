"use strict";
exports.__esModule = true;
var moment = require("moment");
var min = 1000;
var max = 9999;
var code = Math.floor(Math.random() * (max - min + 1)) + min;
var expirationDate = moment().add(300, 'seconds').toDate();
console.log("expirationDate", expirationDate);
