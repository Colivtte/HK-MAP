/* 香江图志 —— 原神风格香港分区地图
   引擎：MapLibre GL JS（矢量瓦片来自 OpenFreeMap，无需密钥）
   所有业务数据在 data/ 目录，改数据即可更新地图，无需动本文件 */

// ── 原神配色（对照游戏截图逐项取样） ─────────────────────────
const C = {
  land: '#C6BB88',      // 基底暖卡其
  forest: '#87A75E',    // 森林绿（树冠纹理的底色）
  grass: '#A9BB6F',     // 草地黄绿
  farm: '#B9AE72',      // 农田橄榄
  rock: '#A29B85',      // 山岩灰
  sand: '#D8CD9B',      // 沙地
  urban: '#CEC091',     // 城镇暖沙（聚落色块）
  water: '#43809C',     // 青碧海色
  beach: '#EAE0B4',     // 海滩沙带
  road: '#EFE5C2',      // 米色小径
  roadCase: '#CFC296',
  building: '#E0D2A4',
  buildingEdge: '#A89570',
  border: '#EBDCAC',    // 区界米金
};

// 18 区一句话简介（key 与 GeoJSON 的 CNAME_S 对应）
const DISTRICT_DESC = {
  '中西区': '政商心脏：中环摩天楼群与百年老街并存，山顶缆车由此登顶。',
  '湾仔区': '会展之城：会议展览中心坐镇维港，旧街市与摩登高楼交错。',
  '东区': '港岛东：太古坊商业带与筲箕湾渔村气息一脉相承。',
  '南区': '山海之间：海洋公园、浅水湾与鸭脷洲渔港，港岛后花园。',
  '油尖旺区': '九龙最繁华：尖沙咀、旺角、油麻地，霓虹与市井共冶一炉。',
  '深水埗区': '市井烟火：电子老街鸭寮街与布艺基隆街，创客小店生长之地。',
  '九龙城区': '美食之城：启德旧机场涅槃重生，红磡与土瓜湾藏龙卧虎。',
  '黄大仙区': '香火鼎盛：黄大仙祠有求必应，志莲净苑藏一方唐风净土。',
  '观塘区': '旧工业区蜕变：九龙东 CBD2 崛起，apm 与海滨步道新生。',
  '葵青区': '门户要冲：葵涌货柜码头与青马大桥，俯瞰蓝巴勒海峡。',
  '荃湾区': '新市镇鼻祖：三栋屋博物馆见证围村往事，青山公路串起滨海长廊。',
  '屯门区': '青山湾畔：黄金海岸沙滩与红楼中山遗迹，岭南大学坐镇虎地。',
  '元朗区': '围村与湿地：屏山文物径、米埔候鸟天堂与流浮山生蚝。',
  '北区': '香港最北：粉岭联和墟与边境墟市，梧桐山隔河相望。',
  '大埔区': '吐露港畔：大埔墟与林村许愿树，环港最宜单车骑行。',
  '沙田区': '城门河畔：沙田马场骏马奔腾，中文大学山城对望。',
  '西贡区': '香港后花园：海鲜街、万宜水库与联合国教科文地质公园。',
  '离岛区': '岛屿星罗：大屿山大佛与机场、长洲抢包山，迪士尼亦在此。',
};

const ICONS = {
  scenic: '<svg viewBox="0 0 24 24"><path d="M3 18 L9 7 L13 13 L16 9 L21 18 Z"/><circle cx="18" cy="4.5" r="1.6"/></svg>',
  library: '<svg viewBox="0 0 24 24"><path d="M12 5.5 C10 3.8 7 3.2 4 3.8 V17.5 C7 16.9 10 17.5 12 19.2 C14 17.5 17 16.9 20 17.5 V3.8 C17 3.2 14 3.8 12 5.5 Z"/><path d="M12 5.5 V19.2"/></svg>',
  university: '<svg viewBox="0 0 24 24"><path d="M12 4 L22 9 L12 14 L2 9 Z"/><path d="M6 11.5 V16 C6 16 8.2 18 12 18 C15.8 18 18 16 18 16 V11.5"/><path d="M22 9 V14.5"/></svg>',
  apple: '<svg viewBox="0 0 24 24"><path d="M16.9 12.8 c0-2.2 1.8-3.2 1.9-3.3 c-1-1.5-2.6-1.7-3.2-1.7 c-1.3-.1-2.6.8-3.2.8 c-.7 0-1.7-.8-2.8-.8 C7.2 7.9 5 9.5 5 12.8 c0 2 .7 4.1 1.7 5.5 c.8 1.2 1.8 2.2 3 2.2 c1.2 0 1.7-.8 3.2-.8 c1.5 0 1.9.8 3.2.8 c1.3 0 2.1-1.2 2.9-2.4 c.9-1.4 1.3-2.7 1.3-2.8 c-.1 0-2.5-1-2.4-3.5 z"/><path d="M14.6 7.3 c.7-.8 1.1-1.9 1-3 c-1 0-2.2.7-2.9 1.5 c-.6.7-1.2 1.9-1 3 c1.1.1 2.2-.6 2.9-1.5 z"/></svg>',
  port: '<svg viewBox="0 0 24 24"><path d="M3.5 19 V11 C3.5 7 7.2 4.8 12 4.8 C16.8 4.8 20.5 7 20.5 11 V19"/><path d="M9 19 V13.5 C9 12 10.3 11 12 11 C13.7 11 15 12 15 13.5 V19"/><path d="M2 19 H22"/></svg>',
  EYE_ON: '<svg viewBox="0 0 24 24"><path d="M2 12 C4.5 7 8 5 12 5 C16 5 19.5 7 22 12 C19.5 17 16 19 12 19 C8 19 4.5 17 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>',
  EYE_OFF: '<svg viewBox="0 0 24 24"><path d="M2 12 C4.5 7 8 5 12 5 C16 5 19.5 7 22 12 C19.5 17 16 19 12 19 C8 19 4.5 17 2 12 Z"/><circle cx="12" cy="12" r="3"/><path d="M4 4 L20 20"/></svg>',
};
const EYE_ON = '<svg viewBox="0 0 24 24"><path d="M2 12 C4.5 7 8 5 12 5 C16 5 19.5 7 22 12 C19.5 17 16 19 12 19 C8 19 4.5 17 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24"><path d="M4 4 L20 20"/><path d="M9.9 5.2 C10.6 5.07 11.3 5 12 5 C16 5 19.5 7 22 12 C21.3 13.3 20.5 14.5 19.6 15.4 M6.3 6.9 C4 8.3 2.8 10 2 12 C4.5 17 8 19 12 19 C13.6 19 15.1 18.6 16.5 17.9"/><path d="M9.9 9.9 A3 3 0 0 0 14.1 14.1"/></svg>';

