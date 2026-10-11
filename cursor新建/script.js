const loader = document.getElementById("loader");
const themeToggle = document.getElementById("theme-toggle");
const printBtn = document.getElementById("print-btn");
const menuBtn = document.getElementById("menu-btn");
const mobileNav = document.getElementById("mobile-nav");
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const glow = document.querySelector(".cursor-glow");
const progress = document.getElementById("progress");
const roleText = document.getElementById("role-text");
const portraitWrap = document.getElementById("portrait-wrap");

const roles = ["行政管理", "文稿与调研", "青年交流协作", "公共治理实务"];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

window.addEventListener("load", () => {
  window.setTimeout(() => loader.classList.add("is-done"), 950);
});

const savedTheme = localStorage.getItem("resume-theme");
if (savedTheme === "light") {
  document.documentElement.dataset.theme = "light";
  themeToggle.textContent = "深色";
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  if (next === "dark") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = "light";
  }
  localStorage.setItem("resume-theme", next);
  themeToggle.textContent = next === "light" ? "深色" : "浅色";
});

printBtn.addEventListener("click", () => window.print());

menuBtn.addEventListener("click", () => {
  mobileNav.hidden = !mobileNav.hidden;
  menuBtn.setAttribute("aria-expanded", String(!mobileNav.hidden));
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("pointermove", (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const box = button.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    button.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

function typeRole() {
  const current = roles[roleIndex];
  roleText.textContent = current.slice(0, charIndex);
  if (!deleting && charIndex < current.length) {
    charIndex += 1;
    window.setTimeout(typeRole, 90);
    return;
  }
  if (!deleting && charIndex === current.length) {
    deleting = true;
    window.setTimeout(typeRole, 1400);
    return;
  }
  if (deleting && charIndex > 0) {
    charIndex -= 1;
    window.setTimeout(typeRole, 45);
    return;
  }
  deleting = false;
  roleIndex = (roleIndex + 1) % roles.length;
  window.setTimeout(typeRole, 240);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  typeRole();
}

const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((el, index) => {
  el.style.animationDelay = `${Math.min(index % 6, 5) * 80}ms`;
});

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((el) => io.observe(el));

const counters = document.querySelectorAll("[data-count]");
const countIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
counters.forEach((el) => countIo.observe(el));

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav a")];

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${ratio * 100}%`;

  const current = sections.findLast((section) => window.scrollY + 120 >= section.offsetTop);
  navLinks.forEach((link) => {
    const active = current && link.getAttribute("href") === `#${current.id}`;
    link.classList.toggle("is-active", Boolean(active));
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

portraitWrap.addEventListener("pointermove", (event) => {
  const box = portraitWrap.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  portraitWrap.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
});

portraitWrap.addEventListener("pointerleave", () => {
  portraitWrap.style.transform = "";
});

function scrollToHash() {
  const id = location.hash.slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector(".topbar");
  const offset = (header ? header.offsetHeight : 80) + 16;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

window.addEventListener("hashchange", scrollToHash);
window.addEventListener("load", scrollToHash);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !message) {
    statusEl.textContent = "请把三项都填完整。";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    statusEl.textContent = "邮箱格式看起来不对。";
    return;
  }

  const subject = encodeURIComponent(`简历网站留言 · ${name}`);
  const body = encodeURIComponent(`${message}\n\n来自：${name} <${email}>`);
  window.location.href = `mailto:15366269116@163.com?subject=${subject}&body=${body}`;
  statusEl.textContent = "正在打开邮件客户端…";
  form.reset();
});
