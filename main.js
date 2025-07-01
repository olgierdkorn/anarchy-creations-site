// Minimalny, zoptymalizowany main.js: tylko efekt konsoli i loop scroll

function typeWriterEffect(element, text, speedMin = 10, speedMax = 50) {
  if (!element) return;
  if (element._typewriterInterval) clearInterval(element._typewriterInterval);
  element.textContent = ">  ";
  let i = 0;
  function typeNext() {
    if (i < text.length) {
      element.textContent += text.charAt(i++);
      const delay = Math.floor(Math.random() * (speedMax - speedMin + 1)) + speedMin;
      element._typewriterInterval = setTimeout(typeNext, delay);
    } else {
      clearTimeout(element._typewriterInterval);
    }
  }
  typeNext();
}

function updateHeader(sectionType) {
  const status = document.getElementById("consoleText");
  const sectionNames = {
    'system-breakdown': "./boot/system-breakdown.exe",
    'project-showtime': "./top_secret/showtime.tba",
    'about-us': "./dev/operator.profile",
    'contact': "./net/comms.cfg"
  };
  if (status && sectionNames[sectionType]) {
    typeWriterEffect(status, `Initializing ${sectionNames[sectionType]}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector('main');
  const wrapper = document.querySelector('.sections-wrapper');
  if (!main || !wrapper) return;

  // Funkcja do tworzenia klonów (na podstawie oryginału)
  function createSectionClone(original, sectionType) {
    const clone = original.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('data-clone', 'true');
    clone.setAttribute('data-section-type', sectionType);
    return clone;
  }

  // Usuwanie starych klonów
  Array.from(wrapper.querySelectorAll('[data-clone="true"]')).forEach(e => e.remove());

  // Pobierz oryginalne sekcje
  const sections = Array.from(wrapper.querySelectorAll('.section')).filter(s => !s.hasAttribute('data-clone'));
  const firstSection = sections[0];
  const lastSection = sections[sections.length - 1];

  // Dodaj klon ostatniej sekcji na górę
  const cloneLast = createSectionClone(lastSection, lastSection.getAttribute('data-section-type'));
  wrapper.insertBefore(cloneLast, wrapper.firstElementChild);
  // Dodaj klon pierwszej sekcji na dół
  const cloneFirst = createSectionClone(firstSection, firstSection.getAttribute('data-section-type'));
  wrapper.appendChild(cloneFirst);

  // Scroll do pierwszej oryginalnej sekcji
  setTimeout(() => {
    firstSection.scrollIntoView({ behavior: 'auto' });
    updateHeader(firstSection.getAttribute('data-section-type'));
  }, 0);

  let isLooping = false;
  let lastSectionType = null;

  // Infinity scroll: jeśli klon na górze/dole jest w pełni widoczny, przeskocz do oryginału
  function handleInfinityScroll() {
    const sectionsAll = Array.from(wrapper.children);
    const viewportHeight = window.innerHeight;
    for (let i = 0; i < sectionsAll.length; i++) {
      const section = sectionsAll[i];
      const rect = section.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= viewportHeight) {
        if (section.hasAttribute('data-clone')) {
          isLooping = true;
          if (i === 0) {
            // Klon ostatniej sekcji na górze -> przeskocz do oryginału na dole
            sections[sections.length - 1].scrollIntoView({ behavior: 'auto' });
          } else if (i === sectionsAll.length - 1) {
            // Klon pierwszej sekcji na dole -> przeskocz do oryginału na górze
            sections[0].scrollIntoView({ behavior: 'auto' });
          }
          setTimeout(() => { isLooping = false; }, 30);
        }
        break;
      }
    }
  }

  // Aktywna sekcja na podstawie środka viewportu
  function getActiveSection() {
    const sectionsAll = Array.from(wrapper.children);
    const viewportCenter = window.innerHeight / 2;
    let closest = null;
    let minDist = Infinity;
    for (const section of sectionsAll) {
      const rect = section.getBoundingClientRect();
      const sectionCenter = (rect.top + rect.bottom) / 2;
      const dist = Math.abs(sectionCenter - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = section;
      }
    }
    return closest;
  }

  function handleActiveSection() {
    if (isLooping) return;
    const active = getActiveSection();
    if (!active) return;
    const sectionType = active.getAttribute('data-section-type');
    if (sectionType && lastSectionType !== sectionType) {
      lastSectionType = sectionType;
      updateHeader(sectionType);
    }
  }

  // Obsługa scrolla, resize i po instant scrollu
  main.addEventListener('scroll', () => {
    handleInfinityScroll();
    handleActiveSection();
  }, { passive: true });
  window.addEventListener('resize', handleActiveSection);

  // Po instant scrollu (np. po infinity scroll)
  main.addEventListener('transitionend', handleActiveSection);
  main.addEventListener('scrollend', handleActiveSection);

  // Dla instant scrolla po infinity scrollu (timeout)
  setInterval(handleActiveSection, 100);
});
