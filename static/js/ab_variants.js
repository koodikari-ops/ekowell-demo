"use strict";

const AB_VARIANTS = {
  A: {
    id: "A",
    tabLabel: "A: Järki & 11 400 EUR säästö",
    eyebrow: "Vaihtoehto A (Taloudellinen järki) — Säästä yli 75 % verrattuna koko pumpun vaihtoon",
    headline: 'Älä vaihda koko maalämpöpumppua. <span class="text-gradient">Uudista vain sen sydän</span> ja säästä yli 10 000 euroa.',
    lead: "Maalämpöpumppusi lämpökaivo, kuparikierukat ja suljetussa hapettomassa kierrossa toimiva runko kestävät vuosikymmeniä. Kun 12–18 vuotta palvellut kompressori päivitetään uuteen tehdasmoduuliin <strong>yhdessä työpäivässä</strong>, saat uuden laitteen tehon murto-osalla uuden hinnasta.",
    ctaText: "Laske oma säästösi ja varaa maksuton arvio",
    photo: "static/images/ekowell_huoltoauto_talvi.jpg",
    photoTag: "SUORAAN VALMISTAJALTA ILMAN VÄLIKÄSIÄ",
    photoTitle: "Miksi maksaa 14 890 EUR, kun 3 490 EUR riittää?",
    photoDesc: "Toimivaa laiterunkoa ja putkistoja ei pureta turhaan. Uudistamme vain kuluneen kompressoriyksikön tehdastakuulla.",
    quote: '"Meille tarjottiin jo 15 500 euron täysremonttia. Ekowell vaihtoi pelkän kompressorin päivässä ja säästimme yli 11 000 euroa." — Omakotiasukas, Pirkanmaa',
    formHeadline: "Varmista 11 400 EUR säästö — Pyydä maksuton arvio",
  },
  B: {
    id: "B",
    tabLabel: "B: Talvipakkasen mielenrauha",
    eyebrow: "Vaihtoehto B (Huoltovarmuus & turva) — Ennakoi ennen tammikuun -25 C pakkasia",
    headline: 'Varmista lämmin koti ennen pakkasia. <span class="text-gradient">Uusi pumppusi voimanlähde</span> yhdessä päivässä.',
    lead: "12–18-vuotias kompressori pettää lähes aina vuoden kylmimpänä yönä, jolloin varaosajonot ovat viikkoja ja talo jää kalliin varasähkön varaan. Ennakoiva vaihto palauttaa täyden toimintavarmuuden ilman, että talon lämmitys katkeaa hetkeksikään.",
    ctaText: "Varmista kotisi talvivarmuus omalla reitilläsi",
    photo: "static/images/ekowell_perhe_mielenrauha.jpg",
    photoTag: "HUOLETON TALVI PERHEELLESI",
    photoTitle: "Ei hätäpäivystystä eikä kylmää taloa pakkasella",
    photoDesc: "Asennus kestää vain yhden työpäivän (4–6 tuntia), joten talo pysyy lämpimänä myös talviasennuksen aikana.",
    quote: '"Naapurin pumppu hajosi -28 asteen pakkasella ja he odottivat uutta kolme viikkoa. Me vaihdoimme kompressorin ennakkoon päivässä." — Perheenisä, Oulu',
    formHeadline: "Turvaa lämmin koti talveksi — Varaa kartoitus",
  },
  C: {
    id: "C",
    tabLabel: "C: Sähkölasku & kuuma vesi",
    eyebrow: "Vaihtoehto C (Energiasäästö & mukavuus) — Lopeta sähkövastuksen piilokulutus",
    headline: 'Syökö kulunut kompressori salaa sähköä? <span class="text-gradient">Palauta kuuma vesi</span> ja pudota sähkölaskua.',
    lead: "Kun kompressori kuluu 40 000 käyttötunnin jälkeen, sen kuumakaasun tulistusteho hiipuu. Silloin suihkuvesi haalenee ja pumppu kytkee kalliin sähkövastuksen salaa päälle. Uusi tehdasmoduuli palauttaa huippuhyötysuhteen (COP 4.30) välittömästi.",
    ctaText: "Katso paljonko pumppusi säästää sähköä vuodessa",
    photo: "static/images/ekowell_lammin_koti.jpg",
    photoTag: "TÄYSI LÄMPÖTEHO JA KUUMA KÄYTTÖVESI",
    photoTitle: "Säästä 450–650 EUR vuodessa lämmityssähkössä",
    photoDesc: "Uusi scroll-kompressori nostaa kuumakaasun tulistuksen takaisin huipputasolle ja lopettaa turhan vastuskäytön.",
    quote: '"Suihkuvesi riittää taas koko perheelle ja pumpun käyntiääni muuttui kuiskaavan hiljaiseksi. Sähkönkulutus putosi heti." — Omakotiasukas, Espoo',
    formHeadline: "Pudota lämmityskuluja — Pyydä säästölaskelma",
  },
  D: {
    id: "D",
    tabLabel: "D: Huoltoauto alueellasi (0 EUR)",
    eyebrow: "Vaihtoehto D (Paikallinen huoltoreitti) — Matkakulut 0 EUR ennakkoreitityksellä",
    headline: 'Ekowellin huoltoauto saapuu seudullesi — <span class="text-gradient">Avaimet käteen -päivitys</span> ilman matkakuluja.',
    lead: "Yhdistämme saman maakunnan maalämpökohteet yhdelle huoltoreitille. Rovaniemen tehtaan oma erikoisasentaja tuo mukanaan valmiin kompressoriyksikön ja hoitaa kaiken kerralla kuntoon — säästät heti satojen eurojen kilometrikorvaukset.",
    ctaText: "Varaa paikka alueesi 0 EUR huoltoreitiltä",
    photo: "static/images/ekowell_asentaja_huolto.png",
    photoTag: "20 VUODEN SUOMALAINEN TEHDASOSAAMINEN",
    photoTitle: "Tehtaan oma asentaja palvelee koko Suomessa",
    photoDesc: "Huollamme ja uudistamme Ekowell EVD/EVT -mallien lisäksi myös muut maalämpöpumput suoraan tehdastakuulla.",
    quote: '"Asentaja soitti etukäteen, tuli sovittuna aamuna ja iltapäivällä pumppu kävi kuin uusi. Matkakuluja ei veloitettu lainkaan." — Omakotiasukas, Kuopio',
    formHeadline: "Liity alueesi 0 EUR huoltoreitille ilman sitoumusta",
  },
};

