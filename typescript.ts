const moment = require('moment');
// Vous avez importé DateTime mais ne l'avez pas utilisé, donc je l'ai commenté.
const DateTime = require('luxon');

const min = 1000;
const max = 9999;
const code = Math.floor(Math.random() * (max - min + 1)) + min;

const expirationDate = moment().add(300, 'seconds').toDate();
const expirationTime = DateTime.DateTime.local().plus({ seconds: 300 }).toJSDate();

// console.log("expirationDate", typeof expirationDate, expirationDate);
// console.log("expirationTime", typeof expirationTime, expirationTime);
// console.log("code", code);
