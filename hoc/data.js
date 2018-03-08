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

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _apollo = require('../apollo');

var _apollo2 = _interopRequireDefault(_apollo);

var _component = require('../lib/component');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _component.getHOC)((ComposedComponent, opts) => {
  if (opts.default) {
    opts.endpoint = opts.default;
    delete opts.default;
  }
  _config2.default.add(opts);

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
      _config2.default.add({ cookieSource });
      const apolloClient = _apollo2.default.getClient();
      let errors;
      try {
        // Run all GraphQL queries
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
      } catch (error) {
        // catch queries errors
        errors = error.queryErrors;
        // remove circular reference
        errors.map(err => delete err.queryErrors);
      }

      if (!process.browser) {
        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        _head2.default.rewind();
      }

      // Extract query data from the Apollo store
      serverState = {
        apollo: {
          data: apolloClient.cache.extract()
        }
      };

      return _extends({
        serverState,
        errors
      }, composedInitialProps);
    }

    constructor(props) {
      super(props);
      this.apolloClient = _apollo2.default.getClient(this.props.serverState.apollo.data);
    }

    render() {
      return _react2.default.createElement(
        _reactApollo.ApolloProvider,
        { client: this.apolloClient },
        _react2.default.createElement(ComposedComponent, this.props)
      );
    }
  }

  WithData.displayName = `WithData(${(0, _component.getComponentDisplayName)(ComposedComponent)})`;
  WithData.propTypes = {
    serverState: _propTypes2.default.object.isRequired
  };
  return WithData;
});