// ── 地图样式（矢量瓦片 + 自绘原神风） ──────────────────────
const style = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    omf: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
    districts: { type: 'geojson', data: window.HK_DISTRICTS, generateId: true },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': C.land } },
    // 生物群系马赛克：森林 / 草地 / 农田 / 岩沙 / 城镇各成色块，拼出手绘地表
    { id: 'forest', type: 'fill', source: 'omf', 'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: { 'fill-color': C.forest, 'fill-opacity': 0.9 } },
    { id: 'greens', type: 'fill', source: 'omf', 'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'grass', 'recreation_ground']]],
      paint: { 'fill-color': C.grass, 'fill-opacity': 0.8 } },
    { id: 'grassland', type: 'fill', source: 'omf', 'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: { 'fill-color': C.grass, 'fill-opacity': 0.75 } },
    { id: 'farmland', type: 'fill', source: 'omf', 'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'farmland'],
      paint: { 'fill-color': C.farm, 'fill-opacity': 0.85 } },
    { id: 'rock-sand', type: 'fill', source: 'omf', 'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['rock', 'sand']]],
      paint: { 'fill-color': ['match', ['get', 'class'], 'rock', C.rock, C.sand], 'fill-opacity': 0.9 } },
    { id: 'urban', type: 'fill', source: 'omf', 'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial']]],
      paint: { 'fill-color': C.urban, 'fill-opacity': 0.85 } },
    { id: 'water', type: 'fill', source: 'omf', 'source-layer': 'water', paint: { 'fill-color': C.water } },
    // 原神式海岸：近岸浅光 + 沙滩色带 + 米白岸线
    { id: 'coast-glow', type: 'line', source: 'omf', 'source-layer': 'water',
      paint: { 'line-color': '#9ED2DE', 'line-blur': 6, 'line-opacity': 0.3,
               'line-width': ['interpolate', ['linear'], ['zoom'], 9, 6, 13, 18] } },
    { id: 'coast-band', type: 'line', source: 'omf', 'source-layer': 'water',
      paint: { 'line-color': C.beach, 'line-opacity': 0.5,
               'line-width': ['interpolate', ['linear'], ['zoom'], 9, 4, 13, 12] } },
    { id: 'coast-rim', type: 'line', source: 'omf', 'source-layer': 'water',
      paint: { 'line-color': '#F2E9C8', 'line-opacity': 0.85,
               'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1.2, 13, 2.2] } },
    // 注：不渲染 waterway 线图层——OSM 里的城门河/锦田河等均为人工取直渠道，
    // 笔直的蓝色线条与原神式手绘水体冲突；海/湖/水塘等多边形水面保留。
    { id: 'building', type: 'fill', source: 'omf', 'source-layer': 'building', minzoom: 12.5,
      paint: { 'fill-color': C.building, 'fill-outline-color': C.buildingEdge, 'fill-opacity': 0.9 } },
    // 无衬线小径：去掉重 casing，弱化市政路网感
    { id: 'road-minor', type: 'line', source: 'omf', 'source-layer': 'transportation', minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'path']]],
      paint: { 'line-color': C.road, 'line-width': 1.1, 'line-opacity': 0.85 } },
    { id: 'road-case', type: 'line', source: 'omf', 'source-layer': 'transportation', minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
      paint: { 'line-color': C.roadCase,
               'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 6],
               'line-opacity': ['case', ['==', ['get', 'brunnel'], 'tunnel'], 0.25, 0.85] } },
    { id: 'road', type: 'line', source: 'omf', 'source-layer': 'transportation', minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
      paint: { 'line-color': C.road,
               'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 14, 4.2],
               'line-opacity': ['case', ['==', ['get', 'brunnel'], 'tunnel'], 0.3, 0.9] } },
    { id: 'admin', type: 'line', source: 'omf', 'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: { 'line-color': '#7A6A45', 'line-width': 1.5, 'line-dasharray': [3, 2] } },
    // 分区覆盖层（hover 高亮用 feature-state）
    { id: 'district-fill', type: 'fill', source: 'districts',
      paint: { 'fill-color': '#FFF3C4', 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.22, 0.05] } },
    { id: 'district-line-under', type: 'line', source: 'districts',
      paint: { 'line-color': '#5E4F33', 'line-width': 3.2, 'line-opacity': 0.3 } },
    { id: 'district-line', type: 'line', source: 'districts',
      paint: { 'line-color': C.border, 'line-width': 1.5 } },
  ],
};

// 初始化诊断：错误不会吞掉，落在 window.__errors 便于排查
window.__errors = [];
window.addEventListener('error', e => window.__errors.push(String(e.message || e)));
window.addEventListener('unhandledrejection', e => window.__errors.push(String(e.reason)));

// ── 初始化 ───────────────────────────────────────────────
const INIT_VIEW = { center: [114.13, 22.36], zoom: 10.15 };
const HK_BOUNDS = [[113.82, 22.13], [114.46, 22.58]];

const map = new maplibregl.Map({
  container: 'map',
  style,
  ...INIT_VIEW,
  minZoom: 9.5, maxZoom: 15.5,
  attributionControl: false,
  dragRotate: false, pitchWithRotate: false,
});
map.touchZoomRotate.disableRotation(); // 双指捏合缩放可用，但禁用双指旋转防误操作
map.addControl(new maplibregl.AttributionControl({
  compact: true,
  customAttribution: '<span class="attrib-hint">点击分区查看概览 <i>◆</i> 点击图钉查看详情 <i>◆</i> 右侧隐藏面板可筛选标注</span>',
}), 'top-right');
map.on('error', e => window.__errors.push(e && e.error ? String(e.error.message || e.error) : String(e)));
window.__map = map;

const catById = Object.fromEntries(window.HK_CATEGORIES.map(c => [c.id, c]));
const markersByCat = Object.fromEntries(window.HK_CATEGORIES.map(c => [c.id, []]));
const visible = Object.fromEntries(window.HK_CATEGORIES.map(c => [c.id, true]));
let activePopup = null;

function closePopup() { if (activePopup) { activePopup.remove(); activePopup = null; } }

// ── 点亮机制（原神式收集）：点击弹窗中的"点亮"标记足迹，localStorage 持久化 ──
const LIT_KEY = 'hkmap-lit';
let litSet = new Set();
try { litSet = new Set(JSON.parse(localStorage.getItem(LIT_KEY) || '[]')); } catch (e) { /* 隐私模式等场景忽略 */ }
const poiEls = {}; // poi.id → 图钉元素
function updateLitCount() {
  document.getElementById('poiTotal').textContent =
    `共 ${window.HK_POIS.length} 处标注 · 18 分区 · 已点亮 ${litSet.size}`;
}
function setLit(pid, on) {
  if (on) litSet.add(pid); else litSet.delete(pid);
  try { localStorage.setItem(LIT_KEY, JSON.stringify([...litSet])); } catch (e) { /* 忽略 */ }
  if (poiEls[pid]) poiEls[pid].classList.toggle('lit', on);
  updateLitCount();
}

