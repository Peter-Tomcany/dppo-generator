/**
 * DPPO 2025 – Hlavná aplikácia
 * Stav, UI rendering, tab management
 */

// ============ STATE ============
let header = defaultHeader();
let rows = {};
let tabARows = {};
let loaded = false;
let fileName = '';
let activeTab = 'data';
let xmlPreview = '';

function defaultHeader() {
  return {
    dic: '', ico: '', pravnaForma: '112',
    skNaceK1: '', skNaceK2: '', skNaceK3: '', skNaceCinnost: '',
    obchodneMeno: '',
    sidloUlica: '', sidloCislo: '', sidloPsc: '', sidloObec: '',
    sidloStat: 'Slovenská republika', sidloTel: '', sidloEmail: '',
    zdanObdOd: '1.1.2025', zdanObdDo: '31.12.2025',
    rdp: 1, odp: 0, ddp: 0,
    uplatnujemPar17: 0, ukoncujemPar17: 0, obmedzenie: 0, prepojenie: 0,
    oslobodenie13ab: 0, mikrodanovnik: 0, polovicna46b3: 0,
    neplatenie46b7: 0, zapocitanie46b5: 0,
    spUlica: '', spCislo: '', spPsc: '', spObec: '', spPocet: '',
    opPriezvisko: '', opMeno: '', opTitul: '', opTitulZa: '',
    opPostavenie: 'konateľ',
    opUlica: '', opCislo: '', opPsc: '', opObec: '',
    opStat: 'Slovenská republika', opTel: '', opEmail: '',
    pocetPriloh: '5', datumVyhlasenia: '',
    c7paragraf50: 0, suhlasZasl: 0,
    osobitneZaznamy: '',
  };
}

// ============ FILE HANDLING ============
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadArea').classList.remove('drag');
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadArea').classList.add('drag');
}

function handleDragLeave() {
  document.getElementById('uploadArea').classList.remove('drag');
}

function handleFileInput(e) {
  const file = e.target?.files?.[0];
  if (file) processFile(file);
}

