// this file is part of the Jest configuration for a JavaScript project.
// it specifies how Jest should behave when running tests, including which files to look for, how to transform them, and what environment to use.
// transform is used to specify how to process files before testing. in this case, it uses Babel to transform JavaScript files.
// testEnvironment specifies the environment in which the tests will run. here, it's set to "node", meaning the tests will run in a Node.js environment.
// testMatch is an array of glob patterns that Jest uses to detect test files. in this case, it looks for any .test.js files in the src/test directory and its subdirectories.
// moduleNameMapper is used to specify how to handle module paths. in this case, it allows for importing modules without the .js extension, making the code cleaner and more consistent.
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  testMatch: ["**/src/test/**/*.test.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
