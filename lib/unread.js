import * as cheerio from 'cheerio';
import _ from 'lodash';
import client from './client.js';
import {forumTimeToUnix} from './utils.js';
import {unreadAllURL} from './constants.js';
import {EPARSE, setErrorCode} from './errors.js';

export async function getUnreadPosts(cookieJar, options) {
    options = assignOptions(options);

    const boards = options.boards;
    let unreadURL = unreadAllURL;
    if(boards.length > 0) unreadURL = unreadURL + ';boards=';

    for(let i=0; i<boards.length; i++){
        unreadURL = unreadURL + boards[i];
        if(i !== boards.length-1)
            unreadURL = unreadURL + ',';
    }

    // There are 20 unread posts per page, fetch a bit more, in case duplicates are found (low chance)
    const pagesToFetch = Math.ceil((options.unreadLimit + 5)/20); //

    return await fetch().catch(error => {throw error;});  //error.code is already set

    async function fetch(){
        let unreadPages, unreadPosts;
        try {
            unreadPages = await fetchUnreadPagesURLs();
            unreadPosts = await fetchUnread(unreadPages);
            unreadPosts.sort(function(a, b) {
                const postIdDiff = b.postId - a.postId;
                return postIdDiff === 0 ? b.timestamp - a.timestamp : postIdDiff;
            });
            unreadPosts = _.sortedUniqBy(unreadPosts, 'postId');
            return (options.unreadLimit<unreadPosts.length) ? unreadPosts.slice(0,options.unreadLimit) : unreadPosts;
        } catch (error) {
            throw setErrorCode(error);
        }
    }

    function fetchUnread(unreadPagesURLs) {
        return new Promise(function(resolve, reject) {
            let unreadPromises = [];

            unreadPagesURLs.forEach(function(unreadPageURL) {
                unreadPromises.push(fetchUnreadPage(unreadPageURL, cookieJar));
            });

            Promise.all(unreadPromises)
                .then(unreadPostsUnsorted => {
                    resolve([].concat(...unreadPostsUnsorted));
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    function fetchUnreadPage(unreadPageURL) {
        return new Promise(function(resolve, reject) {
            client.get(unreadPageURL, { cookieJar })
                .then(function({body}) {
                    return resolve(extractUnread(body));
                })
                .catch(function(error) {
                    return reject(error);
                });
        });
    }

    function fetchUnreadPagesURLs() {
        return new Promise(function(resolve, reject) {
            client.get(unreadURL, { cookieJar })
                .then(function({body}) {
                    return resolve(extractNavPages(body));
                })
                .catch(function(error) {
                    return reject(error);
                });
        });
    }

    function extractUnread(html) {
        let unread = [];
        let topicTitle, topicId, timestamp, postId, poster, tds, link, timeAndPoster, posterId, board, boardId;

        try {
            const $ = cheerio.load(html);
            $('table[class=bordercolor][cellspacing="1"]')
                .find('tr')
                .not('.titlebg')
                .each(function() {
                    tds = $(this).find('td');
                    topicTitle = tds.eq(2).find('a').first().text().trim();
                    link = tds.last().find('a').attr('href');
                    postId = /.msg(\d+)/g.exec(link)[1];
                    if(options.afterPostId >= parseInt(postId))
                        return false;
                    topicId = /topic=(\d+)/g.exec(link)[1];
                    timeAndPoster = tds.last().find('span');
                    posterId = timeAndPoster.find('a').attr('href');
                    if(posterId)    //Null if poster is a guest
                        posterId = /u=(\d+)/g.exec(posterId)[1];
                    timeAndPoster = timeAndPoster.text().trim();
                    poster = /(?:by|από)\s(.+)/g.exec(timeAndPoster)[1].trim();
                    timestamp = forumTimeToUnix(/.+/g.exec(timeAndPoster)[0]);
                    if(options.boardInfo){
                        board = tds.eq(2).find('span > a').last();
                        boardId = board.attr('href');
                        boardId = parseInt(/board=(\d+)/g.exec(boardId)[1]);
                        board = board.text().trim();
                        unread.push(new UnreadPost(topicId, topicTitle, timestamp, postId, poster, posterId, boardId, board));
                    }
                    else
                        unread.push(new UnreadPost(topicId, topicTitle, timestamp, postId, poster, posterId));
                });
            return unread;
        } catch (error) {
            throw setErrorCode(error, EPARSE);
        }
    }

    function extractNavPages(html) {
        let navPagesURLs = [];
        navPagesURLs.push(unreadURL);   // Always include the first page
        try {
            const $ = cheerio.load(html);
            const lastPageElement = $('td[class=middletext]').first().find('.navPages').last();
            if (lastPageElement.length>0){
                let lastPage = (/start=(\d+)/g.exec(lastPageElement.attr('href'))[1])/20 + 1;
                if(lastPage>pagesToFetch)
                    lastPage = pagesToFetch;
                for (let i = 2; i <= lastPage; i++)
                    navPagesURLs.push(unreadURL + ';start=' + (i-1)*20);
            }
            return navPagesURLs;
        } catch (error) {
            throw setErrorCode(error, EPARSE);
        }
    }
}

function assignOptions (options){
    let defaultOptions = {
        boards: [],
        boardInfo: false,
        unreadLimit: Infinity,
        afterPostId: -1
    };
    return Object.assign({}, defaultOptions, options);
}

class UnreadPost {
    constructor(topicId, topicTitle, timestamp, postId, poster, posterId, boardId, boardTitle) {
        this.topicId = parseInt(topicId);
        this.topicTitle = topicTitle;
        this.timestamp = timestamp;
        this.postId = parseInt(postId);
        this.poster = poster;
        this.posterId = parseInt(posterId);
        if(boardId) { // Otherwise parseInt will return null and it will be saved like that
            this.boardId = parseInt(boardId);
            this.boardTitle = boardTitle;   // Will be undefined anyway if boardId is undefined
        }
    }
}
