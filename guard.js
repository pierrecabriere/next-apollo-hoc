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

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _lib.getDecorator)((ComposedComponent, opts) => {
  class WithGuard extends _react2.default.Component {

    static async getInitialProps(ctx) {
      let guard = null;

      let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }

      const cookieSource = process.browser ? document : ctx.req.headers;
      const apollo = (0, _lib.getApollo)(null, { cookieSource });
      try {
        await (0, _reactApollo.getDataFromTree)(_react2.default.createElement(
          _reactApollo.ApolloProvider,
          { client: apollo },
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

      let data = null;

      try {
        data = apollo.readQuery({ query: opts.query });
      } catch (e) {
        opts.error && opts.error(e);
      }

      try {
        guard = await opts.guard(data);

        opts.next && opts.next(guard, ctx);
      } catch (e) {
        opts.error && opts.error(e);
      }

      return _extends({
        guard
      }, composedInitialProps);
    }

    render() {
      return _react2.default.createElement(ComposedComponent, this.props);
    }
  }

  WithGuard.displayName = `WithGuard(${(0, _lib.getComponentDisplayName)(ComposedComponent)})`;
  let decorator = WithGuard;
  if (opts.query) decorator = (0, _reactApollo.graphql)(opts.query)(decorator);

  return decorator;
});
//# sourceMappingURL=guard.js.map