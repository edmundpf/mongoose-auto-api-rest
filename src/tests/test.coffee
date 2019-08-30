a = require('axios')
p = require('print-tools-js')
assert = require('chai').assert
should = require('chai').should()
api = server = port = url = null

USERNAME = 'user@email.com'
PASSWORD1 = 'testPass1!'
PASSWORD2 = 'testPass2!'
SECRET_KEY = 'secretKeyTest'
ACCESS_TOKEN = ''

#: Start Server Hook

before((done) ->
	this.timeout(5000)
	api = require('../index')
	port = require('../../../../appConfig.json').serverPort
	url = "http://localhost:#{port}"
	done()
)

#: Request

request = (endpoint, func, log) ->
	try
		res = await func("#{url}#{endpoint}")
		if log
			p.chevron("Status Code: #{res.status}")
			p.bullet(JSON.stringify(res.data))
		return {
			...res.data,
			statusCode: res.status
		}
	catch error
		if log
			p.chevron("Status Code: #{error.response.status}")
			p.bullet(JSON.stringify(error.response.data))
		return {
			...error.response.data,
			statusCode: error.response.status
		}

#: Get Request

get = (endpoint, log=true) ->
	await request(endpoint, a.get.bind(a), log)

#: Post Request

post = (endpoint, log=true) ->
	await request(endpoint, a.post.bind(a), log)

#: Delete Request

remove = (endpoint, log=true) ->
	await request(endpoint, a.delete.bind(a), log)

#: Error Response Assert

errorAssert = (res, msg, args) ->
	extArgs = true
	if args?
		for key, val of args
			if res.response[key] != val
				extArgs = false
				break
	assert.equal(
		res.status == 'error' and
		[401, 500].includes(res.statusCode) and
		res.response.message.includes(msg) and
		extArgs,
		true
	)

#: Error Response Code Assert

errorCodeAssert = (res, codes) ->
	hasCodes = true
	for code in codes
		if !res.response.codes? or !res.response.codes.includes(code)
			hasCodes = false
			break
	assert.equal(
		res.status == 'error' and
		[401, 500].includes(res.statusCode) and
		hasCodes
		true
	)

#: Okay Response Assert

okayAssert = (res, msg, args) ->
	extArgs = true
	if args?
		for key, val of args
			if res.response[key] != val
				extArgs = false
				break
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		res.response.message.includes(msg) and
		extArgs,
		true
	)

#: Creation Assert

createAssert = (res) ->
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		res.response._id?,
		true
	)

# Check that server has started

describe 'Server Started', ->
	it 'Server is on', ->
		assert(api?)

#: Initialization/Admin Setup

describe 'Admin setup', ->
	it 'Init - Signup not protected', ->
		res = await get('/signup')
		errorAssert(
			res,
			'Not Authorized'
		)
	it 'Init - Secret Key endpoint not protected', ->
		res = await post('/secret_key/insert')
		errorAssert(
			res,
			'validation failed'
		)
	it 'Set Secret Key', ->
		res = await post("/secret_key/insert?key=#{SECRET_KEY}")
		createAssert(res)

	it 'Secret Key endpoint protected', ->
		res = await post('/secret_key/insert')
		errorAssert(
			res,
			'No token provided'
		)

	it 'Signup - Incorrect Secret Key', ->
		res = await post("/signup?username=testUser&password=testPassword&secret_key=incorrectKey")
		errorAssert(
			res,
			'Incorrect secret key'
		)

	it 'Signup - Invalid Username and Password', ->
		res = await post("/signup?username=user&password=testPassword&secret_key=#{SECRET_KEY}")
		errorCodeAssert(
			res,
			[
				'USERNAME_INVALID_EMAIL',
				'PASSWORD_INVALID_PASSWORD'
			]
		)

	it 'Valid Signup', ->
		res = await post("/signup?username=#{USERNAME}&password=#{PASSWORD1}&secret_key=#{SECRET_KEY}")
		if res.response.access_token?
			ACCESS_TOKEN = res.response.access_token
		assert.equal(
			res.status == 'ok' and
			res.response.access_token?,
			true
		)

#: Admin Validation

describe 'Admin validation', ->
	it 'No token', ->
		res = await get('/verify_token')
		errorAssert(
			res,
			'No token provided'
		)

	it 'Invalid token', ->
		a.defaults.headers.common.authorization = ACCESS_TOKEN
		res = await get('/verify_token?auth_token=invalidToken')
		errorAssert

	it 'Verify token', ->
		res = await get('/verify_token')
		okayAssert(
			res,
			'Token verified'
		)

	it 'Login - User not found', ->
		res = await post("/login?username=fakeUser@email.com&password=fakePassword1!")
		errorAssert(
			res,
			'User does not exist'
		)

	it 'Login - Invalid password', ->
		res = await post("/login?username=#{USERNAME}&password=fakePassword1!")
		errorAssert(
			res,
			'Incorrect username or password'
		)

	it 'Valid login', ->
		res = await post("/login?username=#{USERNAME}&password=#{PASSWORD1}")
		assert.equal(
			res.status == 'ok' and
			res.response.access_token?,
			true
		)

# Cleanup

after((done) ->
	done()
	process.exit(0)
)

#::: End Program :::