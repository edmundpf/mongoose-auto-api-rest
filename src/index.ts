import https from 'https'
import cors from 'cors'
import bcrypt from 'bcrypt'
import express from 'express'
import p from 'print-tools-js'
import mongoose from 'mongoose'
import publicIp from 'public-ip'
import compression from 'compression'
import models from 'mongoose-auto-api.models'
import parseQuery from './utils/parseQuery'
import { listRoutes } from './utils/routeWrapper'
import { appRoutes } from './utils/routeWrapper'
import { listMethods } from './utils/routeWrapper'
import { normalMethods } from './utils/routeWrapper'
import { objOmit } from './utils/apiFunctions'
import { errorObj } from './utils/apiFunctions'
import { parseDataSort } from './utils/apiFunctions'
import { schemaAsync } from './utils/apiFunctions'
import { updateQuery } from './utils/apiFunctions'
import { allowedPassword } from './utils/apiFunctions'
import { allowedSecretKey } from './utils/apiFunctions'
import { responseFormat } from './utils/apiFunctions'
import { incorrectSecretKey } from './utils/apiFunctions'
import { incorrectUserOrPass } from './utils/apiFunctions'
import { userNotFound } from './utils/apiFunctions'
import { noCurrentPass } from './utils/apiFunctions'
import { signToken } from './utils/apiFunctions'
import { verifyToken } from './utils/apiFunctions'
import { ONE_DAY } from './utils/apiFunctions'
import { getKeys } from './utils/jwtRotation'
import { resolve, join } from 'path'
import { existsSync, readFileSync } from 'fs'

//: Setup

const config = existsSync(join(__dirname, '../../../appConfig.json'))
	? require('../../../appConfig.json')
	: require('./data/defaultConfig.json')
const serverPort =
	process.env.NODE_ENV === 'production'
		? process.env.PORT || config.serverPort
		: config.serverPort + 10
const corsPort =
	process.env.NODE_ENV === 'production'
		? process.env.WEB_PORT || config.webPort
		: config.webPort + 10
const { mongoosePort } = config
const { databaseName } = config
const userAuth = models.userAuth.model
const secretKey = models.secretKey.model
let serverAddress: any = null
const app = express()
app.locals.jwtKeys = getKeys()

//: MongoDB Config

const mongooseConnect = async () => {
	try {
		return await mongoose.connect(
			`mongodb://localhost:${mongoosePort}/${databaseName}`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false,
			}
		)
	} catch (error) {
		p.error('MongoDB Service is not started.')
		return process.exit(1)
	}
}

//: Server Started Function

const serverStarted = () => {
	p.success(`Public IP: ${serverAddress}`, { log: false })
	return p.titleBox('Data API Server', {
		titleDesc: `Running on port ${serverPort}`,
		tagLine: `Connecting to Mongo database: ${databaseName} on port ${mongoosePort}`,
	})
}

//: Init Server

const init = async () => {
	try {
		serverAddress = await publicIp.v4()
	} catch (error) {
		serverAddress = 'localhost'
	}
	return await mongooseConnect()
}

//: Refresh JWT Keys

setInterval(() => {
	app.locals.jwtKeys = getKeys()
}, ONE_DAY)

//: Start Server

