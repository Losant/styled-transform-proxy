/**
 * @typedef ProxyFn = (Array<String> strings, ...* interpolations -> [strings, ...interpolations])
 * @typedef TemplateFn = (Array<String> strings, ...* interpolations) -> Array<String|Function>
 * @typedef TemplateFactoryFn = (*) -> TemplateFn
 */

import { curry, keys, reduce, is } from 'ramda';

/**
 * Takes a transform function, a target object / function, and a source object / function
 * and copies over all the methods from the source to the target after running each method
 * through the transform function.
 *
 * @signature Function -> Object|Function -> Object|Function -> Object|Function
 */
const copyMethodsWith = curry((transform, target, source) => {
  const reducer = (acc, key) => {
    if (is(Function, source[key])) {
      acc[key] = transform(source[key]);
    }

    return acc;
  };

  return reduce(reducer, target, keys(source));
});

/**
 * Takes a transform function and a source function and returns a thunk that accepts any
 * number of args and returns the result of calling the transform function on the result
 * of the source function with the provided args.
 *
 * @signature (a -> b) -> (...* -> a) -> (...* -> b)
 */
const createThunkWith = curry((transform, fn) =>
  (...args) =>
    transform(fn(...args))
);

/**
 * @signature ProxyFn -> TemplateFn -> TemplateFn
 */
const proxy = curry((proxyFn, styledTemplateFn) => {
  const proxiedTemplateFn = (strings, ...interpolations) => {
    const proxiedTemplateFnResults = proxyFn(strings, ...interpolations);

    return styledTemplateFn(...proxiedTemplateFnResults);
  };

  return proxiedTemplateFn;
});

/**
 * @signature ProxyFn -> TemplateFn -> TemplateFn
 */
export const makeProxiedTemplateFunction = curry((proxyFn, styledTemplateFn) => {
  const applyProxyFn = proxy(proxyFn);
  const proxyMethods = copyMethodsWith(createThunkWith(applyProxyFn));

  return proxyMethods(applyProxyFn(styledTemplateFn), styledTemplateFn);
});

/**
 * @signature ProxyFn -> TemplateFactoryFn -> TemplateFactoryFn
 */
export const makeProxiedTemplateFactory = curry((proxyFn, styled) =>
  createThunkWith(makeProxiedTemplateFunction(proxyFn), styled)
);
