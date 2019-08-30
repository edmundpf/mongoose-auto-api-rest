jwt = require('jsonwebtoken')
uuid = require('uuidv4').default
validation = require('mongoose-auto-api.validation')
models = require('mongoose-auto-api.models')

userAuth = models.userAuth.model
secretKey = models.secretKey.model
AUTH_TOKEN = uuid()

#::: MISC FUNCTIONS :::

# Omit Properties from Object and get Copy

objOmit = (obj, keys) ->
	clone = Object.assign({}, obj)
	for key in keys
		delete obj[key]
	return clone

#: Get Error Object

errorObj = (error) ->
	return (
		message: error.message
		name: error.name
		trace: error.stack.split('\n')[1].trim()
	)

#::: SCHEMA FUNCTIONS :::

# Get Schema Info

schemaInfo = (model, primaryKey) ->
	schema = model.schema.paths
	listFields = []
	for key, value of schema
		if value.$isMongooseArray? and value.$isMongooseArray
			listFields.push(key)
	return
		schema: Object.keys(schema)
		primary_key: primaryKey
		list_fields: listFields

# Get Schema Info Async

schemaAsync = (model, primaryKey) ->
	Promise.resolve schemaInfo(model, primaryKey)

# Update Query

updateQuery = (req, primaryKey) ->
	updateQuery = objOmit(req.query, [ primaryKey ])
	if updateQuery.update_primary?
		updateQuery[primaryKey] = updateQuery.update_primary
		updateQuery.update_primary = null
	return updateQuery

# Allowed Password Check

allowedPassword = (req, res) ->
	userVal = validation.userVal(
		req.query.username,
		'username'
	)
	passVal = validation.passVal(
		req.query.password,
		'password'
	)
	error = validation.joinValidations([userVal, passVal])
	if !error.valid
		return(
			status: 'error'
			response: error
		)
	else
		return true

#::: RESPONSE FUNCTIONS :::

# Response/Error JSON

responseFormat = (method, args, req, res) ->
	try
		response = await method(...args);
		retJson =
			status: 'ok'
			response: response
		if res.locals.refresh_token?
			retJson.refresh_token = res.locals.refresh_token
		return res.json(retJson)
	catch error
		errJson =
			status: 'error'
			response: errorObj(error)
		if res.locals.refresh_token?
			errJson.refresh_token = res.locals.refresh_token
		return res.status(500).json(errJson)

# Incorrect Secret Key JSON

incorrectSecretKey = (res) ->
	res.status(401).json
		status: 'error'
		response:
			message: 'Incorrect secret key.'
			codes: [ 'SECRET_KEY_INCORRECT' ]

# Incorrect Username or Password JSON

incorrectUserOrPass = (res) ->
	res.status(401).json
		status: 'error'
		response:
			message: 'Incorrect username or password.'
			codes: [ 'USER_OR_PASSWORD_INCORRECT' ]

# User Not Found JSON

userNotFound = (res) ->
	res.status(401).json
		status: 'error'
		response:
			message: 'User does not exist.'
			codes: [ 'USER_NOT_FOUND' ]

# No Current Password JSON

noCurrentPass = (res) ->
	res.status(401).json
		status: 'error'
		response:
			message: 'Must include current password.'
			codes: [ 'PASSWORD_NO_CURRENT' ]

#::: TOKEN FUNCTIONS :::

# Sign JSON Web Token

signToken = (user) ->
	expires_in = 24 * 60 * 60
	access_token = jwt.sign(
		{
			username: user.username
			uid: user.uid
		},
		AUTH_TOKEN,
		expiresIn: expires_in
	)
	return
		username: user.username
		uid: user.uid
		access_token: access_token
		expires_in: expires_in

# Verify JSON Web Token

verifyToken = (req, res, next) ->
	if req.params.path?
		if req.params.path == 'secret_key'
			getAll = await secretKey.find({})
			if getAll.length <= 0
				return next()
		else if req.params.path == 'signup'
			getAll = await userAuth.find({})
			if getAll.length <= 0
				return next()
	token = req.query.auth_token or req.headers['x-access-token'] or req.headers['authorization']
	if !token
		return res.status(401).json(
			status: 'error'
			response:
				message: 'No token provided.'
		)
	else
		jwt.verify(
			token,
			AUTH_TOKEN,
			(error, decoded) ->
				currentTime = Math.round(Date.now() / 1000)
				expiresIn = 24 * 60 * 60
				oneHour = 60 * 60
				if error
					return res.status(401).json(
						status: 'error'
						response:
							message: 'Invalid token.'
					)
				else if currentTime < decoded.exp and currentTime + expiresIn > decoded.exp + oneHour
					res.locals.refresh_token = signToken(decoded)
					return next()
				else
					return next()
		)
	return

#::: EXPORTS :::

module.exports = {
	objOmit,
	errorObj,
	schemaAsync,
	updateQuery,
	allowedPassword,
	responseFormat,
	incorrectSecretKey,
	incorrectUserOrPass,
	userNotFound,
	noCurrentPass,
	signToken,
	verifyToken,
}

#::: End Program :::