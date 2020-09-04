a = require('axios')
fs = require('fs')
p = require('print-tools-js')
assert = require('chai').assert
should = require('chai').should()
api = server = port = url = null

USERNAME = 'user@email.com'
PASSWORD1 = 'testPass1!'
PASSWORD2 = 'testPass2!'
SECRET_KEY1 = 'secretKeyTest1!'
SECRET_KEY2 = 'secretKeyTest2!'
ACCESS_TOKEN = ''

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

customerModel = """
{
	name: 'customer',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		products: [{
			type: String
		}]
	},
}
"""

productModel = """
{
	name: 'product',
	schema: {
		name: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		price: {
			type: Number,
			unique: true,
			required: true,
		}
	},
}
"""

infoModel = """
{
	name: 'info',
	schema: {
		email: {
			type: String,
			unique: true,
			required: true,
			primaryKey: true,
		},
		location: {
			type: String,
			unique: true,
			required: true,
		}
	},
}
"""

subDocModel = """
{
	name: 'subDoc',
	schema: {
		name: {
			type: new require('mongoose').Schema({
				address: String,
			}),
			required: true,
		},
		password: {
			type: String,
			encode: true,
		}
	},
}
"""

models =
	'./models/customer.js': customerModel
	'./models/product.js': productModel
	'./models/info.js': infoModel
	'./models/subDoc.js': subDocModel

#: Start Server Hook

before(() ->
	this.timeout(10000)
	if !fs.existsSync('./models')
		fs.mkdirSync('./models')
	for key, val of models
		if !fs.existsSync(key)
			fs.writeFileSync(
				key,
				"module.exports = #{val}"
			)

	restServer = require('../index')
	await restServer.start()
	api = restServer.app
	port = if process.env.NODE_ENV == 'production' then process.env.PORT || restServer.config.serverPort else restServer.config.serverPort + 10
	if restServer.config.serverAddress != 'localhost'
		url = "https://localhost:#{port}"
	else
		url = "http://localhost:#{port}"
)

#: Request

