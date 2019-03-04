let rp = require('request-promise-native');
const cheerio = require('cheerio');
const setErrorCode = require('./utils').setErrorCode;

const indexURL = 'https://www.thmmy.gr/smf/index.php?theme=4';
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

exports.getSesc = function(cookieJar) {
    return new Promise(function(resolve, reject) {
        rp({url: indexURL, jar: cookieJar})
            .then(function(html) {
                try {
                    const $ = cheerio.load(html);
                    const logoutLink = $('a[id=logoutbtn]').attr('href');
                    return resolve(/;sesc=(\w+)/i.exec(logoutLink)[1]);
                } catch (error) {
                    return reject(setErrorCode(error,'EPARSE'));
                }
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
};

exports.isSescValid = function(html) {
    try {
        let sescIsValid = true;
        const $ = cheerio.load(html);
        $('tr[class=windowbg]>td[style="padding: 3ex;"]').each(function() {
            const errorText = $(this).text();
            if(errorText.includes("Session verification failed") || errorText.includes("Η επαλήθευση συνόδου απέτυχε"))
                sescIsValid = false;
        });
        return sescIsValid;
    } catch (error) {
        throw setErrorCode(error,'EPARSE');
    }
};
