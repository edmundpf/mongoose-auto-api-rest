"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = void 0;
const json_config_ts_1 = __importDefault(require("json-config-ts"));
const uuidv4_1 = __importDefault(require("uuidv4"));
const apiFunctions_1 = require("./apiFunctions");
// Init
const store = new json_config_ts_1.default({
    collection: 'mongoose_auto_api',
    name: 'jwt_k',
    defaultData: {
        cur: {
            k: '',
            exp: 0,
        },
        prev: {
            k: '',
            exp: 0,
        },
    },
});
// Update Key Data
const updateKeyData = (key, preservePrev = false) => {
    if (key == 'cur' && preservePrev) {
        store.set('prev', store.data.cur);
    }
    store.set(key, {
        k: uuidv4_1.default(),
        exp: Math.round(new Date().getTime() / 1000) + apiFunctions_1.TOKEN_EXPIRY,
    });
};
// Get Keys
exports.getKeys = () => {
    const curTime = new Date().getTime() / 1000;
    store.load();
    for (const key in store.data) {
        if (!store.data[key].k) {
            updateKeyData(key, false);
        }
        else if (key == 'cur' && curTime > store.data[key].exp) {
            updateKeyData(key, true);
        }
    }
    return store.data;
};
