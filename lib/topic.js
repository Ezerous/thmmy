let rp = require('request-promise-native');
const cheerio = require('cheerio');
const setErrorCode = require('./utils').setErrorCode;

const topicBaseURL = 'https://www.thmmy.gr/smf/index.php?topic=';   //Also apply ';theme=4' after applying topicId

exports.getTopicBoards = async function(topicId, options={}) {
    let cookieJar = false;
    if("cookieJar" in options)
        cookieJar = options.cookieJar;
    return await fetchBoards(topicId, cookieJar).catch(error => {throw setErrorCode(error);});
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

class Board {
    constructor(boardId, boardTitle) {
        this.boardId = parseInt(boardId);
        this.boardTitle = boardTitle;
    }
}
