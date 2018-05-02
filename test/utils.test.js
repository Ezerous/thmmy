const moment = require('moment-timezone');
const forumTimeToUnix = require('./../lib/utils').forumTimeToUnix;

const dummyTodayTimestamp = moment.tz({hour: 23, minute: 12, seconds: 44}, "Europe/Athens").format('X');

const dummyTodayEN = "Today at 23:12:44";
const dummyTodayEL = "Σήμερα στις 23:12:44";

const todayTestEN = "converts \"" + dummyTodayEN + "\" to " + dummyTodayTimestamp;
const todayTestEL = "converts \"" + dummyTodayEL + "\" to " + dummyTodayTimestamp;

it(todayTestEN, () => {
    expect(forumTimeToUnix(dummyTodayEN)).toBe(parseInt(dummyTodayTimestamp));
});

it(todayTestEL, () => {
    expect(forumTimeToUnix(dummyTodayEL)).toBe(parseInt(dummyTodayTimestamp));
});

const dummyOldTimestamp = moment.tz("2016-11-12 19:57", "Europe/Athens").format('X');

const dummyOldEN = "November 12, 2016, 19:57:00";
const dummyOldEL = "Νοεμβρίου 12, 2016, 19:57:00";

const oldTestEN = "converts \"" + dummyOldEN + "\" to " + dummyOldTimestamp;
const oldTestEL = "converts \"" + dummyOldEL + "\" to " + dummyOldTimestamp;

it(oldTestEN, () => {
    expect(forumTimeToUnix(dummyOldEN)).toBe(parseInt(dummyOldTimestamp));
});

it(oldTestEL, () => {
    expect(forumTimeToUnix(dummyOldEL)).toBe(parseInt(dummyOldTimestamp));
});
