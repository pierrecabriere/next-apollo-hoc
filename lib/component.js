'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComponentDisplayName = getComponentDisplayName;
exports.getHOC = getHOC;
// Gets the display name of a JSX component for dev tools
function getComponentDisplayName(Component) {
  return Component.displayName || Component.name || 'Unknown';
}

function getHOC(getComponent) {
  return (...configs) => {
    if ('function' === typeof configs[0]) {
      const ComposedComponent = configs[0];
      return getComponent(ComposedComponent, {});
    }

    configs.forEach((config, index) => {
      if ('object' !== typeof config) {
        configs[index] = { default: config };
      }
    });

    const opts = Object.assign({}, ...configs);

    return ComposedComponent => getComponent(ComposedComponent, opts, configs);
  };
}