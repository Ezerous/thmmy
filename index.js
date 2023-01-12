import {login, getSesc} from './lib/auth.js';
import {getUnreadPosts} from './lib/unread.js';
import {getRecentPosts} from './lib/recent.js';
import {getTopicBoards, markTopicAsUnread} from './lib/topic.js';
import {isForumReachable} from './lib/connectivity.js';
import {setErrorCode, EAUTH, EPARSE, EINVALIDSESC, EOTHER} from './lib/errors.js';

export {
    login,
    getSesc,
    getUnreadPosts,
    getRecentPosts,
    getTopicBoards,
    markTopicAsUnread,
    isForumReachable,
    setErrorCode,
    EAUTH,
    EPARSE,
    EINVALIDSESC,
    EOTHER
}
