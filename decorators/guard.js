'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactApollo = require('react-apollo');

var _head = require('next/head');

var _head2 = _interopRequireDefault(_head);

var _component = require('../lib/component');

var _apollo = require('../apollo');

var _apollo2 = _interopRequireDefault(_apollo);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _component.getDecorator)((ComposedComponent, opts) => {
  if (opts.default) {
    opts.guards = [opts.default];
  }

  opts.guards.forEach((guard, index) => {
    if ('object' === typeof guard && guard.name) {
      _config2.default.add({ guards: [guard] });
    }

    if ('string' === typeof guard) {
      opts.guards[index] = _config2.default.get().guards.find(g => guard === g.name);
    }
  });

  class WithGuard extends _react2.default.Component {

    static async getInitialProps(ctx) {
      let guard;

      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }

      const apolloClient = _apollo2.default.getClient();
      try {
        await (0, _reactApollo.getDataFromTree)(_react2.default.createElement(
          _reactApollo.ApolloProvider,
          { client: apolloClient },
          _react2.default.createElement(ComposedComponent, composedInitialProps)
        ), {
          router: {
            asPath: ctx.asPath,
            pathname: ctx.pathname,
            query: ctx.query
          }
        });
      } catch (error) {}

      if (!process.browser) {
        _head2.default.rewind();
      }

      console.log('call guard');

      opts.guards.forEach(g => {
        let data = null;

        try {
          data = apolloClient.readQuery({ query: g.query });
        } catch (e) {
          g.error && g.error(e);
        }

        try {
          guard = undefined === guard ? g.guard(data) : g.guard(data) && guard;

          g.next && g.next(guard, ctx);
        } catch (e) {
          g.error && g.error(e);
        }
      });

      opts.next && opts.next(guard);

      return _extends({
        guard
      }, composedInitialProps);
    }

    render() {
      return _react2.default.createElement(ComposedComponent, this.props);
    }
  }

  WithGuard.displayName = `WithGuard(${(0, _component.getComponentDisplayName)(ComposedComponent)})`;
  let decorator = WithGuard;
  opts.guards.forEach(guard => {
    if (guard.query) decorator = (0, _reactApollo.graphql)(guard.query)(decorator);
  });

  return decorator;
});
//# sourceMappingURL=guard.js.map