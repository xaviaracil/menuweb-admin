var allTestFiles = [];
var TEST_REGEXP = /base\/test\/spec\/.*\.js$/;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // example of using shim, to load non AMD libraries (such as underscore and jquery)
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
  },

  shim: {
    'underscore': {
      exports: '_'
    },
    'jquery': {
      exports: '$'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});