// ── 锚点图钉（景点/图书馆/大学）：白壳灰框 + 灰拱 + 青色上沿 + 分类色菱形 ──
const TEARDROP_CATS = { scenic: 1, library: 1, university: 1 };
// 分类色用于中央菱形；白色标识统一缩小并居中。
const TEARDROP_STYLE = {
  scenic:     { inner: '#E8A33D', glyph: '#FFFFFF' },
  library:    { inner: '#3F918B', glyph: '#FFFFFF' },
  university: { inner: '#9B7BD1', glyph: '#FFFFFF' },
};
function teardropSvg(cat) {
  const st = TEARDROP_STYLE[cat] || { inner: '#2E3D5C', glyph: '#FFFFFF' };
  const glyph = ICONS[cat]
    .replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg class="pin-svg" viewBox="10 4 54 75" width="27" height="37.5">
<path d="M36.5 7.8 C38.3 8.5 40.2 12 43 14 C54.5 22 59.2 30.5 59.2 43.1 C59.2 47 48.7 58.9 36.5 75.4 C26.5 62 19.6 52.2 15.9 46.6 C12.7 41.8 15.9 28 21.6 21.4 C26.4 15.9 32.6 13.3 36.5 7.8 Z" fill="#FAFAFA" stroke="#637880" stroke-width="4.8" stroke-linejoin="round"/>
<path d="M20.5 37 C21 27.3 26.5 21 36.5 16.7 C46.3 21.2 51.9 27.4 52.3 37 Z" fill="#60625C"/>
<path d="M25.2 37 L36.5 23.9 L47.7 37 L44.2 37 L36.5 28.1 L28.8 37 Z" fill="#02FAFA"/>
<path d="M36.5 28.1 L44.3 37.1 L36.5 47.2 L28.7 37.1 Z" fill="${st.inner}"/>
<g transform="translate(31.94 32.64) scale(0.38)" fill="none" stroke="#FFFFFF" stroke-width="1.64" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
<g class="badge" transform="translate(11.5 4) scale(1.35)">
      <circle cx="32" cy="9" r="6.5" fill="#F3D98B" stroke="#FFF8E0" stroke-width="1.5"/>
      <path d="M29.2 9.2 l1.9 2 l3.6-4" fill="none" stroke="#4A3B22" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
</svg>`;
}

// ── 口岸菱形徽记（深蓝菱黑边框 + 中央原图标：红底白拱门圆徽） ──
function portSvg() {
  return '<img class="port-svg" src="assets/port-anchor-final.png" alt="口岸">';
}

// ── POI 图钉 ─────────────────────────────────────────────
function makePoiMarker(poi) {
  const cat = catById[poi.cat];
  const el = document.createElement('div');
  el.className = 'poi' + (poi.labelTop ? ' label-top' : '') + ` cat-${poi.cat}`;
  el.dataset.pid = poi.id;
  el.innerHTML = TEARDROP_CATS[poi.cat]
    ? teardropSvg(poi.cat) + `<div class="poi-name">${poi.name}</div>`
    : poi.cat === 'port'
      ? portSvg() + `<div class="poi-name">${poi.name}</div>`
      : `<div class="poi-pin" style="--c:${cat.color}">${ICONS[poi.cat]}</div>
         <div class="poi-name">${poi.name}</div>`;
  poiEls[poi.id] = el;
  el.classList.toggle('lit', litSet.has(poi.id));
  el.addEventListener('click', e => {
    e.stopPropagation();
    closePopup();
    const lit = litSet.has(poi.id);
    const rows = [
      ['交通', poi.mtr], ['费用', poi.fee], ['建议', poi.time],
    ].filter(r => r[1]);
    const linkHtml = poi.url
      ? `<a class="pop-link" href="${poi.url}" target="_blank" rel="noopener">${poi.urlLabel || '了解更多'} ↗</a>`
      : (poi.wiki ? `<a class="pop-link" href="https://zh.wikipedia.org/wiki/${encodeURIComponent(poi.wiki)}" target="_blank" rel="noopener">维基百科 ↗</a>` : '');
    activePopup = new maplibregl.Popup({ className: 'genshin-popup', offset: 34, closeButton: false, maxWidth: '300px' })
      .setLngLat([poi.lng, poi.lat])
      .setHTML(`
        <div class="pop-head">
          <span class="pop-dot" style="background:${cat.color}"></span>
          <span><span class="pop-name">${poi.name}</span><div class="pop-en">${poi.en}</div></span>
        </div>
        <div class="pop-desc">${poi.desc}</div>
        <div class="pop-rows">
          ${rows.map(r => `<div class="pop-row"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join('')}
        </div>
        ${poi.tip ? `<div class="pop-tip"><span class="k">贴士</span>${poi.tip}</div>` : ''}
        <div class="pop-actions">
          ${linkHtml}
          <button class="lit-btn ${lit ? 'on' : ''}" data-pid="${poi.id}">${lit ? '✦ 已点亮' : '✦ 点亮'}</button>
        </div>`)
      .addTo(map);
    const btn = activePopup.getElement().querySelector('.lit-btn');
    if (btn) btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const on = !litSet.has(poi.id);
      setLit(poi.id, on);
      btn.classList.toggle('on', on);
      btn.textContent = on ? '✦ 已点亮' : '✦ 点亮';
    });
  });
  // labelTop: 名称放在图钉上方（锚点 bottom，让图钉钉在坐标上）
  const m = new maplibregl.Marker({ element: el, anchor: poi.labelTop ? 'bottom' : 'top' })
    .setLngLat([poi.lng, poi.lat]).addTo(map);
  markersByCat[poi.cat].push(m);
}

// ── 分区名标签 ───────────────────────────────────────────
function makeDistrictLabels() {
  for (const f of window.HK_DISTRICTS.features) {
    const p = f.properties;
    const el = document.createElement('div');
    el.className = 'district-label';
    el.textContent = p.CNAME_S;
    new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([p.labelLng, p.labelLat]).addTo(map);
  }
}

// ── 海面波纹：运行时生成可平铺的弧线纹理贴到水面上 ──────────
function addWavePattern() {
  const s = 128, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const x = cv.getContext('2d');
  x.fillStyle = C.water;
  x.fillRect(0, 0, s, s);
  x.strokeStyle = 'rgba(255,255,255,0.075)';
  x.lineWidth = 2.4;
  x.lineCap = 'round';
  const arc = (cx, cy) => {
    for (const dx of [-s, 0, s]) {           // 左右各复制一份保证平铺无缝
      x.beginPath();
      x.arc(cx + dx, cy, 13, Math.PI * 1.15, Math.PI * 1.85);
      x.stroke();
    }
  };
  for (let row = 0; row < 4; row++) {
    const y = 18 + row * 31;
    const off = (row % 2) * 31.5;
    for (let cx = off; cx < s + 40; cx += 63) arc(cx, y);
  }
  map.addImage('hk-waves', x.getImageData(0, 0, s, s), { pixelRatio: 2 });
  map.setPaintProperty('water', 'fill-pattern', 'hk-waves');
}

// ── POI 名称随缩放显隐：全景只留图钉（像原神），放大后名字淡入，悬停常显 ──
const NAMES_AT_ZOOM = 11.5;
function updateNameVisibility() {
  document.body.classList.toggle('names-on', map.getZoom() >= NAMES_AT_ZOOM);
}
map.on('zoom', updateNameVisibility);

// ── 分区交互（hover + 点击） ─────────────────────────────
let hoveredId = null;
function setHover(id, on) {
  if (id == null) return;
  map.setFeatureState({ source: 'districts', id }, { hover: on });
}
map.on('mousemove', 'district-fill', e => {
  map.getCanvas().style.cursor = 'pointer';
  const id = e.features[0].id;
  if (id !== hoveredId) { setHover(hoveredId, false); setHover(id, true); hoveredId = id; }
});
map.on('mouseleave', 'district-fill', () => {
  map.getCanvas().style.cursor = '';
  setHover(hoveredId, false); hoveredId = null;
});
map.on('click', 'district-fill', e => {
  // 点在线路（加宽命中层）或地铁站上：交给线路/站点处理，不弹分区卡
  if (map.getLayer('mtr-hit') &&
      map.queryRenderedFeatures(e.point, { layers: ['mtr-hit', 'bus-hit', 'lrt-hit', 'tram-hit'] }).length) return;
  if (map.getLayer('mtr-station') &&
      map.queryRenderedFeatures(e.point, { layers: ['mtr-station'] }).length) return;
  const p = e.features[0].properties;
  // 再次点击已展开的同一分区：信息卡弹回（收起）
  if (panel.classList.contains('open') && openDistrictName === p.CNAME_S) {
    closeDistrictPanel();
    return;
  }
  openDistrictPanel(p.CNAME_S, p.ENAME);
});
map.on('click', e => { if (!e.defaultPrevented) closePopup(); });

