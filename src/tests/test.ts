// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import a from 'axios';
import fs from 'fs';
import p from 'print-tools-js';
import { assert } from 'chai';
require('chai').should();

// Setup

let api, port, server, url;
api = server = port = url = null

// Constants

const USERNAME = 'user@email.com';
const PASSWORD1 = 'testPass1!';
const PASSWORD2 = 'testPass2!';
const SECRET_KEY1 = 'secretKeyTest1!';
const SECRET_KEY2 = 'secretKeyTest2!';
let ACCESS_TOKEN = '';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Sample Models

const customerModel = `\
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
}\
`;

const productModel = `\
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
}\
`;

const infoModel = `\
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
}\
`;

const subDocModel = `\
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
}\
`;

const models = {
	'./models/customer.js': customerModel,
	'./models/product.js': productModel,
	'./models/info.js': infoModel,
	'./models/subDoc.js': subDocModel
};

//: Start Server Hook

before(async function() {
	this.timeout(10000);
	if (!fs.existsSync('./models')) {
		fs.mkdirSync('./models');
	}
	for (let key in models) {
		const val = models[key];
		if (!fs.existsSync(key)) {
			fs.writeFileSync(
				key,
				`module.exports = ${val}`
			);
		}
	}

	const restServer = require('../index');
	await(restServer.start());
	api = restServer.app;
	port = process.env.NODE_ENV === 'production' ? process.env.PORT || restServer.config.serverPort : restServer.config.serverPort + 10;
	if (restServer.config.serverAddress !== 'localhost') {
		return url = `https://localhost:${port}`;
	} else {
		return url = `http://localhost:${port}`;
	}
});

//: Request

const request = async (endpoint, func, log) => {
	try {
		const res = await(func(`${url}${endpoint}`));
		if (log) {
			console.log(`\n${'-'.repeat(process.stdout.columns)}`);
			p.chevron(`Status Code: ${res.status}`);
			p.bullet(
				`${JSON.stringify(res.data)}\n`,
				{log: false}
			);
		}
		return {
			...res.data,
			statusCode: res.status
		};
	} catch (error) {
		if (log) {
			console.log(`\n${'-'.repeat(process.stdout.columns)}`);
			p.chevron(`Status Code: ${error.response.status}`);
			p.bullet(
				`${JSON.stringify(error.response.data)}\n`,
				{log: false}
			);
		}
		return {
			...error.response.data,
			statusCode: error.response.status
		};
	}
};

//: Get Request

const get = async (endpoint, log) => {
	if (log == null) { log = true; }
	return await(request(endpoint, a.get.bind(a), log));
};

//: Post Request

const post = async (endpoint, log) => {
	if (log == null) { log = true; }
	return await(request(endpoint, a.post.bind(a), log));
};

//: Delete Request

const remove = async (endpoint, log) => {
	if (log == null) { log = true; }
	return await(request(endpoint, a.delete.bind(a), log));
};

//: Error Response Assert

const errorAssert = (res, msg, args) => {
	let extArgs = true;
	if (args != null) {
		for (let key in args) {
			const val = args[key];
			if (res.response[key] !== val) {
				extArgs = false;
				break;
			}
		}
	}
	return assert.equal(
		(res.status === 'error') &&
		[401, 500].includes(res.statusCode) &&
		res.response.message.includes(msg) &&
		extArgs,
		true
	);
};

//: Error Response Code Assert

const errorCodeAssert = (res, codes) => {
	let hasCodes = true;
	for (let code of codes) {
		if ((res.response.codes == null) || !res.response.codes.includes(code)) {
			hasCodes = false;
			break;
		}
	}
	return assert.equal(
		(res.status === 'error') &&
		[401, 500].includes(res.statusCode) &&
		hasCodes,
		true
	);
};

//: Error Response Exists Assert

const errorExistsAssert = function(res, fields) {
	let hasFields = false;
	for (let field of fields) {
		if (res.response[field] != null) {
			hasFields = true;
			break;
		}
	}
	return assert.equal(
		(res.status === 'error') &&
		[401, 500].includes(res.statusCode) &&
		!hasFields,
		true
	);
};

//: Okay Response Assert

const okayAssert = function(res, msg, args) {
	let extArgs = true;
	if (args != null) {
		for (let key in args) {
			const val = args[key];
			if (res.response[key] !== val) {
				extArgs = false;
				break;
			}
		}
	}
	return assert.equal(
		(res.status === 'ok') &&
		(res.statusCode === 200) &&
		res.response.message.includes(msg) &&
		extArgs,
		true
	);
};

