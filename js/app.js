const standardCurrents = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
  500, 630
];

const sectionProperties = [
  { section: 1.5, rCopper: 12.1, rAluminium: 18.1, x: 0.083 },
  { section: 2.5, rCopper: 7.41, rAluminium: 11.3, x: 0.08 },
  { section: 4, rCopper: 4.61, rAluminium: 7.08, x: 0.079 },
  { section: 6, rCopper: 3.08, rAluminium: 4.61, x: 0.078 },
  { section: 10, rCopper: 1.83, rAluminium: 2.78, x: 0.076 },
  { section: 16, rCopper: 1.15, rAluminium: 1.75, x: 0.073 },
  { section: 25, rCopper: 0.727, rAluminium: 1.12, x: 0.071 },
  { section: 35, rCopper: 0.524, rAluminium: 0.868, x: 0.07 },
  { section: 50, rCopper: 0.387, rAluminium: 0.641, x: 0.069 },
  { section: 70, rCopper: 0.268, rAluminium: 0.443, x: 0.067 },
  { section: 95, rCopper: 0.206, rAluminium: 0.32, x: 0.066 },
  { section: 120, rCopper: 0.161, rAluminium: 0.253, x: 0.065 },
  { section: 150, rCopper: 0.132, rAluminium: 0.206, x: 0.064 },
  { section: 185, rCopper: 0.106, rAluminium: 0.164, x: 0.063 },
  { section: 240, rCopper: 0.083, rAluminium: 0.125, x: 0.062 }
];

const izReference = {
  copper: {
    "En conduit (B1)": {
      1.5: 18,
      2.5: 24,
      4: 32,
      6: 41,
      10: 57,
      16: 76,
      25: 101,
      35: 125,
      50: 150,
      70: 192,
      95: 232,
      120: 269,
      150: 306,
      185: 353,
      240: 415
    },
    "Sur chemin de câbles (C)": {
      1.5: 20,
      2.5: 27,
      4: 36,
      6: 46,
      10: 65,
      16: 87,
      25: 115,
      35: 141,
      50: 169,
      70: 212,
      95: 253,
      120: 292,
      150: 334,
      185: 384,
      240: 455
    },
    "Enterré (D)": {
      1.5: 23,
      2.5: 30,
      4: 40,
      6: 51,
      10: 70,
      16: 92,
      25: 119,
      35: 144,
      50: 173,
      70: 212,
      95: 248,
      120: 283,
      150: 321,
      185: 366,
      240: 428
    }
  },
  aluminium: {
    "En conduit (B1)": {
      1.5: 16,
      2.5: 20,
      4: 26,
      6: 33,
      10: 45,
      16: 59,
      25: 78,
      35: 97,
      50: 115,
      70: 141,
      95: 169,
      120: 194,
      150: 221,
      185: 253,
      240: 297
    },
    "Sur chemin de câbles (C)": {
      1.5: 18,
      2.5: 24,
      4: 31,
      6: 40,
      10: 55,
      16: 72,
      25: 96,
      35: 119,
      50: 142,
      70: 176,
      95: 207,
      120: 236,
      150: 269,
      185: 310,
      240: 362
    },
    "Enterré (D)": {
      1.5: 20,
      2.5: 26,
      4: 34,
      6: 43,
      10: 59,
      16: 77,
      25: 101,
      35: 124,
      50: 150,
      70: 186,
      95: 220,
      120: 251,
      150: 286,
      185: 330,
      240: 384
    }
  }
};

const insulationMultiplier = {
  copper: {
    PVC: 1,
    XLPE: 1.12
  },
  aluminium: {
    PVC: 1,
    XLPE: 1.1
  }
};

const thermalK = {
  copper: {
    PVC: 115,
    XLPE: 143
  },
  aluminium: {
    PVC: 76,
    XLPE: 94
  }
};

const curveData = {
  B: { thermal: 1.45, magneticMin: 3, magneticMax: 5 },
  C: { thermal: 1.45, magneticMin: 5, magneticMax: 10 },
  D: { thermal: 1.45, magneticMin: 10, magneticMax: 20 }
};

