// Chuyển một file .md -> .html (rồi dùng Chrome headless in ra PDF).
// Dùng: node build_pdf.mjs [TÊN_FILE.md]   (mặc định docs/LUAT_MA_SOI.md)
// Trình chuyển Markdown tối giản: headers, hr, blockquote, bảng GFM,
// list (ordered/unordered, 1 cấp lồng), bold, inline code, code fence, link, emoji.
import { readFileSync, writeFileSync } from "node:fs";

const inFile = process.argv[2] || "docs/LUAT_MA_SOI.md";
const outHtml = inFile.replace(/\.md$/i, "") + ".html";

const src = readFileSync(inFile, "utf8");
const lines = src.replace(/\r\n/g, "\n").split("\n");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text) {
  const codeRe = /`([^`]+)`/g;
  let last = 0, m;
  const segs = [];
  while ((m = codeRe.exec(text))) {
    segs.push({ t: "text", v: text.slice(last, m.index) });
    segs.push({ t: "code", v: m[1] });
    last = codeRe.lastIndex;
  }
  segs.push({ t: "text", v: text.slice(last) });
  return segs
    .map((s) => {
      if (s.t === "code") return `<code>${esc(s.v)}</code>`;
      let v = esc(s.v);
      v = v.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
      v = v.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return v;
    })
    .join("");
}

const out = [];
let i = 0;
while (i < lines.length) {
  let line = lines[i];

  if (line.trim().startsWith("```")) {
    const buf = [];
    i++;
    while (i < lines.length && !lines[i].trim().startsWith("```")) { buf.push(esc(lines[i])); i++; }
    i++;
    out.push(`<pre><code>${buf.join("\n")}</code></pre>`);
    continue;
  }
  if (/^---+\s*$/.test(line)) { out.push("<hr/>"); i++; continue; }

  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    const lvl = h[1].length;
    const id = h[2].toLowerCase().replace(/[^\wÀ-ỹ\s-]/g, "").trim().replace(/\s+/g, "-");
    out.push(`<h${lvl} id="${id}">${inline(h[2])}</h${lvl}>`);
    i++;
    continue;
  }

  if (/^>\s?/.test(line)) {
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(inline(lines[i].replace(/^>\s?/, ""))); i++; }
    out.push(`<blockquote>${buf.join("<br/>")}</blockquote>`);
    continue;
  }

  if (line.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
    const splitRow = (r) => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
    const header = splitRow(line);
    i += 2;
    const rows = [];
    while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") { rows.push(splitRow(lines[i])); i++; }
    let t = "<table><thead><tr>" + header.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>";
    for (const r of rows) t += "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
    t += "</tbody></table>";
    out.push(t);
    continue;
  }

  if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
    const items = [];
    let listType = /^\s*\d+\./.test(line) ? "ol" : "ul";
    while (i < lines.length && /^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) {
      const mm = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      items.push({ indent: mm[1].length, text: mm[3] });
      i++;
    }
    let html = `<${listType}>`;
    let inSub = false;
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      if (it.indent > 0 && !inSub) { html += `<ul><li>${inline(it.text)}</li>`; inSub = true; }
      else if (it.indent > 0 && inSub) { html += `<li>${inline(it.text)}</li>`; }
      else { if (inSub) { html += "</ul>"; inSub = false; } html += `<li>${inline(it.text)}</li>`; }
    }
    if (inSub) html += "</ul>";
    html += `</${listType}>`;
    out.push(html);
    continue;
  }

  if (line.trim() === "") { i++; continue; }

  const buf = [line];
  i++;
  while (
    i < lines.length && lines[i].trim() !== "" &&
    !/^(#{1,6})\s/.test(lines[i]) && !/^>\s?/.test(lines[i]) &&
    !/^---+\s*$/.test(lines[i]) && !lines[i].trim().startsWith("```") &&
    !/^(\s*)([-*]|\d+\.)\s+/.test(lines[i]) && !lines[i].includes("|")
  ) { buf.push(lines[i]); i++; }
  out.push(`<p>${inline(buf.join(" "))}</p>`);
}

const css = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI","Noto Sans","Noto Color Emoji",Arial,sans-serif; font-size:12px; line-height:1.6; color:#1f2328; max-width:820px; margin:0 auto; padding:24px 28px; }
h1 { font-size:26px; border-bottom:3px solid #7c3aed; padding-bottom:8px; color:#5b21b6; }
h2 { font-size:20px; border-bottom:1px solid #d0d7de; padding-bottom:5px; margin-top:28px; color:#6d28d9; }
h3 { font-size:16px; margin-top:20px; color:#374151; }
h4 { font-size:13.5px; margin-top:16px; color:#4b5563; }
a { color:#2563eb; text-decoration:none; }
hr { border:none; border-top:1px solid #e5e7eb; margin:20px 0; }
blockquote { margin:12px 0; padding:8px 14px; border-left:4px solid #a78bfa; background:#f5f3ff; color:#4c1d95; border-radius:0 6px 6px 0; }
code { background:#f3f4f6; padding:1.5px 5px; border-radius:4px; font-family:"Consolas","Courier New",monospace; font-size:0.9em; color:#be185d; }
pre { background:#1f2937; color:#e5e7eb; padding:12px 14px; border-radius:8px; overflow-x:auto; font-size:11px; line-height:1.5; }
pre code { background:none; color:inherit; padding:0; }
table { border-collapse:collapse; width:100%; margin:12px 0; font-size:11px; }
th,td { border:1px solid #d0d7de; padding:6px 9px; text-align:left; vertical-align:top; }
th { background:#ede9fe; color:#5b21b6; font-weight:600; }
tr:nth-child(even) td { background:#faf9ff; }
ul,ol { padding-left:24px; }
li { margin:3px 0; }
strong { color:#111827; }
@page { size:A4; margin:14mm 12mm; }
`;

const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><title>${esc(inFile)}</title>
<style>${css}</style></head><body>${out.join("\n")}</body></html>`;

writeFileSync(outHtml, html, "utf8");
console.log("HTML written: " + outHtml + " (" + html.length + " bytes)");
