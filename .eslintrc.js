module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es2021': true,
		'jest': true,
		'node': true // Add Node.js environment here
	},
	'extends': 'eslint:recommended',
	'overrides': [
		{
			'files': ['.eslintrc.{js,cjs}'],
			'parserOptions': {
				'sourceType': 'script'
			}
		}
	],
	'parserOptions': {
		'ecmaVersion': 'latest'
	},
	'ignorePatterns': [
		'**/*.test.js',
		'**/*.spec.js',
		'**/*.config.js',
		'jest-setup.js',
		'db.js'
	],
	'rules': {
		'indent': ['error', 'tab'],
		'quotes': ['error', 'single'], // Specify single quotes
		'semi': ['error', 'always'], // Require semicolons
		'no-unsafe-finally': 'off' // Disable no-unsafe-finally rule
	}
};
