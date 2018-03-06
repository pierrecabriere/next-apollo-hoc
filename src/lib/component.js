// Gets the display name of a JSX component for dev tools
export function getComponentDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown'
}

export function getHOC(getComponent) {
  return (...configs) => {
    if ('function' === typeof configs[0]) {
      const ComposedComponent = configs[0]
      return getComponent(ComposedComponent, {})
    }

    if (1 === configs.length && 'object' !== typeof configs[0]) {
      configs[0] = {
        default: configs[0]
      }
    }

    const opts = Object.assign({}, ...configs)

    return ComposedComponent => getComponent(ComposedComponent, opts)
  }
}