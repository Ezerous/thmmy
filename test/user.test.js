import { login } from './../lib/auth.js';
import {getUnreadPosts} from './../lib/unread.js';
import {cookieName} from "../lib/constants.js";
import { getCredentials } from './misc/test.utils.js';

const credentials = getCredentials();
let loginData;

describe('auth', () => {
    it('non default credentials found in config file or in the environment', async () => {
        const defaultCredentials = {username: 'username', password: 'password'};
        expect(credentials).not.toEqual(defaultCredentials);
    });

    it('provided valid credentials, login is successful', async () => {
        loginData = await login(credentials.username, credentials.password);
        expect(JSON.stringify(loginData.cookieJar)).toEqual(expect.stringContaining(cookieName));
    });
});

describe('unread', () => {
    it('posts are retrieved successfully', async () => {
        expect.assertions(2);
        const unreadLimit = 35;
        const unreadPosts = await getUnreadPosts(loginData.cookieJar, {unreadLimit: unreadLimit});
        expect(unreadPosts).toBeTruthy();
        expect(unreadPosts.length).toBeLessThanOrEqual(unreadLimit);
    });
});
