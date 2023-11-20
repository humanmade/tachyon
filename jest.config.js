/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	"preset": "ts-jest/presets/default-esm",
  testEnvironment: 'node',
  testMatch: ['**/tests/**/test-*.ts'],
  globals: {
	"ts-jest": {
		useESM: true,
	}
  },
  "extensionsToTreatAsEsm": [".ts"]
};
