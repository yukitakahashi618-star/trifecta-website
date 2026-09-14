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
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => setMenuState(false)));
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

// Launch announcement modal
const noticeModal = document.createElement("div");
noticeModal.className = "notice-modal";
noticeModal.setAttribute("role", "dialog");
noticeModal.setAttribute("aria-modal", "true");
noticeModal.setAttribute("aria-labelledby", "noticeTitle");
noticeModal.innerHTML = `
  <div class="notice-modal__panel">
    <button class="notice-modal__close" type="button" aria-label="お知らせを閉じる"><span></span><span></span></button>
    <p class="notice-modal__eyebrow">NEWS</p>
    <h2 id="noticeTitle">お知らせ</h2>
    <div class="notice-modal__line" aria-hidden="true"></div>
    <p class="notice-modal__text">株式会社Trifectaのコーポレートサイトを公開しました。<br>今後ともよろしくお願いいたします。</p>
  </div>`;
document.body.appendChild(noticeModal);

const noticeClose = noticeModal.querySelector(".notice-modal__close");
const closeNotice = () => {
  noticeModal.classList.remove("is-open");
  document.body.classList.remove("notice-open");
};
const openNotice = () => {
  noticeModal.classList.add("is-open");
  document.body.classList.add("notice-open");
  noticeClose.focus({ preventScroll: true });
};
noticeClose.addEventListener("click", closeNotice);
noticeModal.addEventListener("click", event => { if (event.target === noticeModal) closeNotice(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && noticeModal.classList.contains("is-open")) closeNotice(); });
window.addEventListener("load", () => window.setTimeout(openNotice, reduceMotion ? 0 : 450), { once: true });