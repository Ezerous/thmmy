import moment from "moment-timezone";

/**
 * Converts a given forum time (formatted as %B %d, %Y, %H:%M:%S or %B %d, %Y, %I:%M:%S %p)
 * to a Unix Timestamp. Supports both English and Greek.
 */
export function forumTimeToUnix(forumTime) {
    if (/\D+\s\D+/i.test(forumTime)) {  //e.g. Today at 23:12:44 or Σήμερα στις 23:12:44
        const today = moment().format('MMMM DD, Y');
        const time = today + ', ' + /\S+\s\S+\s(\d+:\d+:\d+)/i.exec(forumTime)[1];
        return moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'Europe/Athens').unix();
    } else {    //e.g. November 12, 2016, 19:57:00 or Νοεμβρίου 12, 2016, 19:57:00
        const time = /(.*\d+)/i.exec(forumTime)[1];
        let momentTime = moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'Europe/Athens').unix();
        if (!momentTime)  //Locale 'en' failed, attempting conversion for 'el'
            momentTime = moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'el', 'Europe/Athens').unix();
        return momentTime;
    }
}

