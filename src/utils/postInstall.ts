import fs from 'fs';
import defaultConfig from '../data/defaultConfig.json';

try {
	if (!fs.existsSync('../../models')) {
		fs.mkdirSync('../../models');
		console.log('Created models directory.');
	}
} catch (error) {
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
} catch (error) {
	console.log('Could not create config file.');
}