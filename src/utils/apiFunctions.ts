// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import jwt from 'jsonwebtoken';
import { default as uuid } from 'uuidv4';
import validation from 'mongoose-auto-api.validation';
import models from 'mongoose-auto-api.models';

const userAuth = models.userAuth.model;
const secretKey = models.secretKey.model;
const AUTH_TOKEN = uuid();

//::: MISC FUNCTIONS :::

// Omit Properties from Object and get Copy

const objOmit = function(obj, keys) {
	const clone = Object.assign({}, obj);
	for (let key of Array.from(keys)) {
		delete obj[key];
	}
	return clone;
};

//: Get Error Object

const errorObj = error => ({
    message: error.message,
    name: error.name,
    trace: error.stack.split('\n')[1].trim()
});

//: Parse Data Sort

const parseDataSort = function(query, aggregate) {
	let skip;
	if (aggregate == null) { aggregate = false; }
	let limit = 0;
	let sortOrder = 1;
	let sortArgs = null;
	let sortField = 'updatedAt';
	if (query.sort_order != null) {
		sortOrder = Number(query.sort_order);
	}
	if (query.sort_field != null) {
		sortField = query.sort_field;
	}
	if (query.record_limit != null) {
		limit = Number(query.record_limit);
	}
	if (query.skip != null) {
		skip = Number(query.skip);
	}
	if (aggregate) {
		sortArgs = [
			{
				$sort: {
					// [sortField]: sortOrder
				}
			}
		];
		if (skip) {
			sortArgs.push({
				$skip: skip
			});
		}
		if (limit !== 0) {
			sortArgs.push({
				$limit: limit
			});
		}
	} else {
		sortArgs = {
			sort: {
				// [sortField]: sortOrder
			}
		};
		if (skip) {
			sortArgs.skip = skip;
		}
		if (limit !== 0) {
			sortArgs.limit = limit;
		}
	}
	return sortArgs;
};

//::: SCHEMA FUNCTIONS :::

// Get Schema Info

const schemaInfo = model => ({
    schema: Object.keys(model.model.schema.paths),
    primary_key: model.primaryKey,
    list_fields: model.listFields,
    encrypt_fields: model.encryptFields,
    encode_fields: model.encodeFields,
    subdoc_fields: model.subDocFields
});

// Get Schema Info Async

const schemaAsync = model => Promise.resolve(schemaInfo(model));

// Update Query

var updateQuery = function(req, primaryKey) {
	updateQuery = objOmit(req.query, [ primaryKey ]);
	if (updateQuery.update_primary != null) {
		updateQuery[primaryKey] = updateQuery.update_primary;
		updateQuery.update_primary = null;
	}
	return updateQuery;
};

// Allowed Password Check

const allowedPassword = function(req) {
	const userVal = validation.userVal(
		req.query.username,
		'username'
	);
	const passVal = validation.passVal(
		req.query.password,
		'password'
	);
	const error = validation.joinValidations([userVal, passVal]);
	if (!error.valid) {
		return{
			status: 'error',
			response: error
		};
	} else {
		return true;
	}
};

// Allowed Secret Key

const allowedSecretKey = function(req) {
	const error = validation.passVal(
		req.query.key,
		'key'
	);
	if (!error.valid) {
		return{
			status: 'error',
			response: error
		};
	} else {
		return true;
	}
};

//::: RESPONSE FUNCTIONS :::

// Response/Error JSON

const responseFormat = function(method, args, req, res, spreadArgs) {
	let response;
	if (spreadArgs == null) { spreadArgs = true; }
	try {
		if (spreadArgs) {
			response = await(method(
				// ...args
			)
			);
		} else {
			response = await(method(args));
		}
		const retJson = {
			status: 'ok',
			response
		};
		if (res.locals.refresh_token != null) {
			retJson.refresh_token = res.locals.refresh_token;
		}
		return res.json(retJson);
	} catch (error) {
		const errJson = {
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

const incorrectSecretKey = res => res.status(401).json({
    status: 'error',
    response: {
        message: 'Incorrect secret key.',
        codes: [ 'SECRET_KEY_INCORRECT' ]
    }});

// Incorrect Username or Password JSON

const incorrectUserOrPass = res => res.status(401).json({
    status: 'error',
    response: {
        message: 'Incorrect username or password.',
        codes: [ 'USER_OR_PASSWORD_INCORRECT' ]
    }});

// User Not Found JSON

const userNotFound = res => res.status(401).json({
    status: 'error',
    response: {
        message: 'User does not exist.',
        codes: [ 'USER_NOT_FOUND' ]
    }});

// No Current Password JSON

const noCurrentPass = res => res.status(401).json({
    status: 'error',
    response: {
        message: 'Must include current password.',
        codes: [ 'PASSWORD_NO_CURRENT' ]
    }});

//::: TOKEN FUNCTIONS :::

// Sign JSON Web Token (expires in 7 days)

const signToken = function(user) {
	const expires_in = 24 * 60 * 60 * 7;
	const access_token = jwt.sign(
		{
			username: user.username,
			uid: user.uid
		},
		AUTH_TOKEN,
		{expiresIn: expires_in}
	);
	return {
		username: user.username,
		uid: user.uid,
		access_token,
		expires_in
	};
};

// Verify JSON Web Token

const verifyToken = function(req, res, next) {
	if (req.params.path != null) {
		let getAll;
		if (req.params.path === 'update_secret_key') {
			getAll = await(secretKey.find({}));
			if (getAll.length <= 0) {
				return next();
			}
		} else if (req.params.path === 'signup') {
			getAll = await(userAuth.find({}));
			if (getAll.length <= 0) {
				return next();
			}
		}
	}
	const token = req.query.auth_token || req.headers['x-access-token'] || req.headers['authorization'];
	if (!token) {
		return res.status(401).json({
			status: 'error',
			response: {
				message: 'No token provided.'
			}
		});
	} else {
		jwt.verify(
			token,
			AUTH_TOKEN,
			(error, decoded) => {
				const currentTime = Math.round(Date.now() / 1000);
				const expiresIn = 24 * 60 * 60;
				const oneHour = 60 * 60;
				if (error) {
					return res.status(401).json({
						status: 'error',
						response: {
							message: 'Invalid token.'
						}
					});
				} else if ((currentTime < decoded.exp) && ((currentTime + expiresIn) > (decoded.exp + oneHour))) {
					res.locals.refresh_token = signToken(decoded);
					return next();
				} else {
					return next();
				}
		});
	}
};

//::: EXPORTS :::

export default {
	objOmit,
	errorObj,
	parseDataSort,
	schemaAsync,
	updateQuery,
	allowedPassword,
	allowedSecretKey,
	responseFormat,
	incorrectSecretKey,
	incorrectUserOrPass,
	userNotFound,
	noCurrentPass,
	signToken,
	verifyToken,
};

//::: End Program :::