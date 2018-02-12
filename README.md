# styled-transform-proxy

Helper function for extending styled-components via a custom transform function. This
function is curried and takes two arguments - the transform function and the original
`styled` function from `styled-components`.

## Type Definitions

```
transform :: (Array<String> strings, ...* interpolations) -> [strings, ...interpolations]

styledTransformProxy :: transform -> styled -> styled
```

## Examples

### Transform strings

```js
// src/styled-custom.js
import styled from 'styled-components';
import styledTransformProxy from 'styled-transform-proxy';
import { map, replace } from 'ramda';

const transformStrings = map(replace(/\.foo\s/g, '.bar '));

const transform = (strings, ...interpolations) => [
  transformStrings([...strings]),
  ...interpolations
];

export default styledTransformProxy(transform, styled);

// src/components/my-component.js
import styled from '../styled-custom';

// Results in `.foo` below being transformed to `.bar`
const MyComponent = styled.span`
  .foo {
    color: red;
  }
`;
```

### Transform interpolations

```js
// src/styled-custom.js
import styled from 'styled-components';
import styledTransformProxy from 'styled-transform-proxy';
import { identity, map, path, useWith, split, when, is } from 'ramda';

/**
 * Takes a dot-separated path and an object and returns the value at that path.
 * e.g. dotPath('foo.bar', { foo: { bar: 1 } }); => 1
 *
 * dotPath :: String -> Object -> *
 */
const dotPath = useWith(path, [split('.'), identity]);

const transformInterpolations = map(when(is(String), dotPath));

const transform = (strings, ...interpolations) => [
  strings,
  ...transformInterpolations(interpolations)
];

export default styledTransformProxy(transform, styled);

// src/components/my-component.js
import styled from '../styled-custom';

// Results in `.foo` below being transformed to `.bar`
const MyComponent = styled.span`
  color: ${'colors.foreground'};
  background-color: ${'colors.background'}
`;
```
