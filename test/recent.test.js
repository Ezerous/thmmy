const login = require('./../lib/auth').login;
const getRecentPosts = require('./../lib/recent').getRecentPosts;

it('retrieves recent posts from sidebar', async () => {
    expect.assertions(1);
    const recentPosts = await getRecentPosts();
    expect(recentPosts).toBeDefined();
});
