fs = require('fs')
path = require('path')
https = require('https')
cors = require('cors')
assert = require('assert')
bcrypt = require('bcrypt')
express = require('express')
p = require('print-tools-js')
mongoose = require('mongoose')
publicIp = require('public-ip')
compression = require('compression')
models = require('mongoose-auto-api.models')

listRoutes = require('./utils/routeWrapper').listRoutes
normalRoutes = require('./utils/routeWrapper').normalRoutes
appRoutes = require('./utils/routeWrapper').appRoutes
listMethods = require('./utils/routeWrapper').listMethods
normalMethods = require('./utils/routeWrapper').normalMethods
routeMethods = require('./utils/routeWrapper').routeMethods

objOmit = require('./utils/apiFunctions').objOmit
errorObj = require('./utils/apiFunctions').errorObj
parseDataSort = require('./utils/apiFunctions').parseDataSort
schemaAsync = require('./utils/apiFunctions').schemaAsync
updateQuery = require('./utils/apiFunctions').updateQuery
allowedPassword = require('./utils/apiFunctions').allowedPassword
allowedSecretKey = require('./utils/apiFunctions').allowedSecretKey
responseFormat = require('./utils/apiFunctions').responseFormat
incorrectSecretKey = require('./utils/apiFunctions').incorrectSecretKey
incorrectUserOrPass = require('./utils/apiFunctions').incorrectUserOrPass
userNotFound = require('./utils/apiFunctions').userNotFound
noCurrentPass = require('./utils/apiFunctions').noCurrentPass
signToken = require('./utils/apiFunctions').signToken
verifyToken = require('./utils/apiFunctions').verifyToken
parseQuery = require('./utils/parseQuery')

try
	serverConfig = require('../../../appConfig.json')
catch error
	serverConfig = require('./data/defaultConfig.json')
	p.warning('Could not load app config file, using default configuration.')


serverPort = if process.env.NODE_ENV == 'production' then process.env.PORT || serverConfig.serverPort else serverConfig.serverPort + 10
corsPort = if process.env.NODE_ENV == 'production' then process.env.WEB_PORT || serverConfig.webPort else serverConfig.webPort + 10
mongoosePort = serverConfig.mongoosePort
databaseName = serverConfig.databaseName
userAuth = models.userAuth.model
secretKey = models.secretKey.model
serverAddress = null
app = express()

#: MongoDB Config

mongooseConnect = () ->
	try
		return await mongoose.connect("mongodb://localhost:#{mongoosePort}/#{databaseName}",
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		)
	catch error
		p.error('MongoDB Service is not started.')
		process.exit(1)

#: Server Started Function

serverStarted = () =>
	p.success("Public IP: #{serverAddress}", log: false)
	p.titleBox(
		"Data API Server"
		titleDesc: "Running on port #{serverPort}"
		tagLine: "Connecting to Mongo database: #{databaseName} on port #{mongoosePort}"
	)

#: Init Server

init = () ->

	try
		serverAddress = await publicIp.v4()
	catch error
		serverAddress = 'localhost'
	await mongooseConnect()

#: Start Server

