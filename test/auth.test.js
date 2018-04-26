const login = require('./../lib/auth').login;
const getCredentials = require('./utils').getCredentials;

const credentials = getCredentials();

it('non default credentials found in config file or in the environment', async () => {
    const defaultCredentials = {username: 'username', password: 'password'};
    expect(credentials).not.toEqual(defaultCredentials);
});

it('provided valid credentials, login is successful', async () => {
    expect.assertions(1);
    const loginResult = await login(credentials.username, credentials.password);
    expect(JSON.stringify(loginResult)).toEqual(expect.stringContaining("THMMYgrC00ki3"));
});
