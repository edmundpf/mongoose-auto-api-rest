export default {
	outputFileExtension: 'ts',
	useJSModules: true,
	jscodeshiftScripts: ['./transform/arrow-functions.js'],
	fixImportsConfig: {
		searchPath: './src',
		absoluteImportPaths: ['./src'],
	},
};
