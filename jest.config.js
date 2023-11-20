/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/tests/**/test-*.ts'],
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		// '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
		// '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: './tsconfig.test.json',
			},
		],
	},
};
