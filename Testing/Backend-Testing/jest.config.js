export default {
  transform: {
    "^.+\\.[tj]s$": "babel-jest",
  },
  testEnvironment: "node",

  roots: [
    "<rootDir>/unit",
    "<rootDir>/integration",        // ADD THIS
  ],

  moduleDirectories: [
    "node_modules",
    "../../Server/node_modules",
  ],

  moduleNameMapper: {
    "^axios$": "axios",
  },
};
