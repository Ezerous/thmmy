import * as cheerio from 'cheerio';
import client from './client.js';
import {getSesc, isSescValid} from './auth.js';
import {setErrorCode, EINVALIDSESC, EPARSE} from './errors.js';
import {markTopicAsUnreadURL, topicBaseURL} from "./constants.js";

export async function getTopicBoards(topicId, options={}) {
    options = assignOptions(options);
    return await fetchBoards(topicId, options.cookieJar).catch(error => { throw setErrorCode(error); });
}

export async function markTopicAsUnread(topicId, cookieJar, options={}) {
    options = assignOptions(options);
    const sesc = (options.sesc) ? options.sesc : await getSesc(cookieJar).catch(error => { throw error; });     //error.code is already set
    return new Promise(function(resolve, reject) {
        const url = markTopicAsUnreadURL + topicId + ';sesc=' + sesc;
        client.get(url, { cookieJar })
            .then(function({body}) {
                return isSescValid(body) ? resolve() : reject(setErrorCode(new Error('Invalid sesc!'),EINVALIDSESC));
            })
            .catch(function(error) {
                return reject(setErrorCode(error));
            });
    });
}

function fetchBoards(topicId, cookieJar) {
    return new Promise(function(resolve, reject) {
        const topicURL = topicBaseURL + topicId + ';theme=4';
        client.get(topicURL, { cookieJar })
            .then(function({body}) {
                return resolve(extractBoards(body));
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
        throw setErrorCode(error,EPARSE);
    }
}

function assignOptions (options){
    let defaultOptions = {
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