// ── 右侧分区信息卡 ───────────────────────────────────────
const panel = document.getElementById('districtPanel');
let openDistrictName = null;
function closeDistrictPanel() {
  panel.classList.remove('open');
  filterPanel.classList.remove('nudge'); // 筛选弹窗回到原位
  openDistrictName = null;
}
function openDistrictPanel(name, en) {
  document.getElementById('panelName').textContent = name;
  document.getElementById('panelEn').textContent = (en || '').toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  document.getElementById('panelDesc').textContent = DISTRICT_DESC[name] || '';
  const list = document.getElementById('panelPois');
  const pois = window.HK_POIS.filter(p => p.district === name);
  list.innerHTML = pois.length
    ? pois.map(p => {
        const cat = catById[p.cat];
        return `<div class="panel-poi" data-id="${p.id}">
                  <span class="dot" style="background:${cat.color}"></span>
                  <span class="p-name">${p.name}</span>
                  <span class="p-cat">${cat.name}</span>
                </div>`;
      }).join('')
    : '<div class="panel-empty">暂无标注，欢迎在 data/pois.js 中补充</div>';
  list.querySelectorAll('.panel-poi').forEach(row => {
    row.addEventListener('click', () => {
      const poi = window.HK_POIS.find(p => p.id === row.dataset.id);
      if (poi) flyToPoi(poi);
    });
  });
  openDistrictName = name;
  panel.classList.add('open');
  filterPanel.classList.add('nudge'); // 筛选弹窗保持展开、平移到信息卡左侧
}
document.getElementById('panelClose').addEventListener('click', closeDistrictPanel);

// ── 地铁层：线路走向 + 选线高亮（选中加粗发光，其余变浅） ──────
let mtrSel = null;
const MTR_NONE = ['==', ['get', 'id'], '__none__'];

// 命中层加宽后多线易重叠：选离点击处最近的线（经度按纬度做等距修正）
function nearestLineFeature(lngLat, features) {
  const kx = Math.cos(lngLat[1] * Math.PI / 180);
  const d2Seg = (p, a, b) => {
    const px = (p[0] - a[0]) * kx, py = p[1] - a[1];
    const bx = (b[0] - a[0]) * kx, by = b[1] - a[1];
    const t = Math.max(0, Math.min(1, (px * bx + py * by) / (bx * bx + by * by || 1)));
    return (px - t * bx) ** 2 + (py - t * by) ** 2;
  };
  let best = features[0], bd = Infinity;
  for (const f of features) {
    const c = f.geometry.coordinates;
    for (let i = 0; i < c.length - 1; i++) {
      const d = d2Seg(lngLat, c[i], c[i + 1]);
      if (d < bd) { bd = d; best = f; }
    }
  }
  return best;
}

// 站名 → 所在线路：同名站出现在 ≥2 条线即换乘站
const stationLines = {};
window.HK_MTR_LINES.forEach(l => l.stations.forEach(s => {
  (stationLines[s.name] = stationLines[s.name] || new Set()).add(l.id);
}));
const linesAt = name => [...(stationLines[name] || [])].map(x =>
  window.HK_MTR_LINES.find(l => l.id === x));

function addMtrLayers() {
  if (!window.HK_MTR_LINES || !window.HK_MTR_LINES.length) return;
  const lineFc = {
    type: 'FeatureCollection',
    features: window.HK_MTR_LINES.map(l => ({
      type: 'Feature',
      properties: { id: l.id, zh: l.zh, color: l.color },
      geometry: { type: 'LineString', coordinates: l.coords },
    })),
  };
  const stopFc = {
    type: 'FeatureCollection',
    features: window.HK_MTR_LINES.flatMap(l => l.stations.map(s => ({
      type: 'Feature',
      properties: { line: l.id, zh: l.zh, name: s.name, color: l.color,
                    interchange: (stationLines[s.name] || []).length >= 2 },
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    }))),
  };
  map.addSource('mtr', { type: 'geojson', data: lineFc });
  map.addSource('mtr-stations', { type: 'geojson', data: stopFc });
  map.addLayer({ id: 'mtr-halo', type: 'line', source: 'mtr', filter: MTR_NONE,
    paint: { 'line-color': '#FFF8E0', 'line-width': 10, 'line-opacity': 0.55, 'line-blur': 1.5 } });
  map.addLayer({ id: 'mtr-line', type: 'line', source: 'mtr',
    paint: { 'line-color': ['get', 'color'], 'line-width': 2.5, 'line-opacity': 0.85 } });
  // 透明加宽命中层：扩大线路点击范围（不可见，但参与要素查询）
  map.addLayer({ id: 'mtr-hit', type: 'line', source: 'mtr',
    paint: { 'line-width': 16, 'line-opacity': 0 } });
  map.addLayer({ id: 'mtr-station', type: 'circle', source: 'mtr-stations', filter: MTR_NONE,
    paint: { 'circle-radius': 4.5, 'circle-color': '#FFFDF2',
             'circle-stroke-color': ['get', 'color'], 'circle-stroke-width': 2.5 } });
  // 换乘站：外加一圈光环
  map.addLayer({ id: 'mtr-station-ring', type: 'circle', source: 'mtr-stations', filter: MTR_NONE,
    paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,253,242,0.15)',
             'circle-stroke-color': '#FFFDF2', 'circle-stroke-width': 1.8 } });
  // 站名标签（symbol 层自带防重叠；换乘站金色）
  map.addLayer({ id: 'mtr-station-label', type: 'symbol', source: 'mtr-stations', filter: MTR_NONE,
    layout: { 'text-field': ['get', 'name'],
              'text-font': ['Noto Sans Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10.5, 13, 12.5],
              'text-offset': [1.1, 0],
              'text-anchor': 'left',
              'text-allow-overlap': false,
              'text-padding': 2 },
    paint: { 'text-color': ['case', ['get', 'interchange'], '#FFE9A8', '#FFF9E6'],
             'text-halo-color': '#3A2E1A', 'text-halo-width': 1.6 } });

  map.on('mouseenter', 'mtr-hit', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'mtr-hit', () => { map.getCanvas().style.cursor = ''; });
  map.on('click', 'mtr-station', e => {
    e.preventDefault();
    closePopup();
    const f = e.features[0].properties;
    const others = linesAt(f.name).filter(l => l.id !== f.line);
    const xfer = others.length ? `<div class="pop-xfer">↔ 可换乘：${others.map(l => l.zh).join('、')}</div>` : '';
    activePopup = new maplibregl.Popup({ className: 'genshin-popup', offset: 12, closeButton: false, maxWidth: '220px' })
      .setLngLat(e.lngLat)
      .setHTML(`<div class="pop-head">
          <span class="pop-dot" style="background:${f.color}"></span>
          <span><span class="pop-name">${f.name}站</span><div class="pop-en">${f.zh}</div></span>
        </div>${xfer}`)
      .addTo(map);
  });
  map.on('mouseenter', 'mtr-station', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'mtr-station', () => { map.getCanvas().style.cursor = ''; });
}

