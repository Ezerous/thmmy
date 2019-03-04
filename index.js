exports.login = require('./lib/auth').login;
exports.getSesc = require('./lib/auth').getSesc;
exports.getUnreadPosts = require('./lib/unread').getUnreadPosts;
exports.getRecentPosts = require('./lib/recent').getRecentPosts;
exports.getTopicBoards = require('./lib/topic').getTopicBoards;
exports.markTopicAsUnread = require('./lib/topic').markTopicAsUnread;