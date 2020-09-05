"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const print_tools_js_1 = __importDefault(require("print-tools-js"));
const chai_1 = require("chai");
require('chai').should();
// Setup
let api, port, url;
api = port = url = null;
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
    './models/subDoc.js': subDocModel,
};
//: Start Server Hook
before(function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.timeout(10000);
        if (!fs_1.default.existsSync('./models')) {
            fs_1.default.mkdirSync('./models');
        }
        for (const key in models) {
            const val = models[key];
            if (!fs_1.default.existsSync(key)) {
                fs_1.default.writeFileSync(key, `module.exports = ${val}`);
            }
        }
        const restServer = require('../index').default;
        yield restServer.start();
        api = restServer.app;
        port =
            process.env.NODE_ENV === 'production'
                ? process.env.PORT || restServer.config.serverPort
                : restServer.config.serverPort + 10;
        if (restServer.config.serverAddress !== 'localhost') {
            return (url = `https://localhost:${port}`);
        }
        else {
            return (url = `http://localhost:${port}`);
        }
    });
});
//: Request
const request = (endpoint, func, log) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield func(`${url}${endpoint}`);
        if (log) {
            console.log(`\n${'-'.repeat(process.stdout.columns)}`);
            print_tools_js_1.default.chevron(`Status Code: ${res.status}`);
            print_tools_js_1.default.bullet(`${JSON.stringify(res.data)}\n`, { log: false });
        }
        return Object.assign(Object.assign({}, res.data), { statusCode: res.status });
    }
    catch (error) {
        if (log) {
            console.log(`\n${'-'.repeat(process.stdout.columns)}`);
            print_tools_js_1.default.chevron(`Status Code: ${error.response.status}`);
            print_tools_js_1.default.bullet(`${JSON.stringify(error.response.data)}\n`, { log: false });
        }
        return Object.assign(Object.assign({}, error.response.data), { statusCode: error.response.status });
    }
});
//: Get Request
const get = (endpoint, log = true) => __awaiter(void 0, void 0, void 0, function* () {
    return yield request(endpoint, axios_1.default.get.bind(axios_1.default), log);
});
//: Post Request
const post = (endpoint, log = true) => __awaiter(void 0, void 0, void 0, function* () {
    return yield request(endpoint, axios_1.default.post.bind(axios_1.default), log);
});
//: Delete Request
const remove = (endpoint, log = true) => __awaiter(void 0, void 0, void 0, function* () {
    return yield request(endpoint, axios_1.default.delete.bind(axios_1.default), log);
});
//: Error Response Assert
const errorAssert = (res, msg, args) => {
    let extArgs = true;
    if (args != null) {
        for (const key in args) {
            const val = args[key];
            if (res.response[key] !== val) {
                extArgs = false;
                break;
            }
        }
    }
    return chai_1.assert.equal(res.status === 'error' &&
        [401, 500].includes(res.statusCode) &&
        res.response.message.includes(msg) &&
        extArgs, true);
};
//: Error Response Code Assert
const errorCodeAssert = (res, codes) => {
    let hasCodes = true;
    for (const code of codes) {
        if (res.response.codes == null || !res.response.codes.includes(code)) {
            hasCodes = false;
            break;
        }
    }
    return chai_1.assert.equal(res.status === 'error' && [401, 500].includes(res.statusCode) && hasCodes, true);
};
//: Okay Response Assert
const okayAssert = (res, msg, args) => {
    let extArgs = true;
    if (args != null) {
        for (const key in args) {
            const val = args[key];
            if (res.response[key] !== val) {
                extArgs = false;
                break;
            }
        }
    }
    return chai_1.assert.equal(res.status === 'ok' &&
        res.statusCode === 200 &&
        res.response.message.includes(msg) &&
        extArgs, true);
};
//: Okay Response Exists Assert
const okayExistsAssert = (res, fields) => {
    let hasFields = true;
    for (const field of fields) {
        if (res.response[field] == null) {
            hasFields = false;
            break;
        }
    }
    return chai_1.assert.equal(res.status === 'ok' && res.statusCode === 200 && hasFields, true);
};
//: Okay Modification Assert
const okayModAssert = (res, field, num) => chai_1.assert.equal(res.status === 'ok' &&
    res.statusCode === 200 &&
    res.response[field] === num, true);
