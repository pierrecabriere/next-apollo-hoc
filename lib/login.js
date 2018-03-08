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
  _config2.default.addAuth({ login: opts });
  opts = _config2.default.getAuth().login;

  const mutationOpts = {
    variables: opts.variables
  };
  const { data } = await this.loginMutation(mutationOpts);

  const authToken = opts.authToken(data);
  _flexibleCookies.Cookies.set(_const.CONST_AUTHTOKEN_COOKIE, authToken, { source: opts.cookieSource, days: 365 });

  await opts.update(_apollo2.default.getClient(), data, opts.updateStore);

  opts.next && opts.next(data);

  return data;
};