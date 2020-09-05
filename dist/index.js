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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const print_tools_js_1 = __importDefault(require("print-tools-js"));
const mongoose_1 = __importDefault(require("mongoose"));
const public_ip_1 = __importDefault(require("public-ip"));
const compression_1 = __importDefault(require("compression"));
const mongoose_auto_api_models_1 = __importDefault(require("mongoose-auto-api.models"));
const routeWrapper_1 = require("./utils/routeWrapper");
const routeWrapper_2 = require("./utils/routeWrapper");
const routeWrapper_3 = require("./utils/routeWrapper");
const routeWrapper_4 = require("./utils/routeWrapper");
const apiFunctions_1 = require("./utils/apiFunctions");
const apiFunctions_2 = require("./utils/apiFunctions");
const apiFunctions_3 = require("./utils/apiFunctions");
const apiFunctions_4 = require("./utils/apiFunctions");
const apiFunctions_5 = require("./utils/apiFunctions");
const apiFunctions_6 = require("./utils/apiFunctions");
const apiFunctions_7 = require("./utils/apiFunctions");
const apiFunctions_8 = require("./utils/apiFunctions");
const apiFunctions_9 = require("./utils/apiFunctions");
const apiFunctions_10 = require("./utils/apiFunctions");
const apiFunctions_11 = require("./utils/apiFunctions");
const apiFunctions_12 = require("./utils/apiFunctions");
const apiFunctions_13 = require("./utils/apiFunctions");
const apiFunctions_14 = require("./utils/apiFunctions");
const parseQuery_1 = __importDefault(require("./utils/parseQuery"));
//: Setup
const config = fs_1.default.existsSync('../../../appConfig.json')
    ? require('../../../appConfig.json')
    : require('./data/defaultConfig.json');
const serverPort = process.env.NODE_ENV === 'production'
    ? process.env.PORT || config.serverPort
    : config.serverPort + 10;
const corsPort = process.env.NODE_ENV === 'production'
    ? process.env.WEB_PORT || config.webPort
    : config.webPort + 10;
