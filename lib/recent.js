let rp = require('request-promise');
const cheerio = require('cheerio');
const forumTimeToUnix = require('./utils').forumTimeToUnix;
const setErrorCode = require('./utils').setErrorCode;

const indexURL = 'https://www.thmmy.gr/smf/index.php?theme=4';

exports.getRecentPosts = async function(options) {
    let cookieJar = false;
    if(options && "cookieJar" in options)
        cookieJar = options.cookieJar;
    return await fetchRecentPosts(cookieJar).catch(error => {throw setErrorCode(error);});
};

function fetchRecentPosts(cookieJar) {
    return new Promise(function(resolve, reject) {
        rp({url: indexURL, jar: cookieJar})
            .then(function(html) {
                return resolve(extractRecent(html));
            })
            .catch(function(error) {
                return reject(error);
            });
    });
}

function extractRecent(html) {
    let recent = [];
    let topicTitle, topicId, timestamp, postId, poster, posterId, link;
    try {
        const $ = cheerio.load(html);

        $('#block8').find('div').first().children().each(function(i) {
            if(i%4===0)
            {
                topicTitle = $(this).find('a').attr('title').trim();
                link = $(this).find('a').attr('href');
                topicId = /topic=(\d+)/i.exec(link)[1];
                postId = /.msg(\d+)/i.exec(link)[1];
            }
            else if((i-1)%4===0){
                poster = $(this).find('a').text();
                posterId = $(this).find('a').attr('href');
                if(posterId)    //Null if poster is a guest
                    posterId = /u=(\d+)/i.exec(posterId)[1];
            }
            else if((i-2)%4===0){
                timestamp = $(this).text();
                timestamp = forumTimeToUnix(/\[(.*)]/i.exec(timestamp)[1]);
                recent.push(new RecentPost(topicId, topicTitle, timestamp, postId, poster, posterId));
            }
        });
        return recent;
    } catch (error) {
        throw setErrorCode(error,'EPARSE');
    }
}

class RecentPost {
    constructor(topicId, topicTitle, timestamp, postId, poster, posterId) {
        this.topicId = parseInt(topicId);
        this.topicTitle = topicTitle;
        this.timestamp = timestamp;
        this.postId = parseInt(postId);
        this.poster = poster;
        this.posterId = parseInt(posterId);
    }
}
