<h1 align="center">Tango LowCode Designer</h1>
<div align="center">

A source code based low-code designer from the NetEase Cloud Music Develop Team.

</div>

## 📄 Usage

Install the low-code designer

```bash
npm install @music163/tango-designer
```

Initialize the low-code designer engine

```js
import { createEngine } form '@music163/tango-designer';

// init designer engine
const engine = createEngine({
  entry: '/src/index.js',
  files: sampleFiles,
  componentPrototypes: prototypes as any,
});
```

Initialize the drag-and-drop engine

```js
import { DndQuery } form '@music163/tango-designer';

const sandboxQuery = new DndQuery({
  context: 'iframe',
});
```
