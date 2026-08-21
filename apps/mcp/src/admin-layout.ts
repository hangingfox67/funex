/**
 * Shared admin layout — mobile-first, dark theme, tab nav.
 */

const NAV_ITEMS = [
  { path: '/admin', label: 'Funnel', icon: '📊' },
  { path: '/admin/baseline', label: 'Baseline', icon: '🧪' },
  { path: '/admin/conversions', label: 'Conversions', icon: '💰' },
  { path: '/admin/catalog', label: 'Catalog', icon: '📦' },
];

export function layout(activePath: string, title: string, body: string): string {
  const nav = NAV_ITEMS.map((item) => {
    const active = activePath === item.path ? 'active' : '';
    return `<a href="${item.path}" class="tab ${active}">${item.icon} ${item.label}</a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>${title} — Funex Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#111;color:#e0e0e0;font-size:14px;padding-bottom:60px}
.header{background:#1a1a1a;padding:12px 16px;border-bottom:1px solid #333;position:sticky;top:0;z-index:10}
.header h1{font-size:1rem;color:#888;font-weight:400}
.tabs{display:flex;position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;border-top:1px solid #333;z-index:10}
.tab{flex:1;text-align:center;padding:10px 4px;color:#888;text-decoration:none;font-size:.75rem;transition:color .15s}
.tab.active{color:#3b82f6;font-weight:600}
.tab:active{background:#222}
.content{padding:12px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.card{background:#1a1a1a;border-radius:8px;padding:12px;text-align:center}
.card .val{font-size:1.4rem;font-weight:700;color:#fff}
.card .lbl{font-size:.7rem;color:#888;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:.8rem}
th{text-align:left;padding:8px 6px;border-bottom:1px solid #333;color:#888;font-weight:500;position:sticky;top:44px;background:#111}
td{padding:8px 6px;border-bottom:1px solid #222}
tr:active{background:#1a1a1a}
.badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:.7rem;font-weight:600}
.badge-blue{background:#1e3a5f;color:#93c5fd}
.badge-green{background:#14532d;color:#86efac}
.badge-yellow{background:#422006;color:#fde047}
.badge-red{background:#450a0a;color:#fca5a5}
.btn{display:inline-block;padding:8px 16px;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:.85rem;cursor:pointer;text-decoration:none}
.btn:active{background:#2563eb}
.btn-sm{padding:4px 10px;font-size:.75rem}
.upload-box{background:#1a1a1a;border:2px dashed #333;border-radius:12px;padding:24px;text-align:center;margin:16px 0}
input[type=file]{margin:8px 0}
.mono{font-family:'SF Mono',Monaco,Consolas,monospace;font-size:.75rem}
.mt{margin-top:12px}
.mb{margin-bottom:12px}
.text-muted{color:#888}
.text-sm{font-size:.8rem}
.copy-btn{background:#333;border:none;color:#ccc;padding:4px 8px;border-radius:4px;font-size:.7rem;cursor:pointer;margin-left:4px}
.copy-btn:active{background:#555}
.toggle{width:20px;height:20px;border:2px solid #555;border-radius:4px;display:inline-block;cursor:pointer;vertical-align:middle}
.toggle.on{background:#3b82f6;border-color:#3b82f6}
@media(min-width:640px){.cards{grid-template-columns:repeat(6,1fr)}.content{max-width:960px;margin:0 auto}}
</style></head><body>
<div class="header"><h1>Funex Admin</h1></div>
<div class="content">${body}</div>
<nav class="tabs">${nav}</nav>
</body></html>`;
}
