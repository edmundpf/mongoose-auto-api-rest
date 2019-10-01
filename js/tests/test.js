var ACCESS_TOKEN, PASSWORD1, PASSWORD2, SECRET_KEY1, SECRET_KEY2, USERNAME, a, api, assert, createAssert, customerModel, errorAssert, errorCodeAssert, errorExistsAssert, findTest, fs, get, infoModel, models, okayAssert, okayExistsAssert, okayModAssert, p, port, post, productModel, remove, request, server, should, url;

a = require('axios');

fs = require('fs');

p = require('print-tools-js');

assert = require('chai').assert;

should = require('chai').should();

api = server = port = url = null;

USERNAME = 'user@email.com';

PASSWORD1 = 'testPass1!';

PASSWORD2 = 'testPass2!';

SECRET_KEY1 = 'secretKeyTest1!';

SECRET_KEY2 = 'secretKeyTest2!';

ACCESS_TOKEN = '';

customerModel = "{\n	name: 'customer',\n	schema: {\n		name: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		email: {\n			type: String,\n			unique: true,\n			required: true,\n		},\n		products: [{\n			type: String\n		}]\n	},\n}";

productModel = "{\n	name: 'product',\n	schema: {\n		name: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		price: {\n			type: Number,\n			unique: true,\n			required: true,\n		}\n	},\n}";

infoModel = "{\n	name: 'info',\n	schema: {\n		email: {\n			type: String,\n			unique: true,\n			required: true,\n			primaryKey: true,\n		},\n		location: {\n			type: String,\n			unique: true,\n			required: true,\n		}\n	},\n}";

models = {
  './models/customer.js': customerModel,
  './models/product.js': productModel,
  './models/info.js': infoModel
};

//: Start Server Hook
before(function(done) {
  var key, restServer, val;
  this.timeout(10000);
  if (!fs.existsSync('./models')) {
    fs.mkdirSync('./models');
  }
  for (key in models) {
    val = models[key];
    if (!fs.existsSync(key)) {
      fs.writeFileSync(key, `module.exports = ${val}`);
    }
  }
  restServer = require('../index');
  api = restServer.app;
  port = restServer.config.serverPort;
  url = `http://localhost:${port}`;
  return done();
});