start = () ->

	keyPath = if serverConfig.sslKey then serverConfig.sslKey else "/etc/letsencrypt/live/#{serverConfig.serverAddress}/privkey.pem"
	certPath = if serverConfig.sslCert then serverConfig.sslCert else "/etc/letsencrypt/live/#{serverConfig.serverAddress}/cert.pem"
	chainPath = if serverConfig.sslChain then serverConfig.sslChain else "/etc/letsencrypt/live/#{serverConfig.serverAddress}/chain.pem"
	keyPath = path.resolve(keyPath)
	certPath = path.resolve(certPath)
	chainPath = path.resolve(chainPath)

	keyExists = fs.existsSync(keyPath)
	certExists = fs.existsSync(certPath)
	chainExists = fs.existsSync(chainPath)

	app.use(compression())

	if serverConfig.serverAddress != 'localhost' and keyExists and certExists and chainExists

		app.use(
			cors(
				origin: [
					"http://localhost:#{corsPort}"
					"https://localhost:#{corsPort}"
					"http://#{serverAddress}:#{corsPort}"
					"https://#{serverAddress}:#{corsPort}"
					"http://#{serverConfig.serverAddress}:#{corsPort}"
					"https://#{serverConfig.serverAddress}:#{corsPort}"
				]
				exposedHeaders: [ 'X-Access-Token' ],
			)
		)

		p.success('Secure server starting...', log: false)
		https.createServer(
			{
				key: fs.readFileSync(keyPath)
				cert: fs.readFileSync(certPath)
				ca: fs.readFileSync(chainPath)
			},
			app
		).listen(serverPort, serverStarted)
	else

		app.use(
			cors(
				origin: "http://localhost:#{corsPort}"
				exposedHeaders: [ 'X-Access-Token' ],
			)
		)

		p.warning('Insecure server starting', log: false)
		app.listen(serverPort, serverStarted)

	#: All Routes

	app.all("/:path(#{Object.keys(appRoutes).join('|')})/:method(#{normalMethods.join('|')})",
		verifyToken, (req, res) =>

			modelInfo = appRoutes[req.params.path]
			model = modelInfo.model
			primaryKey = modelInfo.primaryKey

			#: Format Sub-Document fields

			if ['update', 'insert'].includes(req.params.method)
				for field in modelInfo.subDocFields
					if typeof req.query[field] == 'string'
						req.query[field] = JSON.parse(req.query[field])

			#: Insert

			if req.params.method == 'insert'
				await responseFormat(
					model.create.bind(model),
					[req.query],
					req,
					res
				)

			#: Update

			else if req.params.method == 'update'

				await responseFormat(
					model.updateOne.bind(model),
					[
						{
							# [primaryKey]: req.query[primaryKey]
						},
						updateQuery(req, primaryKey)
					],
					req,
					res
				)

			#: Delete

			else if req.params.method == 'delete'
				await responseFormat(
					model.deleteOne.bind(model),
					[
						{
							# [primaryKey]: req.query[primaryKey]
						}
					],
					req,
					res
				)

			#: Delete All

			else if req.params.method == 'delete_all'
				await responseFormat(
					model.deleteMany.bind(model),
					[{}],
					req,
					res
				)

			#: Get

			else if req.params.method == 'get'
				await responseFormat(
					model.find.bind(model),
					[
						{
							# [primaryKey]: req.query[primaryKey]
						}
					],
					req,
					res
				)

			#: Get All

			else if req.params.method == 'get_all'

				sortArgs = parseDataSort(req.query, false)

				await responseFormat(
					model.find.bind(model),
					[
						{},
						null,
						sortArgs,
					],
					req,
					res
				)

			#: Find

			else if req.params.method == 'find'

				sortArgs = parseDataSort(req.query, true)

				if req.query.local_field? and req.query.from? and req.query.foreign_field? and req.query.as?
					lookup =
						$lookup:
							from: req.query.from
							localField: req.query.local_field
							foreignField: req.query.foreign_field
							as: req.query.as
					if modelInfo.listFields.includes(req.query.local_field)
						aggArgs = [
							parseQuery(model, req.query.where),
							lookup
						]
					else
						unwind =
							$unwind: "$#{req.query.as}"
						aggArgs = [
							parseQuery(model, req.query.where),
							lookup,
							unwind,
							# ...sortArgs,
						]

				else
					aggArgs = [
						parseQuery(model, req.query.where),
						# ...sortArgs,
					]

				await responseFormat(
					model.aggregate.bind(model),
					aggArgs,
					req,
					res,
					false
				)

			#: Get Schema Info

			else if req.params.method == 'schema'
				await responseFormat(
					schemaAsync,
					[
						modelInfo
					],
					req,
					res
				)

			#: Sterilize: removes fields not in schema, sets all query fields to specified value for all docs

			else if req.params.method == 'sterilize'
				setDict = {}
				unsetDict = {}
				normalDict = {}
				mongoFields = [
					'_id',
					'createdAt',
					'updatedAt',
					'uid',
					'__v'
				]
				allFields = [
					# ...mongoFields
					# ...modelInfo.allFields
				]
				listFields = modelInfo.listFields
				records = await model.find({}).lean()
				for record in records
					for key of record
						if !allFields.includes(key) and !Object.keys(unsetDict).includes(key)
							unsetDict[key] = 1
				for field, val of req.query
					if listFields.includes(field)
						setDict[field] = val.split(',')
					else
						if field != 'auth_token'
							normalDict[field] = val
				await model.collection.dropIndexes()
				await responseFormat(
					model.updateMany.bind(model),
					[
						{},
						{
							# ...normalDict,
							$set: setDict,
							$unset: unsetDict,
						},
						{
							multi: true,
							strict: false
						}
					],
					req,
					res
				)
	)

	#: List Routes

	app.all("/:path(#{Object.keys(listRoutes).join('|')})/:method(#{listMethods.join('|')})",
		verifyToken, (req, res) =>

			model = appRoutes[req.params.path].model
			primaryKey = appRoutes[req.params.path].primaryKey

			if ['push', 'push_unique', 'set'].includes(req.params.method)
				updateDict = {}
				for key of req.query
					if ![primaryKey, 'auth_token', 'refresh_token'].includes(key)
						if req.params.method != 'set'
							updateDict[key] =
								$each: req.query[key].split(',')
						else
							if req.query[key] != '[]'
								updateDict[key] = req.query[key].split(',')
							else
								updateDict[key] = []

				#: Push

				if req.params.method == 'push'
					await responseFormat(
						model.updateOne.bind(model),
						[
							{
								# [primaryKey]: req.query[primaryKey]
							},
							{
								$push: updateDict
							}
						],
						req,
						res
					)

				#: Push Unique

				else if req.params.method == 'push_unique'
					await responseFormat(
						model.updateOne.bind(model),
						[
							{
								# [primaryKey]: req.query[primaryKey]
							},
							{
								$addToSet: updateDict
							}
						],
						req,
						res
					)

				#: Set

				else if req.params.method == 'set'
					await responseFormat(
						model.updateOne.bind(model),
						[
							{
								# [primaryKey]: req.query[primaryKey]
							},
							{
								$set: updateDict
							}
						],
						req,
						res
					)
	)

	#: Login

	app.all('/login', (req, res) =>
		try
			user = await userAuth.findOne(
				username: req.query.username
			)
			if user
				passMatch = await bcrypt.compare(
					req.query.password,
					user.password
				)
				if !passMatch
					return incorrectUserOrPass(res)
				else
					token = signToken(user)
					return res.json(
						status: 'ok'
						response: token
					)
			else
				return userNotFound(res)
		catch error
			return res.status(500).json(
				status: 'error'
				response: errorObj(error)
			)
	)

	#: Edit Secret Key

	app.all('/:path(update_secret_key)', verifyToken, (req, res) =>
		try

			isValid = allowedSecretKey(req)
			if isValid != true
				return res.status(401).json(isValid)

			key = await secretKey.find({})
			if key.length == 0
				response = await secretKey.create(req.query)
			else
				response = await secretKey.updateOne(
					{
						key: key[key.length - 1].key
					},
					req.query
				)
			return res.json(
				status: 'ok'
				response: response
			)

		catch error
			return res.status(500).json(
				status: 'error'
				response: errorObj(error)
			)
	)

	#: Sign Up

	app.all('/:path(signup)', verifyToken, (req, res) =>
		try
			if req.query.secret_key?

				key = await secretKey.find({})
				if key.length > 0
					key_match = await bcrypt.compare(
						req.query.secret_key,
						key[key.length - 1].key
					)
					if !key_match
						return incorrectSecretKey(res)

				isValid = allowedPassword(req)
				if isValid != true
					return res.status(401).json(isValid)
				response = await userAuth.create(req.query)

				if req.query.username == response.username
					token = signToken(response)
					return res.json(
						status: 'ok'
						response: token
					)
				else
					return res.status(401).json(
						status: 'error'
						response: response
					)

			else
				return res.status(401).json(
					status: 'error'
					response:
						message: 'Not Authorized.'
				)

		catch error
			return res.status(500).json(
				status: 'error'
				response: errorObj(error)
			)
	)

	#: Update Password

	app.all('/update_password', (req, res) =>

		try
			user = await userAuth.findOne(
				username: req.query.username
			)

			if user && req.query.current_password?
				passMatch = await bcrypt.compare(
					req.query.current_password,
					user.password
				)
				if !passMatch
					return incorrectUserOrPass(res)
			else if !user
				return userNotFound(res)
			else if !req.query.current_password?
				return noCurrentPass(res)

			isValid = allowedPassword(req)
			if isValid != true
				return res.status(401).json(isValid)
			passUpdate = await userAuth.updateOne(
				{ username: req.query.username },
				objOmit(req.query, ['username'])
			)

			if passUpdate.nModified == 1
				return res.json(
					status: 'ok'
					response:
						message: 'Password updated.'
					)
			else
				return res.status(401).json(
					status: 'error'
					response: passUpdate
				)
		catch error
			return res.status(500).json(
				status: 'error'
				response: errorObj(error)
			)
	)

	#: Verify Token

	app.all('/verify_token', verifyToken, (req, res) =>
		if res.locals.refresh_token?
			return res.json(
				status: 'ok',
				refresh_token: res.locals.refresh_token
				response:
					message: 'Token verified.'
			)
		else
			return res.json(
				status: 'ok'
				response:
					message: 'Token verified.'
			)
	)

#: Main

main = () ->
	await init()
	start()

#: Exports

module.exports = {
	app: app
	start: main
	models: models
	config: serverConfig
}