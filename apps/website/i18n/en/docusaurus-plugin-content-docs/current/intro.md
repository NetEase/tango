import Link from '@docusaurus/Link';

# Introduction

Tango is a low-code designer framework for quickly building low-code platforms. With Tango, you only need a few lines of code to build a basic low-code platform frontend system. The Tango low-code designer **directly reads the source code of the frontend project, executes and renders the frontend view based on the source code, and provides users with low-code visual building capabilities. User building operations will be converted into modifications to the code**. With Tango, **source code goes in, source code comes out**.

## Architecture

The Tango low-code engine has been layered and decoupled in implementation, allowing the upper-level low-code platform and the lower-level low-code engine to be developed and maintained independently for rapid integration and deployment. On the other hand, the Tango low-code engine defines an open material ecosystem, allowing developers to freely contribute extension component configuration attribute setters and expand low-code materials to second and third-party business components.

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/18236990116/aabf/8a16/28ee/f0fd29a84c7aa40bb26383cdef12b88c.png" />

## Builder Components

Tango low-code engine designer is used to low-cost initialization of a basic low-code platform. Its front-end mainly includes the following parts:

- Designer main framework: for external framework initialization, state management, drag-and-drop engine binding, and other core logic.
- Sidebar panel: provides expandable sidebar panels, in addition to built-in universal panels, users can also add custom panels.
- Property setting panel: property setter panel that supports user property configuration.
- Runtime sandbox: used for rendering the designer runtime view.
- Web IDE: used for online source code editing.

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/30108642346/b8cf/e86d/ef5a/514d90b722b5d8dc0e18516ed594a07b.png" />

## Source Code based Low-Code Kernel

The Tango low-code engine does not rely on private setup protocols and DSL, but directly uses source code to drive it. The engine internally converts the source code to AST, and all the user's setup operations are converted to traversal and modification of AST, and then the AST is regenerated as code and synchronized to the online sandbox for execution. Compared with [traditional schema-based low-code solutions](https://mp.weixin.qq.com/s/yqYey76qLGYPfDtpGkVFfA), which are limited by private DSL and protocols, it can perfectly integrate low-code setup with source code development.

<img src="https://p5.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13140534982/ee2e/f42c/cc9a/184e2918a011b57d46e6c64a2722fa44.png" />

## Code in, Code out

Due to the engine kernel being completely based on source code-driven implementation, Tango's low-code engine is able to achieve visual building capabilities with source code input and output, without providing any proprietary intermediate products. As a result, the online development capabilities built by Tango can seamlessly connect and integrate with the team's existing development services (code hosting, building, deployment, CDN).

<img src="https://p6.music.126.net/obj/wonDlsKUwrLClGjCm8Kx/13208022400/b809/b82e/77b0/5e4fe78a8f11c8ed89c9ec9ced43e845.png" />
