const login = require('./../lib/auth').login;
const getCredentials = require('./misc/test.utils').getCredentials;
const getUnreadPosts = require('./../lib/unread').getUnreadPosts;
const getTopicBoards = require('./../lib/topic').getTopicBoards;

const credentials = getCredentials();
let cookieJar;

describe('auth', () => {
    it('non default credentials found in config file or in the environment', async () => {
        const defaultCredentials = {username: 'username', password: 'password'};
        expect(credentials).not.toEqual(defaultCredentials);
    });

    it('provided valid credentials, login is successful', async () => {
        expect.assertions(1);
        cookieJar = await login(credentials.username, credentials.password);
        expect(JSON.stringify(cookieJar)).toEqual(expect.stringContaining("THMMYgrC00ki3"));
    });
});

describe('unread', () => {
    it('posts are retrieved successfully', async () => {
        expect.assertions(2);
        const unreadLimit = 35;
        const unreadPosts = await getUnreadPosts(cookieJar.cookieJar, {unreadLimit: unreadLimit});
        expect(unreadPosts).toBeTruthy();
        expect(unreadPosts.length).toBeLessThanOrEqual(unreadLimit);
    });
});


describe('topic', () => {
    it('boards are retrieved successfully', async () => {
        expect.assertions(1);
        const topicBoards = await getTopicBoards(9609, cookieJar);
        expect(topicBoards.length).toBe(3);
    });
});
