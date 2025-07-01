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
let scrollCooldown = false;
const main = document.querySelector('main');

// Loop scroll: IntersectionObserver + wheel/touch detection
function setupLoopScroll() {
  const firstSection = sections[0];
  const lastSection = sections[sections.length - 1];

  // Helper: cooldown
  function setCooldown() {
    scrollCooldown = true;
    setTimeout(() => (scrollCooldown = false), 1000);
  }

  // Observer for last section (scroll down)
  const observerDown = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !scrollCooldown) {
        // Listen for wheel/touch
        const onWheel = (e) => {
          if (e.deltaY > 0 && !scrollCooldown) {
            setCooldown();
            firstSection.scrollIntoView({ behavior: 'smooth' });
          }
        };
        const onTouch = (e) => {
          if (!scrollCooldown) {
            setCooldown();
            firstSection.scrollIntoView({ behavior: 'smooth' });
          }
        };
        main.addEventListener('wheel', onWheel, { once: true });
        main.addEventListener('touchend', onTouch, { once: true });
      }
    },
    { threshold: 0.7 }
  );
  observerDown.observe(lastSection);

  // Observer for first section (scroll up)
  const observerUp = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !scrollCooldown) {
        // Listen for wheel/touch
        const onWheel = (e) => {
          if (e.deltaY < 0 && !scrollCooldown) {
            setCooldown();
            lastSection.scrollIntoView({ behavior: 'smooth' });
          }
        };
        const onTouch = (e) => {
          if (!scrollCooldown) {
            setCooldown();
            lastSection.scrollIntoView({ behavior: 'smooth' });
          }
        };
        main.addEventListener('wheel', onWheel, { once: true });
        main.addEventListener('touchend', onTouch, { once: true });
      }
    },
    { threshold: 0.7 }
  );
  observerUp.observe(firstSection);
}

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector('main');
  const section1 = document.getElementById('system-breakdown');
  const section4 = document.getElementById('contact');
  if (!main || !section1 || !section4) return;

  // Usuń stare klony jeśli istnieją
  const oldClone1 = document.getElementById('clone-1');
  const oldClone4 = document.getElementById('clone-4');
  if (oldClone1) oldClone1.remove();
  if (oldClone4) oldClone4.remove();

  // Stwórz klona sekcji 4 na górze
  const clone4 = section4.cloneNode(true);
  clone4.removeAttribute('id');
  clone4.id = 'clone-4';
  clone4.setAttribute('aria-hidden', 'true');
  clone4.className = section4.className;
  clone4.style.cssText = section4.style.cssText;
  clone4.setAttribute('data-style-id', 'contact'); // dla stylowania jak #contact
  Array.from(section4.attributes).forEach(attr => {
    if (attr.name !== 'id' && attr.name !== 'aria-hidden') {
      clone4.setAttribute(attr.name, attr.value);
    }
  });
  main.insertBefore(clone4, main.firstElementChild);

  // Stwórz klona sekcji 1 na dole
  const clone1 = section1.cloneNode(true);
  clone1.removeAttribute('id');
  clone1.id = 'clone-1';
  clone1.setAttribute('aria-hidden', 'true');
  clone1.className = section1.className;
  clone1.style.cssText = section1.style.cssText;
  clone1.setAttribute('data-style-id', 'system-breakdown'); // dla stylowania jak #system-breakdown
  Array.from(section1.attributes).forEach(attr => {
    if (attr.name !== 'id' && attr.name !== 'aria-hidden') {
      clone1.setAttribute(attr.name, attr.value);
    }
  });
  main.appendChild(clone1);

  // Pozycje: 0-klon4, 1-section1, 2-section2, 3-section3, 4-section4, 5-klon1
  const allSections = Array.from(main.children);
  // Start na sekcji 1 (druga sekcja, index 1)
  allSections[1].scrollIntoView({ behavior: 'auto' });
  updateHeader(0);

  let isLooping = false;
  function scrollToSectionInstant(target) {
    isLooping = true;
    target.scrollIntoView({ behavior: 'auto' });
    setTimeout(() => { isLooping = false; }, 30);
  }

  // Observer na klony
  function handleLoopSnap(entries) {
    if (isLooping) return;
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio === 1) {
        if (entry.target.id === 'clone-4') {
          // Przeskocz niewidocznie do oryginału sekcji 4 (index 4)
          scrollToSectionInstant(allSections[4]);
          updateHeader(3);
        } else if (entry.target.id === 'clone-1') {
          // Przeskocz niewidocznie do oryginału sekcji 1 (index 1)
          scrollToSectionInstant(allSections[1]);
          updateHeader(0);
        }
      }
    }
  }
  const loopObserver = new IntersectionObserver(handleLoopSnap, {
    threshold: 1.0
  });
  loopObserver.observe(clone4);
  loopObserver.observe(clone1);
});
