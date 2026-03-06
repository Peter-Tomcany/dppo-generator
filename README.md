# DPPO 2025 – Generátor XML

Webová aplikácia na generovanie XML súboru pre daňové priznanie k dani z príjmov právnickej osoby (DPPO) za zdaňovacie obdobie 2025.

## Ako to funguje

1. Otvorte `index.html` v prehliadači (alebo navštívte nasadenú URL)
2. Nahrajte Excel súbor (Výpočet_ZD_2025.xlsm) s hárkami:
   - **Základné údaje** – IČO, DIČ, sídlo, právna forma, zdaňovacie obdobie
   - **Pomôcka k DP** – riadky daňového priznania s vypočítanými sumami
3. Skontrolujte/upravte dáta v záložkách
4. Kliknite **Stiahnuť XML** – dostanete XML validné podľa XSD schémy `dppo2025_v2`

## Štruktúra projektu

```
dppo-generator/
├── index.html              # Hlavná stránka
├── css/
│   └── style.css           # Štýly
├── js/
│   ├── constants.js        # Mapovania riadkov, popisky, sekcie
│   ├── excel-parser.js     # Parsovanie Excel súborov (SheetJS)
│   ├── xml-generator.js    # Generovanie XML podľa XSD
│   └── app.js              # Stav, UI, tab management
├── xsd/
│   └── dppo2025_v2.xsd     # XSD schéma (referencia)
└── README.md
```

## Nasadenie

### Netlify (odporúčané)
1. Pushnite repo na GitHub
2. Pripojte na Netlify → automatický deploy

### Lokálne
Stačí otvoriť `index.html` v prehliadači. Žiadny build nie je potrebný.

## Závislosť

- [SheetJS (xlsx)](https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js) – načítavanie Excel súborov (CDN)

## TODO

- [ ] Editovateľné tabuľky B, D, E, F, I, K
- [ ] XSD validácia pred stiahnutím
- [ ] Prílohy §30c, §30e, §30ca
- [ ] Tabuľka I – transakcie závislých osôb
- [ ] Poukázanie podielu dane (VII. časť) – viac prijímateľov
- [ ] Vrátenie preplatku (X. časť) – IBAN

---

© Helwitax s.r.o. | Interný nástroj
