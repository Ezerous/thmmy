const login = require('./../lib/auth').login;

it('non default credentials found in config file', async () => {
    const defaultCredentials = ['username','password'];
    expect([global.USERNAME, global.PASSWORD]).not.toEqual(defaultCredentials);
});

it('provided valid credentials, login is successful', async () => {
    expect.assertions(1);
    const loginResult = await login(global.USERNAME, global.PASSWORD);
    expect(JSON.stringify(loginResult)).toEqual(expect.stringContaining("THMMYgrC00ki3"));
});
