const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const scrollProgress = document.getElementById("scrollProgress");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (scrollProgress) scrollProgress.style.width = `${ratio * 100}%`;
}, { passive: true });

const setMenuState = open => {
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
};

menuBtn.addEventListener("click", () => setMenuState(!document.body.classList.contains("menu-open")));
document.addEventListener("keydown", event => { if (event.key === "Escape") setMenuState(false); });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
document.querySelectorAll(".reveal, .section-label").forEach(el => observer.observe(el));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  let ticking = false;
  const updateParallax = () => {
    document.querySelectorAll(".scroll-section").forEach(section => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (center - viewportCenter) * -0.035;
      const word = section.querySelector(".section-word");
      if (word) word.style.setProperty("--word-shift", `${offset}px`);
    });
    const featuredWork = document.querySelector(".work-card-large");
    if (featuredWork) {
      const r = featuredWork.getBoundingClientRect();
      const shift = Math.max(-22, Math.min(22, (r.top - window.innerHeight * .5) * -.035));
      featuredWork.style.setProperty("--work-shift", `${shift}px`);
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();
  document.querySelectorAll(".work-visual").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${((e.clientX-r.left)/r.width)*100}%`);
      el.style.setProperty("--py", `${((e.clientY-r.top)/r.height)*100}%`);
    });
  });
}

document.querySelectorAll(".brand-logo, .back-top").forEach(el => {
  el.removeAttribute("href");
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.style.cursor = "pointer";
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  el.addEventListener("click", scrollToTop);
  el.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); scrollToTop(); }
  });
});

// NEWS section + detail modal
const noticeStyles = document.createElement("style");
noticeStyles.textContent = `
.news-strip{background:#111313;color:#efede6;padding:0 8vw;scroll-margin-top:72px;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.1)}.news-strip__button{width:100%;min-height:112px;border:0;background:transparent;color:inherit;display:grid;grid-template-columns:100px 130px 1fr 32px;gap:22px;align-items:center;text-align:left;cursor:pointer;font-family:"Noto Sans JP",sans-serif;transition:background .3s,padding .3s;padding:0 4px}.news-strip__button:hover{background:rgba(255,255,255,.035);padding-left:18px;padding-right:18px}.news-strip__label{font:600 11px/1 "DM Sans";letter-spacing:.22em;color:#d3b779}.news-strip__date{font:500 11px/1 "DM Sans";letter-spacing:.08em;color:rgba(255,255,255,.48)}.news-strip__title{font-size:14px;line-height:1.8;color:rgba(255,255,255,.9)}.news-strip__arrow{font-size:22px;color:#d3b779;text-align:right;transition:transform .3s}.news-strip__button:hover .news-strip__arrow{transform:translate(3px,-3px)}.notice-modal{position:fixed;z-index:5000;inset:0;display:grid;place-items:center;padding:24px;background:rgba(5,9,12,.72);backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s ease}.notice-modal.is-open{opacity:1;visibility:visible}.notice-modal__panel{position:relative;width:min(620px,100%);padding:58px 62px 60px;background:#f2f0ea;color:#131414;box-shadow:0 28px 90px rgba(0,0,0,.28);transform:translateY(18px) scale(.985);transition:transform .4s ease}.notice-modal.is-open .notice-modal__panel{transform:none}.notice-modal__panel:before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#8e774d,#d3b779)}.notice-modal__eyebrow{font:600 10px/1 "DM Sans";letter-spacing:.24em;color:#9a8151;margin-bottom:22px}.notice-modal__date{font:500 10px/1 "DM Sans";letter-spacing:.1em;color:#8a877f;margin-bottom:16px}.notice-modal__panel h2{font-family:"Noto Serif JP";font-size:clamp(28px,3vw,38px);font-weight:500;letter-spacing:.02em}.notice-modal__line{width:44px;height:1px;background:#b59a67;margin:26px 0}.notice-modal__text{font-size:14px;line-height:2.15;color:#5f5f5b}.notice-modal__close{position:absolute;top:20px;right:20px;width:38px;height:38px;border:0;background:transparent;cursor:pointer}.notice-modal__close span{position:absolute;left:8px;top:18px;width:22px;height:1px;background:#555}.notice-modal__close span:first-child{transform:rotate(45deg)}.notice-modal__close span:last-child{transform:rotate(-45deg)}body.notice-open{overflow:hidden}@media(max-width:1100px) and (min-width:901px){.nav{gap:1.55vw}.nav a{font-size:10px}}@media(max-width:700px){.news-strip{padding:0 6.5vw}.news-strip__button{min-height:112px;grid-template-columns:68px 1fr 24px;gap:8px 12px;padding:0}.news-strip__button:hover{padding:0;background:transparent}.news-strip__label{grid-row:1/3}.news-strip__date{align-self:end}.news-strip__title{align-self:start;font-size:12px}.news-strip__arrow{grid-column:3;grid-row:1/3}.notice-modal{padding:18px}.notice-modal__panel{padding:48px 28px 42px}.notice-modal__text{font-size:13px;line-height:2}.notice-modal__close{top:12px;right:12px}}
`;
document.head.appendChild(noticeStyles);

const hero = document.querySelector(".hero");
let newsStrip = null;
if (hero) {
  newsStrip = document.createElement("section");
  newsStrip.className = "news-strip";
  newsStrip.id = "news";
  newsStrip.setAttribute("aria-label", "お知らせ");
  newsStrip.innerHTML = `<button class="news-strip__button" type="button" aria-haspopup="dialog"><span class="news-strip__label">NEWS</span><time class="news-strip__date" datetime="2026-09-14">2026.09.14</time><span class="news-strip__title">株式会社Trifectaのコーポレートサイトを公開しました。</span><span class="news-strip__arrow" aria-hidden="true">↗</span></button>`;
  hero.insertAdjacentElement("afterend", newsStrip);
}

// Keep navigation order aligned with page order: NEWS -> ABOUT -> ...
const nav = document.getElementById("nav");
if (nav && !nav.querySelector('a[href="#news"]')) {
  const newsNav = document.createElement("a");
  newsNav.href = "#news";
  newsNav.textContent = "NEWS";
  nav.insertBefore(newsNav, nav.firstElementChild);
}
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => setMenuState(false)));

const noticeModal = document.createElement("div");
noticeModal.className = "notice-modal";
noticeModal.setAttribute("role", "dialog");
noticeModal.setAttribute("aria-modal", "true");
noticeModal.setAttribute("aria-labelledby", "noticeTitle");
noticeModal.innerHTML = `
  <div class="notice-modal__panel">
    <button class="notice-modal__close" type="button" aria-label="お知らせを閉じる"><span></span><span></span></button>
    <p class="notice-modal__eyebrow">NEWS</p>
    <p class="notice-modal__date">2026.09.14</p>
    <h2 id="noticeTitle">お知らせ</h2>
    <div class="notice-modal__line" aria-hidden="true"></div>
    <p class="notice-modal__text">株式会社Trifectaのコーポレートサイトを公開しました。<br>今後ともよろしくお願いいたします。</p>
  </div>`;
document.body.appendChild(noticeModal);

const noticeTrigger = document.querySelector(".news-strip__button");
const noticeClose = noticeModal.querySelector(".notice-modal__close");
const closeNotice = () => {
  noticeModal.classList.remove("is-open");
  document.body.classList.remove("notice-open");
  if (noticeTrigger) noticeTrigger.focus({ preventScroll: true });
};
const openNotice = () => {
  noticeModal.classList.add("is-open");
  document.body.classList.add("notice-open");
  noticeClose.focus({ preventScroll: true });
};
if (noticeTrigger) noticeTrigger.addEventListener("click", openNotice);
noticeClose.addEventListener("click", closeNotice);
noticeModal.addEventListener("click", event => { if (event.target === noticeModal) closeNotice(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && noticeModal.classList.contains("is-open")) closeNotice(); });