//: Okay Response Exists Assert

const okayExistsAssert = function(res, fields) {
	let hasFields = true;
	for (let field of fields) {
		if ((res.response[field] == null)) {
			hasFields = false;
			break;
		}
	}
	return assert.equal(
		(res.status === 'ok') &&
		(res.statusCode === 200) &&
		hasFields,
		true
	);
};

//: Okay Modification Assert

const okayModAssert = (res, field, num) => assert.equal(
    (res.status === 'ok') &&
    (res.statusCode === 200) &&
    (res.response[field] === num),
    true
);

//: Creation Assert

const createAssert = res => assert.equal(
    (res.status === 'ok') &&
    (res.statusCode === 200) &&
    (res.response._id != null),
    true
);

//: Find Test

const findTest = function(field, op, value, valField, valRes) {
	let query = [{
		field,
		op,
		value
	}];
	query = new URLSearchParams({where: JSON.stringify(query)});
	const res = await(get(`/customer/find?${query}`));
	return assert.equal(
		(res.status === 'ok') &&
		(res.statusCode === 200) &&
		(res.response[0][valField] === valRes),
		true
	);
};

// Check that server has started

describe('Server Started', () => it('Server is on', () => assert(api != null)));

//: Initialization/Admin Setup

describe('Admin setup', () => {

	it('Init - Signup not protected', () => {
		const res = await(post('/signup'));
		return errorAssert(
			res,
			'Not Authorized'
		);
	});
	it('Init - Secret Key endpoint protected', () => {
		const res = await(post('/secret_key/insert'));
		return errorAssert(
			res,
			'No token provided'
		);
	});
	it('Init - Update Secret Key endpoint not protected', () => {
		const res = await(post('/update_secret_key'));
		return errorAssert(
			res,
			'Cannot read property'
		);
	});

	it('Create Secret Key - Invalid Key', () => {
		const res = await(post("/update_secret_key?key=test123"));
		return errorCodeAssert(
			res,
			[
				'KEY_INVALID_LENGTH',
				'KEY_INVALID_PASSWORD'
			]
		);
	});

	it('Create Secret Key', () => {
		const res = await(post(`/update_secret_key?key=${SECRET_KEY1}`));
		return createAssert(res);
	});

	it('Update Secret Key endpoint protected', () => {
		const res = await(post('/update_secret_key'));
		return errorAssert(
			res,
			'No token provided'
		);
	});

	it('Signup - Incorrect Secret Key', () => {
		const res = await(post("/signup?username=testUser&password=testPassword&secret_key=incorrectKey"));
		return errorAssert(
			res,
			'Incorrect secret key'
		);
	});

	it('Signup - Invalid Username and Password', () => {
		const res = await(post(`/signup?username=user&password=testPassword&secret_key=${SECRET_KEY1}`));
		return errorCodeAssert(
			res,
			[
				'USERNAME_INVALID_EMAIL',
				'PASSWORD_INVALID_PASSWORD'
			]
		);
	});

	return it('Valid Signup', () => {
		const res = await(post(`/signup?username=${USERNAME}&password=${PASSWORD1}&secret_key=${SECRET_KEY1}`));
		if (res.response.access_token != null) {
			ACCESS_TOKEN = res.response.access_token;
		}
		return assert.equal(
			(res.status === 'ok') &&
			(res.response.access_token != null),
			true
		);
	});
});

//: Admin Validation

