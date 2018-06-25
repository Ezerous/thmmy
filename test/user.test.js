const login = require('./../lib/auth').login;
const getCredentials = require('./misc/test.utils').getCredentials;
const getUnreadPosts = require('./../lib/unread').getUnreadPosts;

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
        expect.assertions(1);
        const unreadPosts = await getUnreadPosts(cookieJar);
        expect(unreadPosts).toBeTruthy();
    });
});