const labels = {
  copper: "Cuivre",
  aluminium: "Aluminium",
  PVC: "PVC",
  XLPE: "PR/XLPE"
};

const form = document.getElementById("sizing-form");
const inSelect = document.getElementById("in");
const resultsContainer = document.getElementById("results");

populateInSelect();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  computeSizing();
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    resultsContainer.innerHTML = `
      <p class="results__placeholder">
        Remplissez le formulaire et lancez le calcul pour visualiser les vérifications étape par étape.
      </p>`;
    inSelect.value = "";
  }, 0);
});

function populateInSelect() {
  const fragment = document.createDocumentFragment();
  standardCurrents.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.toString();
    option.textContent = `${value} A`;
    fragment.appendChild(option);
  });
  inSelect.appendChild(fragment);
}

function computeSizing() {
  const data = getFormData();

  if (!data) {
    return;
  }

  const {
    circuitType,
    powerVA,
    powerDisplay,
    powerUsedVA,
    voltage,
    cosPhi,
    sinPhi,
    ks,
    ku,
    material,
    insulation,
    installation,
    length,
    dropLimit,
    kTotal,
    kTemp,
    kGroup,
    kOther,
    selectedIn,
    recommendedIn,
    curve,
    iccMin,
    iccMax,
    icu,
    i2t,
    thermalConstant
  } = data;
  const ib =
    circuitType === "triphase"
      ? powerUsedVA / (voltage * Math.sqrt(3))
      : powerUsedVA / voltage;

  const cableOptions = buildCableOptions(material, insulation, installation);

  if (!cableOptions.length) {
    renderError(
      "Aucune donnée disponible pour la combinaison choisie. Vérifiez le mode de pose ou le matériau."
    );
    return;
  }

  let effectiveIn = selectedIn;
  if (!effectiveIn || effectiveIn < ib) {
    effectiveIn = recommendedIn;
    if (standardCurrents.includes(recommendedIn)) {
      inSelect.value = recommendedIn.toString();
    }
  }

  const curveInfo = curveData[curve];
  const i2 = curveInfo.thermal * effectiveIn;
  const overloadLimit = curveInfo.thermal * effectiveIn * 1.0;

  const evaluation = cableOptions.map((option) => {
    const izBase = option.iz;
    const izCorrected = izBase * kTotal;
    const izOk = izCorrected >= effectiveIn;
    const overloadOk = i2 <= curveInfo.thermal * izCorrected;
    const lengthKm = length / 1000;
    const rTotal = option.r * lengthKm;
    const xTotal = option.x * lengthKm;
    const dropVolt =
      circuitType === "triphase"
        ? Math.sqrt(3) * ib * (rTotal * cosPhi + xTotal * sinPhi)
        : 2 * ib * (rTotal * cosPhi + xTotal * sinPhi);
    const dropPercent = (dropVolt / voltage) * 100;
    const dropOk = dropPercent <= dropLimit;
    const thermalLimit = Math.pow(thermalConstant, 2) * Math.pow(option.section, 2);
    const thermalOk = i2t > 0 ? i2t <= thermalLimit : true;
    const pass = izOk && overloadOk && dropOk && thermalOk;
    return {
      ...option,
      izBase,
      izCorrected,
      izOk,
      overloadOk,
      dropVolt,
      dropPercent,
      dropOk,
      thermalLimit,
      thermalOk,
      pass
    };
  });

  const chosenOption = evaluation.find((item) => item.pass);
  const magneticMin = curveInfo.magneticMin * effectiveIn;
  const magneticOk = iccMin >= magneticMin;
  const breakingOk = icu >= iccMax;

  const finalOk =
    Boolean(chosenOption) &&
    magneticOk &&
    breakingOk &&
    (i2t > 0 ? chosenOption.thermalOk : true);

  renderResults({
    ib,
    powerDisplay,
    powerUsedVA,
    ks,
    ku,
    effectiveIn,
    recommendedIn,
    curve,
    curveInfo,
    i2,
    overloadLimit,
    cableOptions: evaluation,
    chosenOption,
    dropLimit,
    circuitType,
    voltage,
    material,
    insulation,
    installation,
    kTemp,
    kGroup,
    kOther,
    kTotal,
    magneticMin,
    magneticOk,
    iccMin,
    iccMax,
    breakingOk,
    icu,
    finalOk,
    i2t,
    thermalConstant
  });
}

