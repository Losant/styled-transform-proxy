// @flow

import { curry, keys, reduce, is } from 'ramda';

import {
  hasTemplateFactoryMethods,
  makeProxiedTemplateFunction,
  makeProxiedTemplateFactory,
} from './utils';

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
