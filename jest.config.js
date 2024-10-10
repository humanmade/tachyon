/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/tests/**/test-*.ts'],
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: './tsconfig.test.json',
			},
		],
	},
	moduleNameMapper: {
		"(.+)\\.js": "$1"
	},
};
