let rp = require('request-promise-native');
const setErrorCode = require('./utils').setErrorCode;

const loginURL = 'https://www.thmmy.gr/smf/index.php?action=login2';

exports.login = function(userName, password) {
    return new Promise(function(resolve, reject) {
        let cookieJar = rp.jar();
        const options = {
            method: 'POST',
            url: loginURL,
            followAllRedirects: true,
            form: {
                user: userName,
                passwrd: password,
                cookielength: '-1'
            },
            jar: cookieJar
        };

        rp(options)
            .then(function() {
                if(cookieJar.getCookieString('https://www.thmmy.gr').includes('THMMYgrC00ki3'))
                    return resolve(cookieJar);
                else
                    return reject(setErrorCode(new Error('Authentication failed.'),'EAUTH'));
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
};