function getFormData() {
  const circuitType = form.circuitType.value;
  const power = parseFloat(form.power.value);
  const powerUnit = form.powerUnit.value;
  const voltage = parseFloat(form.voltage.value);
  let cosPhi = parseFloat(form.cosphi.value);
  const ks = parseFloat(form.ks.value);
  const ku = parseFloat(form.ku.value);
  const material = form.material.value;
  const insulation = form.insulation.value;
  const installation = form.installation.value;
  const length = parseFloat(form.length.value);
  const dropLimit = parseFloat(form.voltageDropLimit.value);
  const kTemp = parseFloat(form.kTemp.value);
  const kGroup = parseFloat(form.kGroup.value);
  const kOther = parseFloat(form.kOther.value);
  const curve = form.curve.value;
  const selectedIn = parseFloat(form.in.value);
  const iccMin = parseFloat(form.iccMin.value);
  const iccMax = parseFloat(form.iccMax.value) * 1000; // Convert to A
  const icu = parseFloat(form.icu.value) * 1000; // Convert to A
  const i2t = parseFloat(form.i2t.value);

  if (
    [
      power,
      voltage,
      cosPhi,
      ks,
      ku,
      length,
      dropLimit,
      kTemp,
      kGroup,
      kOther,
      iccMin,
      iccMax,
      icu
    ].some((value) => Number.isNaN(value) || value < 0)
  ) {
    renderError("Veuillez vérifier les valeurs saisies : aucune ne doit être négative ou vide.");
    return null;
  }

  cosPhi = Math.min(Math.max(cosPhi, 0), 1);
  const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));

  if (voltage === 0) {
    renderError("La tension doit être différente de 0.");
    return null;
  }

  const powerVA = powerUnit === "kVA" ? power * 1000 : (power / (cosPhi || 0.001)) * 1000;
  const powerDisplay = powerUnit === "kVA" ? `${power.toFixed(2)} kVA` : `${power.toFixed(2)} kW`;
  const powerUsedVA = powerVA * ks * ku;
  const denominator = circuitType === "triphase" ? voltage * Math.sqrt(3) : voltage;
  const ibEstimate = denominator > 0 ? powerUsedVA / denominator : 0;
  const recommendedIn =
    standardCurrents.find((value) => value >= ibEstimate) ||
    standardCurrents[standardCurrents.length - 1];

  const kTotal = kTemp * kGroup * kOther;
  const thermalConstant = thermalK[material]?.[insulation] ?? 0;

  if (!thermalConstant) {
    renderError("Combinaison matériau/isolant non supportée.");
    return null;
  }

  return {
    circuitType,
    powerVA,
    powerDisplay,
    powerUsedVA,
    voltage,
    cosPhi,
    sinPhi,
    ks,
    ku,
    material,
    insulation,
    installation,
    length,
    dropLimit,
    kTotal,
    kTemp,
    kGroup,
    kOther,
    selectedIn: Number.isNaN(selectedIn) ? undefined : selectedIn,
    recommendedIn,
    curve,
    iccMin,
    iccMax,
    icu,
    i2t: Number.isNaN(i2t) ? 0 : i2t,
    thermalConstant
  };
}

function buildCableOptions(material, insulation, installation) {
  const reference = izReference[material]?.[installation];
  if (!reference) {
    return [];
  }

  const multiplier = insulationMultiplier[material]?.[insulation] ?? 1;

  return sectionProperties
    .filter((item) => reference[item.section])
    .map((item) => ({
      section: item.section,
      iz: reference[item.section] * multiplier,
      r: material === "copper" ? item.rCopper : item.rAluminium,
      x: item.x
    }));
}

