# vvyiii

产品概念原型 / design prototype,基于 [Next.js](https://nextjs.org) + [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)。

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

## 注意

- 不要提交 `.env`、API key、密码等凭证(`.gitignore` 已拦截常见模式)
- 不要提交真实业务数据的导出文件(CSV / JSON dump 等);原型里用假数据