request = (endpoint, func, log) ->
	try
		res = await func("#{url}#{endpoint}")
		if log
			console.log("\n#{'-'.repeat(process.stdout.columns)}")
			p.chevron("Status Code: #{res.status}")
			p.bullet(
				"#{JSON.stringify(res.data)}\n",
				log: false
			)
		return {
			# ...res.data,
			statusCode: res.status
		}
	catch error
		if log
			console.log("\n#{'-'.repeat(process.stdout.columns)}")
			p.chevron("Status Code: #{error.response.status}")
			p.bullet(
				"#{JSON.stringify(error.response.data)}\n"
				log: false
			)
		return {
			# ...error.response.data,
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

#: Error Response Exists Assert

errorExistsAssert = (res, fields) ->
	hasFields = false
	for field in fields
		if res.response[field]?
			hasFields = true
			break
	assert.equal(
		res.status == 'error' and
		[401, 500].includes(res.statusCode) and
		!hasFields,
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

#: Okay Response Exists Assert

okayExistsAssert = (res, fields) ->
	hasFields = true
	for field in fields
		if !res.response[field]?
			hasFields = false
			break
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		hasFields,
		true
	)

#: Okay Modification Assert

okayModAssert = (res, field, num) ->
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		res.response[field] == num,
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

#: Find Test

findTest = (field, op, value, valField, valRes) ->
	query = [{
		field: field
		op: op
		value: value
	}]
	query = new URLSearchParams(where: JSON.stringify(query))
	res = await get("/customer/find?#{query}")
	assert.equal(
		res.status == 'ok' and
		res.statusCode == 200 and
		res.response[0][valField] == valRes,
		true
	)

# Check that server has started

describe 'Server Started', ->

	it 'Server is on', ->
		assert(api?)

#: Initialization/Admin Setup

describe 'Admin setup', ->

	it 'Init - Signup not protected', ->
		res = await post('/signup')
		errorAssert(
			res,
			'Not Authorized'
		)
	it 'Init - Secret Key endpoint protected', ->
		res = await post('/secret_key/insert')
		errorAssert(
			res,
			'No token provided'
		)
	it 'Init - Update Secret Key endpoint not protected', ->
		res = await post('/update_secret_key')
		errorAssert(
			res,
			'Cannot read property'
		)

	it 'Create Secret Key - Invalid Key', ->
		res = await post("/update_secret_key?key=test123")
		errorCodeAssert(
			res,
			[
				'KEY_INVALID_LENGTH'
				'KEY_INVALID_PASSWORD'
			]
		)

	it 'Create Secret Key', ->
		res = await post("/update_secret_key?key=#{SECRET_KEY1}")
		createAssert(res)

	it 'Update Secret Key endpoint protected', ->
		res = await post('/update_secret_key')
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
		res = await post("/signup?username=user&password=testPassword&secret_key=#{SECRET_KEY1}")
		errorCodeAssert(
			res,
			[
				'USERNAME_INVALID_EMAIL',
				'PASSWORD_INVALID_PASSWORD'
			]
		)

	it 'Valid Signup', ->
		res = await post("/signup?username=#{USERNAME}&password=#{PASSWORD1}&secret_key=#{SECRET_KEY1}")
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

	it 'Model route - no token', ->
		res = await get('/customer/get_all')
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

	it 'Update Secret Key', ->
		res = await post("/update_secret_key?key=#{SECRET_KEY2}")
		okayModAssert(
			res,
			'nModified',
			1
		)

	it 'Valid Signup after Secret Key update', ->
		res = await post("/signup?username=zelda@email.com&password=testPassword123!&secret_key=#{SECRET_KEY2}")
		if res.response.access_token?
			ACCESS_TOKEN = res.response.access_token
		assert.equal(
			res.status == 'ok' and
			res.response.access_token?,
			true
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

	it 'Password change - User not found', ->
		res = await post("/update_password?username=fakeUser@email.com&password=fakePassword1!&current_password=fakePassword2!")
		errorAssert(
			res,
			'User does not exist'
		)

	it 'Password change - Invalid password', ->
		res = await post("/update_password?username=#{USERNAME}&password=fakePassword1!&current_password=fakePassword2!")
		errorAssert(
			res,
			'Incorrect username or password'
		)

	it 'Password change - no current password', ->
		res = await post("/update_password?username=#{USERNAME}&password=fakePassword1!")
		errorAssert(
			res,
			'Must include current password'
		)

	it 'Password change - invalid password', ->
		res = await post("/update_password?username=#{USERNAME}&password=fakePassword&current_password=#{PASSWORD1}")
		errorCodeAssert(
			res,
			['PASSWORD_INVALID_PASSWORD']
		)

	it 'Valid password change', ->
		res = await post("/update_password?username=#{USERNAME}&password=#{PASSWORD2}&current_password=#{PASSWORD1}")
		okayAssert(
			res,
			'Password updated'
		)

	it 'Post password change - valid login', ->
		res = await post("/login?username=#{USERNAME}&password=#{PASSWORD2}")
		assert.equal(
			res.status == 'ok' and
			res.response.access_token?,
			true
		)

#: API Methods

describe 'API Methods', ->

	it 'Invalid insert', ->
		res = await post("/customer/insert?name=bob")
		errorAssert(
			res,
			'validation failed'
		)

	it 'Valid insert', ->
		res = await post("/customer/insert?name=bob&email=bob@email.com")
		okayExistsAssert(
			res,
			[
				'_id',
				'uid'
			]
		)

	it 'Valid sub-document and encoded insert', ->
		params = new URLSearchParams(
			name: JSON.stringify(address: 'home')
			password: 'testPassword'
		)
		res = await post("/sub_doc/insert?#{params}")
		okayExistsAssert(
			res,
			[
				'name',
				'password'
			]
		)

	it 'Invalid update', ->
		res = await post("/customer/update?name=joe")
		okayModAssert(
			res,
			'nModified',
			0
		)

	it 'Valid update', ->
		res = await post("/customer/update?name=bob&email=bob1@gmail.com")
		okayModAssert(
			res,
			'nModified',
			1
		)

	it 'Invalid get', ->
		res = await get("/customer/get?name=joe")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 0,
			true
		)

	it 'Valid get', ->
		res = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1 and
			res.response[0]._id? and
			res.response[0].name == 'bob',
			true
		)

	it 'Valid get-all', ->
		res = await get("/customer/get_all")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1 and
			res.response[0]._id? and
			res.response[0].name == 'bob',
			true
		)

	it 'Schema info - list fields', ->
		res = await get("/customer/schema")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.schema.includes('name') and
			res.response.list_fields.includes('products') and
			res.response.primary_key == 'name',
			true
		)

	it 'Schema info - encrypted fields', ->
		res = await get("/user_auth/schema")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.schema.includes('username') and
			res.response.encrypt_fields.includes('password') and
			res.response.primary_key == 'username',
			true
		)

	it 'Schema info - encoded and sub-document fields', ->
		res = await get("/sub_doc/schema")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.schema.includes('name') and
			res.response.encode_fields.includes('password') and
			res.response.subdoc_fields.includes('name')
			true
		)

	it 'Sterilize - remove obsolete, and set fields for all documents', ->
		res = await get("/customer/sterilize?email=master@email.com&products=apples,oranges")
		users = await get("/customer/get_all")
		hasChanges = true
		for user in users.response
			if user.products[0] != 'apples' or user.products[1] != 'oranges' or user.email != 'master@email.com'
				hasChanges = false
				break
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.nModified == 1 and
			hasChanges,
			true
		)

	it 'Invalid delete', ->
		await post("/customer/insert?name=tom&email=tom@email.com")
		await post("/customer/insert?name=jerry&email=jerry@email.com")
		res = await remove("/customer/delete?name=barney")
		okayModAssert(
			res,
			'deletedCount',
			0
		)

	it 'Invalid find', ->
		res = await get("/customer/find?where=")
		errorAssert(
			res,
			'Arguments must be aggregate pipeline operators'
		)

	it 'Valid $eq find', ->
		await findTest(
			'email'
			'$eq',
			'jerry@email.com'
			'email',
			'jerry@email.com'
		)

	it 'Valid $ne find', ->
		await findTest(
			'email'
			'$ne',
			'jerry@email.com'
			'email',
			'master@email.com'
		)

	it 'Valid $gt find', ->
		await findTest(
			'email'
			'$gt',
			'master@email.com'
			'email',
			'tom@email.com'
		)

	it 'Valid $gte find', ->
		await findTest(
			'email'
			'$gte',
			'master@email.com'
			'email',
			'master@email.com'
		)

	it 'Valid $lt find', ->
		await findTest(
			'email'
			'$lt',
			'master@email.com'
			'email',
			'jerry@email.com'
		)

	it 'Valid $in find', ->
		await findTest(
			'email'
			'$in',
			[
				'master@email.com'
				'fake@email.com'
			],
			'email',
			'master@email.com'
		)

	it 'Valid $nin find', ->
		await findTest(
			'email'
			'$nin',
			[
				'master@email.com'
				'tom@email.com'
			],
			'email',
			'jerry@email.com'
		)

	it 'Valid $lte find', ->
		await findTest(
			'email'
			'$lte',
			'master@email.com'
			'email',
			'master@email.com'
		)

	it 'Valid $strt find', ->
		await findTest(
			'email'
			'$strt',
			'master'
			'email',
			'master@email.com'
		)

	it 'Valid $end find', ->
		await findTest(
			'email'
			'$end',
			'y@email.com'
			'email',
			'jerry@email.com'
		)

	it 'Valid $cont find', ->
		await findTest(
			'email'
			'$cont',
			'aste'
			'email',
			'master@email.com'
		)

	it 'Valid $inc find', ->
		await findTest(
			'products'
			'$inc',
			'apples'
			'email',
			'master@email.com'
		)

	it 'Valid $ninc find', ->
		await findTest(
			'products'
			'$ninc',
			'apples'
			'email',
			'tom@email.com'
		)

	it 'Valid find w/ multiple arguments', ->
		query = [
			{
				field: 'email'
				op: '$cont'
				value: 'master'
			},
			{
				field: 'products'
				op: '$inc'
				value: 'apples'
			},
			{
				field: 'email'
				op: '$gt'
				value: 'jerry'
			}
		]
		query = new URLSearchParams(where: JSON.stringify(query))
		res = await get("/customer/find?#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response[0].email == 'master@email.com',
			true
		)

	it 'Valid list field lookup', ->
		query = [
			{
				field: 'email'
				op: '$cont'
				value: 'master'
			}
		]
		query = new URLSearchParams(where: JSON.stringify(query))
		await post("/product/insert?name=apples&price=2.50")
		await post("/product/insert?name=oranges&price=4.50")
		res = await get("/customer/find?#{query}&from=product&local_field=products&foreign_field=name&as=productInfo")
		await post("/product/delete_all")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response[0].productInfo[0].name == 'apples',
			true
		)

	it 'Valid get_all sort and limit', ->
		query =
			sort_field: 'name'
			sort_order: -1
			record_limit: 1
		query = new URLSearchParams(query)
		res = await get("/customer/get_all?#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1 and
			res.response[0].name == 'tom',
			true
		)

	it 'Valid get_all sort, limit, and skip', ->
		query =
			sort_field: 'name'
			sort_order: -1
			record_limit: 1
			skip: 1
		query = new URLSearchParams(query)
		res = await get("/customer/get_all?#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1 and
			res.response[0].name == 'jerry',
			true
		)

	it 'Valid find sort and limit', ->
		query =
			sort_field: 'name'
			sort_order: -1
			record_limit: 1
		where = [
			{
				field: 'name'
				op: '$gte'
				value: 'a'
			}
		]
		query = new URLSearchParams(query)
		where = new URLSearchParams(where: JSON.stringify(where))
		res = await get("/customer/find?#{where}&#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1 and
			res.response[0].name == 'tom',
			true
		)

	it 'Valid find sort, limit, and skip', ->
		query =
			sort_field: 'name'
			sort_order: -1
			record_limit: 1
			skip: 1
		where = []
		query = new URLSearchParams(query)
		where = new URLSearchParams(where: JSON.stringify(where))
		res = await get("/customer/find?#{where}&#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 1,
			res.response[0].name == 'jerry',
			true
		)

	it 'Valid non-list field lookup', ->
		query = [
			{
				field: 'email'
				op: '$cont'
				value: 'master'
			}
		]
		query = new URLSearchParams(where: JSON.stringify(query))
		await post("/info/insert?email=master@email.com&location=NY")
		res = await get("/customer/find?#{query}&from=info&local_field=email&foreign_field=email&as=emailInfo")
		await post("/info/delete_all")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response[0].emailInfo.location == 'NY',
			true
		)

	it 'Valid find w/ no records found', ->
		query = [
			{
				field: 'email'
				op: '$cont'
				value: 'debra'
			}
		]
		query = new URLSearchParams(where: JSON.stringify(query))
		res = await get("/customer/find?#{query}")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.length == 0
			true
		)

	it 'Valid delete', ->
		res = await remove("/customer/delete?name=tom")
		okayModAssert(
			res,
			'deletedCount',
			1
		)

	it 'Valid push', ->
		res = await post("/customer/push?name=bob&products=apples,oranges")
		user = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.nModified == 1 and
			user.response[0].products[2] == 'apples' and
			user.response[0].products[3] == 'oranges',
			true
		)

	it 'Invalid push unique', ->
		res = await post("/customer/push_unique?name=bob&products=apples,oranges")
		user = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			user.response[0].products.length == 4,
			true
		)

	it 'Valid push unique', ->
		res = await post("/customer/push_unique?name=bob&products=pears,grapes")
		user = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.nModified == 1 and
			user.response[0].products[4] == 'pears' and
			user.response[0].products[5] == 'grapes',
			true
		)

	it 'Valid set', ->
		res = await post("/customer/set?name=bob&products=beets,carrots")
		user = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.nModified == 1 and
			user.response[0].products[0] == 'beets' and
			user.response[0].products[1] == 'carrots',
			true
		)

	it 'Valid set - no items', ->
		res = await post("/customer/set?name=bob&products=[]")
		user = await get("/customer/get?name=bob")
		assert.equal(
			res.status == 'ok' and
			res.statusCode == 200 and
			res.response.nModified == 1 and
			user.response[0].products.length == 0
			true
		)

	it 'Valid delete all', ->
		res = await remove("/customer/delete_all")
		okayModAssert(
			res,
			'deletedCount',
			2
		)

	it 'Admin Auth cleanup', ->
		user = await remove('/user_auth/delete_all')
		secret = await remove('/secret_key/delete_all')
		subDoc = await remove('/sub_doc/delete_all')
		p.success('Secret key and User Auth cleanup completed.')
		assert.equal(
			user.status == 'ok' and
			user.statusCode == 200 and
			user.response.deletedCount == 2 and
			secret.status == 'ok' and
			secret.statusCode == 200 and
			secret.response.deletedCount == 1,
			subDoc.status == 'ok' and
			subDoc.statusCode == 200 and
			subDoc.response.deletedCount == 1 and
			true
		)

# Cleanup

after((done) ->
	for key, val of models
		if fs.existsSync(key)
			fs.unlinkSync(key)
	if fs.existsSync('./models')
		fs.rmdirSync('./models')
	done()
	process.exit(0)
)

#::: End Program :::