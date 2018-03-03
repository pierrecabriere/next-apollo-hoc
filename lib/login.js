'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _flexibleCookies = require('flexible-cookies');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _const = require('./const');

var _apollo = require('../apollo');

var _apollo2 = _interopRequireDefault(_apollo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (opts) {
  _config2.default.add({ auth: { login: opts } });
  opts = _config2.default.get().auth.login;
  let res;

  try {
    const mutationOpts = {
      variables: opts.variables
    };
    res = await this.loginMutation(mutationOpts);
  } catch (e) {
    console.error(e);
    return false;
  }
  const data = res.data;

  try {
    const authToken = opts.authToken(data);
    console.log('create auth cookie');
    _flexibleCookies.Cookies.set(_const.CONST_AUTHTOKEN_COOKIE, authToken, { source: opts.cookieSource, days: 365 });
  } catch (e) {
    console.error(e);
    return null;
  }

  try {
    await opts.update(_apollo2.default.getClient(), data, opts.updateStore);
  } catch (e) {
    console.error(e);
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