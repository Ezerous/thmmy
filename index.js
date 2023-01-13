import {login, getSesc, isThmmyCookieExistent} from './lib/auth.js';
import {getUnreadPosts} from './lib/unread.js';
import {getRecentPosts} from './lib/recent.js';
import {getTopicBoards, markTopicAsUnread} from './lib/topic.js';
import {isForumReachable} from './lib/connectivity.js';
import {domainURL, indexBaseURL, cookieName} from './lib/constants.js';
import {setErrorCode, EAUTH, EPARSE, EINVALIDSESC, EOTHER} from './lib/errors.js';

export {
    login,
    getSesc,
    isThmmyCookieExistent,
    getUnreadPosts,
    getRecentPosts,
    getTopicBoards,
    markTopicAsUnread,
    isForumReachable,
    domainURL,
    indexBaseURL,
    cookieName,
    setErrorCode,
    EAUTH,
    EPARSE,
    EINVALIDSESC,
    EOTHER
}
