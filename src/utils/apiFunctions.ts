import jwt from 'jsonwebtoken'
import validation from 'mongoose-auto-api.validation'
import models from 'mongoose-auto-api.models'

const userAuth = models.userAuth.model
const secretKey = models.secretKey.model
const ONE_HOUR = 60 * 60
const ONE_DAY = 24 * ONE_HOUR
const TOKEN_EXPIRY = 7 * ONE_DAY

//::: MISC FUNCTIONS :::

// Omit Properties from Object and get Copy

const objOmit = (obj: any, keys: Array<string>) => {
	const clone = Object.assign({}, obj)
	for (const key of keys) {
		delete obj[key]
	}
	return clone
}

//: Get Error Object

const errorObj = (error) => ({
	message: error.message,
	name: error.name,
	trace: error.stack.split('\n')[1].trim(),
})

//: Parse Data Sort

const parseDataSort = (query, aggregate = false) => {
	let skip
	let limit = 0
	let sortOrder = 1
	let sortArgs: any = null
	let sortField = 'updatedAt'
	if (query.sort_order != null) {
		sortOrder = Number(query.sort_order)
	}
	if (query.sort_field != null) {
		sortField = query.sort_field
	}
	if (query.record_limit != null) {
		limit = Number(query.record_limit)
	}
	if (query.skip != null) {
		skip = Number(query.skip)
	}
	if (aggregate) {
		sortArgs = [
			{
				$sort: {
					[sortField]: sortOrder,
				},
			},
		]
		if (skip) {
			sortArgs.push({
				$skip: skip,
			})
		}
		if (limit !== 0) {
			sortArgs.push({
				$limit: limit,
			})
		}
	} else {
		sortArgs = {
			sort: {
				[sortField]: sortOrder,
			},
		}
		if (skip) {
			sortArgs.skip = skip
		}
		if (limit !== 0) {
			sortArgs.limit = limit
		}
	}
	return sortArgs
}

//::: SCHEMA FUNCTIONS :::

// Get Schema Info

const schemaInfo = (model) => ({
	schema: Object.keys(model.model.schema.paths),
	primary_key: model.primaryKey,
	list_fields: model.listFields,
	encrypt_fields: model.encryptFields,
	encode_fields: model.encodeFields,
	subdoc_fields: model.subDocFields,
})

// Get Schema Info Async

const schemaAsync = (model) => Promise.resolve(schemaInfo(model))

// Update Query

const updateQuery = (req, primaryKey) => {
	const query: any = objOmit(req.query, [primaryKey])
	if (query.update_primary != null) {
		query[primaryKey] = query.update_primary
		query.update_primary = null
	}
	return query
}

// Allowed Password Check

const allowedPassword = (req) => {
	const userVal = validation.userVal(req.query.username, 'username')
	const passVal = validation.passVal(req.query.password, 'password')
	const error = validation.joinValidations([userVal, passVal])
	if (!error.valid) {
		return {
			status: 'error',
			response: error,
		}
	} else {
		return true
	}
}

// Allowed Secret Key

const allowedSecretKey = (req) => {
	const error = validation.passVal(req.query.key, 'key')
	if (!error.valid) {
		return {
			status: 'error',
			response: error,
		}
	} else {
		return true
	}
}

//::: RESPONSE FUNCTIONS :::

// Response/Error JSON

const responseFormat = async (
	method,
	args,
	res,
	spreadArgs = true,
	lean = false,
	count = false
) => {
	let response
	try {
		response = spreadArgs ? method(...args) : method(args)
		response = lean ? await response.lean() : await response
		const retJson: any = {
			status: 'ok',
			response: count && Array.isArray(response) ? response.length : response,
		}
		if (res.locals.refresh_token != null) {
			retJson.refresh_token = res.locals.refresh_token
		}
		return res.json(retJson)
	} catch (error) {
		const errJson: any = {
			status: 'error',
			response: errorObj(error),
		}
		if (res.locals.refresh_token != null) {
			errJson.refresh_token = res.locals.refresh_token
		}
		return res.status(500).json(errJson)
	}
}

// Incorrect Secret Key JSON

const incorrectSecretKey = (res) =>
	res.status(401).json({
		status: 'error',
		response: {
			message: 'Incorrect secret key.',
			codes: ['SECRET_KEY_INCORRECT'],
		},
	})

// Incorrect Username or Password JSON

const incorrectUserOrPass = (res) =>
	res.status(401).json({
		status: 'error',
		response: {
			message: 'Incorrect username or password.',
			codes: ['USER_OR_PASSWORD_INCORRECT'],
		},
	})

// User Not Found JSON

const userNotFound = (res) =>
	res.status(401).json({
		status: 'error',
		response: {
			message: 'User does not exist.',
			codes: ['USER_NOT_FOUND'],
		},
	})

// No Current Password JSON

const noCurrentPass = (res) =>
	res.status(401).json({
		status: 'error',
		response: {
			message: 'Must include current password.',
			codes: ['PASSWORD_NO_CURRENT'],
		},
	})

//::: TOKEN FUNCTIONS :::

// Sign JSON Web Token (expires in 7 days)

const signToken = (user, curToken) => {
	const access_token = jwt.sign(
		{
			username: user.username,
			uid: user.uid,
		},
		curToken.k,
		{
			expiresIn: TOKEN_EXPIRY,
			header: {
				kid: String(curToken.exp),
			},
		}
	)
	return {
		username: user.username,
		uid: user.uid,
		access_token,
		expires_in: TOKEN_EXPIRY,
	}
}

// Verify JSON Web Token

const verifyToken = async (req, res, next) => {
	if (req.params.path != null) {
		let getAll
		if (req.params.path === 'update_secret_key') {
			getAll = await secretKey.find({})
			if (getAll.length <= 0) {
				return next()
			}
		} else if (req.params.path === 'signup') {
			getAll = await userAuth.find({})
			if (getAll.length <= 0) {
				return next()
			}
		}
	}
	const token =
		req.query.auth_token ||
		req.headers['x-access-token'] ||
		req.headers['authorization']
	if (!token) {
		return res.status(401).json({
			status: 'error',
			response: {
				message: 'No token provided.',
			},
		})
	} else {
		const jwtKeys = req.app.locals.jwtKeys
		jwt.verify(
			token,
			(header, cb) => {
				for (const key in jwtKeys) {
					if (jwtKeys[key].exp == header.kid) {
						return cb(null, jwtKeys[key].k)
					}
				}
				return cb(null, null)
			},
			(error, decoded) => {
				const currentTime = Math.round(Date.now() / 1000)
				if (error) {
					return res.status(401).json({
						status: 'error',
						response: {
							message: 'Invalid token.',
						},
					})
				} else if (
					currentTime < decoded.exp &&
					currentTime + ONE_DAY > decoded.exp + ONE_HOUR
				) {
					res.locals.refresh_token = signToken(decoded, jwtKeys.cur)
					return next()
				} else {
					return next()
				}
			}
		)
	}
}

//::: EXPORTS :::

export {
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
	ONE_DAY,
	TOKEN_EXPIRY,
}

//::: End Program :::