function renderResults(data) {
  const {
    ib,
    powerDisplay,
    powerUsedVA,
    ks,
    ku,
    effectiveIn,
    recommendedIn,
    curve,
    curveInfo,
    i2,
    overloadLimit,
    cableOptions,
    chosenOption,
    dropLimit,
    circuitType,
    voltage,
    material,
    insulation,
    installation,
    kTemp,
    kGroup,
    kOther,
    kTotal,
    magneticMin,
    magneticOk,
    iccMin,
    iccMax,
    breakingOk,
    icu,
    finalOk,
    i2t,
    thermalConstant
  } = data;

  const powerUsedkVA = powerUsedVA / 1000;
  const magneticState = magneticOk ? "ok" : "fail";
  const breakingState = breakingOk ? "ok" : "fail";
  const i2tState = i2t > 0 ? (chosenOption && i2t <= chosenOption.thermalLimit ? "ok" : "fail") : "warning";

  const summaryStatus = finalOk ? "ok" : "fail";

  let html = `
    <div class="result-summary ${summaryStatus === "ok" ? "result-summary--success" : "result-summary--alert"}">
      <div>
        <h3>Section ${chosenOption ? "retenue" : "non trouvée"}</h3>
        <p class="result-summary__value">${
          chosenOption
            ? `${formatNumber(chosenOption.section, 0)} mm² — ${labels[material]}, ${labels[insulation]}`
            : "Aucune section ne valide toutes les contraintes"
        }</p>
        <p class="result-summary__subtitle">Mode de pose : ${installation}</p>
      </div>
      <div class="result-summary__tags">
        ${renderStatus(
          "ok",
          `IB = ${formatNumber(ib, 2)} A`
        )}
        ${renderStatus(
          effectiveIn >= ib ? "ok" : "fail",
          `In utilisé = ${formatNumber(effectiveIn, 0)} A`
        )}
        ${renderStatus(
          chosenOption && chosenOption.dropOk ? "ok" : "fail",
          `ΔU ≤ ${dropLimit}%`
        )}
      </div>
    </div>
  `;

  html += `
    <div class="results__grid">
      <article class="result-card">
        <h4>Étape 1 · Courant d'emploi</h4>
        <p><strong>IB = ${formatNumber(ib, 2)} A</strong></p>
        <ul>
          <li>Puissance saisie : ${powerDisplay}</li>
          <li>Puissance utilisée : ${formatNumber(powerUsedkVA, 2)} kVA (ks = ${ks}, ku = ${ku})</li>
          <li>Tension : ${formatNumber(voltage, 0)} V (${circuitType === "triphase" ? "triphasé" : "monophasé"})</li>
        </ul>
      </article>
      <article class="result-card">
        <h4>Étape 2 · Protection</h4>
        <p><strong>Courbe ${curve} — In = ${formatNumber(effectiveIn, 0)} A</strong></p>
        <ul>
          <li>Calibre recommandé : ${formatNumber(recommendedIn, 0)} A</li>
          <li>I₂ estimé : ${formatNumber(i2, 1)} A</li>
          <li>Condition de base : ${renderStatus(
            effectiveIn >= ib ? "ok" : "fail",
            "In ≥ IB"
          )}</li>
        </ul>
      </article>
      <article class="result-card">
        <h4>Étape 3 · Courant admissible</h4>
        <p><strong>k total = ${formatNumber(kTotal, 2)}</strong></p>
        <ul>
          <li>k<sub>temp</sub> = ${formatNumber(kTemp, 2)}, k<sub>group</sub> = ${formatNumber(
    kGroup,
    2
  )}, k<sub>sup</sub> = ${formatNumber(kOther, 2)}</li>
          <li>Thermique k = ${thermalConstant} A·√s/mm²</li>
          <li>${renderStatus(
            chosenOption && chosenOption.izOk ? "ok" : "fail",
            "Iz' ≥ In"
          )}</li>
        </ul>
      </article>
      <article class="result-card">
        <h4>Étape 4 · Surcharge</h4>
        <p><strong>Limite : ${formatNumber(overloadLimit, 1)} A</strong></p>
        <ul>
          <li>${renderStatus(
            chosenOption && chosenOption.overloadOk ? "ok" : "fail",
            "I₂ ≤ 1,45 × Iz'"
          )}</li>
        </ul>
      </article>
      <article class="result-card">
        <h4>Étape 5 · Chute de tension</h4>
        <p><strong>ΔU admise : ${dropLimit}%</strong></p>
        <ul>
          <li>${renderStatus(
            chosenOption && chosenOption.dropOk ? "ok" : "fail",
            chosenOption
              ? `ΔU calculée = ${formatNumber(chosenOption.dropPercent, 2)} %`
              : "Pas de section conforme"
          )}</li>
        </ul>
      </article>
      <article class="result-card">
        <h4>Étape 6 · Court-circuit</h4>
        <ul>
          <li>${renderStatus(
            magneticState,
            `Icc min ${formatNumber(iccMin, 0)} A ≥ ${formatNumber(magneticMin, 0)} A`
          )}</li>
          <li>${renderStatus(
            breakingState,
            `Icu ${formatNumber(icu / 1000, 1)} kA ≥ Icc max ${formatNumber(iccMax / 1000, 1)} kA`
          )}</li>
          <li>${renderStatus(
            i2tState,
            i2t > 0
              ? chosenOption
                ? `k²S² = ${formatNumber(chosenOption.thermalLimit, 0)} ≥ I²t ${formatNumber(i2t, 0)}`
                : "Section non validée"
              : "I²t non renseigné"
          )}</li>
        </ul>
      </article>
    </div>
  `;

  html += renderCableTable(cableOptions, dropLimit, i2t);

  if (!finalOk) {
    html += `
      <div class="results__warning">
        <h4>Recommandations</h4>
        <p>
          Ajustez les paramètres (section supérieure, facteurs de correction, calibre de protection
          ou données de court-circuit) pour satisfaire l'ensemble des critères normatifs.
        </p>
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
}

function renderCableTable(options, dropLimit, i2t) {
  if (!options.length) {
    return "";
  }

  const rows = options
    .map((option) => {
      const status = option.pass ? "ok" : option.dropOk && option.izOk ? "warn" : "fail";
      const statusLabel =
        status === "ok"
          ? "Conforme"
          : status === "warn"
          ? "ΔU à optimiser"
          : "Non conforme";
      const i2tCheck = i2t > 0 ? (option.thermalOk ? "✅" : "❌") : "—";
      return `
        <tr class="status-row status-row--${status}">
          <td>${formatNumber(option.section, 0)} mm²</td>
          <td>${formatNumber(option.izBase, 1)} A</td>
          <td>${formatNumber(option.izCorrected, 1)} A</td>
          <td>${formatNumber(option.dropPercent, 2)} %</td>
          <td>${formatNumber(option.dropVolt, 2)} V</td>
          <td>${option.overloadOk ? "✅" : "❌"}</td>
          <td>${option.dropOk ? "✅" : "❌"}</td>
          <td>${i2tCheck}</td>
          <td>${statusLabel}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="results__table-wrapper">
      <h4>Analyse des sections disponibles</h4>
      <table class="results__table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Iz base</th>
            <th>Iz'</th>
            <th>ΔU %</th>
            <th>ΔU (V)</th>
            <th>I₂ ≤ 1,45×Iz'</th>
            <th>ΔU ≤ ${dropLimit}%</th>
            <th>k²S² ≥ I²t</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderStatus(state, text) {
  let icon = "";
  let cls = "";
  switch (state) {
    case "ok":
      icon = "✅";
      cls = "status status--ok";
      break;
    case "warn":
      icon = "⚠️";
      cls = "status status--warn";
      break;
    default:
      icon = "❌";
      cls = "status status--fail";
      break;
  }
  return `<span class="${cls}">${icon} ${text}</span>`;
}

function renderError(message) {
  resultsContainer.innerHTML = `
    <div class="results__warning">
      <h4>Erreur</h4>
      <p>${message}</p>
    </div>
  `;
}

function formatNumber(value, decimals = 2) {
  return Number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
