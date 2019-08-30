var ACCESS_TOKEN, PASSWORD1, PASSWORD2, SECRET_KEY, USERNAME, a, api, assert, createAssert, errorAssert, errorCodeAssert, get, okayAssert, p, port, post, remove, request, server, should, url;

a = require('axios');

p = require('print-tools-js');

assert = require('chai').assert;

should = require('chai').should();

api = server = port = url = null;

USERNAME = 'user@email.com';

PASSWORD1 = 'testPass1!';

PASSWORD2 = 'testPass2!';

SECRET_KEY = 'secretKeyTest';

ACCESS_TOKEN = '';

//: Start Server Hook
before(function(done) {
  this.timeout(5000);
  api = require('../index');
  port = require('../../../../appConfig.json').serverPort;
  url = `http://localhost:${port}`;
  return done();
});

//: Request
request = async function(endpoint, func, log) {
  var error, res;
  try {
    res = (await func(`${url}${endpoint}`));
    if (log) {
      p.chevron(`Status Code: ${res.status}`);
      p.bullet(JSON.stringify(res.data));
    }
    return {
      ...res.data,
      statusCode: res.status
    };
  } catch (error1) {
    error = error1;
    if (log) {
      p.chevron(`Status Code: ${error.response.status}`);
      p.bullet(JSON.stringify(error.response.data));
    }
    return {
      ...error.response.data,
      statusCode: error.response.status
    };
  }
};

//: Get Request
get = async function(endpoint, log = true) {
  return (await request(endpoint, a.get.bind(a), log));
};

//: Post Request
post = async function(endpoint, log = true) {
  return (await request(endpoint, a.post.bind(a), log));
};

//: Delete Request
remove = async function(endpoint, log = true) {
  return (await request(endpoint, a.delete.bind(a), log));
};

//: Error Response Assert
errorAssert = function(res, msg, args) {
  var extArgs, key, val;
  extArgs = true;
  if (args != null) {
    for (key in args) {
      val = args[key];
      if (res.response[key] !== val) {
        extArgs = false;
        break;
      }
    }
  }
  return assert.equal(res.status === 'error' && [401, 500].includes(res.statusCode) && res.response.message.includes(msg) && extArgs, true);
};

//: Error Response Code Assert
errorCodeAssert = function(res, codes) {
  var code, hasCodes, i, len;
  hasCodes = true;
  for (i = 0, len = codes.length; i < len; i++) {
    code = codes[i];
    if ((res.response.codes == null) || !res.response.codes.includes(code)) {
      hasCodes = false;
      break;
    }
  }
  return assert.equal(res.status === 'error' && [401, 500].includes(res.statusCode) && hasCodes, true);
};

//: Okay Response Assert
okayAssert = function(res, msg, args) {
  var extArgs, key, val;
  extArgs = true;
  if (args != null) {
    for (key in args) {
      val = args[key];
      if (res.response[key] !== val) {
        extArgs = false;
        break;
      }
    }
  }
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.message.includes(msg) && extArgs, true);
};

//: Creation Assert
createAssert = function(res) {
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && (res.response._id != null), true);
};

// Check that server has started
describe('Server Started', function() {
  return it('Server is on', function() {
    return assert(api != null);
  });
});

//: Initialization/Admin Setup
describe('Admin setup', function() {
  it('Init - Signup not protected', async function() {
    var res;
    res = (await get('/signup'));
    return errorAssert(res, 'Not Authorized');
  });
  it('Init - Secret Key endpoint not protected', async function() {
    var res;
    res = (await post('/secret_key/insert'));
    return errorAssert(res, 'validation failed');
  });
  it('Set Secret Key', async function() {
    var res;
    res = (await post(`/secret_key/insert?key=${SECRET_KEY}`));
    return createAssert(res);
  });
  it('Secret Key endpoint protected', async function() {
    var res;
    res = (await post('/secret_key/insert'));
    return errorAssert(res, 'No token provided');
  });
  it('Signup - Incorrect Secret Key', async function() {
    var res;
    res = (await post("/signup?username=testUser&password=testPassword&secret_key=incorrectKey"));
    return errorAssert(res, 'Incorrect secret key');
  });
  it('Signup - Invalid Username and Password', async function() {
    var res;
    res = (await post(`/signup?username=user&password=testPassword&secret_key=${SECRET_KEY}`));
    return errorCodeAssert(res, ['USERNAME_INVALID_EMAIL', 'PASSWORD_INVALID_PASSWORD']);
  });
  return it('Valid Signup', async function() {
    var res;
    res = (await post(`/signup?username=${USERNAME}&password=${PASSWORD1}&secret_key=${SECRET_KEY}`));
    if (res.response.access_token != null) {
      ACCESS_TOKEN = res.response.access_token;
    }
    return assert.equal(res.status === 'ok' && (res.response.access_token != null), true);
  });
});

//: Admin Validation
describe('Admin validation', function() {
  it('No token', async function() {
    var res;
    res = (await get('/verify_token'));
    return errorAssert(res, 'No token provided');
  });
  it('Invalid token', async function() {
    var res;
    a.defaults.headers.common.authorization = ACCESS_TOKEN;
    res = (await get('/verify_token?auth_token=invalidToken'));
    return errorAssert;
  });
  it('Verify token', async function() {
    var res;
    res = (await get('/verify_token'));
    return okayAssert(res, 'Token verified');
  });
  it('Login - User not found', async function() {
    var res;
    res = (await post("/login?username=fakeUser@email.com&password=fakePassword1!"));
    return errorAssert(res, 'User does not exist');
  });
  it('Login - Invalid password', async function() {
    var res;
    res = (await post(`/login?username=${USERNAME}&password=fakePassword1!`));
    return errorAssert(res, 'Incorrect username or password');
  });
  return it('Valid login', async function() {
    var res;
    res = (await post(`/login?username=${USERNAME}&password=${PASSWORD1}`));
    return assert.equal(res.status === 'ok' && (res.response.access_token != null), true);
  });
});

// Cleanup
after(function(done) {
  done();
  return process.exit(0);
});

//::: End Program :::
