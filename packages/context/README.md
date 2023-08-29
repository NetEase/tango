# tango-apps-context

> React context of tango-apps core

## Usage

install

```bash
yarn add @music163/tango-context
```

usage

```jsx
import { observer, useWorkspace } from '@music/tango-apps-context';

export const SampleWidget = observer(() => {
  const ws = useWorkspace();
  return <div></div>;
});
```
