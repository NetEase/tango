<h1 align="center">Tango LowCode Designer</h1>
<div align="center">

A source code based low-code designer from the NetEase Cloud Music Develop Team.

</div>

English | [简体中文](./README.zh-CN.md)

## ✨ Features

- Tested in the production environment of NetEase Cloud Music, can be flexibly integrated into low-code platforms, local development tools, etc.
- Based on source code AST, with no private DSL and protocol
  Real-time code generation capability, supporting source code in and source code out
- Out-of-the-box front-end low-code designer, providing flexible and easy-to-use designer React components
- Developed using TypeScript, providing complete type definition files

## 🎯 Compatibility

- Modern browsers（Chrome >= 80, Edge >= 80, last 2 safari versions, last 2 firefox versions）

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

Initialize the designer layout (WIP)

Find details from [Documentation Site](./#)。

## 💻 Development

### Recommended Development Environment

- Node.js >= 16.0.0
- Yarn >= 1.22.0

### Development Quick Start


```bash
# clone the repo
git clone https://github.com/NetEase/tango.git

# enter the project root
cd tango

# install dependencies
yarn

# start the designer playground app
yarn start
```

## 🤝 Contributing

Please read the [github contribution guide](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) first。

- Clone the repository
- Create a branch
- Commit and push your code
- Open a Pull Request

## 💗 Acknowledgments

Thanks to the NetEase Cloud Music Front-end team, Public Technology team, Live Broadcasting Technology team, and all the colleagues who participated in the Tango project.

Thank you to CodeSandbox for providing the [Sandpack](https://sandpack.codesandbox.io/) project, which provides powerful online code execution capabilities for Tango.
