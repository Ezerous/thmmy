let rp = require('request-promise-native');
const cheerio = require('cheerio');
const forumTimeToUnix = require('./utils').forumTimeToUnix;
const setErrorCode = require('./utils').setErrorCode;

const unreadURL = 'https://www.thmmy.gr/smf/index.php?action=unread;all;theme=4';

exports.getUnreadPosts = async function(options) {
    let unreadFetcher = new UnreadFetcher(options);
    return await unreadFetcher.fetch().catch(error => {throw error;});  //error.code is already set
};

class UnreadFetcher {
    constructor(options) {
        this.cookieJar = options.cookieJar;
        this.boardInfo = options.boardInfo;
    }

    async fetch(){
        let unreadPages, unreadPosts;
        try {
            unreadPages = await this.fetchUnreadPagesURLs();
            unreadPosts = await this.fetchUnread(unreadPages);
            unreadPosts.sort(function(a, b) {
                return b.timestamp - a.timestamp;
            });
            return unreadPosts;
        } catch (error) {
            throw setErrorCode(error);
        }
    }


    fetchUnread(unreadPagesURLs) {
        let fetcher = this;
        return new Promise(function(resolve, reject) {
            let unreadPromises = [];

            unreadPagesURLs.forEach(function(unreadPageURL) {
                unreadPromises.push(fetcher.fetchUnreadPage(unreadPageURL, fetcher.cookieJar));
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

    fetchUnreadPage(unreadPageURL) {
        let fetcher = this;
        return new Promise(function(resolve, reject) {
            rp({url: unreadPageURL, jar: fetcher.cookieJar})
                .then(function(html) {
                    return resolve(fetcher.extractUnread(html));
                })
                .catch(function(error) {
                    return reject(error);
                });
        });
    }

    fetchUnreadPagesURLs() {
        let fetcher = this;
        return new Promise(function(resolve, reject) {
            rp({url: unreadURL, jar: fetcher.cookieJar})
                .then(function(html) {
                    return resolve(UnreadFetcher.extractNavPages(html));
                })
                .catch(function(error) {
                    return reject(error);
                });
        });
    }

    extractUnread(html) {
        let fetcher = this;
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
                    topicId = /topic=(\d+)/i.exec(link)[1];
                    postId = /.msg(\d+)/i.exec(link)[1];
                    timeAndPoster = tds.last().find('span');
                    posterId = timeAndPoster.find('a').attr('href');
                    if(posterId)    //Null if poster is a guest
                        posterId = /u=(\d+)/i.exec(posterId)[1];
                    timeAndPoster = timeAndPoster.text().trim();
                    poster = /(by|από)\s(.+)/i.exec(timeAndPoster)[2].trim();
                    timestamp = forumTimeToUnix(/.+/i.exec(timeAndPoster)[0]);
                    if(fetcher.boardInfo){
                        board = tds.eq(2).find('span > a').last();
                        boardId = board.attr('href');
                        boardId = parseInt(/board=(\d+)/i.exec(boardId)[1]);
                        board = board.text().trim();
                        unread.push(new UnreadPost(topicId, topicTitle, timestamp, postId, poster, posterId, boardId, board));
                    }
                    else
                        unread.push(new UnreadPost(topicId, topicTitle, timestamp, postId, poster, posterId));
                });
            return unread;
        } catch (error) {
            throw setErrorCode(error,'EPARSE');
        }
    }

    static extractNavPages(html) {
        let navPagesURLs = [];
        try {
            const $ = cheerio.load(html);
            const lastPage = $('td[class=middletext]').first().find('.navPages').last();
            if (lastPage) {
                const lastPageStart = /start=(\d+)/i.exec(lastPage.attr('href'))[1];
                for (let i = 0; i <= lastPageStart; i = i + 20)
                    navPagesURLs.push(unreadURL + ';start=' + i);
            }
            return navPagesURLs;
        } catch (error) {
            throw setErrorCode(error,'EPARSE');
        }
    }
}

class UnreadPost {
    constructor(topicId, topicTitle, timestamp, postId, poster, posterId, boardId, boardTitle) {
        this.topicId = parseInt(topicId);
        this.topicTitle = topicTitle;
        this.timestamp = timestamp;
        this.postId = parseInt(postId);
        this.poster = poster;
        this.posterId = parseInt(posterId);
        if(boardId) // Otherwise parseInt will return null and it will be saved like that
        {
            this.boardId = parseInt(boardId);
            this.boardTitle = boardTitle;   // Will be undefined anyway if boardId is undefined
        }
    }
}