//: Request
request = async function(endpoint, func, log) {
  var error, res;
  try {
    res = (await func(`${url}${endpoint}`));
    if (log) {
      console.log(`\n${'-'.repeat(process.stdout.columns)}`);
      p.chevron(`Status Code: ${res.status}`);
      p.bullet(`${JSON.stringify(res.data)}\n`, {
        log: false
      });
    }
    return {
      ...res.data,
      statusCode: res.status
    };
  } catch (error1) {
    error = error1;
    if (log) {
      console.log(`\n${'-'.repeat(process.stdout.columns)}`);
      p.chevron(`Status Code: ${error.response.status}`);
      p.bullet(`${JSON.stringify(error.response.data)}\n`, {
        log: false
      });
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

//: Error Response Exists Assert
errorExistsAssert = function(res, fields) {
  var field, hasFields, i, len;
  hasFields = false;
  for (i = 0, len = fields.length; i < len; i++) {
    field = fields[i];
    if (res.response[field] != null) {
      hasFields = true;
      break;
    }
  }
  return assert.equal(res.status === 'error' && [401, 500].includes(res.statusCode) && !hasFields, true);
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

//: Okay Response Exists Assert
okayExistsAssert = function(res, fields) {
  var field, hasFields, i, len;
  hasFields = true;
  for (i = 0, len = fields.length; i < len; i++) {
    field = fields[i];
    if (res.response[field] == null) {
      hasFields = false;
      break;
    }
  }
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && hasFields, true);
};

//: Okay Modification Assert
okayModAssert = function(res, field, num) {
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response[field] === num, true);
};

//: Creation Assert
createAssert = function(res) {
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && (res.response._id != null), true);
};

//: Find Test
findTest = async function(field, op, value, valField, valRes) {
  var query, res;
  query = [
    {
      field: field,
      op: op,
      value: value
    }
  ];
  query = new URLSearchParams({
    where: JSON.stringify(query)
  });
  res = (await get(`/customer/find?${query}`));
  return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response[0][valField] === valRes, true);
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
    res = (await post('/signup'));
    return errorAssert(res, 'Not Authorized');
  });
  it('Init - Secret Key endpoint protected', async function() {
    var res;
    res = (await post('/secret_key/insert'));
    return errorAssert(res, 'No token provided');
  });
  it('Init - Update Secret Key endpoint not protected', async function() {
    var res;
    res = (await post('/update_secret_key'));
    return errorAssert(res, 'Cannot read property');
  });
  it('Create Secret Key - Invalid Key', async function() {
    var res;
    res = (await post("/update_secret_key?key=test123"));
    return errorCodeAssert(res, ['KEY_INVALID_LENGTH', 'KEY_INVALID_PASSWORD']);
  });
  it('Create Secret Key', async function() {
    var res;
    res = (await post(`/update_secret_key?key=${SECRET_KEY1}`));
    return createAssert(res);
  });
  it('Update Secret Key endpoint protected', async function() {
    var res;
    res = (await post('/update_secret_key'));
    return errorAssert(res, 'No token provided');
  });
  it('Signup - Incorrect Secret Key', async function() {
    var res;
    res = (await post("/signup?username=testUser&password=testPassword&secret_key=incorrectKey"));
    return errorAssert(res, 'Incorrect secret key');
  });
  it('Signup - Invalid Username and Password', async function() {
    var res;
    res = (await post(`/signup?username=user&password=testPassword&secret_key=${SECRET_KEY1}`));
    return errorCodeAssert(res, ['USERNAME_INVALID_EMAIL', 'PASSWORD_INVALID_PASSWORD']);
  });
  return it('Valid Signup', async function() {
    var res;
    res = (await post(`/signup?username=${USERNAME}&password=${PASSWORD1}&secret_key=${SECRET_KEY1}`));
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
  it('Model route - no token', async function() {
    var res;
    res = (await get('/customer/get_all'));
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
  it('Update Secret Key', async function() {
    var res;
    res = (await post(`/update_secret_key?key=${SECRET_KEY2}`));
    return okayModAssert(res, 'nModified', 1);
  });
  it('Valid Signup after Secret Key update', async function() {
    var res;
    res = (await post(`/signup?username=zelda@email.com&password=testPassword123!&secret_key=${SECRET_KEY2}`));
    if (res.response.access_token != null) {
      ACCESS_TOKEN = res.response.access_token;
    }
    return assert.equal(res.status === 'ok' && (res.response.access_token != null), true);
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
  it('Valid login', async function() {
    var res;
    res = (await post(`/login?username=${USERNAME}&password=${PASSWORD1}`));
    return assert.equal(res.status === 'ok' && (res.response.access_token != null), true);
  });
  it('Password change - User not found', async function() {
    var res;
    res = (await post("/update_password?username=fakeUser@email.com&password=fakePassword1!&current_password=fakePassword2!"));
    return errorAssert(res, 'User does not exist');
  });
  it('Password change - Invalid password', async function() {
    var res;
    res = (await post(`/update_password?username=${USERNAME}&password=fakePassword1!&current_password=fakePassword2!`));
    return errorAssert(res, 'Incorrect username or password');
  });
  it('Password change - no current password', async function() {
    var res;
    res = (await post(`/update_password?username=${USERNAME}&password=fakePassword1!`));
    return errorAssert(res, 'Must include current password');
  });
  it('Password change - invalid password', async function() {
    var res;
    res = (await post(`/update_password?username=${USERNAME}&password=fakePassword&current_password=${PASSWORD1}`));
    return errorCodeAssert(res, ['PASSWORD_INVALID_PASSWORD']);
  });
  it('Valid password change', async function() {
    var res;
    res = (await post(`/update_password?username=${USERNAME}&password=${PASSWORD2}&current_password=${PASSWORD1}`));
    return okayAssert(res, 'Password updated');
  });
  return it('Post password change - valid login', async function() {
    var res;
    res = (await post(`/login?username=${USERNAME}&password=${PASSWORD2}`));
    return assert.equal(res.status === 'ok' && (res.response.access_token != null), true);
  });
});

//: API Methods
describe('API Methods', function() {
  it('Invalid insert', async function() {
    var res;
    res = (await post("/customer/insert?name=bob"));
    return errorAssert(res, 'validation failed');
  });
  it('Valid insert', async function() {
    var res;
    res = (await post("/customer/insert?name=bob&email=bob@email.com"));
    return okayExistsAssert(res, ['_id', 'uid']);
  });
  it('Invalid update', async function() {
    var res;
    res = (await post("/customer/update?name=joe"));
    return okayModAssert(res, 'nModified', 0);
  });
  it('Valid update', async function() {
    var res;
    res = (await post("/customer/update?name=bob&email=bob1@gmail.com"));
    return okayModAssert(res, 'nModified', 1);
  });
  it('Invalid get', async function() {
    var res;
    res = (await get("/customer/get?name=joe"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.length === 0, true);
  });
  it('Valid get', async function() {
    var res;
    res = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.length === 1 && (res.response[0]._id != null) && res.response[0].name === 'bob', true);
  });
  it('Valid get-all', async function() {
    var res;
    res = (await get("/customer/get_all"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.length === 1 && (res.response[0]._id != null) && res.response[0].name === 'bob', true);
  });
  it('Schema info - list fields', async function() {
    var res;
    res = (await get("/customer/schema"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.schema.includes('name') && res.response.list_fields.includes('products') && res.response.primary_key === 'name', true);
  });
  it('Schema info - encrypted fields', async function() {
    var res;
    res = (await get("/user_auth/schema"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.schema.includes('username') && res.response.encrypt_fields.includes('password') && res.response.primary_key === 'username', true);
  });
  it('Sterilize - remove obsolete, and set fields for all documents', async function() {
    var hasChanges, i, len, ref, res, user, users;
    res = (await get("/customer/sterilize?email=master@email.com&products=apples,oranges"));
    users = (await get("/customer/get_all"));
    hasChanges = true;
    ref = users.response;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      if (user.products[0] !== 'apples' || user.products[1] !== 'oranges' || user.email !== 'master@email.com') {
        hasChanges = false;
        break;
      }
    }
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.nModified === 1 && hasChanges, true);
  });
  it('Invalid delete', async function() {
    var res;
    await post("/customer/insert?name=tom&email=tom@email.com");
    await post("/customer/insert?name=jerry&email=jerry@email.com");
    res = (await remove("/customer/delete?name=barney"));
    return okayModAssert(res, 'deletedCount', 0);
  });
  it('Invalid find', async function() {
    var res;
    res = (await get("/customer/find?where="));
    return errorAssert(res, 'Arguments must be aggregate pipeline operators');
  });
  it('Valid $eq find', async function() {
    return (await findTest('email', '$eq', 'jerry@email.com', 'email', 'jerry@email.com'));
  });
  it('Valid $ne find', async function() {
    return (await findTest('email', '$ne', 'jerry@email.com', 'email', 'master@email.com'));
  });
  it('Valid $gt find', async function() {
    return (await findTest('email', '$gt', 'master@email.com', 'email', 'tom@email.com'));
  });
  it('Valid $gte find', async function() {
    return (await findTest('email', '$gte', 'master@email.com', 'email', 'master@email.com'));
  });
  it('Valid $lt find', async function() {
    return (await findTest('email', '$lt', 'master@email.com', 'email', 'jerry@email.com'));
  });
  it('Valid $in find', async function() {
    return (await findTest('email', '$in', ['master@email.com', 'fake@email.com'], 'email', 'master@email.com'));
  });
  it('Valid $nin find', async function() {
    return (await findTest('email', '$nin', ['master@email.com', 'tom@email.com'], 'email', 'jerry@email.com'));
  });
  it('Valid $lte find', async function() {
    return (await findTest('email', '$lte', 'master@email.com', 'email', 'master@email.com'));
  });
  it('Valid $strt find', async function() {
    return (await findTest('email', '$strt', 'master', 'email', 'master@email.com'));
  });
  it('Valid $end find', async function() {
    return (await findTest('email', '$end', 'y@email.com', 'email', 'jerry@email.com'));
  });
  it('Valid $cont find', async function() {
    return (await findTest('email', '$cont', 'aste', 'email', 'master@email.com'));
  });
  it('Valid $inc find', async function() {
    return (await findTest('products', '$inc', 'apples', 'email', 'master@email.com'));
  });
  it('Valid $ninc find', async function() {
    return (await findTest('products', '$ninc', 'apples', 'email', 'tom@email.com'));
  });
  it('Valid find w/ multiple arguments', async function() {
    var query, res;
    query = [
      {
        field: 'email',
        op: '$cont',
        value: 'master'
      },
      {
        field: 'products',
        op: '$inc',
        value: 'apples'
      },
      {
        field: 'email',
        op: '$gt',
        value: 'jerry'
      }
    ];
    query = new URLSearchParams({
      where: JSON.stringify(query)
    });
    res = (await get(`/customer/find?${query}`));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response[0].email === 'master@email.com', true);
  });
  it('Valid list field lookup', async function() {
    var query, res;
    query = [
      {
        field: 'email',
        op: '$cont',
        value: 'master'
      }
    ];
    query = new URLSearchParams({
      where: JSON.stringify(query)
    });
    await post("/product/insert?name=apples&price=2.50");
    await post("/product/insert?name=oranges&price=4.50");
    res = (await get(`/customer/find?${query}&from=product&local_field=products&foreign_field=name&as=productInfo`));
    await post("/product/delete_all");
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response[0].productInfo[0].name === 'apples', true);
  });
  it('Valid non-list field lookup', async function() {
    var query, res;
    query = [
      {
        field: 'email',
        op: '$cont',
        value: 'master'
      }
    ];
    query = new URLSearchParams({
      where: JSON.stringify(query)
    });
    await post("/info/insert?email=master@email.com&location=NY");
    res = (await get(`/customer/find?${query}&from=info&local_field=email&foreign_field=email&as=emailInfo`));
    await post("/info/delete_all");
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response[0].emailInfo.location === 'NY', true);
  });
  it('Valid find w/ no records found', async function() {
    var query, res;
    query = [
      {
        field: 'email',
        op: '$cont',
        value: 'debra'
      }
    ];
    query = new URLSearchParams({
      where: JSON.stringify(query)
    });
    res = (await get(`/customer/find?${query}`));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.length === 0, true);
  });
  it('Valid delete', async function() {
    var res;
    res = (await remove("/customer/delete?name=tom"));
    return okayModAssert(res, 'deletedCount', 1);
  });
  it('Valid push', async function() {
    var res, user;
    res = (await post("/customer/push?name=bob&products=apples,oranges"));
    user = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.nModified === 1 && user.response[0].products[2] === 'apples' && user.response[0].products[3] === 'oranges', true);
  });
  it('Invalid push unique', async function() {
    var res, user;
    res = (await post("/customer/push_unique?name=bob&products=apples,oranges"));
    user = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && user.response[0].products.length === 4, true);
  });
  it('Valid push unique', async function() {
    var res, user;
    res = (await post("/customer/push_unique?name=bob&products=pears,grapes"));
    user = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.nModified === 1 && user.response[0].products[4] === 'pears' && user.response[0].products[5] === 'grapes', true);
  });
  it('Valid set', async function() {
    var res, user;
    res = (await post("/customer/set?name=bob&products=beets,carrots"));
    user = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.nModified === 1 && user.response[0].products[0] === 'beets' && user.response[0].products[1] === 'carrots', true);
  });
  it('Valid set - no items', async function() {
    var res, user;
    res = (await post("/customer/set?name=bob&products=[]"));
    user = (await get("/customer/get?name=bob"));
    return assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response.nModified === 1 && user.response[0].products.length === 0, true);
  });
  it('Valid delete all', async function() {
    var res;
    res = (await remove("/customer/delete_all"));
    return okayModAssert(res, 'deletedCount', 2);
  });
  return it('Admin Auth cleanup', async function() {
    var secret, user;
    user = (await remove('/user_auth/delete_all'));
    secret = (await remove('/secret_key/delete_all'));
    p.success('Secret key and User Auth cleanup completed.');
    return assert.equal(user.status === 'ok' && user.statusCode === 200 && user.response.deletedCount === 2 && secret.status === 'ok' && secret.statusCode === 200 && secret.response.deletedCount === 1, true);
  });
});

// Cleanup
after(function(done) {
  var key, val;
  for (key in models) {
    val = models[key];
    if (fs.existsSync(key)) {
      fs.unlinkSync(key);
    }
  }
  if (fs.existsSync('./models')) {
    fs.rmdirSync('./models');
  }
  done();
  return process.exit(0);
});

//::: End Program :::
