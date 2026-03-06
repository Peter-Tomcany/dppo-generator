/**
 * DPPO 2025 – Generátor XML
 * Generovanie XML podľa XSD schémy dppo2025_v2_xsd.xml
 */

// --- XML helpers ---
function fmtDec(v) {
  if (v === null || v === undefined || v === '' || v === 0) return '';
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? '' : n.toFixed(2);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function xmlEl(tag, val) { return '<' + tag + '>' + esc(val) + '</' + tag + '>'; }
function xmlDec(tag, val) { return '<' + tag + '>' + esc(fmtDec(val)) + '</' + tag + '>'; }

// --- Main XML generation ---
function generateXml(header, rows, tabARows) {
  const h = header;
  const rv = (n) => rows[n] ?? '';
  const t2s = () => '<s1></s1><s2></s2>';
  const pad2 = (i) => String(i).padStart(2, '0');

  // ==================== TELO ROWS ====================
  let teloRows = '';
  for (const [rNum, xmlName] of ROW_MAP) {
    if (rNum === 610) continue;
    teloRows += xmlDec(xmlName, rv(rNum)) + '\n';
  }

  // r610 – špeciálny typ (text + suma)
  const r610 = '<r610><text></text><suma>' + esc(fmtDec(rv(610))) + '</suma></r610>\n';
  teloRows = teloRows.replace('</r600>\n', '</r600>\n' + r610);

  // ddpDatum + dodatočné riadky
  teloRows += xmlEl('ddpDatum', '') + '\n';
  [1120, 1130, 1140, 1150, 1160, 1170, 1180, 1190, 1191, 1192].forEach(r => {
    teloRows += xmlDec('r' + r, '') + '\n';
  });

  // ==================== TABUĽKA A ====================
  let tabA = '<tabA>\n';
  for (let i = 1; i <= 17; i++) {
    tabA += xmlDec('r' + pad2(i), tabARows['130/A' + i] ?? '') + '\n';
  }
  tabA += '</tabA>\n';

  // ==================== TABUĽKA B ====================
  let tabB = '<tabB>\n';
  for (let i = 1; i <= 6; i++) tabB += xmlDec('r' + pad2(i), '') + '\n';
  tabB += '</tabB>\n';

  // ==================== TAB C1, C2 (6 riadkov) ====================
  function emptyTab6(name) {
    let s = '<' + name + '>\n';
    for (let i = 1; i <= 6; i++) s += xmlDec('r' + pad2(i), '') + '\n';
    return s + '</' + name + '>\n';
  }

  // ==================== TABUĽKA D ====================
  let tabD = '<tabD>\n';
  tabD += '<tabDs01>' + xmlDec('r01', '') + xmlDec('r02', '') + xmlDec('r03', '') + '</tabDs01>\n';
  for (let i = 2; i <= 8; i++) {
    tabD += '<tabDs' + pad2(i) + '>' + xmlEl('datumOd', '') + xmlEl('datumDo', '')
      + xmlDec('r01', '') + xmlDec('r02', '') + xmlDec('r03', '') + '</tabDs' + pad2(i) + '>\n';
  }
  tabD += '<tabDs09>' + xmlDec('r01', '') + xmlDec('r02', '') + xmlDec('r03', '') + '</tabDs09>\n';
  tabD += '</tabD>\n';

  // ==================== TABUĽKA E ====================
  let tabE = '<tabE>\n';
  for (let i = 1; i <= 10; i++) tabE += xmlDec('r' + pad2(i), '') + '\n';
  tabE += '</tabE>\n';

  // ==================== TABUĽKA F ====================
  let tabF = '<tabF>\n';
  for (let i = 1; i <= 3; i++) tabF += xmlDec('r' + pad2(i), '') + '\n';
  tabF += '</tabF>\n';

  // ==================== TAB G1, G2, G3 ====================
  function tabG(name, cnt) {
    let s = '<' + name + '>\n';
    for (let i = 1; i <= cnt; i++) s += xmlDec('r' + pad2(i), '') + '\n';
    return s + '</' + name + '>\n';
  }

  // ==================== TABUĽKA H ====================
  let tabH = '<tabH>\n' + xmlDec('r01', '') + '\n<prijmy>';
  for (let i = 2; i <= 10; i++) tabH += xmlDec('r' + pad2(i), '');
  tabH += '</prijmy>\n<vydavky>';
  for (let i = 2; i <= 10; i++) tabH += xmlDec('r' + pad2(i), '');
  tabH += '</vydavky>\n' + xmlDec('r11', '') + '\n</tabH>\n';

  // ==================== TABUĽKA I ====================
  const emptyTr = () => xmlEl('druh', '') + xmlDec('vplyvNaR100', '')
    + xmlEl('nazovZavislejOsoby', '') + xmlEl('kodStatu', '');
  let tabI = '<tabI>\n';
  for (let i = 1; i <= 18; i++) tabI += '<r' + pad2(i) + '>' + emptyTr() + '</r' + pad2(i) + '>\n';
  tabI += '</tabI>\n';

  // ==================== TABUĽKA J ====================
  let tabJ = '<tabJ>' + xmlDec('r01', '') + xmlDec('r02', '') + '</tabJ>\n';

  // ==================== OBMEDZENÁ DAŇOVÁ POVINNOSŤ ====================
  let obm = '<obmedzenaDanovaPovinnost>' + xmlEl('datumOd', '') + xmlEl('datumDo', '')
    + xmlEl('TIN', '') + '</obmedzenaDanovaPovinnost>\n';

  // ==================== TABUĽKA K ====================
  let tabK = '<tabK>\n<obdobiaMinimalDane>\n';
  for (let i = 1; i <= 4; i++) {
    tabK += '<obdobie' + i + '>' + xmlEl('datumOd', '') + xmlEl('datumDo', '')
      + xmlDec('vyskaKladnehoRozdielu', '') + xmlDec('zapocitanaVPredObdobiach', '')
      + xmlDec('zapocitanaVDanomObdobi', '') + xmlDec('zostavajucaCast', '')
      + '</obdobie' + i + '>\n';
  }
  tabK += '</obdobiaMinimalDane>\n';
  tabK += '<spolu>' + xmlDec('zapocitanaVDanomObdobi', '') + xmlDec('zostavajucaCast', '') + '</spolu>\n';
  tabK += '</tabK>\n';

  // ==================== ZDANENIE §17f ====================
  let z17 = '<zdaneniePar17f>\n';
  for (let i = 1; i <= 6; i++) z17 += '<r' + pad2(i) + '>' + t2s() + '</r' + pad2(i) + '>\n';
  for (let i = 7; i <= 13; i++) z17 += xmlDec('r' + pad2(i), '') + '\n';
  for (let i = 14; i <= 19; i++) z17 += '<r' + pad2(i) + '>' + t2s() + '</r' + pad2(i) + '>\n';
  for (let i = 20; i <= 27; i++) z17 += xmlDec('r' + pad2(i), '') + '\n';
  z17 += '<r28></r28>\n';
  for (let i = 29; i <= 31; i++) z17 += xmlDec('r' + pad2(i), '') + '\n';
  z17 += '</zdaneniePar17f>\n';

  // ==================== PODIELY §51e ====================
  let p51 = '<podielyNaZiskuPar51e>\n';
  for (let i = 1; i <= 3; i++) p51 += xmlDec('r' + pad2(i), '') + '\n';
  for (let i = 4; i <= 6; i++) p51 += '<r' + pad2(i) + '>' + t2s() + '</r' + pad2(i) + '>\n';
  p51 += xmlDec('r07', '') + '\n<r08></r08>\n' + xmlDec('r09', '') + '\n';
  p51 += '</podielyNaZiskuPar51e>\n';

  // ==================== VÝNOSY ZO ŠTÁTNYCH DLHOPISOV §51ea ====================
  let vsd = '<vynosyZoStatnychDlhopisov>\n';
  for (let i = 1; i <= 3; i++) vsd += '<r' + i + '>' + t2s() + '</r' + i + '>';
  vsd += '<r4><s1>16</s1><s2>13</s2></r4>';
  for (let i = 5; i <= 14; i++) vsd += '<r' + i + '>' + t2s() + '</r' + i + '>';
  vsd += '\n</vynosyZoStatnychDlhopisov>\n';

  // ==================== VII. ČASŤ ====================
  let c7 = xmlEl('c7paragraf50', h.c7paragraf50) + '\n' + xmlEl('suhlasZasl', h.suhlasZasl) + '\n';
  c7 += xmlDec('c7r1', '') + xmlDec('c7r2', '') + xmlDec('c7r3', '') + xmlDec('c7r4', '') + '\n';
  c7 += '<c7r5></c7r5>\n';
  c7 += '<c7prijimatel1>' + xmlDec('suma', '') + '<ico></ico>'
    + '<obchodneMeno><riadok></riadok><riadok></riadok></obchodneMeno></c7prijimatel1>\n';

  // ==================== OPRÁVNENÁ OSOBA ====================
  let op = '<opravnenaOsoba>\n';
  op += xmlEl('priezvisko', h.opPriezvisko) + xmlEl('meno', h.opMeno);
  op += xmlEl('titul', h.opTitul) + xmlEl('titulZa', h.opTitulZa);
  op += xmlEl('postavenie', h.opPostavenie) + '\n';
  op += '<trvalyPobyt>' + xmlEl('ulica', h.opUlica) + xmlEl('cislo', h.opCislo);
  op += xmlEl('psc', h.opPsc) + xmlEl('obec', h.opObec) + xmlEl('stat', h.opStat);
  op += xmlEl('tel', h.opTel) + xmlEl('emailFax', h.opEmail) + '</trvalyPobyt>\n';
  op += '</opravnenaOsoba>\n';

  // ==================== PLATENIE §17f ====================
  let pl = '<platenieDanePar17f>\n' + xmlEl('ziadam17f', '0') + '\n';
  for (let i = 0; i < 5; i++) {
    pl += '<splatka>' + xmlEl('datumSplat', '') + xmlDec('suma', '') + '</splatka>\n';
  }
  pl += xmlEl('datum', '') + '\n</platenieDanePar17f>\n';

  // ==================== VRÁTENIE PREPLATKU ====================
  let vr = '<vrateniePreplatku>\n' + xmlEl('vratit', '0') + '\n';
  vr += '<sposobPlatby>' + xmlEl('poukazka', '0') + xmlEl('ucet', '0') + '</sposobPlatby>\n';
  vr += '<bankovyUcet>' + xmlEl('IBAN', '') + '</bankovyUcet>\n';
  vr += xmlEl('datum', '') + '\n</vrateniePreplatku>\n';

  // ==================== PRÍLOHA §13a, §13b ====================
  let pr13 = '<prilPar13aA13b>' + xmlDec('r01', '') + xmlEl('cisloPatentuSoftver', '')
    + xmlDec('r02', '') + xmlEl('cisloPatentu', '') + xmlDec('r03', '') + '</prilPar13aA13b>\n';

  // ==================== ZOSTAVENIE DOKUMENTU ====================
  return `<?xml version="1.0" encoding="UTF-8"?>
<dokument>
<hlavicka>
${xmlEl('dic', h.dic)}
${xmlEl('ico', h.ico)}
${xmlEl('pravnaForma', h.pravnaForma)}
<typDP>${xmlEl('rdp', h.rdp)}${xmlEl('odp', h.odp)}${xmlEl('ddp', h.ddp)}</typDP>
<zdanovacieObdobie>${xmlEl('od', h.zdanObdOd)}${xmlEl('do', h.zdanObdDo)}</zdanovacieObdobie>
<skNace><k1>${esc(h.skNaceK1)}</k1><k2>${esc(h.skNaceK2)}</k2><k3>${esc(h.skNaceK3)}</k3>${xmlEl('cinnost', h.skNaceCinnost)}</skNace>
<obchodneMeno><riadok>${esc(h.obchodneMeno)}</riadok><riadok></riadok></obchodneMeno>
<sidlo>${xmlEl('ulica', h.sidloUlica)}${xmlEl('cislo', h.sidloCislo)}${xmlEl('psc', h.sidloPsc)}${xmlEl('obec', h.sidloObec)}${xmlEl('stat', h.sidloStat)}${xmlEl('tel', h.sidloTel)}${xmlEl('emailFax', h.sidloEmail)}</sidlo>
${xmlEl('uplatnujemPar17', h.uplatnujemPar17)}
${xmlEl('ukoncujemUplatnovaniePar17', h.ukoncujemPar17)}
${xmlEl('obmedzenie', h.obmedzenie)}
${xmlEl('prepojenie', h.prepojenie)}
${xmlEl('uplatnenieOslobodeniaPar13ab', h.oslobodenie13ab)}
${xmlEl('mikrodanovnikPar2w', h.mikrodanovnik)}
${xmlEl('polovicnaVyskaDanePar46b3', h.polovicna46b3)}
${xmlEl('neplatenieMinDanePar46b7', h.neplatenie46b7)}
${xmlEl('zapocitanieMinDanePar46b5', h.zapocitanie46b5)}
<stalaPrevadzkaren>${xmlEl('ulica', h.spUlica)}${xmlEl('cislo', h.spCislo)}${xmlEl('psc', h.spPsc)}${xmlEl('obec', h.spObec)}${xmlEl('pocetSp', h.spPocet)}</stalaPrevadzkaren>
</hlavicka>
<telo>
${teloRows}
${tabA}${tabB}${emptyTab6('tabC1')}${emptyTab6('tabC2')}${tabD}${tabE}${tabF}${tabG('tabG1', 3)}${tabG('tabG2', 3)}${tabG('tabG3', 4)}${tabH}${tabI}${tabJ}${obm}${tabK}${z17}${p51}${vsd}${c7}${xmlEl('osobitneZaznamy', h.osobitneZaznamy)}
${op}${xmlEl('pocetPriloh', h.pocetPriloh)}
${xmlEl('datumVyhlasenia', h.datumVyhlasenia)}
${pl}${vr}${pr13}</telo>
</dokument>`;
}
