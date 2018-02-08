import { curry, keys, reduce, is } from 'ramda';

const copyMethodsWith = curry((transform, target, source) => {
  const reducer = (acc, key) => {
    if (is(Function, source[key])) {
      acc[key] = transform(source[key]);
    }

    return acc;
  };

  return reduce(reducer, target, keys(source));
});

const createThunkWith = curry((transform, fn) => {
  return (...args) => {
    return transform(fn(...args));
  };
});

const proxy = curry((proxyFn, fn) => {
  return (strings, ...interpolations) => {
    const proxyResults = proxyFn(strings, ...interpolations);

    return fn(...proxyResults);
  };
});

export const proxyTemplateFunction = curry((proxyFn, fn) => {
  const proxyMethods = copyMethodsWith(createThunkWith(proxy(proxyFn)));

  return proxyMethods(proxy(proxyFn, fn), fn);
});

export const proxyTemplateFactory = curry((proxyFn, fn) => {
  return createThunkWith(proxyTemplateFunction(proxyFn), fn);
});
