const getRecentPosts = require('./../lib/recent').getRecentPosts;

describe('recent', () => {
    it('posts are retrieved successfully from sidebar', async () => {
        expect.assertions(1);
        const recentPosts = await getRecentPosts();
        expect(recentPosts).toBeDefined();
    });
});
