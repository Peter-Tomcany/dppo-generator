/**
 * DPPO 2025 – Parser Excel súborov
 * Načítanie hárkov "Základné údaje" a "Pomôcka k DP"
 */

function parseExcelFile(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const result = { header: {}, rows: {}, tabARows: {} };

  // --- Základné údaje ---
  if (wb.SheetNames.indexOf('Základné údaje') >= 0) {
    const ws = wb.Sheets['Základné údaje'];
    const cv = (c) => ws[c] ? ws[c].v : '';

    result.header.obchodneMeno = cv('C3');
    result.header.sidloUlica = cv('C4');
    result.header.sidloCislo = cv('C5');
    result.header.sidloPsc = String(cv('C6'));
    result.header.sidloObec = cv('C7');
    result.header.sidloStat = cv('C8') || 'Slovenská republika';
    result.header.ico = String(cv('C9'));
    result.header.dic = String(cv('C10'));

    // Právna forma – parse "112" from "112 - Spoločnosť s ručením obmedzeným"
    const pf = String(cv('C11'));
    const pfm = pf.match(/^(\d{3})/);
    if (pfm) result.header.pravnaForma = pfm[1];

    // SK NACE – remove dots, split into k1(2), k2(2), k3(1)
    const nace = String(cv('C12')).replace(/\./g, '');
    if (nace.length >= 4) {
      result.header.skNaceK1 = nace.substring(0, 2);
      result.header.skNaceK2 = nace.substring(2, 4);
      result.header.skNaceK3 = nace.length >= 5 ? nace.substring(4, 5) : '';
    }

    // Zdaňovacie obdobie
    const dOd = cv('C13'), dDo = cv('C14');
    if (dOd) result.header.zdanObdOd = fmtDate(dOd);
    if (dDo) result.header.zdanObdDo = fmtDate(dDo);

    // Mikrodaňovník
    const mikro = String(cv('C15')).toUpperCase();
    result.header.mikrodanovnik = (mikro === 'ÁNO' || mikro === 'ANO') ? 1 : 0;

    // Zdaniteľné príjmy (výnosy) – r.560
    const zdanPrijmy = cv('C19');
    if (zdanPrijmy && typeof zdanPrijmy === 'number') {
      result.rows[560] = zdanPrijmy;
    }
  }

  // --- Pomôcka k DP ---
  if (wb.SheetNames.indexOf('Pomôcka k DP') >= 0) {
    const ws = wb.Sheets['Pomôcka k DP'];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:E100');

    for (let R = range.s.r; R <= range.e.r; R++) {
      const cC = ws[XLSX.utils.encode_cell({ r: R, c: 2 })]; // col C = riadok DP
      const cD = ws[XLSX.utils.encode_cell({ r: R, c: 3 })]; // col D = tab A ref
      const cE = ws[XLSX.utils.encode_cell({ r: R, c: 4 })]; // col E = suma
      const valE = cE ? cE.v : null;

      // Hlavné riadky: col C = číslo riadku
      if (cC && typeof cC.v === 'number') {
        const rn = cC.v;
        if (ROW_MAP.some(x => x[0] === rn) || rn === 610) {
          result.rows[rn] = valE;
        }
      }

      // Tabuľka A: col D = "130/A1", "130/A2" ...
      if (cD && typeof cD.v === 'string' && cD.v.startsWith('130/A')) {
        result.tabARows[cD.v] = valE;
      }
    }
  }

  return result;
}

function fmtDate(v) {
  if (!v) return '';
  if (v instanceof Date) {
    return v.getDate() + '.' + (v.getMonth() + 1) + '.' + v.getFullYear();
  }
  return String(v);
}
