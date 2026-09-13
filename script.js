const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const scrollProgress = document.getElementById("scrollProgress");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (scrollProgress) scrollProgress.style.width = `${ratio * 100}%`;
}, { passive: true });

menuBtn.addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});

document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", () => document.body.classList.remove("menu-open"));
});

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
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
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

// Header/footer logo and BACK TO TOP behave like buttons instead of hash links.
document.querySelectorAll(".brand-logo, .back-top").forEach(el => {
  el.removeAttribute("href");
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.style.cursor = "pointer";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  };

  el.addEventListener("click", scrollToTop);
  el.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToTop();
    }
  });
});
