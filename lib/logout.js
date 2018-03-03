'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsCookies = require('js-cookies');

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _const = require('./const');

var _apollo = require('../apollo');

var _apollo2 = _interopRequireDefault(_apollo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (opts) {
  _config2.default.add({ auth: { logout: opts } });
  opts = _config2.default.get().auth.logout;

  try {
    _jsCookies.Cookies.delete(_const.CONST_AUTHTOKEN_COOKIE, { source: opts.cookieSource });
  } catch (e) {
    console.error(e);
    return null;
  }

  _apollo2.default.resetStore();

  if (opts.updateStore) {
    try {
      _apollo2.default.getClient().writeQuery(opts.updateStore(null));
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