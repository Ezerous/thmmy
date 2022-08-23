/**
 * Returns credentials from the environment or, if not set, from the
 * test.setup.js file
 */
exports.getCredentials = function() {
    if(process.env.USERNAME && process.env.PASSWORD)
        return {username: process.env.USERNAME, password: process.env.PASSWORD};
    return {username: global.USERNAME, password: global.PASSWORD};
};