function applyMtrSelection() {
  const sel = mtrSel;
  const eqSel = ['==', ['get', 'id'], sel || '__none__'];
  const selLine = ['==', ['get', 'line'], sel || '__none__'];
  map.setFilter('mtr-halo', sel ? eqSel : MTR_NONE);
  map.setFilter('mtr-station', sel ? selLine : MTR_NONE);
  map.setFilter('mtr-station-ring', ['all', selLine, ['==', ['get', 'interchange'], true]]);
  map.setFilter('mtr-station-label', sel ? selLine : MTR_NONE);
  applyTransitStyles();
}

// ── 四系统选线联动样式（唯一写入口：任何系统选中，其余整体退后） ──
function applyTransitStyles() {
  const anySel = !!(mtrSel || busSel || lrtSel || tramSel);
  if (map.getLayer('mtr-line')) {
    const eqSel = ['==', ['get', 'id'], mtrSel || '__none__'];
    map.setPaintProperty('mtr-line', 'line-width', mtrSel ? ['case', eqSel, 5, 2] : 2.5);
    map.setPaintProperty('mtr-line', 'line-opacity', mtrSel ? ['case', eqSel, 1, 0.4] : (anySel ? 0.4 : 0.85));
  }
  if (map.getLayer('bus-line')) {
    const eqSel = ['==', ['get', 'id'], busSel || '__none__'];
    map.setPaintProperty('bus-line', 'line-width', busSel ? ['case', eqSel, 4.5, 1.8] : (mtrSel ? 1.8 : 2.4));
    map.setPaintProperty('bus-line', 'line-opacity', busSel ? ['case', eqSel, 1, 0.4] : (anySel ? 0.3 : 0.7));
  }
  if (map.getLayer('lrt-line')) {
    map.setPaintProperty('lrt-line', 'line-width', lrtSel ? 1.6 : 2.2);
    map.setPaintProperty('lrt-line', 'line-opacity', lrtSel ? 0.15 : (anySel ? 0.3 : 0.8));
  }
  if (map.getLayer('tram-line')) {
    map.setPaintProperty('tram-line', 'line-width', tramSel ? 1.6 : 2.2);
    map.setPaintProperty('tram-line', 'line-opacity', tramSel ? 0.15 : (anySel ? 0.3 : 0.8));
  }
  document.querySelectorAll('.mtr-row').forEach(r => r.classList.toggle('sel', r.dataset.id === mtrSel));
  document.querySelectorAll('.bus-row').forEach(r => r.classList.toggle('sel', r.dataset.id === busSel));
  document.querySelectorAll('.lrt-row').forEach(r => r.classList.toggle('sel', r.dataset.id === lrtSel));
  document.querySelectorAll('.tram-row').forEach(r => r.classList.toggle('sel', r.dataset.id === tramSel));
}

// 按坐标序列的包围盒自适应缩放（地铁/巴士选线共用）
function fitToCoords(coords) {
  let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < mnx) mnx = lng;
    if (lng > mxx) mxx = lng;
    if (lat < mny) mny = lat;
    if (lat > mxy) mxy = lat;
  }
  map.fitBounds([[mnx, mny], [mxx, mxy]], { padding: 70, duration: 800, maxZoom: 12.6 });
}

function selectMtr(id) {
  if (busSel) { busSel = null; applyBusSelection(); } // 与巴士选线互斥
  if (lrtSel) { lrtSel = null; applyLrtSelection(); } // 与轻铁选线互斥
  if (tramSel) { tramSel = null; applyTramSelection(); } // 与电车选线互斥
  mtrSel = mtrSel === id ? null : id;
  applyMtrSelection();
  if (mtrSel) { // 按线路包围盒自适应缩放，完整展现整条地铁线
    fitToCoords(window.HK_MTR_LINES.find(x => x.id === mtrSel).coords);
  }
}

function buildMtrPanel() {
  if (!window.HK_MTR_LINES || !window.HK_MTR_LINES.length) return;
  const list = document.getElementById('mtrList');
  list.innerHTML = window.HK_MTR_LINES.map(l =>
    `<div class="mtr-row" data-id="${l.id}" title="点击${mtrSel === l.id ? '取消' : ''}选择该线">
       <span class="mtr-swatch" style="--c:${l.color}"></span>
       <span class="mtr-name">${l.zh}</span>
       <span class="mtr-en">${l.en}</span>
     </div>`).join('');
  list.querySelectorAll('.mtr-row').forEach(row =>
    row.addEventListener('click', () => selectMtr(row.dataset.id)));
}

// ── 观光巴士层：选线高亮 + 详情弹窗（与地铁选线互斥） ────────
let busSel = null;
const BUS_NONE = ['==', ['get', 'id'], '__none__'];
let busBadge = null;

