const moment = require('moment-timezone');

/**
 * Converts a given forum time (format: %B %d, %Y, %H:%M:%S)
 * to a Unix Timestamp. Supports both English and Greek.
 */
exports.forumTimeToUnix = function(forumTime) {
    if (forumTime) {
        if (/\D+\s\D+/i.test(forumTime)) {
            //e.g. Today at 23:12:44 or Σήμερα στις 23:12:44
            const today = moment().format('MMMM DD, Y');
            const time = today + ', ' + /\S+\s\S+\s(\d+:\d+:\d+)/i.exec(forumTime)[1];
            return moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'Europe/Athens').unix();
        } else {
            //e.g. October 30, 2017, 14:26:51
            const time = /(.*\d+)/i.exec(forumTime)[1];
            let momentTime = moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'Europe/Athens').unix();
            if (momentTime)  //Success for 'en' locale
                return momentTime;
            else {   //Attempting conversion for 'el' locale
                return moment.tz(time, 'MMMM DD, Y, HH:mm:ss', 'el', 'Europe/Athens').unix();
            }
        }
    }
};

/**
 * Sets an error code (implicitly or not) to the given error
 */
exports.setErrorCode = function(error, code) {
    if(code)
        error.code = code;
    else if(!error.code)
    {
        if (error.error)    // Connection errors
            error.code = error.error.code;
        else
            error.code = 'EOTHER';
    }
    return error;
};
