/**
 * GönülSepet35 — urunler.js üzerinden veri (file:// ve https uyumlu).
 */

const urunlerGrid = document.getElementById("urunler-grid");
const urunlerYukleniyor = document.getElementById("urunler-yukleniyor");
const urunlerHata = document.getElementById("urunler-hata");

let instagramUrl =
  "https://www.instagram.com/gonul_sepet35?igsh=MTEwN25yNndoY3p3ZQ==";

async function siteVerisiAl() {
  const gomulu = document.getElementById("site-veri");
  if (gomulu?.textContent?.trim()) {
    return JSON.parse(gomulu.textContent);
  }

  if (window.SITE_VERI) return window.SITE_VERI;

  if (location.protocol === "http:" || location.protocol === "https:") {
    const yanit = await fetch("urunler.json");
    if (yanit.ok) return yanit.json();
  }

  return null;
}

function formatFiyat(fiyat) {
  if (!fiyat || fiyat === 0) return null;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(fiyat);
}

function urunKartiOlustur(urun) {
  const kart = document.createElement("article");
  kart.className = "urun-kart fade-in";
  kart.setAttribute("data-urun-id", String(urun.id));

  const fiyatMetni = formatFiyat(urun.fiyat);
  const fiyatHtml = fiyatMetni
    ? `<p class="urun-fiyat">${fiyatMetni}</p>`
    : `<p class="urun-fiyat urun-fiyat--ig"><span class="ig-mini"></span> Fiyat &amp; sipariş → Instagram</p>`;

  const siparisEtiket = `${urun.isim} hakkında Instagram'dan yazın`;

  kart.innerHTML = `
    <div class="urun-gorsel-wrap">
      <img src="${urun.gorsel}" alt="${urun.isim}" class="urun-gorsel" loading="lazy" width="400" height="300" />
      <span class="urun-rozet">♥ El emeği</span>
      <div class="urun-gorsel-parlama" aria-hidden="true"></div>
    </div>
    <div class="urun-icerik">
      <h3 class="urun-baslik">${urun.isim}</h3>
      ${fiyatHtml}
      <p class="urun-aciklama">${urun.aciklama}</p>
      <a href="${instagramUrl}" class="btn btn-instagram" target="_blank" rel="noopener noreferrer" title="${siparisEtiket}" aria-label="${siparisEtiket}">
        <svg class="btn-ig-icon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        Instagram'dan Sipariş Ver
      </a>
    </div>
  `;

  return kart;
}

function urunleriGoster(urunler) {
  urunlerGrid.innerHTML = "";
  urunler.forEach((urun, i) => {
    const kart = urunKartiOlustur(urun);
    kart.style.transitionDelay = `${i * 0.08}s`;
    urunlerGrid.appendChild(kart);
  });
  gozlemciKur();
}

function hataGoster(mesaj) {
  if (urunlerYukleniyor) urunlerYukleniyor.hidden = true;
  if (urunlerHata) {
    urunlerHata.hidden = false;
    urunlerHata.textContent = mesaj;
  }
}

function instagramLinkleriniGuncelle(kullanici) {
  document.querySelectorAll("[data-instagram]").forEach((el) => {
    el.href = instagramUrl;
    if (el.dataset.instagramLabel) {
      el.textContent = el.dataset.instagramLabel;
    } else if (
      el.classList.contains("footer-ig-btn") ||
      el.classList.contains("footer-ig") ||
      el.classList.contains("nav-ig-text")
    ) {
      el.textContent = kullanici || "@gonul_sepet35";
    }
  });
}

async function urunleriYukle() {
  try {
    const veri = await siteVerisiAl();
    if (!veri) throw new Error("Veri bulunamadı");

    instagramUrl = veri.instagram || instagramUrl;

    if (!Array.isArray(veri.urunler) || veri.urunler.length === 0) {
      hataGoster("Henüz listelenecek ürün bulunmuyor.");
      return;
    }

    if (urunlerYukleniyor) urunlerYukleniyor.hidden = true;
    if (urunlerHata) urunlerHata.hidden = true;
    urunleriGoster(veri.urunler);
    instagramLinkleriniGuncelle(veri.instagramKullanici);
  } catch (err) {
    console.error(err);
    hataGoster(
      "Ürünler yüklenemedi. Sayfayı yenileyin (Ctrl+F5)."
    );
  }
}

function mobilMenuKur() {
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener("click", () => {
    const acik = nav.classList.toggle("nav--acik");
    menuBtn.setAttribute("aria-expanded", acik ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--acik");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function gozlemciKur() {
  const hedefler = document.querySelectorAll(".fade-in:not(.fade-in--gorunur)");
  if (!hedefler.length) return;

  if (!("IntersectionObserver" in window)) {
    hedefler.forEach((el) => el.classList.add("fade-in--gorunur"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("fade-in--gorunur");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );
  hedefler.forEach((el) => obs.observe(el));
}

document.addEventListener("DOMContentLoaded", async () => {
  mobilMenuKur();
  gozlemciKur();
  await urunleriYukle();
});