let activeVariantKey = "A";

function getActiveVariantKey() {
  return activeVariantKey;
}

function applyVariant(key) {
  const v = AB_VARIANTS[key] || AB_VARIANTS.A;
  activeVariantKey = v.id;

  document.querySelectorAll(".ab-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.variant === v.id);
  });

  const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setText("hero-eyebrow-text", v.eyebrow);
  setHtml("hero-headline", v.headline);
  setHtml("hero-lead-text", v.lead);
  setText("hero-primary-cta", v.ctaText);
  setText("hero-photo-tag", v.photoTag);
  setText("hero-photo-title", v.photoTitle);
  setText("hero-photo-desc", v.photoDesc);
  setText("hero-testimonial", v.quote);
  setText("booking-form-headline", v.formHeadline);

  const img = document.getElementById("hero-photo");
  if (img) img.src = v.photo;
}

function initAbTestingBar() {
  const bar = document.getElementById("ab-tabs-container");
  if (!bar) return;
  bar.innerHTML = "";
  Object.values(AB_VARIANTS).forEach((v) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ab-tab-btn";
    btn.dataset.variant = v.id;
    btn.textContent = v.tabLabel;
    btn.addEventListener("click", () => applyVariant(v.id));
    bar.appendChild(btn);
  });

  const params = new URLSearchParams(window.location.search);
  const urlVar = (params.get("variant") || "A").toUpperCase();
  applyVariant(AB_VARIANTS[urlVar] ? urlVar : "A");
}
