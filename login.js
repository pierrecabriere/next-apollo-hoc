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
    variables: null,
    updateStore: null,
    update: null,
    next: null,
    authToken: null
  };
  const opts = Object.assign(defaultOpts, initialConfig, ...configs);

  let res;

  try {
    res = await this.loginMutation({
      variables: opts.variables,
      update: async (store, { data }) => {
        if (opts.update) {
          try {
            opts.update(store, data);
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  } catch (e) {
    console.error(e);
    return false;
  }
  const data = res.data;

  try {
    const authToken = opts.authToken(data);
    _jsCookies.Cookies.set(_config.CONST_AUTHTOKEN_COOKIE, authToken, { cookieSource: opts.cookieSource, days: 365 });
  } catch (e) {
    console.error(e);
    return null;
  }

  (0, _.resetApollo)();

  if (opts.updateStore) {
    try {
      (0, _.updateApollo)(opts.updateStore(data));
    } catch (e) {
      console.error(e);
    }
  }

  if (opts.next) {
    try {
      opts.next(data);
    } catch (e) {
      console.error(e);
    }
  }

  return data;
};
//# sourceMappingURL=login.js.map