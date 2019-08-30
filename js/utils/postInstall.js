var defaultConfig, error, fs;

fs = require('fs');

defaultConfig = require('../data/defaultConfig.json');

try {
  if (!fs.existsSync('./models')) {
    fs.mkdirSync('./models');
    console.log('Created models directory.');
  }
} catch (error1) {
  error = error1;
  console.log('Could not create models directory.');
}

try {
  if (!fs.existsSync('./appConfig.json')) {
    fs.writeFileSync('./appConfig.json', JSON.stringify(defaultConfig, null, 2));
    console.log('Created config file.');
  }
} catch (error1) {
  error = error1;
  console.log('Could not create config file.');
}
