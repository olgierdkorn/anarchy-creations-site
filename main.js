const sections = Array.from(document.querySelectorAll(".section"));
let current = 0;
let isScrolling = false;
let typewriterInterval = null;

function typeToStatus(text) {
  const status = document.getElementById("status-line");
  if (!status) return;

  let i = 0;
  status.classList.remove("crt-cursor");
  status.textContent = "> ";

  const interval = setInterval(() => {
    status.textContent += text.charAt(i++);
    if (i > text.length) {
      clearInterval(interval);
      status.classList.add("crt-cursor");
    }
  }, 30);
}
function typeWriterEffect(element, text, speed = 25) {
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }

  element.textContent = ""; // wyczyść pole przed startem
  let i = 0;

  typewriterInterval = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
    }
  }, speed);
}
function updateHeader(index) {
  const status = document.getElementById("consoleText");
  const sectionNames = [
    "./boot/system-breakdown.exe",
    "./top_secret/showtime.tba",
    "./dev/operator.profile",
    "./net/comms.cfg",
  ];
  if (status) {
    typeWriterEffect(status, `> Initializing ${sectionNames[index]}`);
  }
}

function goToSection(index) {
  if (index >= 0 && index < sections.length) {
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth" });
    updateHeader(index);
    setTimeout(() => (isScrolling = false), 800);
    current = index;
  }
}

let scrollTimeout;
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (isScrolling) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (e.deltaY > 0) goToSection(current + 1);
      else if (e.deltaY < 0) goToSection(current - 1);
    }, 100);
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  if (isScrolling) return;
  if (e.key === "ArrowDown") goToSection(current + 1);
  if (e.key === "ArrowUp") goToSection(current - 1);
});

document.addEventListener("DOMContentLoaded", () => {
  goToSection(0);

  updateHeader(0);
});
