<p align="center">
  <img width="200" src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30218210645/b186/3974/338b/2ddfa3cd042cf988ca452686552f8462.png" />
</p>

<h1 align="center">Tango LowCode Builder</h1>
<div align="center">

A source code based low-code builder, developed by NetEase Cloud Music Develop Team.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/NetEase/tango/blob/main/LICENSE)
[![NPM version](https://img.shields.io/npm/v/@music163/tango-designer.svg?style=flat-square)](http://npmjs.org/package/@music163/tango-designer)

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30108735057/7ba9/dced/9ac3/420f6e04b371dd47de06e7d71142560d.gif" alt="preview" />

</div>

English | [简体中文](/README.zh-CN.md)

## 📄 Documentation

You can view the detailed usage guide through the following links:

- Document site: <https://netease.github.io/tango/>
- Playground application: <https://tango-demo.musicfe.com/designer/>

## ✨ Features

- Tested in the production environment of NetEase Cloud Music, can be flexibly integrated into low-code platforms, local development tools, etc.
- Based on source code AST, with no private DSL and protocol
  Real-time code generation capability, supporting source code in and source code out
- Out-of-the-box front-end low-code designer, providing flexible and easy-to-use designer React components
- Developed using TypeScript, providing complete type definition files

## 🌐 Compatibility

- Modern browsers（Chrome >= 80, Edge >= 80, last 2 safari versions, last 2 firefox versions）

## 🎯 Milestone

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       Tango Release Milestone
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

    section Builder Release
    Alpha version            :active,  des1, 2023-08-10, 2023-08-30
    Beta version               :         des2, 2023-09-01, 2023-09-30
    1.0 RC               :         des3, after des2, 40d
    1.0 version              :         des4, after des3, 21d
```

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

## 💬 Community

Join NetEase Tango Community to share your ideas, suggestions, or questions and connect with other users and contributors.

- Discord: <https://discord.gg/B6hkGTe4Rz>

## 🤝 Contributing

Please read the [github contribution guide](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) first。

- Clone the repository
- Create a branch
- Commit and push your code
- Open a Pull Request

## 📈 Usage Trends

[Usage Trends of Tango Packages](https://npm-compare.com/@music163/tango-helpers,@music163/tango-context,@music163/tango-core,@music163/tango-setting-form,@music163/tango-sandbox,@music163/tango-ui,@music163/tango-designer)

## 💗 Acknowledgments

Thanks to the NetEase Cloud Music Front-end team, Public Technology team, Live Broadcasting Technology team, and all the colleagues who participated in the Tango project.

Thank you to CodeSandbox for providing the [Sandpack](https://sandpack.codesandbox.io/) project, which provides powerful online code execution capabilities for Tango.

## 📄 License

This project is licensed under the terms of the [MIT license](./LICENSE)
