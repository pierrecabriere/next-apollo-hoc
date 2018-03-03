'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsCookies = require('js-cookies');

var _config = require('./lib/config');

var _ = require('./');

exports.default = initialConfig => async function (...configs) {
  const defaultOpts = {
    cookieSource: document,
    updateStore: null,
    next: null
  };
  const opts = Object.assign(defaultOpts, initialConfig, ...configs);

  try {
    _jsCookies.Cookies.delete(_config.CONST_AUTHTOKEN_COOKIE, opts.cookieSource);
  } catch (e) {
    console.error(e);
    return null;
  }

  (0, _.resetApollo)();

  if (opts.updateStore) {
    try {
      (0, _.updateApollo)(opts.updateStore(null));
    } catch (e) {
      console.error(e);
    }
  }

  if (opts.next) {
    try {
      opts.next();
    } catch (e) {
      console.error(e);
    }
  }

  return true;
};
//# sourceMappingURL=logout.js.map