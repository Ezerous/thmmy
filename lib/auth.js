import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import client from './client.js'
import {setErrorCode, EAUTH, EPARSE} from './errors.js';
import {domainURL, indexURL, loginURL, cookieName} from './constants.js';

export async function login(userName, password) {
    return new Promise(function(resolve, reject) {
        const cookieJar = new CookieJar();
        const options = {
            form: {
                user: userName,
                passwrd: password,
                cookielength: '-1'
            },
            cookieJar
        };

        client.post(loginURL, options)
            .then(function({body}) {
                if(cookieJar.getCookieStringSync(domainURL).includes(cookieName))
                    return resolve({cookieJar: cookieJar, sesc: extractSesc(body)});
                else
                    return reject(setErrorCode(new Error('Authentication failed.'), EAUTH));
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
}

function extractSesc(html){
    try {
        const $ = cheerio.load(html);
        const logoutLink = $('a[id=logoutbtn]').attr('href')
        return /;sesc=(\w+)/i.exec(logoutLink)[1];
    } catch (error) {
        throw setErrorCode(error, EPARSE);
    }
}

export function getSesc(cookieJar) {
    return new Promise(function(resolve, reject) {
        client.get(indexURL, {cookieJar})
            .then(function(html) {
                return resolve(extractSesc(html));
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
}

export function isSescValid(html) {
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
        throw setErrorCode(error,EPARSE);
    }
}
