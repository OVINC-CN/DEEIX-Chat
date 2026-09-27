# 自定义品牌资源

OVINC Chat 的产品标题、页面描述、Logo 和 favicon 由部署配置的 `branding` 配置。后端读取配置并通过 `/api/v1/branding` 提供给静态前端；修改品牌后重启应用即可，无需重新构建。

未配置或配置为空时，使用内置 OVINC 品牌资源。品牌接口失败时，页面最多等待 3 秒后使用内置品牌。

```yaml
branding:
  title: OVINC Chat
  short_name: OVINC
  description: OVINC Chat is a multi-model AI conversation system.
  logo_url: ""
  favicon_url: /favicon.png
```

| 配置 | 使用位置 | 内置值或资源 |
| --- | --- | --- |
| `branding.title` | 页面标题、前端产品名称、通知标题 | `OVINC Chat` |
| `branding.short_name` | 生成占位动画和 Artifact 标识 | `OVINC` |
| `branding.description` | HTML Meta Description | `OVINC Chat is a multi-model AI conversation system.` |
| `branding.logo_url` | 登录页、侧栏、分享页和截图 | 浅色 `apps/web/public/logo.png`，深色 `apps/web/public/logo-white.png` |
| `branding.favicon_url` | 浏览器图标 | `apps/web/public/favicon.png` |

资源支持绝对 HTTPS URL 或前端站点的根相对路径。自定义 Logo 在明暗模式中使用同一图片，需要确保对比度；截图所用资源还需允许浏览器读取。回复完成通知优先使用自定义 Logo，否则使用 `/logo.png`。

关于页面使用内置 OVINC Logo，保留版本、版权及许可证说明。显示名称和素材的替换不改变应用标识、存储键或包名。仓库和分发产物中的 `LICENSE`、`NOTICE` 及源代码版权声明保持不变；Apache License 2.0 不授予商标使用权。

本版本不提供 PWA manifest、PWA 图标配置或图标生成流程。旧 Service Worker 清理机制继续保留，以清理已有安装留下的缓存。

分离部署时，用 `NEXT_PUBLIC_API_BASE_URL` 指定后端 API 地址，并将前端来源加入 `server.cors_allow_origin`。品牌值仍由后端部署配置提供。

更新后检查明暗模式中的登录页、侧栏、分享页、关于页、聊天截图、浏览器标题与图标，以及回复完成通知。
