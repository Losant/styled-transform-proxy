// @flow

import {
  __,
  curry,
  pipe,
  propIs,
  contains,
  keys,
  reduce,
  any,
  allPass,
  is,
} from 'ramda';

type UnaryFn<I, R=I> = (I) => R;
type VariadicFn<R> = (...*) => R;

type ProxyFn = (Array<string>, ...*) => Array<*>;
type TemplateFn = (Array<string>, ...*) => Array<String | Function>;
type TemplateFactory = VariadicFn<TemplateFn>;

const CHAINABLE_TEMPLATE_FACTORY_METHODS = ['attrs', 'withConfig'];

const isTemplateFactoryMethod = curry((val: Object | Function, key: string) =>
  allPass([
    contains(__, CHAINABLE_TEMPLATE_FACTORY_METHODS),
    propIs(Function, __, val),
  ])(key)
);

const hasTemplateFactoryMethods = (val: Object | Function) =>
  pipe(
    keys,
    any(isTemplateFactoryMethod(val)),
  )(val);

/**
 * Takes a transform function and a source function and returns a thunk that accepts any
 * number of args and returns the result of calling the transform function on the result
 * of the source function with the provided args.
 *
 * @signature (a -> b) -> (...* -> a) -> (...* -> b)
 */
const createThunkWith = curry(
  (transform: UnaryFn<*>, fn: VariadicFn<*>): VariadicFn<*> =>
    (...args) =>
      transform(fn(...args))
);

const proxy = curry(
  (proxyFn: ProxyFn, styledTemplateFn: TemplateFn): TemplateFn => {
    const proxiedTemplateFn = (strings, ...interpolations) => {
      const proxiedTemplateFnResults = proxyFn(strings, ...interpolations);

      return styledTemplateFn(...proxiedTemplateFnResults);
    };

    return proxiedTemplateFn;
  }
);

const makeProxiedTemplateFunction = curry(
  (proxyFn: ProxyFn, styledTemplateFn: TemplateFn): TemplateFn => {
    const templateFn = proxy(proxyFn, styledTemplateFn);

    CHAINABLE_TEMPLATE_FACTORY_METHODS.forEach((methodName) => {
      const originalMethod = styledTemplateFn[methodName];

      if (is(Function, originalMethod)) {
        templateFn[methodName] = createThunkWith(
          makeProxiedTemplateFunction(proxyFn),
          originalMethod,
        );
      }
    });

    return templateFn;
  }
);

const makeProxiedTemplateFactory = curry(
  (proxyFn: ProxyFn, styled: TemplateFactory): TemplateFactory =>
    createThunkWith(makeProxiedTemplateFunction(proxyFn), styled)
);

const styledTransformProxy = curry(
  (transformFn: (...*) => *, styled: *) => {
    const styledReducer = (acc: Function, key: string) => {
      const sourceValue = styled[key];

      if (is(Function, sourceValue) && hasTemplateFactoryMethods(sourceValue)) {
        acc[key] = makeProxiedTemplateFunction(transformFn, sourceValue);
      }

      return acc;
    };

    // styled(Component)
    const styledProxied = makeProxiedTemplateFactory(transformFn);

    // styled.div, styled.span, etc.
    return reduce(styledReducer, styledProxied, keys(styled));
  }
);

export default styledTransformProxy;