describe('Admin validation', () => {

	it('No token', () => {
		const res = await(get('/verify_token'));
		return errorAssert(
			res,
			'No token provided'
		);
	});

	it('Model route - no token', () => {
		const res = await(get('/customer/get_all'));
		return errorAssert(
			res,
			'No token provided'
		);
	});

	it('Invalid token', () => {
		a.defaults.headers.common.authorization = ACCESS_TOKEN;
		const res = await(get('/verify_token?auth_token=invalidToken'));
		return errorAssert;
	});

	it('Verify token', () => {
		const res = await(get('/verify_token'));
		return okayAssert(
			res,
			'Token verified'
		);
	});

	it('Update Secret Key', () => {
		const res = await(post(`/update_secret_key?key=${SECRET_KEY2}`));
		return okayModAssert(
			res,
			'nModified',
			1
		);
	});

	it('Valid Signup after Secret Key update', () => {
		const res = await(post(`/signup?username=zelda@email.com&password=testPassword123!&secret_key=${SECRET_KEY2}`));
		if (res.response.access_token != null) {
			ACCESS_TOKEN = res.response.access_token;
		}
		return assert.equal(
			(res.status === 'ok') &&
			(res.response.access_token != null),
			true
		);
	});

	it('Login - User not found', () => {
		const res = await(post("/login?username=fakeUser@email.com&password=fakePassword1!"));
		return errorAssert(
			res,
			'User does not exist'
		);
	});

	it('Login - Invalid password', () => {
		const res = await(post(`/login?username=${USERNAME}&password=fakePassword1!`));
		return errorAssert(
			res,
			'Incorrect username or password'
		);
	});

	it('Valid login', () => {
		const res = await(post(`/login?username=${USERNAME}&password=${PASSWORD1}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.response.access_token != null),
			true
		);
	});

	it('Password change - User not found', () => {
		const res = await(post("/update_password?username=fakeUser@email.com&password=fakePassword1!&current_password=fakePassword2!"));
		return errorAssert(
			res,
			'User does not exist'
		);
	});

	it('Password change - Invalid password', () => {
		const res = await(post(`/update_password?username=${USERNAME}&password=fakePassword1!&current_password=fakePassword2!`));
		return errorAssert(
			res,
			'Incorrect username or password'
		);
	});

	it('Password change - no current password', () => {
		const res = await(post(`/update_password?username=${USERNAME}&password=fakePassword1!`));
		return errorAssert(
			res,
			'Must include current password'
		);
	});

	it('Password change - invalid password', () => {
		const res = await(post(`/update_password?username=${USERNAME}&password=fakePassword&current_password=${PASSWORD1}`));
		return errorCodeAssert(
			res,
			['PASSWORD_INVALID_PASSWORD']
		);
	});

	it('Valid password change', () => {
		const res = await(post(`/update_password?username=${USERNAME}&password=${PASSWORD2}&current_password=${PASSWORD1}`));
		return okayAssert(
			res,
			'Password updated'
		);
	});

	return it('Post password change - valid login', () => {
		const res = await(post(`/login?username=${USERNAME}&password=${PASSWORD2}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.response.access_token != null),
			true
		);
	});
});

//: API Methods

