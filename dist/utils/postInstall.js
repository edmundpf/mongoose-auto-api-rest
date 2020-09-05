"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const defaultConfig_json_1 = __importDefault(require("../data/defaultConfig.json"));
try {
    if (!fs_1.default.existsSync('../../models')) {
        fs_1.default.mkdirSync('../../models');
        console.log('Created models directory.');
    }
}
catch (error) {
    console.log('Could not create models directory.');
}
try {
    if (!fs_1.default.existsSync('../../appConfig.json')) {
        fs_1.default.writeFileSync('../../appConfig.json', JSON.stringify(defaultConfig_json_1.default, null, 2));
        console.log('Created config file.');
    }
}
catch (error) {
    console.log('Could not create config file.');
}
