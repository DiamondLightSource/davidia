import type { JestConfigWithTsJest } from 'ts-jest';

// list of packages that use export in their JS so need to transformed
const DEPS_TO_TRANSFORM = [
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-random',
  'd3-scale',
  'd3-time-format',
  'internmap',
  'three',
];

const config: JestConfigWithTsJest = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  // coverageDirectory: undefined,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: undefined,

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // The default configuration for fake timers
  // fakeTimers: {
  //   "enableGlobally": false
  // },

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // moduleNameMapper: {},

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest/presets/js-with-ts',

  // Automatically restore mock state and implementation before every test
  // restoreMocks: false,

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/client'],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: [],

  // Adds a location field to test results
  // testLocationInResults: false,

  // A map from regular expressions to paths to transformers
  // transform: undefined,
  transform: {
    '^.+\\.txs?$': ['ts-jest', { useESM: true }],
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    `node_modules/(?!(${DEPS_TO_TRANSFORM.join('|')}))`,
  ],
};

export default config;