function addBusLayers() {
  if (!window.HK_BUS_LINES || !window.HK_BUS_LINES.length) return;
  const fc = {
    type: 'FeatureCollection',
    features: window.HK_BUS_LINES.map(l => ({
      type: 'Feature', properties: { id: l.id, num: l.num, color: l.color },
      geometry: { type: 'LineString', coordinates: l.coords },
    })),
  };
  map.addSource('buses', { type: 'geojson', data: fc });
  map.addLayer({ id: 'bus-halo', type: 'line', source: 'buses', filter: BUS_NONE,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': '#FFF8E0', 'line-width': 9, 'line-opacity': 0.5, 'line-blur': 1.5 } });
  map.addLayer({ id: 'bus-line', type: 'line', source: 'buses',
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 2.4, 'line-opacity': 0.7 } });
  // 透明加宽命中层：扩大线路点击范围
  map.addLayer({ id: 'bus-hit', type: 'line', source: 'buses',
    layout: { 'line-cap': 'round' },
    paint: { 'line-width': 14, 'line-opacity': 0 } });

  map.on('mouseenter', 'bus-hit', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'bus-hit', () => { map.getCanvas().style.cursor = ''; });
}

function applyBusSelection() {
  const sel = busSel;
  const eqSel = ['==', ['get', 'id'], sel || '__none__'];
  map.setFilter('bus-halo', sel ? eqSel : BUS_NONE);
  applyTransitStyles();
  // 选中线路中点放置号牌
  if (busBadge) { busBadge.remove(); busBadge = null; }
  if (sel) {
    const l = window.HK_BUS_LINES.find(x => x.id === sel);
    const mid = l.coords[Math.floor(l.coords.length / 2)];
    const el = document.createElement('div');
    el.className = 'bus-badge';
    el.style.setProperty('--c', l.color);
    el.textContent = l.num;
    busBadge = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(mid).addTo(map);
  }
}

function selectBus(id) {
  busSel = busSel === id ? null : id;
  if (busSel && mtrSel) { mtrSel = null; applyMtrSelection(); } // 与地铁选线互斥
  if (busSel && lrtSel) { lrtSel = null; applyLrtSelection(); } // 与轻铁选线互斥
  if (busSel && tramSel) { tramSel = null; applyTramSelection(); } // 与电车选线互斥
  applyBusSelection();
}

function buildBusPanel() {
  if (!window.HK_BUS_LINES || !window.HK_BUS_LINES.length) return;
  const list = document.getElementById('busList');
  list.innerHTML = window.HK_BUS_LINES.map(l =>
    `<div class="mtr-row bus-row" data-id="${l.id}" title="${l.from} ↔ ${l.to}">
       <span class="bus-num" style="--c:${l.color}">${l.num}</span>
       <span class="bus-name">${l.from} ↔ ${l.to}</span>
     </div>`).join('');
  list.querySelectorAll('.bus-row').forEach(row =>
    row.addEventListener('click', () => {
      selectBus(row.dataset.id);
      const l = window.HK_BUS_LINES.find(x => x.id === row.dataset.id);
      if (busSel === l.id) fitToCoords(l.coords); // 选中时飞到线路包围盒
    }));
}

function openBusPopup(l, fly) {
  closePopup();
  const mid = l.coords[Math.floor(l.coords.length / 2)];
  if (fly) { // 按线路包围盒自适应缩放，完整展现整条巴士线
    let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
    for (const [lng, lat] of l.coords) {
      if (lng < mnx) mnx = lng;
      if (lng > mxx) mxx = lng;
      if (lat < mny) mny = lat;
      if (lat > mxy) mxy = lat;
    }
    map.fitBounds([[mnx, mny], [mxx, mxy]], { padding: 70, duration: 800, maxZoom: 12.6 });
  }
  const tips = [];
  if (l.highlights) tips.push(['看点', l.highlights]);
  if (l.seat) tips.push(['选位', l.seat]);
  activePopup = new maplibregl.Popup({ className: 'genshin-popup', offset: 16, closeButton: false, maxWidth: '280px' })
    .setLngLat(mid)
    .setHTML(`
      <div class="pop-head">
        <span class="pop-dot" style="background:${l.color}"></span>
        <span><span class="pop-name">${l.operator} ${l.num}</span><div class="pop-en">${l.from} ↔ ${l.to}</div></span>
      </div>
      <div class="pop-rows">
        <div class="pop-row"><span class="k">票价</span><span class="v">${l.price}</span></div>
        <div class="pop-row"><span class="k">车程</span><span class="v">${l.duration}</span></div>
      </div>
      ${tips.map(t => `<div class="pop-tip"><span class="k">${t[0]}</span>${t[1]}</div>`).join('')}`)
    .addTo(map);
}

// ── 轻铁线路（数据来源 OSM，西北新区有轨网络） ─────────────
let lrtSel = null;
const LRT_NONE = ['==', ['get', 'num'], '__none__'];

function addLrtLayers() {
  if (!window.HK_LRT_LINES || !window.HK_LRT_LINES.length) return;
  const fc = {
    type: 'FeatureCollection',
    features: window.HK_LRT_LINES.map(l => ({
      type: 'Feature', properties: { id: l.id, num: l.num, color: l.color },
      geometry: { type: 'LineString', coordinates: l.coords },
    })),
  };
  map.addSource('lrt', { type: 'geojson', data: fc });
  // 轻铁绘制在最底层（地铁/巴士压在其上）
  map.addLayer({ id: 'lrt-halo', type: 'line', source: 'lrt', filter: LRT_NONE,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': '#FFF8E0', 'line-width': 7, 'line-opacity': 0.5, 'line-blur': 1.5 } });
  map.addLayer({ id: 'lrt-line', type: 'line', source: 'lrt',
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 2.2, 'line-opacity': 0.8 } });
  // 选中层：选线时提到最上实色显示（共走廊的半透明叠线会洗掉高亮）
  map.addLayer({ id: 'lrt-sel', type: 'line', source: 'lrt', filter: LRT_NONE,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.95 } });
  map.addLayer({ id: 'lrt-hit', type: 'line', source: 'lrt',
    layout: { 'line-cap': 'round' },
    paint: { 'line-width': 14, 'line-opacity': 0 } });

  map.on('mouseenter', 'lrt-hit', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'lrt-hit', () => { map.getCanvas().style.cursor = ''; });
}

function applyLrtSelection() {
  const sel = lrtSel;
  const eqSel = ['==', ['get', 'id'], sel || '__none__'];
  map.setFilter('lrt-sel', sel ? eqSel : LRT_NONE);
  map.setFilter('lrt-halo', sel ? eqSel : LRT_NONE);
  applyTransitStyles();
}

function selectLrt(id) {
  if (mtrSel) { mtrSel = null; applyMtrSelection(); }   // 与地铁/巴士/电车选线互斥
  if (busSel) { busSel = null; applyBusSelection(); }
  if (tramSel) { tramSel = null; applyTramSelection(); }
  lrtSel = lrtSel === id ? null : id;
  applyLrtSelection();
  if (lrtSel) fitToCoords(window.HK_LRT_LINES.find(x => x.id === lrtSel).coords);
}

function buildLrtPanel() {
  if (!window.HK_LRT_LINES || !window.HK_LRT_LINES.length) return;
  const list = document.getElementById('lrtList');
  list.innerHTML = window.HK_LRT_LINES.map(l =>
    `<div class="mtr-row bus-row lrt-row" data-id="${l.id}" title="${l.from === l.to ? l.from : l.from + ' ↔ ' + l.to}">
       <span class="bus-num" style="--c:${l.color}">${l.num}</span>
       <span class="bus-name">${l.from === l.to ? l.from : l.from + ' ↔ ' + l.to}</span>
     </div>`).join('');
  list.querySelectorAll('.lrt-row').forEach(row =>
    row.addEventListener('click', () => {
      selectLrt(row.dataset.id);
      const l = window.HK_LRT_LINES.find(x => x.id === row.dataset.id);
      if (lrtSel === l.id) fitToCoords(l.coords);
    }));
}

function openLrtPopup(l) {
  closePopup();
  const mid = l.coords[Math.floor(l.coords.length / 2)];
  activePopup = new maplibregl.Popup({ className: 'genshin-popup', offset: 16, closeButton: false, maxWidth: '280px' })
    .setLngLat(mid)
    .setHTML(`
      <div class="pop-head">
        <span class="pop-dot" style="background:${l.color}"></span>
        <span><span class="pop-name">轻铁 ${l.num}</span><div class="pop-en">${l.from} ↔ ${l.to}</div></span>
      </div>
      ${l.note ? `<div class="pop-tip"><span class="k">看点</span>${l.note}</div>` : ''}`)
    .addTo(map);
}

// ── 香港电车线路（港岛叮叮车，数据来源 OSM） ───────────────
let tramSel = null;
const TRAM_NONE = ['==', ['get', 'num'], '__none__'];

function addTramLayers() {
  if (!window.HK_TRAM_LINES || !window.HK_TRAM_LINES.length) return;
  const fc = {
    type: 'FeatureCollection',
    features: window.HK_TRAM_LINES.map(l => ({
      type: 'Feature', properties: { id: l.id, num: l.num, color: l.color },
      geometry: { type: 'LineString', coordinates: l.coords },
    })),
  };
  map.addSource('tram', { type: 'geojson', data: fc });
  map.addLayer({ id: 'tram-halo', type: 'line', source: 'tram', filter: TRAM_NONE,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': '#FFF8E0', 'line-width': 7, 'line-opacity': 0.5, 'line-blur': 1.5 } });
  map.addLayer({ id: 'tram-line', type: 'line', source: 'tram',
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 2.2, 'line-opacity': 0.8 } });
  // 选中层：选线时提到最上实色显示（六线共走廊，半透明叠线会洗掉高亮）
  map.addLayer({ id: 'tram-sel', type: 'line', source: 'tram', filter: TRAM_NONE,
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.95 } });
  map.addLayer({ id: 'tram-hit', type: 'line', source: 'tram',
    layout: { 'line-cap': 'round' },
    paint: { 'line-width': 14, 'line-opacity': 0 } });

  map.on('mouseenter', 'tram-hit', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'tram-hit', () => { map.getCanvas().style.cursor = ''; });
}

// ── 线路点击统一处理：四系统命中区重叠时全系统取最近线，避免互相清选 ──
map.on('click', e => {
  // 点在地铁站圆点上：交给 mtr-station 处理器弹站点弹窗
  if (map.getLayer('mtr-station') &&
      map.queryRenderedFeatures(e.point, { layers: ['mtr-station'] }).length) return;
  const seen = new Set(); const cands = [];
  for (const layer of ['mtr-hit', 'bus-hit', 'lrt-hit', 'tram-hit']) {
    if (!map.getLayer(layer)) continue;
    for (const f of map.queryRenderedFeatures(e.point, { layers: [layer] })) {
      if (!seen.has(f.properties.id)) { seen.add(f.properties.id); cands.push(f); }
    }
  }
  if (!cands.length) return;
  closePopup();
  const id = nearestLineFeature([e.lngLat.lng, e.lngLat.lat], cands).properties.id;
  if (id.startsWith('lr-')) {
    selectLrt(id);
    if (lrtSel === id) openLrtPopup(window.HK_LRT_LINES.find(l => l.id === id));
  } else if (id.startsWith('tram-')) {
    selectTram(id);
    if (tramSel === id) openTramPopup(window.HK_TRAM_LINES.find(l => l.id === id));
  } else if (id.startsWith('b-')) {
    selectBus(id);
    if (busSel === id) openBusPopup(window.HK_BUS_LINES.find(l => l.id === id));
  } else {
    selectMtr(id);
  }
});

function applyTramSelection() {
  const sel = tramSel;
  const eqSel = ['==', ['get', 'id'], sel || '__none__'];
  map.setFilter('tram-sel', sel ? eqSel : TRAM_NONE);
  map.setFilter('tram-halo', sel ? eqSel : TRAM_NONE);
  applyTransitStyles();
}

function selectTram(id) {
  if (mtrSel) { mtrSel = null; applyMtrSelection(); }   // 与地铁/巴士/轻铁选线互斥
  if (busSel) { busSel = null; applyBusSelection(); }
  if (lrtSel) { lrtSel = null; applyLrtSelection(); }
  tramSel = tramSel === id ? null : id;
  applyTramSelection();
  if (tramSel) fitToCoords(window.HK_TRAM_LINES.find(x => x.id === tramSel).coords);
}

function buildTramPanel() {
  if (!window.HK_TRAM_LINES || !window.HK_TRAM_LINES.length) return;
  const list = document.getElementById('tramList');
  list.innerHTML = window.HK_TRAM_LINES.map(l =>
    `<div class="mtr-row bus-row tram-row" data-id="${l.id}" title="${l.from} ↔ ${l.to}">
       <span class="bus-num" style="--c:${l.color}">${l.num}</span>
       <span class="bus-name">${l.from} ↔ ${l.to}</span>
     </div>`).join('');
  list.querySelectorAll('.tram-row').forEach(row =>
    row.addEventListener('click', () => {
      selectTram(row.dataset.id);
      const l = window.HK_TRAM_LINES.find(x => x.id === row.dataset.id);
      if (tramSel === l.id) fitToCoords(l.coords);
    }));
}

function openTramPopup(l) {
  closePopup();
  const mid = l.coords[Math.floor(l.coords.length / 2)];
  activePopup = new maplibregl.Popup({ className: 'genshin-popup', offset: 16, closeButton: false, maxWidth: '280px' })
    .setLngLat(mid)
    .setHTML(`
      <div class="pop-head">
        <span class="pop-dot" style="background:${l.color}"></span>
        <span><span class="pop-name">电车 ${l.num}</span><div class="pop-en">${l.from} ↔ ${l.to}</div></span>
      </div>
      ${l.note ? `<div class="pop-tip"><span class="k">看点</span>${l.note}</div>` : ''}`)
    .addTo(map);
}

// ── 左侧分类面板 ─────────────────────────────────────────
function toggleCat(catId, forceOn) {
  visible[catId] = forceOn === true ? true : !visible[catId];
  for (const m of markersByCat[catId]) m.getElement().style.display = visible[catId] ? '' : 'none';
  const row = document.querySelector(`.cat-row[data-cat="${catId}"]`);
  row.classList.toggle('off', !visible[catId]);
  row.querySelector('.cat-eye').innerHTML = visible[catId] ? EYE_ON : EYE_OFF;
  if (!visible[catId]) closePopup();
}

// ── 飞向标点并弹出详情（分区卡列表 / 侧栏分类列表共用） ──────
function flyToPoi(poi) {
  if (!visible[poi.cat]) toggleCat(poi.cat, true);
  closePopup();
  // 立即弹出详情（弹窗锚定坐标，随相机一起飞），相机随后跟上
  const el = markersByCat[poi.cat].find(m => m.getElement().dataset.pid === poi.id);
  if (el) el.getElement().click();
  map.flyTo({ center: [poi.lng, poi.lat], zoom: 13, speed: 1.4 });
}

function buildSidebar() {
  const list = document.getElementById('catList');
  const CARET = '<svg viewBox="0 0 24 24"><path d="M9 6 L15 12 L9 18"/></svg>';
  list.innerHTML = window.HK_CATEGORIES.map(cat => {
    const pois = window.HK_POIS.filter(p => p.cat === cat.id);
    // 景点/图书馆/大学/口岸：行首图标用地图同款图钉；其余保持圆形色片
    const ico = TEARDROP_CATS[cat.id] ? teardropSvg(cat.id)
      : cat.id === 'port'
        ? '<img class="cat-port-img" src="assets/port-anchor-final.png" alt="">'
        : ICONS[cat.id];
    return `<div class="cat-row" data-cat="${cat.id}">
              <span class="cat-caret" title="展开/收起标点列表">${CARET}</span>
              <span class="cat-ico cat-${cat.id}" style="--c:${cat.color}">${ico}</span>
              <span class="cat-name">${cat.name}</span>
              <span class="cat-count">${pois.length}</span>
              <span class="cat-eye">${EYE_ON}</span>
            </div>
            <div class="cat-pois" data-cat="${cat.id}">
              <div class="cat-pois-inner">
                ${pois.map(p => `<div class="cat-poi-row" data-id="${p.id}" title="${p.name}">
                    <span class="dot" style="background:${cat.color}"></span>
                    <span class="cp-name">${p.name}</span>
                    <span class="cp-district">${p.district || ''}</span>
                  </div>`).join('')}
              </div>
            </div>`;
  }).join('');
  updateLitCount();
  list.querySelectorAll('.cat-row').forEach(row =>
    row.addEventListener('click', () => toggleCat(row.dataset.cat)));
  // 展开/收起按键（阻止冒泡，不影响行点击的显隐切换）；默认收起
  list.querySelectorAll('.cat-caret').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const catId = btn.closest('.cat-row').dataset.cat;
    const wrap = list.querySelector(`.cat-pois[data-cat="${catId}"]`);
    btn.classList.toggle('open', wrap.classList.toggle('open'));
  }));
  // 列表项：飞向标点并弹出详情
  list.querySelectorAll('.cat-poi-row').forEach(row =>
    row.addEventListener('click', () => {
      const poi = window.HK_POIS.find(p => p.id === row.dataset.id);
      if (poi) flyToPoi(poi);
    }));
}

