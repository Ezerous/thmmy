import got from 'got';

const client = got.extend({
	timeout: {request: 10000}
});

export default client;
