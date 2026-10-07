# Otter Verify

产品概念原型 / design prototype(仓库名 vvyiii),基于 [Next.js](https://nextjs.org) + [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000> 查看。

## 技术栈

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS v4**
- **shadcn/ui** — 组件源码在 `components/ui/`,已安装 button、card、input、label、badge、dialog、dropdown-menu、select、textarea、tabs、avatar、separator、switch、checkbox、tooltip、skeleton

需要更多组件时:

```bash
npx shadcn@latest add <component-name>
```

组件列表见 <https://ui.shadcn.com/docs/components>。

## 目录结构

```
app/            页面(App Router)
components/ui/  shadcn/ui 组件源码
lib/            工具函数
public/         静态资源
```

## 部署到公司内部平台(Data Console + Cloudflare Workers)

项目已配置为静态导出(`next.config.ts` 里 `output: 'export'`),`npm run build` 会先生成静态文件到 `out/`,再用 `wrangler deploy --dry-run` 验证。Worker 配置在 `wrangler.toml`(assets-only,托管 `out/` 静态文件)。

部署步骤(在你自己的电脑上):

```bash
# 1. clone 公司的 user-content 仓库
git clone https://github.com/csscompany-enterprise/user-content.git
cd user-content
git checkout -b yi.wu/otter-verify

# 2. 把本项目的代码复制进去(不要带 .git / node_modules / out / .next)
mkdir -p cloudflare-apps/yi.wu/otter-verify
rsync -av --exclude .git --exclude node_modules --exclude out --exclude .next \
  /path/to/vvyiii/ cloudflare-apps/yi.wu/otter-verify/

# 3. 本地验证后提交
cd cloudflare-apps/yi.wu/otter-verify && npm ci && npm run build && cd -
git add cloudflare-apps/yi.wu/otter-verify
git commit -m "feat: initialize otter-verify application"
git push -u origin yi.wu/otter-verify
```

然后:

1. 在 GitHub 上开 PR 合并到 `master`
2. 到 Data Console 创建应用:https://data-console.cssinternal.com/cloudflare-apps
   - Display name:`Otter Verify`
   - Slug:`otter-verify`(Worker 名自动为 `internal-otter-verify`,和 `wrangler.toml` 一致;换名字的话两处要同步改)
   - Repository Path:`cloudflare-apps/yi.wu/otter-verify`
   - Access Policy:`Internal all`(公司邮箱都能访问)
3. 在应用详情页看构建状态,拿到 App URL 分享给团队

之后每次更新:改代码 → merge 到 `master` → 自动部署。

## 注意

- 不要提交 `.env`、API key、密码等凭证(`.gitignore` 已拦截常见模式)
- 不要提交真实业务数据的导出文件(CSV / JSON dump 等);原型里用假数据
