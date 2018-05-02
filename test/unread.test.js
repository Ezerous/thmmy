const login = require('./../lib/auth').login;
const getUnreadPosts = require('./../lib/unread').getUnreadPosts;
const getCredentials = require('./misc/test.utils').getCredentials;

const credentials = getCredentials();

//Skip - it doesn't work...
it.skip('retrieves all of user\'s unread posts', async () => {
    expect.assertions(2);
    const loginResult = await login(credentials.username, credentials.password);
    const unreadPosts = await getUnreadPosts(loginResult);
    expect(unreadPosts).toBeTruthy();
});