describe('API Methods', () => {

	it('Invalid insert', () => {
		const res = await(post("/customer/insert?name=bob"));
		return errorAssert(
			res,
			'validation failed'
		);
	});

	it('Valid insert', () => {
		const res = await(post("/customer/insert?name=bob&email=bob@email.com"));
		return okayExistsAssert(
			res,
			[
				'_id',
				'uid'
			]
		);
	});

	it('Valid sub-document and encoded insert', () => {
		const params = new URLSearchParams({
			name: JSON.stringify({address: 'home'}),
			password: 'testPassword'
		});
		const res = await(post(`/sub_doc/insert?${params}`));
		return okayExistsAssert(
			res,
			[
				'name',
				'password'
			]
		);
	});

	it('Invalid update', () => {
		const res = await(post("/customer/update?name=joe"));
		return okayModAssert(
			res,
			'nModified',
			0
		);
	});

	it('Valid update', () => {
		const res = await(post("/customer/update?name=bob&email=bob1@gmail.com"));
		return okayModAssert(
			res,
			'nModified',
			1
		);
	});

	it('Invalid get', () => {
		const res = await(get("/customer/get?name=joe"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 0),
			true
		);
	});

	it('Valid get', () => {
		const res = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1) &&
			(res.response[0]._id != null) &&
			(res.response[0].name === 'bob'),
			true
		);
	});

	it('Valid get-all', () => {
		const res = await(get("/customer/get_all"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1) &&
			(res.response[0]._id != null) &&
			(res.response[0].name === 'bob'),
			true
		);
	});

	it('Schema info - list fields', () => {
		const res = await(get("/customer/schema"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			res.response.schema.includes('name') &&
			res.response.list_fields.includes('products') &&
			(res.response.primary_key === 'name'),
			true
		);
	});

	it('Schema info - encrypted fields', () => {
		const res = await(get("/user_auth/schema"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			res.response.schema.includes('username') &&
			res.response.encrypt_fields.includes('password') &&
			(res.response.primary_key === 'username'),
			true
		);
	});

	it('Schema info - encoded and sub-document fields', () => {
		const res = await(get("/sub_doc/schema"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			res.response.schema.includes('name') &&
			res.response.encode_fields.includes('password') &&
			res.response.subdoc_fields.includes('name'),
			true
		);
	});

	it('Sterilize - remove obsolete, and set fields for all documents', () => {
		const res = await(get("/customer/sterilize?email=master@email.com&products=apples,oranges"));
		const users = await(get("/customer/get_all"));
		let hasChanges = true;
		for (let user of Array.from(users.response)) {
			if ((user.products[0] !== 'apples') || (user.products[1] !== 'oranges') || (user.email !== 'master@email.com')) {
				hasChanges = false;
				break;
			}
		}
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.nModified === 1) &&
			hasChanges,
			true
		);
	});

	it('Invalid delete', () => {
		await(post("/customer/insert?name=tom&email=tom@email.com"));
		await(post("/customer/insert?name=jerry&email=jerry@email.com"));
		const res = await(remove("/customer/delete?name=barney"));
		return okayModAssert(
			res,
			'deletedCount',
			0
		);
	});

	it('Invalid find', () => {
		const res = await(get("/customer/find?where="));
		return errorAssert(
			res,
			'Arguments must be aggregate pipeline operators'
		);
	});

	it('Valid $eq find', () => await(findTest(
        'email',
        '$eq',
        'jerry@email.com',
        'email',
        'jerry@email.com'
    )
    ));

	it('Valid $ne find', () => await(findTest(
        'email',
        '$ne',
        'jerry@email.com',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $gt find', () => await(findTest(
        'email',
        '$gt',
        'master@email.com',
        'email',
        'tom@email.com'
    )
    ));

	it('Valid $gte find', () => await(findTest(
        'email',
        '$gte',
        'master@email.com',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $lt find', () => await(findTest(
        'email',
        '$lt',
        'master@email.com',
        'email',
        'jerry@email.com'
    )
    ));

	it('Valid $in find', () => await(findTest(
        'email',
        '$in',
        [
            'master@email.com',
            'fake@email.com'
        ],
        'email',
        'master@email.com'
    )
    ));

	it('Valid $nin find', () => await(findTest(
        'email',
        '$nin',
        [
            'master@email.com',
            'tom@email.com'
        ],
        'email',
        'jerry@email.com'
    )
    ));

	it('Valid $lte find', () => await(findTest(
        'email',
        '$lte',
        'master@email.com',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $strt find', () => await(findTest(
        'email',
        '$strt',
        'master',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $end find', () => await(findTest(
        'email',
        '$end',
        'y@email.com',
        'email',
        'jerry@email.com'
    )
    ));

	it('Valid $cont find', () => await(findTest(
        'email',
        '$cont',
        'aste',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $inc find', () => await(findTest(
        'products',
        '$inc',
        'apples',
        'email',
        'master@email.com'
    )
    ));

	it('Valid $ninc find', () => await(findTest(
        'products',
        '$ninc',
        'apples',
        'email',
        'tom@email.com'
    )
    ));

	it('Valid find w/ multiple arguments', () => {
		let query = [
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
		query = new URLSearchParams({where: JSON.stringify(query)});
		const res = await(get(`/customer/find?${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response[0].email === 'master@email.com'),
			true
		);
	});

	it('Valid list field lookup', () => {
		let query = [
			{
				field: 'email',
				op: '$cont',
				value: 'master'
			}
		];
		query = new URLSearchParams({where: JSON.stringify(query)});
		await(post("/product/insert?name=apples&price=2.50"));
		await(post("/product/insert?name=oranges&price=4.50"));
		const res = await(get(`/customer/find?${query}&from=product&local_field=products&foreign_field=name&as=productInfo`));
		await(post("/product/delete_all"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response[0].productInfo[0].name === 'apples'),
			true
		);
	});

	it('Valid get_all sort and limit', () => {
		let query = {
			sort_field: 'name',
			sort_order: -1,
			record_limit: 1
		};
		query = new URLSearchParams(query);
		const res = await(get(`/customer/get_all?${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1) &&
			(res.response[0].name === 'tom'),
			true
		);
	});

	it('Valid get_all sort, limit, and skip', () => {
		let query = {
			sort_field: 'name',
			sort_order: -1,
			record_limit: 1,
			skip: 1
		};
		query = new URLSearchParams(query);
		const res = await(get(`/customer/get_all?${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1) &&
			(res.response[0].name === 'jerry'),
			true
		);
	});

	it('Valid find sort and limit', () => {
		let query = {
			sort_field: 'name',
			sort_order: -1,
			record_limit: 1
		};
		let where = [
			{
				field: 'name',
				op: '$gte',
				value: 'a'
			}
		];
		query = new URLSearchParams(query);
		where = new URLSearchParams({where: JSON.stringify(where)});
		const res = await(get(`/customer/find?${where}&${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1) &&
			(res.response[0].name === 'tom'),
			true
		);
	});

	it('Valid find sort, limit, and skip', () => {
		let query = {
			sort_field: 'name',
			sort_order: -1,
			record_limit: 1,
			skip: 1
		};
		let where = [];
		query = new URLSearchParams(query);
		where = new URLSearchParams({where: JSON.stringify(where)});
		const res = await(get(`/customer/find?${where}&${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 1),
			res.response[0].name === 'jerry',
			true
		);
	});

	it('Valid non-list field lookup', () => {
		let query = [
			{
				field: 'email',
				op: '$cont',
				value: 'master'
			}
		];
		query = new URLSearchParams({where: JSON.stringify(query)});
		await(post("/info/insert?email=master@email.com&location=NY"));
		const res = await(get(`/customer/find?${query}&from=info&local_field=email&foreign_field=email&as=emailInfo`));
		await(post("/info/delete_all"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response[0].emailInfo.location === 'NY'),
			true
		);
	});

	it('Valid find w/ no records found', () => {
		let query = [
			{
				field: 'email',
				op: '$cont',
				value: 'debra'
			}
		];
		query = new URLSearchParams({where: JSON.stringify(query)});
		const res = await(get(`/customer/find?${query}`));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.length === 0),
			true
		);
	});

	it('Valid delete', () => {
		const res = await(remove("/customer/delete?name=tom"));
		return okayModAssert(
			res,
			'deletedCount',
			1
		);
	});

	it('Valid push', () => {
		const res = await(post("/customer/push?name=bob&products=apples,oranges"));
		const user = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.nModified === 1) &&
			(user.response[0].products[2] === 'apples') &&
			(user.response[0].products[3] === 'oranges'),
			true
		);
	});

	it('Invalid push unique', () => {
		const res = await(post("/customer/push_unique?name=bob&products=apples,oranges"));
		const user = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(user.response[0].products.length === 4),
			true
		);
	});

	it('Valid push unique', () => {
		const res = await(post("/customer/push_unique?name=bob&products=pears,grapes"));
		const user = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.nModified === 1) &&
			(user.response[0].products[4] === 'pears') &&
			(user.response[0].products[5] === 'grapes'),
			true
		);
	});

	it('Valid set', () => {
		const res = await(post("/customer/set?name=bob&products=beets,carrots"));
		const user = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.nModified === 1) &&
			(user.response[0].products[0] === 'beets') &&
			(user.response[0].products[1] === 'carrots'),
			true
		);
	});

	it('Valid set - no items', () => {
		const res = await(post("/customer/set?name=bob&products=[]"));
		const user = await(get("/customer/get?name=bob"));
		return assert.equal(
			(res.status === 'ok') &&
			(res.statusCode === 200) &&
			(res.response.nModified === 1) &&
			(user.response[0].products.length === 0),
			true
		);
	});

	it('Valid delete all', () => {
		const res = await(remove("/customer/delete_all"));
		return okayModAssert(
			res,
			'deletedCount',
			2
		);
	});

	return it('Admin Auth cleanup', () => {
		const user = await(remove('/user_auth/delete_all'));
		const secret = await(remove('/secret_key/delete_all'));
		const subDoc = await(remove('/sub_doc/delete_all'));
		p.success('Secret key and User Auth cleanup completed.');
		return assert.equal(
			(user.status === 'ok') &&
			(user.statusCode === 200) &&
			(user.response.deletedCount === 2) &&
			(secret.status === 'ok') &&
			(secret.statusCode === 200) &&
			(secret.response.deletedCount === 1),
			(subDoc.status === 'ok') &&
			(subDoc.statusCode === 200) &&
			(subDoc.response.deletedCount === 1) &&
			true
		);
	});
});

// Cleanup

after(done => {
	for (let key in models) {
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