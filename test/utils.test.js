const moment = require('moment-timezone');
const forumTimeToUnix = require('./../lib/utils').forumTimeToUnix;

function generateDescription(forumTime, momentTime){
    return `converts "${forumTime}" to ${momentTime.toString()}`;
}

const dummyTodayTimestamp = moment.tz({hour: 23, minute: 12, seconds: 44}, "Europe/Athens").format('X');

const dummyTodayEN = "Today at 23:12:44";
const dummyTodayEL = "Σήμερα στις 23:12:44";

const todayTestEN = generateDescription(dummyTodayEN, dummyTodayTimestamp);
const todayTestEL = generateDescription(dummyTodayEL, dummyTodayTimestamp);

it(todayTestEN, () => {
    expect(forumTimeToUnix(dummyTodayEN)).toBe(parseInt(dummyTodayTimestamp));
});

it(todayTestEL, () => {
    expect(forumTimeToUnix(dummyTodayEL)).toBe(parseInt(dummyTodayTimestamp));
});

const dummyOldTimestamp = moment.tz("2016-11-12 19:57", "Europe/Athens").format('X');

const dummyOldEN = "November 12, 2016, 19:57:00";
const dummyOldEL = "Νοεμβρίου 12, 2016, 19:57:00";

const oldTestEN = generateDescription(dummyOldEN, dummyOldTimestamp);
const oldTestEL = generateDescription(dummyOldEL, dummyOldTimestamp);

it(oldTestEN, () => {
    expect(forumTimeToUnix(dummyOldEN)).toBe(parseInt(dummyOldTimestamp));
});

it(oldTestEL, () => {
    expect(forumTimeToUnix(dummyOldEL)).toBe(parseInt(dummyOldTimestamp));
});


const timeGapTimestamp = moment.tz("2019-03-31 03:25:43", "Europe/Athens").format('X');
const timeGapForumTime = "Μαρτίου 31, 2019, 03:25:43 am";
const timeGapTestDescription = generateDescription(timeGapForumTime, timeGapTimestamp);

it(timeGapTestDescription.toString(), () => {
    expect(forumTimeToUnix(timeGapForumTime)).toBe(parseInt(timeGapTimestamp));
});
