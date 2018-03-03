'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactApollo = require('react-apollo');

var _login = require('../lib/login');

var _login2 = _interopRequireDefault(_login);

var _logout = require('../lib/logout');

var _logout2 = _interopRequireDefault(_logout);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _component = require('../lib/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _component.getDecorator)((ComposedComponent, opts) => {
  _config2.default.add({ auth: opts });
  opts = _config2.default.get().auth;

  class WithAuth extends _react2.default.Component {

    static async getInitialProps(ctx) {
      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }

      return _extends({}, composedInitialProps);
    }

    render() {
      let props = this.props;
      let childProps = {
        login: _login2.default,
        logout: _logout2.default
      };

      return _react2.default.createElement(ComposedComponent, _extends({}, props, childProps));
    }
  }

  WithAuth.displayName = `WithAuth(${(0, _component.getComponentDisplayName)(ComposedComponent)})`;
  let decorator = WithAuth;
  if (opts.login && opts.login.mutation) decorator = (0, _reactApollo.graphql)(opts.login.mutation, {
    name: 'loginMutation'
  })(decorator);

  return decorator;
});
//# sourceMappingURL=auth.js.map