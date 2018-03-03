'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getApollo = getApollo;
exports.resetApollo = resetApollo;
exports.updateApollo = updateApollo;
exports.getApolloCache = getApolloCache;

var _apolloClient = require('apollo-client');

var _apolloLinkHttp = require('apollo-link-http');

var _apolloLink = require('apollo-link');

var _apolloCacheInmemory = require('apollo-cache-inmemory');

var _isomorphicUnfetch = require('isomorphic-unfetch');

var _isomorphicUnfetch2 = _interopRequireDefault(_isomorphicUnfetch);

var _jsCookies = require('js-cookies');

var _const = require('./const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = _isomorphicUnfetch2.default;
}

let apolloClient = null;
let opts = {};

function getApollo(initialState, ...configs) {
  opts = Object.assign(opts, ...configs);

  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  let newApolloClient;

  if (!process.browser || !apolloClient) newApolloClient = create(initialState);

  if (!process.browser) return newApolloClient;

  // Reuse client on the client-side
  if (!apolloClient) apolloClient = newApolloClient;

  return apolloClient;
}

function resetApollo() {
  return apolloClient.resetStore();
}

function updateApollo(opts) {
  return apolloClient.writeQuery(opts);
}

function getAuthorization() {
  let cookieToken;
  if (opts.cookieSource) cookieToken = _jsCookies.Cookies.get(_const.CONST_AUTHTOKEN_COOKIE, { source: opts.cookieSource });
  return cookieToken ? `Bearer ${cookieToken}` : null;
}

function create(initialState) {
  const httpLink = new _apolloLinkHttp.HttpLink({
    uri: opts.endpoint, // Server URL (must be absolute)
    credentials: 'include' // Additional fetch() options like `credentials` or `headers`
  });

  const authMiddleware = new _apolloLink.ApolloLink((operation, forward) => {
    const headers = {};
    const authorization = getAuthorization();
    if (authorization) headers.authorization = authorization;

    // add the authorization to the headers
    operation.setContext({
      headers
    });

    return forward(operation);
  });

  return new _apolloClient.ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: (0, _apolloLink.concat)(authMiddleware, httpLink),
    cache: new _apolloCacheInmemory.InMemoryCache().restore(initialState || {})
  });
}

function getApolloCache() {
  return apolloClient.cache.extract();
}
//# sourceMappingURL=apollo.js.map