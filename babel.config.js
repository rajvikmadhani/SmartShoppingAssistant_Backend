// this file is used to configure Babel, a JavaScript compiler.
// specifies which presets to use when transforming JavaScript code.
// babel is a popular tool for converting modern JavaScript code into a version that can run in older environments, like Node.js or older browsers.
// the @babel/preset-env preset allows you to use the latest JavaScript features without needing to specify which environments you want to support. it automatically determines the necessary transformations based on your target environment.
// targets specifies the environments you want to support. in this case, it's set to the current version of Node.js, which means Babel will transform the code to be compatible with the current Node.js version.
// node: "current" means that Babel will use the latest version of Node.js as the target environment for the code transformation. this ensures that the code is compatible with the current Node.js features and syntax.
export default {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