const { mongoosePort } = config;
const { databaseName } = config;
const userAuth = mongoose_auto_api_models_1.default.userAuth.model;
const secretKey = mongoose_auto_api_models_1.default.secretKey.model;
let serverAddress = null;
const app = express_1.default();
//: MongoDB Config
const mongooseConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield mongoose_1.default.connect(`mongodb://localhost:${mongoosePort}/${databaseName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
    }
    catch (error) {
        print_tools_js_1.default.error('MongoDB Service is not started.');
        return process.exit(1);
    }
});
//: Server Started Function
const serverStarted = () => {
    print_tools_js_1.default.success(`Public IP: ${serverAddress}`, { log: false });
    return print_tools_js_1.default.titleBox('Data API Server', {
        titleDesc: `Running on port ${serverPort}`,
        tagLine: `Connecting to Mongo database: ${databaseName} on port ${mongoosePort}`,
    });
};
//: Init Server
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        serverAddress = yield public_ip_1.default.v4();
    }
    catch (error) {
        serverAddress = 'localhost';
    }
    return yield mongooseConnect();
});
//: Start Server
const startServer = () => {
    let keyPath = config.sslKey
        ? config.sslKey
        : `/etc/letsencrypt/live/${config.serverAddress}/privkey.pem`;
    let certPath = config.sslCert
        ? config.sslCert
        : `/etc/letsencrypt/live/${config.serverAddress}/cert.pem`;
    let chainPath = config.sslChain
        ? config.sslChain
        : `/etc/letsencrypt/live/${config.serverAddress}/chain.pem`;
    keyPath = path_1.default.resolve(keyPath);
    certPath = path_1.default.resolve(certPath);
    chainPath = path_1.default.resolve(chainPath);
    const keyExists = fs_1.default.existsSync(keyPath);
    const certExists = fs_1.default.existsSync(certPath);
    const chainExists = fs_1.default.existsSync(chainPath);
    app.use(compression_1.default());
    if (config.serverAddress !== 'localhost' &&
        keyExists &&
        certExists &&
        chainExists) {
        app.use(cors_1.default({
            origin: [
                `http://localhost:${corsPort}`,
                `https://localhost:${corsPort}`,
                `http://${serverAddress}:${corsPort}`,
                `https://${serverAddress}:${corsPort}`,
                `http://${config.serverAddress}:${corsPort}`,
                `https://${config.serverAddress}:${corsPort}`,
            ],
            exposedHeaders: ['X-Access-Token'],
        }));
        print_tools_js_1.default.success('Secure server starting...', { log: false });
        https_1.default
            .createServer({
            key: fs_1.default.readFileSync(keyPath),
            cert: fs_1.default.readFileSync(certPath),
            ca: fs_1.default.readFileSync(chainPath),
        }, app)
            .listen(serverPort, serverStarted);
    }
    else {
        app.use(cors_1.default({
            origin: `http://localhost:${corsPort}`,
            exposedHeaders: ['X-Access-Token'],
        }));
        print_tools_js_1.default.warning('Insecure server starting', { log: false });
        app.listen(serverPort, serverStarted);
    }
    //: All Routes
    app.all(`/:path(${Object.keys(routeWrapper_2.appRoutes).join('|')})/:method(${routeWrapper_4.normalMethods.join('|')})`, apiFunctions_14.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let field, sortArgs;
        const modelInfo = routeWrapper_2.appRoutes[req.params.path];
        const { model } = modelInfo;
        const { primaryKey } = modelInfo;
        //: Format Sub-Document fields
        if (['update', 'insert'].includes(req.params.method)) {
            for (field of modelInfo.subDocFields) {
                if (typeof req.query[field] === 'string') {
                    req.query[field] = JSON.parse(req.query[field]);
                }
            }
        }
        //: Insert
        if (req.params.method === 'insert') {
            return yield apiFunctions_8.responseFormat(model.create.bind(model), [req.query], req, res);
            //: Update
        }
        else if (req.params.method === 'update') {
            return yield apiFunctions_8.responseFormat(model.updateOne.bind(model), [
                {
                    [primaryKey]: req.query[primaryKey],
                },
                apiFunctions_5.updateQuery(req, primaryKey),
            ], req, res);
            //: Delete
        }
        else if (req.params.method === 'delete') {
            return yield apiFunctions_8.responseFormat(model.deleteOne.bind(model), [
                {
                    [primaryKey]: req.query[primaryKey],
                },
            ], req, res);
            //: Delete All
        }
        else if (req.params.method === 'delete_all') {
            return yield apiFunctions_8.responseFormat(model.deleteMany.bind(model), [{}], req, res);
            //: Get
        }
        else if (req.params.method === 'get') {
            return yield apiFunctions_8.responseFormat(model.find.bind(model), [
                {
                    [primaryKey]: req.query[primaryKey],
                },
            ], req, res);
            //: Get All
        }
        else if (req.params.method === 'get_all') {
            sortArgs = apiFunctions_3.parseDataSort(req.query, false);
            return yield apiFunctions_8.responseFormat(model.find.bind(model), [{}, null, sortArgs], req, res);
            //: Find
        }
        else if (req.params.method === 'find') {
            let aggArgs;
            sortArgs = apiFunctions_3.parseDataSort(req.query, true);
            if (req.query.local_field != null &&
                req.query.from != null &&
                req.query.foreign_field != null &&
                req.query.as != null) {
                const lookup = {
                    $lookup: {
                        from: req.query.from,
                        localField: req.query.local_field,
                        foreignField: req.query.foreign_field,
                        as: req.query.as,
                    },
                };
                if (modelInfo.listFields.includes(req.query.local_field)) {
                    aggArgs = [parseQuery_1.default(model, req.query.where), lookup];
                }
                else {
                    const unwind = { $unwind: `$${req.query.as}` };
                    aggArgs = [
                        parseQuery_1.default(model, req.query.where),
                        lookup,
                        unwind,
                        ...sortArgs,
                    ];
                }
            }
            else {
                aggArgs = [parseQuery_1.default(model, req.query.where), ...sortArgs];
            }
            return yield apiFunctions_8.responseFormat(model.aggregate.bind(model), aggArgs, req, res, false);
            //: Get Schema Info
        }
        else if (req.params.method === 'schema') {
            return yield apiFunctions_8.responseFormat(apiFunctions_4.schemaAsync, [modelInfo], req, res);
            //: Sterilize: removes fields not in schema, sets all query fields to specified value for all docs
        }
        else if (req.params.method === 'sterilize') {
            const setDict = {};
            const unsetDict = {};
            const normalDict = {};
            const mongoFields = ['_id', 'createdAt', 'updatedAt', 'uid', '__v'];
            const allFields = [...mongoFields, ...modelInfo.allFields];
            const { listFields } = modelInfo;
            const records = yield model.find({}).lean();
            for (const record of records) {
                for (const key in record) {
                    if (!allFields.includes(key) &&
                        !Object.keys(unsetDict).includes(key)) {
                        unsetDict[key] = 1;
                    }
                }
            }
            for (field in req.query) {
                const val = req.query[field];
                if (listFields.includes(field)) {
                    setDict[field] = val.split(',');
                }
                else {
                    if (field !== 'auth_token') {
                        normalDict[field] = val;
                    }
                }
            }
            yield model.collection.dropIndexes();
            return yield apiFunctions_8.responseFormat(model.updateMany.bind(model), [
                {},
                Object.assign(Object.assign({}, normalDict), { $set: setDict, $unset: unsetDict }),
                {
                    multi: true,
                    strict: false,
                },
            ], req, res);
        }
    }));
    //: List Routes
    app.all(`/:path(${Object.keys(routeWrapper_1.listRoutes).join('|')})/:method(${routeWrapper_3.listMethods.join('|')})`, apiFunctions_14.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { model } = routeWrapper_2.appRoutes[req.params.path];
        const { primaryKey } = routeWrapper_2.appRoutes[req.params.path];
        if (['push', 'push_unique', 'set'].includes(req.params.method)) {
            const updateDict = {};
            for (const key in req.query) {
                if (![primaryKey, 'auth_token', 'refresh_token'].includes(key)) {
                    if (req.params.method !== 'set') {
                        updateDict[key] = { $each: req.query[key].split(',') };
                    }
                    else {
                        if (req.query[key] !== '[]') {
                            updateDict[key] = req.query[key].split(',');
                        }
                        else {
                            updateDict[key] = [];
                        }
                    }
                }
            }
            //: Push
            if (req.params.method === 'push') {
                return yield apiFunctions_8.responseFormat(model.updateOne.bind(model), [
                    {
                        [primaryKey]: req.query[primaryKey],
                    },
                    {
                        $push: updateDict,
                    },
                ], req, res);
                //: Push Unique
            }
            else if (req.params.method === 'push_unique') {
                return yield apiFunctions_8.responseFormat(model.updateOne.bind(model), [
                    {
                        [primaryKey]: req.query[primaryKey],
                    },
                    {
                        $addToSet: updateDict,
                    },
                ], req, res);
                //: Set
            }
            else if (req.params.method === 'set') {
                return yield apiFunctions_8.responseFormat(model.updateOne.bind(model), [
                    {
                        [primaryKey]: req.query[primaryKey],
                    },
                    {
                        $set: updateDict,
                    },
                ], req, res);
            }
        }
    }));
    //: Login
    app.all('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield userAuth.findOne({
                username: req.query.username,
            });
            if (user) {
                const passMatch = yield bcrypt_1.default.compare(req.query.password, user.password);
                if (!passMatch) {
                    return apiFunctions_10.incorrectUserOrPass(res);
                }
                else {
                    const token = apiFunctions_13.signToken(user);
                    return res.json({
                        status: 'ok',
                        response: token,
                    });
                }
            }
            else {
                return apiFunctions_11.userNotFound(res);
            }
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                response: apiFunctions_2.errorObj(error),
            });
        }
    }));
    //: Edit Secret Key
    app.all('/:path(update_secret_key)', apiFunctions_14.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let response;
        try {
            const isValid = apiFunctions_7.allowedSecretKey(req);
            if (isValid !== true) {
                return res.status(401).json(isValid);
            }
            const key = yield secretKey.find({});
            if (key.length === 0) {
                response = yield secretKey.create(req.query);
            }
            else {
                response = yield secretKey.updateOne({
                    key: key[key.length - 1].key,
                }, req.query);
            }
            return res.json({
                status: 'ok',
                response,
            });
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                response: apiFunctions_2.errorObj(error),
            });
        }
    }));
    //: Sign Up
    app.all('/:path(signup)', apiFunctions_14.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let response;
        try {
            if (req.query.secret_key != null) {
                const key = yield secretKey.find({});
                if (key.length > 0) {
                    const key_match = yield bcrypt_1.default.compare(req.query.secret_key, key[key.length - 1].key);
                    if (!key_match) {
                        return apiFunctions_9.incorrectSecretKey(res);
                    }
                }
                const isValid = apiFunctions_6.allowedPassword(req);
                if (isValid !== true) {
                    return res.status(401).json(isValid);
                }
                response = yield userAuth.create(req.query);
                if (req.query.username === response.username) {
                    const token = apiFunctions_13.signToken(response);
                    return res.json({
                        status: 'ok',
                        response: token,
                    });
                }
                else {
                    return res.status(401).json({
                        status: 'error',
                        response,
                    });
                }
            }
            else {
                return res.status(401).json({
                    status: 'error',
                    response: {
                        message: 'Not Authorized.',
                    },
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                response: apiFunctions_2.errorObj(error),
            });
        }
    }));
    //: Update Password
    app.all('/update_password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield userAuth.findOne({
                username: req.query.username,
            });
            if (user && req.query.current_password != null) {
                const passMatch = yield bcrypt_1.default.compare(req.query.current_password, user.password);
                if (!passMatch) {
                    return apiFunctions_10.incorrectUserOrPass(res);
                }
            }
            else if (!user) {
                return apiFunctions_11.userNotFound(res);
            }
            else if (req.query.current_password == null) {
                return apiFunctions_12.noCurrentPass(res);
            }
            const isValid = apiFunctions_6.allowedPassword(req);
            if (isValid !== true) {
                return res.status(401).json(isValid);
            }
            const passUpdate = yield userAuth.updateOne({ username: req.query.username }, apiFunctions_1.objOmit(req.query, ['username']));
            if (passUpdate.nModified === 1) {
                return res.json({
                    status: 'ok',
                    response: {
                        message: 'Password updated.',
                    },
                });
            }
            else {
                return res.status(401).json({
                    status: 'error',
                    response: passUpdate,
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                response: apiFunctions_2.errorObj(error),
            });
        }
    }));
    //: Verify Token
    return app.all('/verify_token', apiFunctions_14.verifyToken, (req, res) => {
        if (res.locals.refresh_token != null) {
            return res.json({
                status: 'ok',
                refresh_token: res.locals.refresh_token,
                response: {
                    message: 'Token verified.',
                },
            });
        }
        else {
            return res.json({
                status: 'ok',
                response: {
                    message: 'Token verified.',
                },
            });
        }
    });
};
//: Main
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield init();
    return startServer();
});
//: Exports
exports.default = {
    app,
    start,
    models: mongoose_auto_api_models_1.default,
    config,
};
