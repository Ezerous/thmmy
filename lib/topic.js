let rp = require('request-promise-native');
const cheerio = require('cheerio');
const setErrorCode = require('./utils').setErrorCode;
const getSesc = require('./auth').getSesc;
const isSescValid = require('./auth').isSescValid;

const topicBaseURL = 'https://www.thmmy.gr/smf/index.php?topic=';   //Also apply ';theme=4' after applying topicId

exports.getTopicBoards = async function(topicId, options={}) {
    options = assignOptions(options);
    return await fetchBoards(topicId, options.cookieJar).catch(error => { throw setErrorCode(error); });
};

exports.markTopicAsUnread = async function(topicId, cookieJar, options={}) {
    options = assignOptions(options);
    const sesc = (options.sesc) ? options.sesc : await getSesc(cookieJar).catch(error => { throw error; });     //error.code is already set
    return new Promise(function(resolve, reject) {
        const url = 'https://www.thmmy.gr/smf/index.php?action=markasread;sa=topic;topic=' + topicId + ';sesc=' + sesc;
        rp({url: url, jar: cookieJar})
            .then(function(html) {
                return isSescValid(html) ? resolve() : reject(setErrorCode(new Error('Invalid sesc!'),'EINVALIDSESC'));
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
};

function fetchBoards(topicId, cookieJar) {
    return new Promise(function(resolve, reject) {
        const topicURL = topicBaseURL+topicId+';theme=4';
        rp({url: topicURL, jar: cookieJar})
            .then(function(html) {
                return resolve(extractBoards(html));
            })
            .catch(function(error) {
                return reject(error);
            });
    });
}

function extractBoards(html) {
    let boards = [];
    let boardId, boardTitle;
    try {
        const $ = cheerio.load(html, {decodeEntities: false});
        $('div[class=nav]').find('a').each(function(i) {
            if(i>2){
                boardId = /board=(\d+)/i.exec($(this));
                if(boardId){
                    boardId=boardId[1];
                    boardTitle=$(this).html().trim();
                    boards.push(new Board(boardId, boardTitle));
                }
                else
                    return false;
            }
        });
        return boards;
    } catch (error) {
        throw setErrorCode(error,'EPARSE');
    }
}

function assignOptions (options){
    let defaultOptions = {
        cookieJar: false,
        sesc: false
    };
    return Object.assign({}, defaultOptions, options);
}

class Board {
    constructor(boardId, boardTitle) {
        this.boardId = parseInt(boardId);
        this.boardTitle = boardTitle;
    }
}
