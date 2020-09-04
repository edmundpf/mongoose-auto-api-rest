// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let error;
import fs from 'fs';
import defaultConfig from '../data/defaultConfig.json';

try {
	if (!fs.existsSync('../../models')) {
		fs.mkdirSync('../../models');
		console.log('Created models directory.');
	}
} catch (error1) {
	error = error1;
	console.log('Could not create models directory.');
}

try {
	if (!fs.existsSync('../../appConfig.json')) {
		fs.writeFileSync(
			'../../appConfig.json',
			JSON.stringify(defaultConfig, null, 2)
		);
		console.log('Created config file.');
	}
} catch (error2) {
	error = error2;
	console.log('Could not create config file.');
}