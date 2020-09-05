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
exports.verifyToken = exports.signToken = exports.noCurrentPass = exports.userNotFound = exports.incorrectUserOrPass = exports.incorrectSecretKey = exports.responseFormat = exports.allowedSecretKey = exports.allowedPassword = exports.updateQuery = exports.schemaAsync = exports.parseDataSort = exports.errorObj = exports.objOmit = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuidv4_1 = __importDefault(require("uuidv4"));
const mongoose_auto_api_validation_1 = __importDefault(require("mongoose-auto-api.validation"));
const mongoose_auto_api_models_1 = __importDefault(require("mongoose-auto-api.models"));
const userAuth = mongoose_auto_api_models_1.default.userAuth.model;
const secretKey = mongoose_auto_api_models_1.default.secretKey.model;
const AUTH_TOKEN = uuidv4_1.default();
//::: MISC FUNCTIONS :::
// Omit Properties from Object and get Copy
const objOmit = (obj, keys) => {
    const clone = Object.assign({}, obj);
    for (const key of keys) {
        delete obj[key];
    }
    return clone;
};
exports.objOmit = objOmit;
//: Get Error Object
const errorObj = (error) => ({
    message: error.message,
    name: error.name,
    trace: error.stack.split('\n')[1].trim(),
});
exports.errorObj = errorObj;
//: Parse Data Sort
const parseDataSort = (query, aggregate = false) => {
    let skip;
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
                    [sortField]: sortOrder,
                },
            },
        ];
        if (skip) {
            sortArgs.push({
                $skip: skip,
            });
        }
        if (limit !== 0) {
            sortArgs.push({
                $limit: limit,
            });
        }
    }
    else {
        sortArgs = {
            sort: {
                [sortField]: sortOrder,
            },
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
exports.parseDataSort = parseDataSort;
//::: SCHEMA FUNCTIONS :::
// Get Schema Info
const schemaInfo = (model) => ({
    schema: Object.keys(model.model.schema.paths),
    primary_key: model.primaryKey,
    list_fields: model.listFields,
    encrypt_fields: model.encryptFields,
    encode_fields: model.encodeFields,
    subdoc_fields: model.subDocFields,
});
// Get Schema Info Async
const schemaAsync = (model) => Promise.resolve(schemaInfo(model));
exports.schemaAsync = schemaAsync;
// Update Query
const updateQuery = (req, primaryKey) => {
    const query = objOmit(req.query, [primaryKey]);
    if (query.update_primary != null) {
        query[primaryKey] = query.update_primary;
        query.update_primary = null;
    }
    return query;
};
exports.updateQuery = updateQuery;
// Allowed Password Check
const allowedPassword = (req) => {
    const userVal = mongoose_auto_api_validation_1.default.userVal(req.query.username, 'username');
    const passVal = mongoose_auto_api_validation_1.default.passVal(req.query.password, 'password');
    const error = mongoose_auto_api_validation_1.default.joinValidations([userVal, passVal]);
    if (!error.valid) {
        return {
            status: 'error',
            response: error,
        };
    }
    else {
        return true;
    }
};
exports.allowedPassword = allowedPassword;
// Allowed Secret Key
const allowedSecretKey = (req) => {
    const error = mongoose_auto_api_validation_1.default.passVal(req.query.key, 'key');
    if (!error.valid) {
        return {
            status: 'error',
            response: error,
        };
    }
    else {
        return true;
    }
};
exports.allowedSecretKey = allowedSecretKey;
//::: RESPONSE FUNCTIONS :::
// Response/Error JSON
const responseFormat = (method, args, req, res, spreadArgs = true) => __awaiter(void 0, void 0, void 0, function* () {
    let response;
    try {
        if (spreadArgs) {
            response = yield method(...args);
        }
        else {
            response = yield method(args);
        }
        const retJson = {
            status: 'ok',
            response,
        };
        if (res.locals.refresh_token != null) {
            retJson.refresh_token = res.locals.refresh_token;
        }
        return res.json(retJson);
    }
    catch (error) {
        const errJson = {
            status: 'error',
            response: errorObj(error),
        };
        if (res.locals.refresh_token != null) {
            errJson.refresh_token = res.locals.refresh_token;
        }
        return res.status(500).json(errJson);
    }
});
exports.responseFormat = responseFormat;
// Incorrect Secret Key JSON
const incorrectSecretKey = (res) => res.status(401).json({
    status: 'error',
    response: {
        message: 'Incorrect secret key.',
        codes: ['SECRET_KEY_INCORRECT'],
    },
});
exports.incorrectSecretKey = incorrectSecretKey;
// Incorrect Username or Password JSON
const incorrectUserOrPass = (res) => res.status(401).json({
    status: 'error',
    response: {
        message: 'Incorrect username or password.',
        codes: ['USER_OR_PASSWORD_INCORRECT'],
    },
});
exports.incorrectUserOrPass = incorrectUserOrPass;
// User Not Found JSON
const userNotFound = (res) => res.status(401).json({
    status: 'error',
    response: {
        message: 'User does not exist.',
        codes: ['USER_NOT_FOUND'],
    },
});
exports.userNotFound = userNotFound;
// No Current Password JSON
const noCurrentPass = (res) => res.status(401).json({
    status: 'error',
    response: {
        message: 'Must include current password.',
        codes: ['PASSWORD_NO_CURRENT'],
    },
});
exports.noCurrentPass = noCurrentPass;
//::: TOKEN FUNCTIONS :::
// Sign JSON Web Token (expires in 7 days)
const signToken = (user) => {
    const expires_in = 24 * 60 * 60 * 7;
    const access_token = jsonwebtoken_1.default.sign({
        username: user.username,
        uid: user.uid,
    }, AUTH_TOKEN, { expiresIn: expires_in });
    return {
        username: user.username,
        uid: user.uid,
        access_token,
        expires_in,
    };
};
exports.signToken = signToken;
// Verify JSON Web Token
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.path != null) {
        let getAll;
        if (req.params.path === 'update_secret_key') {
            getAll = yield secretKey.find({});
            if (getAll.length <= 0) {
                return next();
            }
        }
        else if (req.params.path === 'signup') {
            getAll = yield userAuth.find({});
            if (getAll.length <= 0) {
                return next();
            }
        }
    }
    const token = req.query.auth_token ||
        req.headers['x-access-token'] ||
        req.headers['authorization'];
    if (!token) {
        return res.status(401).json({
            status: 'error',
            response: {
                message: 'No token provided.',
            },
        });
    }
    else {
        jsonwebtoken_1.default.verify(token, AUTH_TOKEN, (error, decoded) => {
            const currentTime = Math.round(Date.now() / 1000);
            const expiresIn = 24 * 60 * 60;
            const oneHour = 60 * 60;
            if (error) {
                return res.status(401).json({
                    status: 'error',
                    response: {
                        message: 'Invalid token.',
                    },
                });
            }
            else if (currentTime < decoded.exp &&
                currentTime + expiresIn > decoded.exp + oneHour) {
                res.locals.refresh_token = signToken(decoded);
                return next();
            }
            else {
                return next();
            }
        });
    }
});
exports.verifyToken = verifyToken;
//::: End Program :::