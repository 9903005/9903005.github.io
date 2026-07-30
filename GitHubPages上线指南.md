# GitHub Pages 免费上线指南（放朋友圈签名用）

> 方案切换说明：原定腾讯云+域名需付费与备案，已应要求改为 **GitHub Pages**——完全免费、免 ICP 备案、链接长期稳定。
> 站点本身为纯静态（零依赖、零构建），本指南所有步骤都不改文章内容，只是换"托管在哪"。

---

## 一、最终效果

- 签名链接形如：`https://你的用户名.github.io/仓库名/`
- 例：`https://xiaoshan.github.io/zaojia-jianding/`
- 手机/电脑微信里点开即看，长期有效，不用每年续费

> 缺点：服务器在境外，国内打开偶尔偏慢（文字博客基本无感）。若以后想加速，可再叠加免费 CDN，不急。

---

## 二、需要你本人做的（仅此一步）

**注册一个免费 GitHub 账号**（1 分钟，需邮箱）：https://github.com

除此之外——建仓库、传文件、开 Pages——都可以交给我，或照下方网页法自己拖。

---

## 三、我帮你做好的

- 站点已是**上传即用**状态，无需任何构建命令
- 上传时把 `blog/` 目录里这些文件整包拖进仓库根即可：

```
index.html      文章列表
article.html    文章详情
tags.html       标签分类
about.html      关于页
css/style.css
js/posts.js
js/main.js
```

> 以后本地加了文章，重新传这几个文件即可，域名不变。

---

## 四、网页上传法（不用装 git，5 分钟）

1. 登录 GitHub → 右上角 **+** → **New repository**
2. 仓库名建议：`zaojia-jianding`（将生成 `https://用户名.github.io/zaojia-jianding/`）
3. 选 **Public**，其余默认 → **Create repository**
4. 进仓库 → **Add file** → **Upload files** → 把上面列出的文件全拖进去 → 拉到底点 **Commit changes**
5. 点 **Settings** → 左侧 **Pages** → **Source** 选 `main`（或 `master`）分支 + `/ (root)` → **Save**
6. 等 1–2 分钟，浏览器打开 `https://你的用户名.github.io/仓库名/` 验证四页正常、搜索可用
7. 把该链接复制到微信「我 → 个人信息 → 个性签名」

---

## 五、想让我全自动？（你零操作）

如果你愿意，在 WorkBuddy 左侧「连接器」里开启 **GitHub** 并授权，我直接帮你：
- 建仓库
- 推送全部文件
- 开启 GitHub Pages
- 把最终链接交给你

你只需点一下授权，其余我来。

---

## 六、合规提示

- GitHub Pages 在境外，个人站点**无需 ICP 备案**。
- 关于页已写明"本站为个人非经营性学习笔记，不构成执业鉴定意见"，保留即可，规避经营性质认定。
- 若日后想绑自己的短域名（如 `zaojia-jianding.cn`），GitHub Pages 也支持自定义域名，到时再说。

---

## 七、过渡期

备案/上线就绪前，现有沙箱链接仍可继续发人看：
`https://ab7332c6ee324599b3c98fafb49ab8e3.sh3.agentos-app.net`
