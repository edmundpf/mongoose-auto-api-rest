var allowedPassword, app, appRoutes, assert, bcrypt, cors, corsPort, databaseName, db, error, errorObj, express, incorrectSecretKey, incorrectUserOrPass, listMethods, listRoutes, models, mongoose, mongooseConnect, mongoosePort, noCurrentPass, normalMethods, normalRoutes, objOmit, p, responseFormat, routeMethods, schemaAsync, secretKey, serverConfig, serverPort, signToken, updateQuery, userAuth, userNotFound, verifyToken;

cors = require('cors');

assert = require('assert');

bcrypt = require('bcrypt');

express = require('express');

p = require('print-tools-js');

mongoose = require('mongoose');

models = require('mongoose-auto-api.models');

listRoutes = require('./utils/routeWrapper').listRoutes;

normalRoutes = require('./utils/routeWrapper').normalRoutes;

appRoutes = require('./utils/routeWrapper').appRoutes;

listMethods = require('./utils/routeWrapper').listMethods;

normalMethods = require('./utils/routeWrapper').normalMethods;

routeMethods = require('./utils/routeWrapper').routeMethods;

objOmit = require('./utils/apiFunctions').objOmit;

errorObj = require('./utils/apiFunctions').errorObj;

schemaAsync = require('./utils/apiFunctions').schemaAsync;

updateQuery = require('./utils/apiFunctions').updateQuery;

allowedPassword = require('./utils/apiFunctions').allowedPassword;

responseFormat = require('./utils/apiFunctions').responseFormat;

incorrectSecretKey = require('./utils/apiFunctions').incorrectSecretKey;

incorrectUserOrPass = require('./utils/apiFunctions').incorrectUserOrPass;

userNotFound = require('./utils/apiFunctions').userNotFound;

noCurrentPass = require('./utils/apiFunctions').noCurrentPass;

signToken = require('./utils/apiFunctions').signToken;

verifyToken = require('./utils/apiFunctions').verifyToken;

try {
  serverConfig = require('../../../appConfig.json');
} catch (error1) {
  error = error1;
  p.error('Could not load app config file.');
  process.exit(1);
}

serverPort = serverConfig.serverPort || process.env.PORT;

corsPort = serverConfig.corsPort;

mongoosePort = serverConfig.mongoosePort;

databaseName = serverConfig.databaseName;

userAuth = models.userAuth.model;

secretKey = models.secretKey.model;

