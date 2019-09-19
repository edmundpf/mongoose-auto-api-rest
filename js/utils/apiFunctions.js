var AUTH_TOKEN, allowedPassword, allowedSecretKey, errorObj, incorrectSecretKey, incorrectUserOrPass, jwt, models, noCurrentPass, objOmit, responseFormat, schemaAsync, schemaInfo, secretKey, signToken, updateQuery, userAuth, userNotFound, uuid, validation, verifyToken;

jwt = require('jsonwebtoken');

uuid = require('uuidv4').default;

validation = require('mongoose-auto-api.validation');

models = require('mongoose-auto-api.models');

userAuth = models.userAuth.model;

secretKey = models.secretKey.model;

AUTH_TOKEN = uuid();

//::: MISC FUNCTIONS :::

// Omit Properties from Object and get Copy
objOmit = function(obj, keys) {
  var clone, i, key, len;
  clone = Object.assign({}, obj);
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    delete obj[key];
  }
  return clone;
};

//: Get Error Object
errorObj = function(error) {
  return {
    message: error.message,
    name: error.name,
    trace: error.stack.split('\n')[1].trim()
  };
};

//::: SCHEMA FUNCTIONS :::

// Get Schema Info
schemaInfo = function(model) {
  return {
    schema: Object.keys(model.model.schema.paths),
    primary_key: model.primaryKey,
    list_fields: model.listFields,
    encrypt_fields: model.encryptFields
  };
};

// Get Schema Info Async
schemaAsync = function(model) {
  return Promise.resolve(schemaInfo(model));
};

// Update Query
updateQuery = function(req, primaryKey) {
  updateQuery = objOmit(req.query, [primaryKey]);
  if (updateQuery.update_primary != null) {
    updateQuery[primaryKey] = updateQuery.update_primary;
    updateQuery.update_primary = null;
  }
  return updateQuery;
};

// Allowed Password Check
allowedPassword = function(req) {
  var error, passVal, userVal;
  userVal = validation.userVal(req.query.username, 'username');
  passVal = validation.passVal(req.query.password, 'password');
  error = validation.joinValidations([userVal, passVal]);
  if (!error.valid) {
    return {
      status: 'error',
      response: error
    };
  } else {
    return true;
  }
};

// Allowed Secret Key
allowedSecretKey = function(req) {
  var error;
  error = validation.passVal(req.query.key, 'key');
  if (!error.valid) {
    return {
      status: 'error',
      response: error
    };
  } else {
    return true;
  }
};

//::: RESPONSE FUNCTIONS :::

// Response/Error JSON
responseFormat = async function(method, args, req, res, spreadArgs = true) {
  var errJson, error, response, retJson;
  try {
    if (spreadArgs) {
      response = (await method(...args));
    } else {
      response = (await method(args));
    }
    retJson = {
      status: 'ok',
      response: response
    };
    if (res.locals.refresh_token != null) {
      retJson.refresh_token = res.locals.refresh_token;
    }
    return res.json(retJson);
  } catch (error1) {
    error = error1;
    errJson = {
      status: 'error',
      response: errorObj(error)
    };
    if (res.locals.refresh_token != null) {
      errJson.refresh_token = res.locals.refresh_token;
    }
    return res.status(500).json(errJson);
  }
};

// Incorrect Secret Key JSON
incorrectSecretKey = function(res) {
  return res.status(401).json({
    status: 'error',
    response: {
      message: 'Incorrect secret key.',
      codes: ['SECRET_KEY_INCORRECT']
    }
  });
};

// Incorrect Username or Password JSON
incorrectUserOrPass = function(res) {
  return res.status(401).json({
    status: 'error',
    response: {
      message: 'Incorrect username or password.',
      codes: ['USER_OR_PASSWORD_INCORRECT']
    }
  });
};

// User Not Found JSON
userNotFound = function(res) {
  return res.status(401).json({
    status: 'error',
    response: {
      message: 'User does not exist.',
      codes: ['USER_NOT_FOUND']
    }
  });
};

// No Current Password JSON
noCurrentPass = function(res) {
  return res.status(401).json({
    status: 'error',
    response: {
      message: 'Must include current password.',
      codes: ['PASSWORD_NO_CURRENT']
    }
  });
};

//::: TOKEN FUNCTIONS :::

// Sign JSON Web Token
signToken = function(user) {
  var access_token, expires_in;
  expires_in = 24 * 60 * 60;
  access_token = jwt.sign({
    username: user.username,
    uid: user.uid
  }, AUTH_TOKEN, {
    expiresIn: expires_in
  });
  return {
    username: user.username,
    uid: user.uid,
    access_token: access_token,
    expires_in: expires_in
  };
};

// Verify JSON Web Token
verifyToken = async function(req, res, next) {
  var getAll, token;
  if (req.params.path != null) {
    if (req.params.path === 'update_secret_key') {
      getAll = (await secretKey.find({}));
      if (getAll.length <= 0) {
        return next();
      }
    } else if (req.params.path === 'signup') {
      getAll = (await userAuth.find({}));
      if (getAll.length <= 0) {
        return next();
      }
    }
  }
  token = req.query.auth_token || req.headers['x-access-token'] || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({
      status: 'error',
      response: {
        message: 'No token provided.'
      }
    });
  } else {
    jwt.verify(token, AUTH_TOKEN, function(error, decoded) {
      var currentTime, expiresIn, oneHour;
      currentTime = Math.round(Date.now() / 1000);
      expiresIn = 24 * 60 * 60;
      oneHour = 60 * 60;
      if (error) {
        return res.status(401).json({
          status: 'error',
          response: {
            message: 'Invalid token.'
          }
        });
      } else if (currentTime < decoded.exp && currentTime + expiresIn > decoded.exp + oneHour) {
        res.locals.refresh_token = signToken(decoded);
        return next();
      } else {
        return next();
      }
    });
  }
};

//::: EXPORTS :::
module.exports = {objOmit, errorObj, schemaAsync, updateQuery, allowedPassword, allowedSecretKey, responseFormat, incorrectSecretKey, incorrectUserOrPass, userNotFound, noCurrentPass, signToken, verifyToken};

//::: End Program :::