function processFile(file) {
  fileName = file.name;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const result = parseExcelFile(e.target.result);

      // Merge parsed header into state
      Object.assign(header, result.header);
      rows = result.rows;
      tabARows = result.tabARows;

      loaded = true;
      renderApp();
    } catch (err) {
      alert('Chyba pri načítaní: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ============ ACTIONS ============
function doGenerate() {
  xmlPreview = generateXml(header, rows, tabARows);
  switchTab('xml');
}

function doDownload() {
  const xml = generateXml(header, rows, tabARows);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = header.obchodneMeno
    ? header.obchodneMeno.replace(/[^a-zA-Z0-9áäčďéíľĺňóôŕšťúýžÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ ]/g, '_').replace(/ /g, '_')
    : '';
  a.download = safeName ? 'DPPO_2025_' + safeName + '.xml' : 'DPPO_2025.xml';
  a.click();
  URL.revokeObjectURL(url);
}

function resetApp() {
  header = defaultHeader();
  rows = {};
  tabARows = {};
  loaded = false;
  fileName = '';
  xmlPreview = '';
  renderApp();
  document.getElementById('uploadArea').style.display = 'block';
}

// ============ UPDATE FUNCTIONS ============
function updateHeader(key, val) {
  header[key] = val;
}

function updateRow(rNum, val) {
  if (val === '') { rows[rNum] = ''; return; }
  const n = Number(String(val).replace(',', '.'));
  rows[rNum] = isNaN(n) ? val : n;
}

function updateTabA(key, val) {
  if (val === '') { tabARows[key] = ''; return; }
  const n = Number(String(val).replace(',', '.'));
  tabARows[key] = isNaN(n) ? val : n;
}

// ============ TAB SWITCHING ============
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  const target = document.getElementById('tab-' + tab);
  if (target) target.style.display = 'block';

  if (tab === 'xml') {
    if (!xmlPreview) xmlPreview = generateXml(header, rows, tabARows);
    renderXmlTab();
  }
}

// ============ RENDER ============
function renderApp() {
  document.getElementById('uploadArea').style.display = loaded ? 'none' : 'block';
  document.getElementById('topActions').style.display = loaded ? 'flex' : 'none';
  document.getElementById('tabBar').style.display = loaded ? 'flex' : 'none';

  if (loaded) {
    renderDataTab();
    renderHeaderTab();
    renderOsobaTab();
    renderXmlTab();
    switchTab('data');
  }
}

// --- Data tab ---
function renderDataTab() {
  const nonZero = ROW_MAP.filter(([rn]) => {
    const v = rows[rn];
    return v !== null && v !== undefined && v !== 0 && v !== '';
  }).length;

  let html = '';

  // Info bar
  html += '<div class="card info-bar">';
  html += '<span class="label">Načítané z:</span> <span class="value">' + esc(fileName) + '</span>';
  html += '<span class="count">(' + nonZero + ' nenulových riadkov)</span>';
  html += '<button class="btn btn-gray btn-sm" onclick="resetApp()">Nový súbor</button>';
  html += '</div>';

  // Main rows
  html += '<div class="card">';
  html += '<h3 class="section-title">II. časť – Výpočet základu dane a dane</h3>';
  html += '<div class="grid-table">';
  html += '<div class="th">Riadok</div><div class="th">Popis</div><div class="th th-right">Suma (EUR)</div>';

  for (const [rNum] of ROW_MAP) {
    const sh = SECTION_HEADERS[rNum];
    if (sh) html += '<div class="section-divider">' + esc(sh) + '</div>';
    const bold = BOLD_ROWS.has(rNum);
    const val = rows[rNum] ?? '';
    html += '<div class="td td-muted' + (bold ? ' td-bold' : '') + '">r.' + rNum + '</div>';
    html += '<div class="td' + (bold ? ' td-bold-w' : '') + '">' + (ROW_LABELS[rNum] || '') + '</div>';
    html += '<div class="td-num"><input class="num-input' + (bold ? ' bold' : '') + '" value="'
      + esc(val) + '" onchange="updateRow(' + rNum + ',this.value)"></div>';
  }
  html += '</div></div>';

  // Tab A
  html += '<div class="card">';
  html += '<h3 class="section-title">Tabuľka A – Nedaňové výdavky (rozpis r.130)</h3>';
  html += '<div class="grid-table">';
  html += '<div class="th">Riadok</div><div class="th">Označenie</div><div class="th th-right">Suma (EUR)</div>';
  for (let i = 1; i <= 17; i++) {
    const key = '130/A' + i;
    const val = tabARows[key] ?? '';
    html += '<div class="td td-muted">A' + i + '</div>';
    html += '<div class="td">' + key + '</div>';
    html += '<div class="td-num"><input class="num-input" value="' + esc(val)
      + '" onchange="updateTabA(\'' + key + '\',this.value)"></div>';
  }
  html += '</div></div>';

  document.getElementById('tab-data').innerHTML = html;
}

// --- Header tab ---
function renderHeaderTab() {
  const h = header;
  let html = '<div class="card">';
  html += '<h3 class="section-title">I. časť – Údaje o daňovníkovi</h3>';
  html += '<div class="form-grid">';
  html += field('DIČ', 'dic', h.dic) + field('IČO', 'ico', h.ico);
  html += field('Obchodné meno', 'obchodneMeno', h.obchodneMeno, true);
  html += field('Právna forma (kód)', 'pravnaForma', h.pravnaForma);
  html += field('SK NACE k1 (2 č.)', 'skNaceK1', h.skNaceK1);
  html += field('SK NACE k2 (2 č.)', 'skNaceK2', h.skNaceK2);
  html += field('SK NACE k3 (1 č.)', 'skNaceK3', h.skNaceK3);
  html += field('Hlavná činnosť', 'skNaceCinnost', h.skNaceCinnost);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">Sídlo</h3>';
  html += '<div class="form-grid">';
  html += field('Ulica', 'sidloUlica', h.sidloUlica) + field('Číslo', 'sidloCislo', h.sidloCislo);
  html += field('PSČ', 'sidloPsc', h.sidloPsc) + field('Obec', 'sidloObec', h.sidloObec);
  html += field('Štát', 'sidloStat', h.sidloStat) + field('Telefón', 'sidloTel', h.sidloTel);
  html += field('E-mail / Fax', 'sidloEmail', h.sidloEmail);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">Zdaňovacie obdobie a typ DP</h3>';
  html += '<div class="form-grid-3">';
  html += field('Od', 'zdanObdOd', h.zdanObdOd) + field('Do', 'zdanObdDo', h.zdanObdDo) + '<div></div>';
  html += '</div>';
  html += '<div class="check-grid" style="margin-top:12px">';
  html += check('Riadne DP', 'rdp', h.rdp);
  html += check('Opravné DP', 'odp', h.odp);
  html += check('Dodatočné DP', 'ddp', h.ddp);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">Označenia na str. 1</h3>';
  html += '<div class="check-grid">';
  html += check('Uplatňujem §17 ods. 17 (kurzové rozdiely)', 'uplatnujemPar17', h.uplatnujemPar17);
  html += check('Ukončujem uplatňovanie §17 ods. 17', 'ukoncujemPar17', h.ukoncujemPar17);
  html += check('Obmedzená daňová povinnosť', 'obmedzenie', h.obmedzenie);
  html += check('Prepojenie (závislé osoby)', 'prepojenie', h.prepojenie);
  html += check('Oslobodenie §13a / §13b', 'oslobodenie13ab', h.oslobodenie13ab);
  html += check('Mikrodaňovník §2 písm. w)', 'mikrodanovnik', h.mikrodanovnik);
  html += check('Polovičná min. daň §46b ods. 3', 'polovicna46b3', h.polovicna46b3);
  html += check('Neplatí min. daň §46b ods. 7', 'neplatenie46b7', h.neplatenie46b7);
  html += check('Započítanie min. dane §46b ods. 5', 'zapocitanie46b5', h.zapocitanie46b5);
  html += '</div></div>';

  document.getElementById('tab-header').innerHTML = html;
}

// --- Osoba tab ---
function renderOsobaTab() {
  const h = header;
  let html = '<div class="card">';
  html += '<h3 class="section-title">Oprávnená osoba</h3>';
  html += '<div class="form-grid">';
  html += field('Priezvisko', 'opPriezvisko', h.opPriezvisko);
  html += field('Meno', 'opMeno', h.opMeno);
  html += field('Titul pred', 'opTitul', h.opTitul);
  html += field('Titul za', 'opTitulZa', h.opTitulZa);
  html += field('Postavenie (napr. konateľ)', 'opPostavenie', h.opPostavenie);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">Trvalý pobyt</h3>';
  html += '<div class="form-grid">';
  html += field('Ulica', 'opUlica', h.opUlica) + field('Číslo', 'opCislo', h.opCislo);
  html += field('PSČ', 'opPsc', h.opPsc) + field('Obec', 'opObec', h.opObec);
  html += field('Štát', 'opStat', h.opStat) + field('Telefón', 'opTel', h.opTel);
  html += field('E-mail', 'opEmail', h.opEmail);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">Vyhlásenie</h3>';
  html += '<div class="form-grid">';
  html += field('Počet príloh', 'pocetPriloh', h.pocetPriloh);
  html += field('Dátum vyhlásenia (D.M.RRRR)', 'datumVyhlasenia', h.datumVyhlasenia);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">VII. časť – Poukázanie podielu dane</h3>';
  html += '<div class="check-grid">';
  html += check('Neuplatňujem §50', 'c7paragraf50', h.c7paragraf50);
  html += check('Súhlas so zaslaním údajov', 'suhlasZasl', h.suhlasZasl);
  html += '</div>';

  html += '<h3 class="section-title" style="margin-top:24px">VIII. časť – Osobitné záznamy</h3>';
  html += '<textarea class="oz-area" rows="5" onchange="header.osobitneZaznamy=this.value">'
    + esc(h.osobitneZaznamy) + '</textarea>';
  html += '</div>';

  document.getElementById('tab-osoba').innerHTML = html;
}

// --- XML tab ---
function renderXmlTab() {
  if (!xmlPreview) xmlPreview = generateXml(header, rows, tabARows);
  let html = '<div class="card">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">';
  html += '<h3 class="section-title" style="margin:0">XML náhľad</h3>';
  html += '<div style="display:flex;gap:10px">';
  html += '<button class="btn btn-blue" onclick="xmlPreview=generateXml(header,rows,tabARows);renderXmlTab()">Obnoviť</button>';
  html += '<button class="btn btn-green" onclick="doDownload()">⬇ Stiahnuť</button>';
  html += '</div></div>';
  html += '<pre class="xml-pre">' + esc(xmlPreview) + '</pre>';
  html += '</div>';
  document.getElementById('tab-xml').innerHTML = html;
}

// --- Field helpers ---
function field(label, key, val, full) {
  return '<div class="field' + (full ? ' full' : '') + '">'
    + '<label>' + esc(label) + '</label>'
    + '<input type="text" value="' + esc(val || '') + '" onchange="updateHeader(\'' + key + '\',this.value)">'
    + '</div>';
}

function check(label, key, val) {
  return '<label class="check-label">'
    + '<input type="checkbox" ' + (val ? 'checked' : '') + ' onchange="updateHeader(\'' + key + '\',this.checked?1:0)">'
    + esc(label) + '</label>';
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', function () {
  // Tab click handlers
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
});