//: Creation Assert
const createAssert = (res) => chai_1.assert.equal(res.status === 'ok' && res.statusCode === 200 && res.response._id != null, true);
//: Find Test
const findTest = (field, op, value, valField, valRes) => __awaiter(void 0, void 0, void 0, function* () {
    let query = [
        {
            field,
            op,
            value,
        },
    ];
    query = new URLSearchParams({ where: JSON.stringify(query) });
    const res = yield get(`/customer/find?${query}`);
    return chai_1.assert.equal(res.status === 'ok' &&
        res.statusCode === 200 &&
        res.response[0][valField] === valRes, true);
});
// Check that server has started
describe('Server Started', function () {
    it('Server is on', function () {
        chai_1.assert(api != null);
    });
});
//: Initialization/Admin Setup
describe('Admin setup', function () {
    it('Init - Signup not protected', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/signup');
            return errorAssert(res, 'Not Authorized');
        });
    });
    it('Init - Secret Key endpoint protected', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/secret_key/insert');
            return errorAssert(res, 'No token provided');
        });
    });
    it('Init - Update Secret Key endpoint not protected', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/update_secret_key');
            return errorAssert(res, 'Cannot read property');
        });
    });
    it('Create Secret Key - Invalid Key', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/update_secret_key?key=test123');
            return errorCodeAssert(res, ['KEY_INVALID_LENGTH', 'KEY_INVALID_PASSWORD']);
        });
    });
    it('Create Secret Key', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_secret_key?key=${SECRET_KEY1}`);
            return createAssert(res);
        });
    });
    it('Update Secret Key endpoint protected', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/update_secret_key');
            return errorAssert(res, 'No token provided');
        });
    });
    it('Signup - Incorrect Secret Key', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/signup?username=testUser&password=testPassword&secret_key=incorrectKey');
            return errorAssert(res, 'Incorrect secret key');
        });
    });
    it('Signup - Invalid Username and Password', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/signup?username=user&password=testPassword&secret_key=${SECRET_KEY1}`);
            return errorCodeAssert(res, [
                'USERNAME_INVALID_EMAIL',
                'PASSWORD_INVALID_PASSWORD',
            ]);
        });
    });
    return it('Valid Signup', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/signup?username=${USERNAME}&password=${PASSWORD1}&secret_key=${SECRET_KEY1}`);
            if (res.response.access_token != null) {
                ACCESS_TOKEN = res.response.access_token;
            }
            return chai_1.assert.equal(res.status === 'ok' && res.response.access_token != null, true);
        });
    });
});
//: Admin Validation
describe('Admin validation', function () {
    it('No token', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/verify_token');
            return errorAssert(res, 'No token provided');
        });
    });
    it('Model route - no token', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/get_all');
            return errorAssert(res, 'No token provided');
        });
    });
    it('Invalid token', function () {
        return __awaiter(this, void 0, void 0, function* () {
            axios_1.default.defaults.headers.common.authorization = ACCESS_TOKEN;
            const res = yield get('/verify_token?auth_token=invalidToken');
            return errorAssert(res, 'Invalid token');
        });
    });
    it('Verify token', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/verify_token');
            return okayAssert(res, 'Token verified');
        });
    });
    it('Update Secret Key', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_secret_key?key=${SECRET_KEY2}`);
            return okayModAssert(res, 'nModified', 1);
        });
    });
    it('Valid Signup after Secret Key update', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/signup?username=zelda@email.com&password=testPassword123!&secret_key=${SECRET_KEY2}`);
            if (res.response.access_token != null) {
                ACCESS_TOKEN = res.response.access_token;
            }
            return chai_1.assert.equal(res.status === 'ok' && res.response.access_token != null, true);
        });
    });
    it('Login - User not found', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/login?username=fakeUser@email.com&password=fakePassword1!');
            return errorAssert(res, 'User does not exist');
        });
    });
    it('Login - Invalid password', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/login?username=${USERNAME}&password=fakePassword1!`);
            return errorAssert(res, 'Incorrect username or password');
        });
    });
    it('Valid login', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/login?username=${USERNAME}&password=${PASSWORD1}`);
            return chai_1.assert.equal(res.status === 'ok' && res.response.access_token != null, true);
        });
    });
    it('Password change - User not found', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/update_password?username=fakeUser@email.com&password=fakePassword1!&current_password=fakePassword2!');
            return errorAssert(res, 'User does not exist');
        });
    });
    it('Password change - Invalid password', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_password?username=${USERNAME}&password=fakePassword1!&current_password=fakePassword2!`);
            return errorAssert(res, 'Incorrect username or password');
        });
    });
    it('Password change - no current password', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_password?username=${USERNAME}&password=fakePassword1!`);
            return errorAssert(res, 'Must include current password');
        });
    });
    it('Password change - invalid password', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_password?username=${USERNAME}&password=fakePassword&current_password=${PASSWORD1}`);
            return errorCodeAssert(res, ['PASSWORD_INVALID_PASSWORD']);
        });
    });
    it('Valid password change', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/update_password?username=${USERNAME}&password=${PASSWORD2}&current_password=${PASSWORD1}`);
            return okayAssert(res, 'Password updated');
        });
    });
    return it('Post password change - valid login', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post(`/login?username=${USERNAME}&password=${PASSWORD2}`);
            return chai_1.assert.equal(res.status === 'ok' && res.response.access_token != null, true);
        });
    });
});
//: API Methods
describe('API Methods', function () {
    it('Invalid insert', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/insert?name=bob');
            return errorAssert(res, 'validation failed');
        });
    });
    it('Valid insert', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/insert?name=bob&email=bob@email.com');
            return okayExistsAssert(res, ['_id', 'uid']);
        });
    });
    it('Valid sub-document and encoded insert', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams({
                name: JSON.stringify({ address: 'home' }),
                password: 'testPassword',
            });
            const res = yield post(`/sub_doc/insert?${params}`);
            return okayExistsAssert(res, ['name', 'password']);
        });
    });
    it('Invalid update', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/update?name=joe');
            return okayModAssert(res, 'nModified', 0);
        });
    });
    it('Valid update', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/update?name=bob&email=bob1@gmail.com');
            return okayModAssert(res, 'nModified', 1);
        });
    });
    it('Invalid get', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/get?name=joe');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 0, true);
        });
    });
    it('Valid get', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0]._id != null &&
                res.response[0].name === 'bob', true);
        });
    });
    it('Valid get-all', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/get_all');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0]._id != null &&
                res.response[0].name === 'bob', true);
        });
    });
    it('Schema info - list fields', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/schema');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.schema.includes('name') &&
                res.response.list_fields.includes('products') &&
                res.response.primary_key === 'name', true);
        });
    });
    it('Schema info - encrypted fields', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/user_auth/schema');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.schema.includes('username') &&
                res.response.encrypt_fields.includes('password') &&
                res.response.primary_key === 'username', true);
        });
    });
    it('Schema info - encoded and sub-document fields', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/sub_doc/schema');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.schema.includes('name') &&
                res.response.encode_fields.includes('password') &&
                res.response.subdoc_fields.includes('name'), true);
        });
    });
    it('Sterilize - remove obsolete, and set fields for all documents', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/sterilize?email=master@email.com&products=apples,oranges');
            const users = yield get('/customer/get_all');
            let hasChanges = true;
            for (const user of users.response) {
                if (user.products[0] !== 'apples' ||
                    user.products[1] !== 'oranges' ||
                    user.email !== 'master@email.com') {
                    hasChanges = false;
                    break;
                }
            }
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.nModified === 1 &&
                hasChanges, true);
        });
    });
    it('Invalid delete', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield post('/customer/insert?name=tom&email=tom@email.com');
            yield post('/customer/insert?name=jerry&email=jerry@email.com');
            const res = yield remove('/customer/delete?name=barney');
            return okayModAssert(res, 'deletedCount', 0);
        });
    });
    it('Invalid find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield get('/customer/find?where=');
            return errorAssert(res, 'Arguments must be aggregate pipeline operators');
        });
    });
    it('Valid $eq find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$eq', 'jerry@email.com', 'email', 'jerry@email.com');
        });
    });
    it('Valid $ne find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$ne', 'jerry@email.com', 'email', 'master@email.com');
        });
    });
    it('Valid $gt find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$gt', 'master@email.com', 'email', 'tom@email.com');
        });
    });
    it('Valid $gte find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$gte', 'master@email.com', 'email', 'master@email.com');
        });
    });
    it('Valid $lt find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$lt', 'master@email.com', 'email', 'jerry@email.com');
        });
    });
    it('Valid $in find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$in', ['master@email.com', 'fake@email.com'], 'email', 'master@email.com');
        });
    });
    it('Valid $nin find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$nin', ['master@email.com', 'tom@email.com'], 'email', 'jerry@email.com');
        });
    });
    it('Valid $lte find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$lte', 'master@email.com', 'email', 'master@email.com');
        });
    });
    it('Valid $strt find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$strt', 'master', 'email', 'master@email.com');
        });
    });
    it('Valid $end find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$end', 'y@email.com', 'email', 'jerry@email.com');
        });
    });
    it('Valid $cont find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('email', '$cont', 'aste', 'email', 'master@email.com');
        });
    });
    it('Valid $inc find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('products', '$inc', 'apples', 'email', 'master@email.com');
        });
    });
    it('Valid $ninc find', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield findTest('products', '$ninc', 'apples', 'email', 'tom@email.com');
        });
    });
    it('Valid find w/ multiple arguments', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = [
                {
                    field: 'email',
                    op: '$cont',
                    value: 'master',
                },
                {
                    field: 'products',
                    op: '$inc',
                    value: 'apples',
                },
                {
                    field: 'email',
                    op: '$gt',
                    value: 'jerry',
                },
            ];
            query = new URLSearchParams({ where: JSON.stringify(query) });
            const res = yield get(`/customer/find?${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response[0].email === 'master@email.com', true);
        });
    });
    it('Valid list field lookup', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = [
                {
                    field: 'email',
                    op: '$cont',
                    value: 'master',
                },
            ];
            query = new URLSearchParams({ where: JSON.stringify(query) });
            yield post('/product/insert?name=apples&price=2.50');
            yield post('/product/insert?name=oranges&price=4.50');
            const res = yield get(`/customer/find?${query}&from=product&local_field=products&foreign_field=name&as=productInfo`);
            yield post('/product/delete_all');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response[0].productInfo[0].name === 'apples', true);
        });
    });
    it('Valid get_all sort and limit', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = {
                sort_field: 'name',
                sort_order: -1,
                record_limit: 1,
            };
            query = new URLSearchParams(query);
            const res = yield get(`/customer/get_all?${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0].name === 'tom', true);
        });
    });
    it('Valid get_all sort, limit, and skip', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = {
                sort_field: 'name',
                sort_order: -1,
                record_limit: 1,
                skip: 1,
            };
            query = new URLSearchParams(query);
            const res = yield get(`/customer/get_all?${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0].name === 'jerry', true);
        });
    });
    it('Valid find sort and limit', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = {
                sort_field: 'name',
                sort_order: -1,
                record_limit: 1,
            };
            let where = [
                {
                    field: 'name',
                    op: '$gte',
                    value: 'a',
                },
            ];
            query = new URLSearchParams(query);
            where = new URLSearchParams({ where: JSON.stringify(where) });
            const res = yield get(`/customer/find?${where}&${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0].name === 'tom', true);
        });
    });
    it('Valid find sort, limit, and skip', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = {
                sort_field: 'name',
                sort_order: -1,
                record_limit: 1,
                skip: 1,
            };
            let where = [];
            query = new URLSearchParams(query);
            where = new URLSearchParams({ where: JSON.stringify(where) });
            const res = yield get(`/customer/find?${where}&${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 1 &&
                res.response[0].name === 'jerry', true);
        });
    });
    it('Valid non-list field lookup', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = [
                {
                    field: 'email',
                    op: '$cont',
                    value: 'master',
                },
            ];
            query = new URLSearchParams({ where: JSON.stringify(query) });
            yield post('/info/insert?email=master@email.com&location=NY');
            const res = yield get(`/customer/find?${query}&from=info&local_field=email&foreign_field=email&as=emailInfo`);
            yield post('/info/delete_all');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response[0].emailInfo.location === 'NY', true);
        });
    });
    it('Valid find w/ no records found', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let query = [
                {
                    field: 'email',
                    op: '$cont',
                    value: 'debra',
                },
            ];
            query = new URLSearchParams({ where: JSON.stringify(query) });
            const res = yield get(`/customer/find?${query}`);
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.length === 0, true);
        });
    });
    it('Valid delete', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield remove('/customer/delete?name=tom');
            return okayModAssert(res, 'deletedCount', 1);
        });
    });
    it('Valid push', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/push?name=bob&products=apples,oranges');
            const user = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.nModified === 1 &&
                user.response[0].products[2] === 'apples' &&
                user.response[0].products[3] === 'oranges', true);
        });
    });
    it('Invalid push unique', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/push_unique?name=bob&products=apples,oranges');
            const user = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                user.response[0].products.length === 4, true);
        });
    });
    it('Valid push unique', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/push_unique?name=bob&products=pears,grapes');
            const user = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.nModified === 1 &&
                user.response[0].products[4] === 'pears' &&
                user.response[0].products[5] === 'grapes', true);
        });
    });
    it('Valid set', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/set?name=bob&products=beets,carrots');
            const user = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.nModified === 1 &&
                user.response[0].products[0] === 'beets' &&
                user.response[0].products[1] === 'carrots', true);
        });
    });
    it('Valid set - no items', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield post('/customer/set?name=bob&products=[]');
            const user = yield get('/customer/get?name=bob');
            return chai_1.assert.equal(res.status === 'ok' &&
                res.statusCode === 200 &&
                res.response.nModified === 1 &&
                user.response[0].products.length === 0, true);
        });
    });
    it('Valid delete all', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield remove('/customer/delete_all');
            return okayModAssert(res, 'deletedCount', 2);
        });
    });
    return it('Admin Auth cleanup', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield remove('/user_auth/delete_all');
            const secret = yield remove('/secret_key/delete_all');
            const subDoc = yield remove('/sub_doc/delete_all');
            print_tools_js_1.default.success('Secret key and User Auth cleanup completed.');
            return chai_1.assert.equal(user.status === 'ok' &&
                user.statusCode === 200 &&
                user.response.deletedCount === 2 &&
                secret.status === 'ok' &&
                secret.statusCode === 200 &&
                secret.response.deletedCount === 1, subDoc.status === 'ok' &&
                subDoc.statusCode === 200 &&
                subDoc.response.deletedCount === 1 &&
                true);
        });
    });
});
// Cleanup
after(function (done) {
    for (const key in models) {
        if (fs_1.default.existsSync(key)) {
            fs_1.default.unlinkSync(key);
        }
    }
    if (fs_1.default.existsSync('./models')) {
        fs_1.default.rmdirSync('./models');
    }
    done();
    process.exit(0);
});
//::: End Program :::
