'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactApollo = require('react-apollo');

var _head = require('next/head');

var _head2 = _interopRequireDefault(_head);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _lib.getDecorator)((ComposedComponent, opts) => {
  const { endpoint } = _config2.default.get();
  opts = Object.assign({
    endpoint
  }, opts || {});
  opts.endpoint = opts.default || opts.endpoint;

  class WithData extends _react2.default.Component {

    static async getInitialProps(ctx) {
      // Initial serverState with apollo (empty)
      let serverState = {
        apollo: {
          data: {}
        },
        cookie: null

        // Evaluate the composed component's getInitialProps()
      };let composedInitialProps = {};
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const cookieSource = process.browser ? document : ctx.req.headers;
      const apollo = (0, _lib.getApollo)(null, { endpoint: opts.endpoint, cookieSource });
      try {
        // Run all GraphQL queries
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
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // http://dev.apollodata.com/react/api-queries.html#graphql-query-data-error
      }

      if (!process.browser) {
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        _head2.default.rewind();
      }

      // Extract query data from the Apollo store
      serverState = {
        apollo: {
          data: apollo.cache.extract()
        },
        cookie: cookieSource.cookie
      };

      return _extends({
        serverState
      }, composedInitialProps);
    }

    constructor(props) {
      super(props);
      const cookieSource = process.browser ? document : this.props.serverState;
      this.apollo = (0, _lib.getApollo)(this.props.serverState.apollo.data, { endpoint: opts.endpoint, cookieSource });
    }

    render() {
      return _react2.default.createElement(
        _reactApollo.ApolloProvider,
        { client: this.apollo },
        _react2.default.createElement(ComposedComponent, this.props)
      );
    }
  }

  WithData.displayName = `WithData(${(0, _lib.getComponentDisplayName)(ComposedComponent)})`;
  WithData.propTypes = {
    serverState: _propTypes2.default.object.isRequired
  };
  return WithData;
});
//# sourceMappingURL=data.js.map