import Link from '@docusaurus/Link';

# 简介

Tango 是一个用于快速构建低代码平台的 JavaScript 框架。借助 Tango 只需要几行代码就可以完成基本的低代码平台前端系统的搭建。

## 引擎架构概览

Tango 低代码引擎在实现上使用分层架构模型，使得上层的低代码平台与底层的低代码引擎可以独立开发，构成有机整体。另一方面，Tango 低代码引擎建立了一套开放的生态体系，开发者可以自由的贡献扩展组件配置能力的属性设置器，以及扩展低代码物料的二方三方业务组件。

如下图所示：

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/18236990116/aabf/8a16/28ee/f0fd29a84c7aa40bb26383cdef12b88c.png" />

## 引擎设计器构成概览

Tango 低代码引擎设计器用于低成本初始化一个基本的低代码平台，其前端部分主要包括如下几个部分：

- 设计器主框架：进行外框架初始化，状态管理，拖拽引擎绑定等核心逻辑。
- 侧边栏面板：提供可扩展的侧边面板，除了内置通用的面板，用户还可以任意添加自定义的面板。
- 属性设置面板：属性设置器面板，支持用户进行属性配置。
- 运行时沙箱：用于设计器运行时视图的渲染。
- Web IDE：用于进行在线源代码编辑。

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13208337399/121f/95a2/5d89/880d65d1ac77a00baf2c4ffd3ba0926b.png" />

## 基于源代码的引擎内核

Tango 低代码引擎使用源代码驱动，借助对源码进行 AST 解析与操纵，实现用户可视化操作行为与源码变更之间的互动。与传统的借助 [Schema 驱动的低代码方案](https://mp.weixin.qq.com/s/yqYey76qLGYPfDtpGkVFfA)相比，无私有搭建协议，无私有 DSL，支持实时源码生成与同步。

<img src="https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13140534982/ee2e/f42c/cc9a/184e2918a011b57d46e6c64a2722fa44.png" />

## 源码进，源码出

由于引擎内核完全基于源代码驱动实现，Tango 低代码引擎能够实现源代码进，源代码出的可视化搭建能力，不提供任何私有的中间产物。从而使得，Tango 构建的线上研发能力可以与团队现有的研发服务（代码托管、构建、部署、CDN）无缝衔接与集成。

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13208022400/b809/b82e/77b0/5e4fe78a8f11c8ed89c9ec9ced43e845.png" />
