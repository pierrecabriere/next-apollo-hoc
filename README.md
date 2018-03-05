# next-apollo-hoc 🚧

[![NPM version](https://img.shields.io/npm/v/next-apollo-hoc.svg)](https://www.npmjs.com/package/next-apollo-hoc)
[![Build Status](https://travis-ci.org/pierrecabriere/next-apollo-hoc.svg?branch=master)](https://travis-ci.org/pierrecabriere/next-apollo-hoc)

**next-apollo-hoc is a simple and flexible way to set up apollo on your [next.js](https://github.com/zeit/next.js) app. It supports server-rendering and authentication.**

---

- [Installation](#1---installation)
- [Basic usage](#2---basic-usage)
- [Externalize configuration](#3---externalize-configuration-recommended)
- [Authentication](#4---authentication)
  - [Login](#41---login)
  - [Logout](#42---logout)
- [Guards](#5---guards)
- [Example](#6---example)
- [Tips and tricks](#7---tips-and-tricks)
  - [Use decorators](#71---use-decorators)
  - [Import your graphql queries/mutations from files ](#72---import-your-graphql-queriesmutations-from-files)
  - [Use the starter kit](#73---use-the-starter-kit)
  [Roadmap](#8---roadmap)

## 1 - Installation
```
npm install --save next-apollo-hoc
```

## 2 - Basic usage
**next-apollo-hoc** provides a **withData** HOC (High-Order Component) that you can easily configure, just by giving your graphql endpoint :
```jsx
import { withData } from 'next-apollo-hoc'

const MyComponent = (props) => { // your page component
  <div>Component that will load data from a graphql endpoint</div>
}

export default withData('https://myendpoint.com')(MyComponent)
```
**That's it**, you are now able to fetch data from your graphql endpoint in any child component !

You can also set an HttpLink configuration for the Apollo Client ([see official documentation](https://www.apollographql.com/docs/react/basics/network-layer.html)) :
```jsx
export default withData({
  endpoint: 'https://myendpoint.com', // can also be set directly in link as uri option
  link: { // can also be an HttpLink object
    credentials: 'include'
  }
})(MyComponent)
```

The **withData** HOC integrates apollo by wrapping your Component inside an ApolloProvider Component. The generated ApolloClient is keeping data from the server then this module has a full-universal support.<br/>
*Even if you can set up this on any Component, it is highly recommended to set it on the highest Component you have (suppose it is your page).*

**Default configuration**
```jsx
{
  endpoint: null, // graphql endpoint
  link: { // HttpLink configuration, see ApolloClient API documentation
    credentials: 'same-origin'
  }
}
```

## 3 - Externalize configuration (recommended)
**next-apollo-hoc** has a config class to create a global configuration :
```jsx
// lib/next-apollo-hoc.js

import { config } from 'next-apollo-hoc'

config.add({
  endpoint: 'https://myendpoint.com',
  link: {
    credentials: 'include'
  }
})

export * from 'next-apollo-hoc'
```

Then, you just have to import HOCs from your file (to load the configuration) and then you will don't need to set an inline configuration anymore :
```diff
- import { withData } from 'next-apollo-hoc'
+ import { withData } from '../lib/next-apollo-hoc'

const MyComponent = (props) => {
  <div>Component that will load data from a graphql endpoint</div>
}

- export default withData({
-   endpoint: 'https://myendpoint.com',
-   link: {
-     credentials: 'include'
-   }
- })(MyComponent)
+ export default withData(MyComponent)
```

**Even if you set and load a global configuration like above, you are still able to override it inside your HOC call**
```jsx
import { withData } from '../lib/next-apollo-hoc'

...

export default withData({
  link: {
    credentials: 'same-origin', // override the configuration set in lib/next-apollo-hoc.js
    useGETForQueries: true // add option to the configuration
  }
})(MyComponent)
```

## 4 - Authentication

**next-apollo-hoc** provide tools to manage authentication (with token authorization) in your app. The HOC **withAuth** (that you can configure) will inject these tools inside your component props, so you will be able to use them where you want in your code.<br/>
To configure **withAuth**, the config component has an addAuth method. Just like for the **withData** HOC, you can set a global configuration and override some options inside the HOC call, or set the whole configuration directly inside the HOC (see [how to externalize configuration](#3---externalize-configuration-recommended))

**Default configuration**
```jsx
{
  tokenType: 'Bearer', // the authorization token type
  login: { ... } // login configuration, see below
  logout: { ... } // logout configuration, see below
}
```

**Examples**
```jsx
config.addAuth({
  tokenType: 'Basic',
  login: {
    mutation: gql`{ ... }
  }
})
```
```jsx
export default withAuth({
  tokenType: 'Basic',
  login: {
    mutation: gql`{ ... }
  }
})(MyComponent)
```

### 4.1 - Login

```jsx
this.props.login()
```

The login function will call a graphql mutation to get a token back. This token will be stored in a cookie and automatically injected inside the authorization headers of each apollo client request.<br/>
So, the minimal configuration is :
```jsx
{
  variables: { username: '...', password: '...' },
  mutation: loginMutation, // your graphql mutation (gql`{ ... })
  authToken: data => data.login.authToken // the function to get the token in the mutation result data
}
```

Usually, the variables parameters is not fixed until the login form submission.<br/>
So you can set/override the configuration inside the login function call like this :
```jsx
this.props.login({
  variables: {
    username: this.state.username,
    password: this.state.password
  }
})
```

Login is an async function, and you can wait for its return to execute code (by example redirection).<br/>
However, to make global the entire execution of your login process, you can define a *next* function in your configuration that will be called after the cookie is set :
```jsx
{
  ...,
  next: data => Router.push('/')
}
```

Finally, the login function will reset the apollo store and try to update with the updateStore option.<br/>
updateStore function result will be used in the writeQuery method call of the Apollo Client ([see official documentation](https://www.apollographql.com/docs/react/basics/caching.html#writequery-and-writefragment)) :
```jsx
{
  ...,
  updateStore: data => ({ // updateStore give the data returned by the login mutation
    query: currentUser,
    data: { viewer: data.login.user }
  })
}
```

**Default configuration**
```jsx
{
  update: async (apolloClient, data, updateStore) => { // The function called after the cookie is set
    await apolloClient.resetStore()
    if (updateStore)
      await apolloClient.writeQuery(updateStore(data))
  }
}
```

### 4.2 - Logout

```jsx
this.props.logout()
```

The logout function works pretty much the same as the login function. Instead of calling a mutation, it will directly delete the previously set cookie. Then, all the apollo client requests authorization will not contains the token anymore.<br/>
Just like login, you can configure an updateStore, update and next function.
```jsx
{
  updateStore: () => ({ query: currentUser, data: { viewer: null } }),
  next: () => Router.pushRoute('/')
}
```

**Default configuration**
```jsx
{
  update: async (apolloClient, data, updateStore) => { // The function called after the cookie is removed
    await apolloClient.resetStore()
    if (updateStore)
      await apolloClient.writeQuery(updateStore(data))
  }
}
```

## 5 - Guards

Once the user is logged and we have an authorization token, we are able to verify the user can access the data before rendering the component.<br/>
**next-apollo-hoc** provides a **withGuard** HOC. you can define your guards config in the global configuration or directly in the HOC call.<br/>
To configure guards in the global configuration, the config component has two methods: addGuard and addGuards.<br/>
The minimal configuration for a guard is :
```jsx
{
  query: currentUser, // the graphql query to fetch
  guard: data => !data || !data.viewer, // the verification to do on the returned data
}
```

A 'guard' prop will be injected in your component. The value will be the result of the guard function.<br/>
Then, you will be able to render the component depending on the guard result
```jsx
const MyComponentForLoggedUsers = (props) => {
  if (!props.guard) return 'Please log in'
  else return 'Hello !'
}

export default withGuard({
  query: currentUser,
  guard: data => data && data.viewer
})(MyComponentForLoggedUsers)
```

In the global configuration, you can give a name at a guard with the *name* option. Then, you will be able to call a guard by its name
```jsx
config.addGuard({
  name: 'logged',
  query: currentUser,
  guard: data => data && data.viewer
})
```
```jsx
export default withGuard('logged')(MyComponentForLoggedUsers)
```

**Override configuration**
You can also override a guard configuration by its name directly in the withGuard call :
```jsx
export default withGuard({
  name: 'logged',
  guard: data => data && data.viewer && data.viewer.role = 'ADMIN'
})(MyComponentForLoggedUsers)
```

**Combine guards**
You can combine multiple guards, like below :
```jsx
export default withGuard('logged', 'loggedAdmin')(MyComponentForLoggedAdminUsers)
```

## 6 - Example

> Example app to come

## 7 - tips and tricks

### 7.1 - Use decorators

Instead of wrapping the export of your Component inside HOCs, a good usage is to use ES6 decorators. To do such a thing, you have to use the *transform-decorators-legacy* babel plugin :
```
npm install --save-dev babel-plugin-transform-decorators-legacy
```

create or edit a .babelrc file at the root of your project
```diff
{
  "presets": "next/babel",
  "plugins": [
+    "babel-plugin-inline-import-graphql-ast"
  ]
}
```

You can now use ES6 decorators in your project :
```jsx
import { withData } from '../lib/next-apollo-hoc'

@withData
@graphql(myQuery)
export default class extends React.Component {
  render() => (
    <div>Component that will load data from a graphql endpoint</div>
  )
}
```

### 7.1 - Use decorators

Instead of wrapping the export of your Component inside HOCs, you can use ES6 decorators. To do such a thing, you have to use the *transform-decorators-legacy* babel plugin :
```
npm install --save-dev babel-plugin-transform-decorators-legacy
```

create or edit a .babelrc file at the root of your project
```diff
{
  "presets": "next/babel",
  "plugins": [
+    "transform-decorators-legacy"
  ]
}
```

You can now use ES6 decorators in your project :
```jsx
import { withData } from '../lib/next-apollo-hoc'

@withData
@graphql(myQuery)
export default class extends React.Component {
  render() => (
    <div>Component that will load data from a graphql endpoint</div>
  )
}
```

### 7.2 - Import your graphql queries/mutations from files

Instead of declaring your graphql queries and mutations directly in your component file with the *graphql-tag*, you can load them from .gql files :
```
npm install --save-dev babel-plugin-inline-import-graphql-ast
```

create or edit a .babelrc file at the root of your project
```diff
{
  "presets": "next/babel",
  "plugins": [
+    "babel-plugin-inline-import-graphql-ast"
  ]
}
```

You can now load your queries and mutations from files :
```jsx
import { graphql } from 'react-apollo'
import myQuery from '../graphql/queries/my_query.gql'

@withData
@graphql(myQuery)
export default class extends React.Component {
  render() => (
    <div>Component that will load data from a graphql endpoint</div>
  )
}
```

> More tips to come

### 7.3 - Use the starter kit

The **[next-apollo-starter-kit]((https://github.com/pierrecabriere/next-apollo-starter-kit))** provides a configuration with all the best practices for starting an universal [next.js](https://github.com/zeit/next.js) app based on apollo.<br/>
The kit includes the **next-apollo-hoc** library and all the tips and tricks listed above.<br/>
You can download it on : [https://github.com/pierrecabriere/next-apollo-starter-kit](https://github.com/pierrecabriere/next-apollo-starter-kit)

## 8 - Roadmap

- add ability to create middlewares from the config class
- any idea ?

# 🚀