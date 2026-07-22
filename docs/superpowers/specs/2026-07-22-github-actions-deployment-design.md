# GitHub Actions Deployment Design

## Goal

在 `main` 分支变更后自动验证并构建 Vue/Vite 项目，将 `dist` 构建产物发布到独立的 `deploy` 分支，供后续部署使用。

## Design

新增 `.github/workflows/deploy.yml`，工作流包含以下阶段：

1. 在 `main` 分支 push 或手动触发时运行。
2. 使用 Node.js 20 和 `npm ci` 安装锁定依赖。
3. 运行 `npm test`，测试失败时停止发布。
4. 运行 `npm run build` 生成 `dist`。
5. 使用 GitHub Actions 的 `contents: write` 权限，把 `dist` 内容写入 `deploy` 分支；分支不存在时自动创建，存在时以最新构建内容覆盖。

工作流使用并发控制，避免同一时间多个构建互相覆盖部署分支。部署分支包含 `.nojekyll`，避免被静态站点服务误处理下划线文件。

## Verification

本地验证包括 `npm test`、`npm run build`，以及使用 Ruby YAML 解析器检查工作流语法。工作流本身不新增应用代码或应用层测试。

## Scope

本次不配置 GitHub Pages、云平台或自定义域名；`deploy` 分支只负责承载发布产物，具体部署平台可在后续接入。
