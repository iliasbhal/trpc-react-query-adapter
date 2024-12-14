import { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
	// preset: "ts-jest",
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				isolatedModules: true,
			},
		],
	},
	// testTimeout: 30000,
	moduleNameMapper: {
		"@/(.*)$": "<rootDir>/$1",
	},
};

export default jestConfig;
