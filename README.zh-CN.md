<p align="center">
  <img width="200" src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30218210645/b186/3974/338b/2ddfa3cd042cf988ca452686552f8462.png" />
</p>

<h1 align="center">Tango 低代码设计器</h1>
<div align="center">

一个源码驱动的低代码设计器框架

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/NetEase/tango/blob/main/LICENSE)
[![NPM version](https://img.shields.io/npm/v/@music163/tango-designer.svg?style=flat-square)](http://npmjs.org/package/@music163/tango-designer)

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30108735057/7ba9/dced/9ac3/420f6e04b371dd47de06e7d71142560d.gif" alt="preview" />

</div>

简体中文 | [English](/README.md)

## 📄 文档

可以通过下面的链接查看详细的使用指南：

- 官方文档站点: <https://netease.github.io/tango/>
- 演示应用: <https://tango-demo.musicfe.com/designer/>

## ✨ 特性

- 经历网易云音乐内网生产环境的实际检验，可灵活集成应用于低代码平台，本地开发工具等
- 基于源码 AST 驱动，无私有 DSL 和协议
- 提供实时出码能力，支持源码进，源码出
- 开箱即用的前端低代码设计器，提供灵活易用的设计器 React 组件
- 使用 TypeScript 开发，提供完整的类型定义文件

## 🎯 里程碑

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       Tango 1.0 Milestones
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

    section Builder Release
    1.0 Alpha  : m1, 2023-10-01, 2024-01-31
    1.0 RC     : m2, 2024-02-01, 2024-04-30
    1.0 Stable : m3, 2024-04-30, 2024-12-31
```

> [!NOTE]
> Alpha 版本会持续对一些实现协议进行优化，并持续融合网易内网版本中的新增特性；RC 版本将会提供基本稳定的解析协议和实现；1.0 正式版本计划在 2024 年Q2发布。1.0 正式版发布后我们将会持续进行版本迭代，并逐步融入内网版本中的流程设计、组件库、AIGC 等核心基础能力。

## 🌐 兼容环境

- 现代浏览器（Chrome >= 80, Edge >= 80, last 2 safari versions, last 2 firefox versions）

## 💻 开发

### 推荐开发环境

- Node `>= 18`
- Yarn `>= 1.22 && < 2`

### 本地开发调试方法

```bash
# 下载仓库
git clone https://github.com/NetEase/tango.git

# 进入项目根目录
cd tango

# 安装依赖
yarn

# 启动设计器示例
yarn start
```

## 💬 社区讨论

参与 NetEase Tango 的社区，以分享您的想法、建议或问题，并与其他用户和贡献者建立联系。

- Discord: <https://discord.gg/B6hkGTe4Rz>
- [使用趋势](https://npm-compare.com/@music163/tango-helpers,@music163/tango-context,@music163/tango-core,@music163/tango-setting-form,@music163/tango-sandbox,@music163/tango-ui,@music163/tango-designer)

## 🤝 参与共建

请先阅读 [贡献指南](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)。

- 克隆仓库
- 创建分支
- 提交代码
- 合并修改 git rebase master
- 发起 Pull Request

## 💗 致谢

感谢网易云音乐公共技术团队，大前端团队，直播技术团队，以及所有参与过 Tango 项目的开发者。

感谢 CodeSandbox 提供的 [Sandpack](https://sandpack.codesandbox.io/) 项目，为 Tango 提供了强大的基于浏览器的代码构建与执行能力。

## 📣 产品推广

![](https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/31629770956/da9e/3a74/4e00/7c69cf46a713f1b008bd1243b5b1ab1c.png)

不要再浪费时间还原 UI 啦，快来试试网易云音乐「海豹 D2C」研发工具吧！轻松将设计稿转为代码，支持 React、RN、Vue、微信小程序等多端场景，所见即所得！

立即体验「海豹 D2C」：

- 我是 Figma 用户：<https://www.figma.com/community/plugin/1174548852019950797/seal-figma-to-code-d2c/>
- 我是 MasterGo 用户：<https://mastergo.com/community/plugin/98956774428196/>

## 📄 开源协议

此项目遵循 [MIT 开源协议](./LICENSE)
