/* ========== 轻量 Markdown 渲染器（零依赖，离线可用） ========== */
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMd(s) {
  s = escapeHtml(s);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  return s;
}

function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // skip closing ```
      out.push("<pre><code>" + escapeHtml(buf.join("\n")) + "</code></pre>");
      continue;
    }

    // 表格
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const headCells = line.split("|").slice(1, -1).map(c => inlineMd(c.trim()));
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map(c => inlineMd(c.trim())));
        i++;
      }
      let html = "<table><thead><tr>" + headCells.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>";
      rows.forEach(r => { html += "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>"; });
      html += "</tbody></table>";
      out.push(html);
      continue;
    }

    // 标题
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const lv = h[1].length;
      out.push(`<h${lv}>` + inlineMd(h[2]) + `</h${lv}>`);
      i++;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(inlineMd(lines[i].replace(/^>\s?/, "")));
        i++;
      }
      out.push("<blockquote><p>" + buf.join("<br>") + "</p></blockquote>");
      continue;
    }

    // 分隔线
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    // 无序列表
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        buf.push("<li>" + inlineMd(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>");
        i++;
      }
      out.push("<ul>" + buf.join("") + "</ul>");
      continue;
    }

    // 有序列表
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push("<li>" + inlineMd(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>");
        i++;
      }
      out.push("<ol>" + buf.join("") + "</ol>");
      continue;
    }

    // 空行
    if (/^\s*$/.test(line)) { i++; continue; }

    // 段落
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^(#{1,6}\s|>\s?|```|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i]) &&
           !/^(-{3,}|\*{3,})\s*$/.test(lines[i])) {
      buf.push(inlineMd(lines[i].trim()));
      i++;
    }
    if (buf.length) out.push("<p>" + buf.join(" ") + "</p>");
    else i++; // 防御：无法识别的行直接跳过，避免死循环
  }

  return out.join("\n");
}

/* ========== 公共工具 ========== */
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

function postCardHtml(p) {
  return `
    <a class="post-card" href="article.html?id=${p.id}">
      <h2>${p.title}</h2>
      <p class="excerpt">${p.excerpt}</p>
      <div class="post-meta">
        <span>📅 ${p.date}</span>
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
    </a>`;
}

function sortedPosts() {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

/* ========== 页面渲染 ========== */
// 关键词高亮（仅用于纯文本，先转义再标记）
function highlight(text, kw) {
  const safe = escapeHtml(text);
  if (!kw) return safe;
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp("(" + esc + ")", "gi"), "<mark>$1</mark>");
}

function postCardHtmlHl(p, kw) {
  return `
    <a class="post-card" href="article.html?id=${p.id}">
      <h2>${highlight(p.title, kw)}</h2>
      <p class="excerpt">${highlight(p.excerpt, kw)}</p>
      <div class="post-meta">
        <span>📅 ${p.date}</span>
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
    </a>`;
}

// 首页文章列表（含站内搜索）
function renderHome() {
  const el = document.getElementById("post-list");
  if (!el) return;
  const input = document.getElementById("search-input");
  const hint = document.getElementById("search-hint");

  const draw = () => {
    const kw = (input ? input.value : "").trim();
    let posts = sortedPosts();
    if (kw) {
      const low = kw.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(low) ||
        p.excerpt.toLowerCase().includes(low) ||
        p.content.toLowerCase().includes(low) ||
        p.tags.some(t => t.toLowerCase().includes(low))
      );
    }
    if (hint) hint.textContent = kw ? `找到 ${posts.length} 篇与「${kw}」相关的文章` : "";
    el.innerHTML = posts.length
      ? posts.map(p => postCardHtmlHl(p, kw)).join("")
      : '<p class="empty">没有找到相关文章，换个关键词试试</p>';
  };

  if (input) input.addEventListener("input", draw);
  draw();
}

// 标签页
function renderTags() {
  const cloudEl = document.getElementById("tag-cloud");
  const listEl = document.getElementById("tag-post-list");
  const labelEl = document.getElementById("tag-label");
  if (!cloudEl) return;

  const counts = {};
  POSTS.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  const current = getParam("tag");

  cloudEl.innerHTML = Object.keys(counts).sort()
    .map(t => `<a class="tag big ${t === current ? "active" : ""}" href="tags.html?tag=${encodeURIComponent(t)}">${t}<span class="count">${counts[t]}</span></a>`)
    .join("");

  const posts = current ? sortedPosts().filter(p => p.tags.includes(current)) : sortedPosts();
  labelEl.textContent = current ? `标签「${current}」下共 ${posts.length} 篇文章` : `全部文章（${posts.length} 篇）`;
  listEl.innerHTML = posts.length ? posts.map(postCardHtml).join("") : '<p class="empty">该标签下暂无文章</p>';
}

// 文章详情页
function renderArticle() {
  const el = document.getElementById("article");
  if (!el) return;
  const post = POSTS.find(p => p.id === getParam("id"));
  if (!post) {
    el.innerHTML = '<p class="empty">未找到该文章，<a href="index.html" style="color:var(--accent)">返回首页</a></p>';
    return;
  }
  document.title = post.title + " · 尺规之间";
  el.innerHTML = `
    <div class="article-header">
      <h1>${post.title}</h1>
      <div class="post-meta">
        <span>📅 ${post.date}</span>
        ${post.tags.map(t => `<a class="tag" href="tags.html?tag=${encodeURIComponent(t)}">${t}</a>`).join("")}
      </div>
    </div>
    <div class="md-body">${renderMarkdown(post.content)}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderTags();
  renderArticle();
});