// ── 地铁/巴士/轻铁/电车整层显隐（板块眼睛开关，状态记忆） ───
const MTRVIS_KEY = 'hkmap-mtr-hidden', BUSVIS_KEY = 'hkmap-bus-hidden', LRTVIS_KEY = 'hkmap-lrt-hidden',
      TRAMVIS_KEY = 'hkmap-tram-hidden';
let mtrHidden = false, busHidden = false, lrtHidden = false, tramHidden = false;
try {
  mtrHidden = localStorage.getItem(MTRVIS_KEY) === '1';
  busHidden = localStorage.getItem(BUSVIS_KEY) === '1';
  lrtHidden = localStorage.getItem(LRTVIS_KEY) === '1';
  tramHidden = localStorage.getItem(TRAMVIS_KEY) === '1';
} catch (e) { /* 忽略 */ }
function applyMtrVis() {
  const vis = mtrHidden ? 'none' : 'visible';
  ['mtr-halo', 'mtr-line', 'mtr-hit', 'mtr-station', 'mtr-station-ring', 'mtr-station-label'].forEach(id => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
  });
  const eye = document.getElementById('mtrEye');
  if (eye) eye.innerHTML = mtrHidden ? ICONS.EYE_OFF : ICONS.EYE_ON;
  document.getElementById('mtrList').classList.toggle('list-hidden', mtrHidden);
  if (mtrHidden && mtrSel) { mtrSel = null; applyMtrSelection(); }
}
function applyBusVis() {
  const vis = busHidden ? 'none' : 'visible';
  ['bus-halo', 'bus-line', 'bus-hit'].forEach(id => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
  });
  const eye = document.getElementById('busEye');
  if (eye) eye.innerHTML = busHidden ? ICONS.EYE_OFF : ICONS.EYE_ON;
  document.getElementById('busList').classList.toggle('list-hidden', busHidden);
  if (busHidden && busSel) { busSel = null; applyBusSelection(); }
}
document.getElementById('mtrEye').addEventListener('click', () => {
  mtrHidden = !mtrHidden;
  try { localStorage.setItem(MTRVIS_KEY, mtrHidden ? '1' : '0'); } catch (e) { /* 忽略 */ }
  applyMtrVis();
});
document.getElementById('busEye').addEventListener('click', () => {
  busHidden = !busHidden;
  try { localStorage.setItem(BUSVIS_KEY, busHidden ? '1' : '0'); } catch (e) { /* 忽略 */ }
  applyBusVis();
});
function applyLrtVis() {
  const vis = lrtHidden ? 'none' : 'visible';
  ['lrt-halo', 'lrt-line', 'lrt-sel', 'lrt-hit'].forEach(id => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
  });
  const eye = document.getElementById('lrtEye');
  if (eye) eye.innerHTML = lrtHidden ? ICONS.EYE_OFF : ICONS.EYE_ON;
  document.getElementById('lrtList').classList.toggle('list-hidden', lrtHidden);
  if (lrtHidden && lrtSel) { lrtSel = null; applyLrtSelection(); }
}
document.getElementById('lrtEye').addEventListener('click', () => {
  lrtHidden = !lrtHidden;
  try { localStorage.setItem(LRTVIS_KEY, lrtHidden ? '1' : '0'); } catch (e) { /* 忽略 */ }
  applyLrtVis();
});
function applyTramVis() {
  const vis = tramHidden ? 'none' : 'visible';
  ['tram-halo', 'tram-line', 'tram-sel', 'tram-hit'].forEach(id => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
  });
  const eye = document.getElementById('tramEye');
  if (eye) eye.innerHTML = tramHidden ? ICONS.EYE_OFF : ICONS.EYE_ON;
  document.getElementById('tramList').classList.toggle('list-hidden', tramHidden);
  if (tramHidden && tramSel) { tramSel = null; applyTramSelection(); }
}
document.getElementById('tramEye').addEventListener('click', () => {
  tramHidden = !tramHidden;
  try { localStorage.setItem(TRAMVIS_KEY, tramHidden ? '1' : '0'); } catch (e) { /* 忽略 */ }
  applyTramVis();
});

