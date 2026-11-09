#!/usr/bin/env node
// يحوّل dist/ إلى صفحة واحدة (CSS و JS مضمّنين) للنشر كـ Artifact داخل Claude.
// الاستخدام: npm run build && npm run artifact  ← dist/huroof.html
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const css = html.match(/href="\.\/(assets\/[^"]+\.css)"/)?.[1];
const js = html.match(/src="\.\/(assets\/[^"]+\.js)"/)?.[1];
if (!css || !js) throw new Error("ما لقيت ملفات CSS/JS في dist/index.html");

const fonts = html.match(/<link\s+href="https:\/\/fonts\.googleapis\.com[^>]+>/)[0];
const cssText = readFileSync(`dist/${css}`, "utf8");
const jsText = readFileSync(`dist/${js}`, "utf8").replace(/<\/script/gi, "<\\/script");

const page = `<title>حروف</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="حروف: بنك أسئلة ثقافية عربية مدققة، مرتبة حسب المجال والحرف.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>${cssText}</style>
<script>try{var t=localStorage.getItem("hrf-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}document.documentElement.lang="ar";document.documentElement.dir="rtl";</script>
<div id="root"></div>
<script type="module">${jsText}</script>
`;
writeFileSync("dist/huroof.html", page);
console.log(`dist/huroof.html ${(page.length / 1024).toFixed(0)} KB`);

// الصور تنشر كملفات بجانب الصفحة (Artifact files): images/اسم ← dist/images/اسم
import { readdirSync, existsSync } from "node:fs";
const imgs = existsSync("dist/images") ? readdirSync("dist/images").filter((f) => !f.startsWith(".")) : [];
writeFileSync("dist/artifact-files.json", JSON.stringify(Object.fromEntries(imgs.map((f) => [`images/${f}`, `dist/images/${f}`])), null, 1));
console.log(`${imgs.length} صورة للنشر (dist/artifact-files.json)`);