const startServer = () => {
	let keyPath = config.sslKey
		? config.sslKey
		: `/etc/letsencrypt/live/${config.serverAddress}/privkey.pem`
	let certPath = config.sslCert
		? config.sslCert
		: `/etc/letsencrypt/live/${config.serverAddress}/cert.pem`
	let chainPath = config.sslChain
		? config.sslChain
		: `/etc/letsencrypt/live/${config.serverAddress}/chain.pem`
	keyPath = resolve(keyPath)
	certPath = resolve(certPath)
	chainPath = resolve(chainPath)

	const keyExists = existsSync(keyPath)
	const certExists = existsSync(certPath)
	const chainExists = existsSync(chainPath)

	app.use(compression())

	if (
		config.serverAddress !== 'localhost' &&
		keyExists &&
		certExists &&
		chainExists
	) {
		app.use(
			cors({
				origin: [
					`http://localhost:${corsPort}`,
					`https://localhost:${corsPort}`,
					`http://${serverAddress}:${corsPort}`,
					`https://${serverAddress}:${corsPort}`,
					`http://${config.serverAddress}:${corsPort}`,
					`https://${config.serverAddress}:${corsPort}`,
				],
				exposedHeaders: ['X-Access-Token'],
			})
		)

		p.success('Secure server starting...', { log: false })
		https
			.createServer(
				{
					key: readFileSync(keyPath),
					cert: readFileSync(certPath),
					ca: readFileSync(chainPath),
				},
				app
			)
			.listen(serverPort, serverStarted)
	} else {
		app.use(
			cors({
				origin: `http://localhost:${corsPort}`,
				exposedHeaders: ['X-Access-Token'],
			})
		)

		p.warning('Insecure server starting', { log: false })
		app.listen(serverPort, serverStarted)
	}

	//: All Routes

	app.all(
		`/:path(${Object.keys(appRoutes).join('|')})/:method(${normalMethods.join(
			'|'
		)})`,
		verifyToken,
		async (req, res) => {
			let field, sortArgs
			const modelInfo = appRoutes[req.params.path]
			const { model } = modelInfo
			const { primaryKey } = modelInfo

			//: Format Sub-Document fields

			if (['update', 'insert'].includes(req.params.method)) {
				for (field of modelInfo.subDocFields) {
					if (typeof req.query[field] === 'string') {
						req.query[field] = JSON.parse(req.query[field])
					}
				}
			}

			//: Insert

			if (req.params.method === 'insert') {
				return await responseFormat(
					model.create.bind(model),
					[req.query],
					req,
					res
				)

				//: Update
			} else if (req.params.method === 'update') {
				return await responseFormat(
					model.updateOne.bind(model),
					[
						{
							[primaryKey]: req.query[primaryKey],
						},
						updateQuery(req, primaryKey),
					],
					req,
					res
				)

				//: Delete
			} else if (req.params.method === 'delete') {
				return await responseFormat(
					model.deleteOne.bind(model),
					[
						{
							[primaryKey]: req.query[primaryKey],
						},
					],
					req,
					res
				)

				//: Delete All
			} else if (req.params.method === 'delete_all') {
				return await responseFormat(
					model.deleteMany.bind(model),
					[{}],
					req,
					res
				)

				//: Get
			} else if (req.params.method === 'get') {
				return await responseFormat(
					model.find.bind(model),
					[
						{
							[primaryKey]: req.query[primaryKey],
						},
					],
					req,
					res
				)

				//: Get All
			} else if (req.params.method === 'get_all') {
				sortArgs = parseDataSort(req.query, false)

				return await responseFormat(
					model.find.bind(model),
					[{}, null, sortArgs],
					req,
					res
				)

				//: Find
			} else if (req.params.method === 'find') {
				let aggArgs
				sortArgs = parseDataSort(req.query, true)

				if (
					req.query.local_field != null &&
					req.query.from != null &&
					req.query.foreign_field != null &&
					req.query.as != null
				) {
					const lookup = {
						$lookup: {
							from: req.query.from,
							localField: req.query.local_field,
							foreignField: req.query.foreign_field,
							as: req.query.as,
						},
					}
					if (modelInfo.listFields.includes(req.query.local_field)) {
						aggArgs = [parseQuery(model, req.query.where), lookup]
					} else {
						const unwind = { $unwind: `$${req.query.as}` }
						aggArgs = [
							parseQuery(model, req.query.where),
							lookup,
							unwind,
							...sortArgs,
						]
					}
				} else {
					aggArgs = [parseQuery(model, req.query.where), ...sortArgs]
				}

				return await responseFormat(
					model.aggregate.bind(model),
					aggArgs,
					req,
					res,
					false
				)

				//: Get Schema Info
			} else if (req.params.method === 'schema') {
				return await responseFormat(schemaAsync, [modelInfo], req, res)

				//: Sterilize: removes fields not in schema, sets all query fields to specified value for all docs
			} else if (req.params.method === 'sterilize') {
				const setDict = {}
				const unsetDict = {}
				const normalDict = {}
				const mongoFields = ['_id', 'createdAt', 'updatedAt', 'uid', '__v']
				const allFields = [...mongoFields, ...modelInfo.allFields]
				const { listFields } = modelInfo
				const records: Array<any> = await model.find({}).lean()
				for (const record of records) {
					for (const key in record) {
						if (
							!allFields.includes(key) &&
							!Object.keys(unsetDict).includes(key)
						) {
							unsetDict[key] = 1
						}
					}
				}
				for (field in req.query) {
					const val = req.query[field]
					if (listFields.includes(field)) {
						setDict[field] = val.split(',')
					} else {
						if (field !== 'auth_token') {
							normalDict[field] = val
						}
					}
				}
				await model.collection.dropIndexes()
				return await responseFormat(
					model.updateMany.bind(model),
					[
						{},
						{
							...normalDict,
							$set: setDict,
							$unset: unsetDict,
						},
						{
							multi: true,
							strict: false,
						},
					],
					req,
					res
				)
			}
		}
	)

	//: List Routes

	app.all(
		`/:path(${Object.keys(listRoutes).join('|')})/:method(${listMethods.join(
			'|'
		)})`,
		verifyToken,
		async (req, res) => {
			const { model } = appRoutes[req.params.path]
			const { primaryKey } = appRoutes[req.params.path]

			if (['push', 'push_unique', 'set'].includes(req.params.method)) {
				const updateDict = {}
				for (const key in req.query) {
					if (![primaryKey, 'auth_token', 'refresh_token'].includes(key)) {
						if (req.params.method !== 'set') {
							updateDict[key] = { $each: req.query[key].split(',') }
						} else {
							if (req.query[key] !== '[]') {
								updateDict[key] = req.query[key].split(',')
							} else {
								updateDict[key] = []
							}
						}
					}
				}

				//: Push

				if (req.params.method === 'push') {
					return await responseFormat(
						model.updateOne.bind(model),
						[
							{
								[primaryKey]: req.query[primaryKey],
							},
							{
								$push: updateDict,
							},
						],
						req,
						res
					)

					//: Push Unique
				} else if (req.params.method === 'push_unique') {
					return await responseFormat(
						model.updateOne.bind(model),
						[
							{
								[primaryKey]: req.query[primaryKey],
							},
							{
								$addToSet: updateDict,
							},
						],
						req,
						res
					)

					//: Set
				} else if (req.params.method === 'set') {
					return await responseFormat(
						model.updateOne.bind(model),
						[
							{
								[primaryKey]: req.query[primaryKey],
							},
							{
								$set: updateDict,
							},
						],
						req,
						res
					)
				}
			}
		}
	)

	//: Login

	app.all('/login', async (req, res) => {
		try {
			const user = await userAuth.findOne({
				username: req.query.username,
			})
			if (user) {
				const passMatch = await bcrypt.compare(
					req.query.password,
					user.password
				)
				if (!passMatch) {
					return incorrectUserOrPass(res)
				} else {
					const token = signToken(user, app.locals.jwtKeys.cur)
					return res.json({
						status: 'ok',
						response: token,
					})
				}
			} else {
				return userNotFound(res)
			}
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				response: errorObj(error),
			})
		}
	})

	//: Edit Secret Key

	app.all('/:path(update_secret_key)', verifyToken, async (req, res) => {
		let response
		try {
			const isValid = allowedSecretKey(req)
			if (isValid !== true) {
				return res.status(401).json(isValid)
			}

			const key = await secretKey.find({})
			if (key.length === 0) {
				response = await secretKey.create(req.query)
			} else {
				response = await secretKey.updateOne(
					{
						key: key[key.length - 1].key,
					},
					req.query
				)
			}
			return res.json({
				status: 'ok',
				response,
			})
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				response: errorObj(error),
			})
		}
	})

	//: Sign Up

	app.all('/:path(signup)', verifyToken, async (req, res) => {
		let response
		try {
			if (req.query.secret_key != null) {
				const key = await secretKey.find({})
				if (key.length > 0) {
					const key_match = await bcrypt.compare(
						req.query.secret_key,
						key[key.length - 1].key
					)
					if (!key_match) {
						return incorrectSecretKey(res)
					}
				}

				const isValid = allowedPassword(req)
				if (isValid !== true) {
					return res.status(401).json(isValid)
				}
				response = await userAuth.create(req.query)

				if (req.query.username === response.username) {
					const token = signToken(response, app.locals.jwtKeys.cur)
					return res.json({
						status: 'ok',
						response: token,
					})
				} else {
					return res.status(401).json({
						status: 'error',
						response,
					})
				}
			} else {
				return res.status(401).json({
					status: 'error',
					response: {
						message: 'Not Authorized.',
					},
				})
			}
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				response: errorObj(error),
			})
		}
	})

	//: Update Password

	app.all('/update_password', async (req, res) => {
		try {
			const user = await userAuth.findOne({
				username: req.query.username,
			})

			if (user && req.query.current_password != null) {
				const passMatch = await bcrypt.compare(
					req.query.current_password,
					user.password
				)
				if (!passMatch) {
					return incorrectUserOrPass(res)
				}
			} else if (!user) {
				return userNotFound(res)
			} else if (req.query.current_password == null) {
				return noCurrentPass(res)
			}

			const isValid = allowedPassword(req)
			if (isValid !== true) {
				return res.status(401).json(isValid)
			}
			const passUpdate = await userAuth.updateOne(
				{ username: req.query.username },
				objOmit(req.query, ['username'])
			)

			if (passUpdate.nModified === 1) {
				return res.json({
					status: 'ok',
					response: {
						message: 'Password updated.',
					},
				})
			} else {
				return res.status(401).json({
					status: 'error',
					response: passUpdate,
				})
			}
		} catch (error) {
			return res.status(500).json({
				status: 'error',
				response: errorObj(error),
			})
		}
	})

	//: Verify Token

	app.all('/verify_token', verifyToken, (req, res) => {
		if (res.locals.refresh_token != null) {
			return res.json({
				status: 'ok',
				refresh_token: res.locals.refresh_token,
				response: {
					message: 'Token verified.',
				},
			})
		} else {
			return res.json({
				status: 'ok',
				response: {
					message: 'Token verified.',
				},
			})
		}
	})
}

//: Main

const start = async () => {
	await init()
	return startServer()
}

//: Exports

export default {
	app,
	start,
	models,
	config,
}