// ── 缩放滑杆（原神样式）：菱形滑块拖拽 / 点轨道跳转 / ± 按钮 ──
const MINZ = 9.5, MAXZ = 15.5;
const THUMB = 30; // 菱形旋转后的外接尺寸
const zoomTrack = document.getElementById('zoomTrack');
const zoomThumb = document.getElementById('zoomThumb');

function updateThumb() {
  const t = Math.min(1, Math.max(0, (map.getZoom() - MINZ) / (MAXZ - MINZ)));
  zoomThumb.style.top = (THUMB / 2 + t * (zoomTrack.clientHeight - THUMB)) + 'px';
}
map.on('zoom', updateThumb);
map.on('load', updateThumb);

document.getElementById('zoomIn').addEventListener('click', () => map.zoomIn({ duration: 260 }));
document.getElementById('zoomOut').addEventListener('click', () => map.zoomOut({ duration: 260 }));
document.getElementById('resetView').addEventListener('click', () =>
  map.flyTo({ ...INIT_VIEW, speed: 1.2 }));

let thumbDrag = false;
zoomThumb.addEventListener('pointerdown', e => {
  thumbDrag = true;
  zoomThumb.setPointerCapture(e.pointerId);
  e.stopPropagation();
});
zoomThumb.addEventListener('pointermove', e => {
  if (!thumbDrag) return;
  const rect = zoomTrack.getBoundingClientRect();
  const y = Math.min(Math.max(e.clientY - rect.top, THUMB / 2), rect.height - THUMB / 2);
  const t = (y - THUMB / 2) / (rect.height - THUMB);
  map.jumpTo({ zoom: MINZ + t * (MAXZ - MINZ) });
});
zoomThumb.addEventListener('pointerup', () => { thumbDrag = false; });
zoomThumb.addEventListener('pointercancel', () => { thumbDrag = false; });
zoomTrack.addEventListener('pointerdown', e => {
  if (e.target === zoomThumb) return; // 滑块拖拽自行处理
  const rect = zoomTrack.getBoundingClientRect();
  const y = Math.min(Math.max(e.clientY - rect.top, THUMB / 2), rect.height - THUMB / 2);
  const t = (y - THUMB / 2) / (rect.height - THUMB);
  map.flyTo({ zoom: MINZ + t * (MAXZ - MINZ), duration: 420 });
});

// ── 标注筛选弹窗（右下星芒按钮开关；弹窗不阻挡地图交互） ─────
const starBtn = document.getElementById('starToggle');
const filterPanel = document.getElementById('filterPanel');
let filterOpen = false;
function applyFilterPanel() {
  filterPanel.classList.toggle('open', filterOpen);
}
starBtn.addEventListener('click', () => {
  filterOpen = !filterOpen;
  if (filterOpen) closeDistrictPanel(); // 打开筛选弹窗时收起分区信息卡
  applyFilterPanel();
});

map.on('load', () => {
  updateNameVisibility();
  addWavePattern();
  addLrtLayers();     // 轻铁在最底层（地铁/巴士压在其上）
  addTramLayers();    // 电车在轻铁之上
  addMtrLayers();
  buildMtrPanel();
  addBusLayers();
  buildBusPanel();
  buildLrtPanel();
  buildTramPanel();
  applyMtrVis();
  applyBusVis();
  applyLrtVis();
  applyTramVis();
  makeDistrictLabels();
  window.HK_POIS.forEach(makePoiMarker);
  buildSidebar();
  const veil = document.getElementById('veil');
  veil.classList.add('hide');
  setTimeout(() => veil.remove(), 900);
});
// 瓦片网络不佳时的兜底：8 秒后无论如何揭开幕布
setTimeout(() => { const v = document.getElementById('veil'); if (v) { v.classList.add('hide'); setTimeout(() => v.remove(), 900); } }, 8000);
