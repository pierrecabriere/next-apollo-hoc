# next-apollo-hoc

[![NPM version](https://img.shields.io/npm/v/next-apollo-hoc.svg)](https://www.npmjs.com/package/next-apollo-hoc)
[![Build Status](https://travis-ci.org/pierrecabriere/next-apollo-hoc.svg?branch=master)](https://travis-ci.org/pierrecabriere/next-apollo-hoc)

**next-apollo-hoc is a flexible way to integrate Apollo Client on a [next.js](https://github.com/zeit/next.js) app with server-rendering support and authentication.**

---

## Installation
```
npm install --save next-apollo-hoc
```

## Basic usage
next-apollo-hoc is providing a **withData** HOC that you can easily configure :
```jsx
import { withData } from 'next-apollo-hoc'

const MyComponent = (props) => {
  <div>Component that will load data from a graphql endpoint</div>
}

export default withData('https://myendpoint.com')(MyComponent)
```

You can also set an HttpLink configuration :
```jsx
export default withData({
  endpoint: 'https://myendpoint.com',
  link: {
    credentials: 'include'
  }
})(MyComponent)
```

## External configuration
next-apollo-hoc let the ability to create an external configuration :