//: MongoDB Config
mongooseConnect = async function() {
  try {
    return (await mongoose.connect(`mongodb://localhost:${mongoosePort}/${databaseName}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    }));
  } catch (error1) {
    error = error1;
    p.error('MongoDB Service is not started.');
    return process.exit(1);
  }
};

//: Server Connect
db = mongooseConnect();

app = express();

app.use(cors({
  origin: `http://localhost:${corsPort}`,
  exposedHeaders: ['X-Access-Token']
}));

app.listen(serverPort, () => {
  return p.titleBox('Data API Server', {
    titleDesc: `Running on port ${serverPort}`,
    tagLine: `Connecting to Mongo database: ${databaseName} on port ${mongoosePort}`
  });
});

//: All Routes
app.all(`/:path(${Object.keys(appRoutes).join('|')})/:method(${normalMethods.join('|')})`, verifyToken, async(req, res) => {
  var field, fields, i, len, model, primaryKey, unsetDict;
  model = appRoutes[req.params.path].model;
  primaryKey = appRoutes[req.params.path].primaryKey;
  //: Insert
  if (req.params.method === 'insert') {
    return (await responseFormat(model.create.bind(model), [req.query], req, res));
  //: Update
  } else if (req.params.method === 'update') {
    return (await responseFormat(model.updateOne.bind(model), [
      {
        [primaryKey]: req.query[primaryKey]
      },
      updateQuery(req,
      primaryKey)
    ], req, res));
  //: Delete
  } else if (req.params.method === 'delete') {
    return (await responseFormat(model.deleteOne.bind(model), [
      {
        [primaryKey]: req.query[primaryKey]
      }
    ], req, res));
  //: Delete All
  } else if (req.params.method === 'delete_all') {
    return (await responseFormat(model.deleteMany.bind(model), [{}], req, res));
  //: Get
  } else if (req.params.method === 'get') {
    return (await responseFormat(model.find.bind(model), [
      {
        [primaryKey]: req.query[primaryKey]
      }
    ], req, res));
  //: Get All
  } else if (req.params.method === 'get_all') {
    return (await responseFormat(model.find.bind(model), [{}], req, res));
  //: Get Schema Info
  } else if (req.params.method === 'schema') {
    return (await responseFormat(schemaAsync, [model, primary_key], req, res));
  //: Sterilize
  } else if (req.params.method === 'sterilize') {
    unsetDict = {};
    fields = req.query.fields.split(',');
    for (i = 0, len = fields.length; i < len; i++) {
      field = fields[i];
      unsetDict[field] = 1;
    }
    return (await responseFormat(model.updateMany.bind(model), [
      {},
      {
        $unset: unsetDict
      },
      {
        multi: true,
        strict: false
      }
    ], req, res));
  }
});

//: List Routes
app.all(`/:path(${Object.keys(listRoutes).join('|')})/:method(${listMethods.join('|')})`, verifyToken, async(req, res) => {
  var key, model, primaryKey, updateDict;
  model = appRoutes[req.params.path].model;
  primaryKey = appRoutes[req.params.path].primaryKey;
  if (['push', 'push_unique', 'set'].includes(req.params.method)) {
    updateDict = {};
    for (key in req.query) {
      if (![primaryKey, 'auth_token', 'refresh_token'].includes(key)) {
        if (req.params.method !== 'set') {
          updateDict[key] = {
            $each: req.query[key].split(',')
          };
        } else {
          updateDict[key] = req.query[key].split(',');
        }
      }
    }
    //: Push
    if (req.params.method === 'push') {
      return (await responseFormat(model.updateOne.bind(model), [
        {
          [primaryKey]: req.query[primaryKey]
        },
        {
          $push: updateDict
        }
      ], req, res));
    //: Push Unique
    } else if (req.params.method === 'push_unique') {
      return (await responseFormat(model.updateOne.bind(model), [
        {
          [primaryKey]: req.query[primaryKey]
        },
        {
          $addToSet: updateDict
        }
      ], req, res));
    //: Set
    } else if (req.params.method === 'set') {
      return (await responseFormat(model.updateOne.bind(model), [
        {
          [primaryKey]: req.query[primaryKey]
        },
        {
          $set: updateDict
        }
      ], req, res));
    }
  }
});

//: Login
app.all('/login', async(req, res) => {
  var passMatch, token, user;
  try {
    user = (await userAuth.findOne({
      username: req.query.username
    }));
    if (user) {
      passMatch = (await bcrypt.compare(req.query.password, user.password));
      if (!passMatch) {
        return incorrectUserOrPass(res);
      } else {
        token = signToken(user);
        return res.json({
          status: 'ok',
          response: token
        });
      }
    } else {
      return userNotFound(res);
    }
  } catch (error1) {
    error = error1;
    return res.status(500).json({
      status: 'error',
      response: errorObj(error)
    });
  }
});

//: Sign Up
app.all('/:path(signup)', verifyToken, async(req, res) => {
  var key, key_match, response, token;
  try {
    if (req.query.secret_key != null) {
      key = (await secretKey.find({}));
      if (key.length > 0) {
        key_match = (await bcrypt.compare(req.query.secret_key, key[key.length - 1].key));
        if (!key_match) {
          return incorrectSecretKey(res);
        }
      }
      allowedPassword(req, res);
      response = (await userAuth.create(req.query));
      if (req.query.username === response.username) {
        token = signToken(response);
        return res.json({
          status: 'ok',
          response: token
        });
      } else {
        return res.status(401).json({
          status: 'error',
          response: response
        });
      }
    } else {
      return res.status(401).json({
        status: 'error',
        response: {
          message: 'Not Authorized.'
        }
      });
    }
  } catch (error1) {
    error = error1;
    return res.status(500).json({
      status: 'error',
      response: errorObj(error)
    });
  }
});

//: Update Password
app.all('/update_password', async(req, res) => {
  var passMatch, passUpdate, user;
  try {
    user = (await userAuth.findOne({
      username: req.query.username
    }));
    if (user && (req.query.current_password != null)) {
      passMatch = (await bcrypt.compare(req.query.current_password, user.password));
      if (!passMatch) {
        return incorrectUserOrPass(res);
      }
    } else if (!user) {
      return userNotFound(res);
    } else if (req.query.current_password == null) {
      return noCurrentPass(res);
    }
    allowedPassword(req, res);
    passUpdate = (await userAuth.updateOne({
      username: req.query.username
    }, objOmit(req.query, ['username'])));
    if (passUpdate.nModified === 1) {
      return res.json({
        status: 'ok',
        response: {
          message: 'Password updated.'
        }
      });
    } else {
      return res.status(401).json({
        status: 'error',
        response: passUpdate
      });
    }
  } catch (error1) {
    error = error1;
    return res.status(500).json({
      status: 'error',
      response: errorObj(error)
    });
  }
});

//: Verify Token
app.all('/verify_token', verifyToken, (req, res) => {
  if (res.locals.refresh_token != null) {
    return res.json({
      status: 'ok',
      refresh_token: res.locals.refresh_token,
      response: {
        message: 'Token verified.'
      }
    });
  } else {
    return res.json({
      status: 'ok',
      response: {
        message: 'Token verified.'
      }
    });
  }
});

//: Exports
module.exports = app;
