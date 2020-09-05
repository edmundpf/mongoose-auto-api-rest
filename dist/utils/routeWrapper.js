"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeMethods = exports.normalMethods = exports.listMethods = exports.appRoutes = exports.normalRoutes = exports.listRoutes = void 0;
const mongoose_auto_api_models_1 = __importDefault(require("mongoose-auto-api.models"));
//: Route Methods
const listMethods = ['set', 'push', 'push_unique'];
exports.listMethods = listMethods;
const normalMethods = [
    'insert',
    'update',
    'delete',
    'delete_all',
    'get',
    'get_all',
    'find',
    'sterilize',
    'schema',
];
exports.normalMethods = normalMethods;
const routeMethods = [...normalMethods, ...listMethods];
exports.routeMethods = routeMethods;
//: Get Routes
const getRoutes = () => {
    const listRoutes = {};
    const normalRoutes = {};
    for (const key in mongoose_auto_api_models_1.default) {
        const model = mongoose_auto_api_models_1.default[key];
        if (model.listFields.length > 0) {
            listRoutes[model.collectionName] = model;
        }
        else {
            normalRoutes[model.collectionName] = model;
        }
    }
    return {
        list: listRoutes,
        normal: normalRoutes,
    };
};
//: Routes
const routes = getRoutes();
const listRoutes = routes.list;
exports.listRoutes = listRoutes;
const normalRoutes = routes.normal;
exports.normalRoutes = normalRoutes;
const appRoutes = Object.assign(Object.assign({}, listRoutes), normalRoutes);
exports.appRoutes = appRoutes;
//::: End Program :::
