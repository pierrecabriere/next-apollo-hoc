# next-apollo-hoc 🚧

[![NPM version](https://img.shields.io/npm/v/next-apollo-hoc.svg)](https://www.npmjs.com/package/next-apollo-hoc)
[![Build Status](https://travis-ci.org/pierrecabriere/next-apollo-hoc.svg?branch=master)](https://travis-ci.org/pierrecabriere/next-apollo-hoc)

**next-apollo-hoc is a flexible way to set up apollo on a [next.js](https://github.com/zeit/next.js) app with server-rendering support and authentication.**

---

## 1. Installation
```
npm install --save next-apollo-hoc
```

## 2. Basic usage
next-apollo-hoc is providing a **withData** HOC (High-Order Component) that you can easily configure on a page :
```jsx
import { withData } from 'next-apollo-hoc'

const MyComponent = (props) => { // your page component
  <div>Component that will load data from a graphql endpoint</div>
}

export default withData('https://myendpoint.com')(MyComponent)
```
That's it, you are now able to fetch data from your graphql endpoint in any child component with universal support !

You can also set an HttpLink configuration :
```jsx
export default withData({
  endpoint: 'https://myendpoint.com', // can also be set directly in link as uri option
  link: { // can also be an HttpLink object
    credentials: 'include'
  }
})(MyComponent)
```

The default configuration for the **withData** HOC is :
```jsx
{
  endpoint: null, // graphql endpoint
  link: { // HttpLink configuration, see ApolloClient API documentation
    credentials: 'same-origin'
  }
}
```

The **withData** HOC integrates apollo by wrapping your Component inside an ApolloProvider Component. The generated ApolloClient is keeping data from the server then this module has a full-universal support.<br/>
*Even if you can set up this on any Component, it is highly recommended to set it on the highest Component you have (suppose it is your page).*

## 3. Externalize configuration (recommended)
next-apollo-hoc lets the ability to create an external configuration file :
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

Then, you don't need to provide an inline configuration anymore :
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

**However, you are still able to override or complete your configuration directly inside the HOC declaration**
```jsx
import { withData } from '../lib/next-apollo-hoc'

...

export default withData({
  link: {
    credentials: 'same-origin', // override the configuration set in lib/next-apollo-hoc.js
    useGETForQueries: true // add specific option, only set for MyComponent
  }
})(MyComponent)
```

## 4. Authentication

### 4.1 Login

### 4.2 Logout

## 5. Guards

## 6. tips and tricks

> more documentation to come for **withAuth** and **withGuard** HOCs