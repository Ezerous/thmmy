import {getRecentPosts} from './../lib/recent';
import {getTopicBoards} from './../lib/topic';

describe('recent', () => {
    it('posts are retrieved successfully from sidebar', async () => {
        expect.assertions(1);
        const recentPosts = await getRecentPosts();
        expect(recentPosts).toBeDefined();
    });
});

describe('topic', () => {
    it('boards are retrieved successfully', async () => {
        expect.assertions(1);
        const topicBoards = await getTopicBoards(9609);
        expect(topicBoards.length).toBe(3);
    });
});
