(function() {
  /* ==========================================================================
     1. POMOCNÉ FUNKCE A SCROLLOVÁNÍ
  ========================================================================== */
  const select = (el, all = false) => {
    if (!el) return null;
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  const onscroll = (el, listener) => {
    if (el) el.addEventListener('scroll', listener);
  };

  const scrollto = (el) => {
    const targetElement = select(el);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  /* ==========================================================================
     INICIALIZACE PO NAČTENÍ DOM
  ========================================================================== */
  function init() {
    /* --- Efekt pro scrollující navbar --- */
    const selectNavbar = select('#navbar');
    if (selectNavbar) {
      const navbarScrolled = () => {
        if (window.scrollY > 100) {
          selectNavbar.classList.add('navbar-scrolled');
        } else {
          selectNavbar.classList.remove('navbar-scrolled');
        }
      };
      navbarScrolled();
      onscroll(window, navbarScrolled);
    }

    /* --- Ovládání menu a kotvy --- */
    const menu = select(".menu");
    const hamburger = select(".hamburger");
    const menuIcon = select(".svg-menu");
    const closeIcon = select(".svg-menu-close");
    const allAnchorLinks = select('a[href^="#"]', true);

    function toggleMenu() {
      if (!menu || !menuIcon || !closeIcon || !hamburger) return;

      menu.classList.toggle("showMenu");
      const isMenuNowOpen = menu.classList.contains("showMenu");
      
      hamburger.setAttribute("aria-expanded", isMenuNowOpen);
      
      if (isMenuNowOpen) {
        closeIcon.style.display = "block";
        menuIcon.style.display = "none";
      } else {
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
      }
    }

    if (hamburger) {
      hamburger.addEventListener("click", toggleMenu);
    }

    allAnchorLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        if (menu && menu.classList.contains("showMenu")) {
          toggleMenu();
        }

        if (href && href.startsWith("#") && href !== "#") {
          e.preventDefault();
          scrollto(href);
        }
      });
    });

    /* --- Řízení aktivní a zamčené karty podle data --- */
    const cards = select(".challenge-card", true);
    if (cards.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let lastUnlockedCard = null;

      cards.forEach(card => {
        const dateAttr = card.getAttribute("data-date");
        if (!dateAttr) return;

        const publishDate = new Date(dateAttr);
        publishDate.setHours(0, 0, 0, 0);

        card.classList.remove("active", "locked", "unlocked");

        if (today >= publishDate) {
          card.classList.add("unlocked");
          lastUnlockedCard = card;
        } else {
          card.classList.add("locked");
        }
      });

      if (lastUnlockedCard) {
        lastUnlockedCard.classList.remove("locked");
        lastUnlockedCard.classList.add("active");
      } else if (cards[0]) {
        cards[0].classList.remove("locked");
        cards[0].classList.add("active");
      }
    }

    /* --- Ovládání modalu a hlasovacího formuláře --- */
    const modal = select("#vote-modal");
    const modalCloseBtn = select("#modal-close");
    const candidateText = select("#selected-candidate");
    const candidateInput = select("#candidate-input");
    const voteForm = select("#vote-form");

    function openModal(candidateName) {
      if (!modal) return;
      
      const cleanName = candidateName ? candidateName.replace(/\s+/g, ' ').trim() : '';
      
      if (candidateText) candidateText.textContent = cleanName;
      if (candidateInput) candidateInput.value = cleanName;
      
      modal.classList.add("is-open");
      modal.style.display = "flex"; // Zajišťuje zobrazení i při chybějícím CSS pravidle
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.style.display = "none";
      if (voteForm) voteForm.reset();
    }

    // Event delegation na document – zachytí kliknutí na jakékoli .btn-vote i uvnitř potomků
    document.addEventListener("click", (e) => {
      const voteBtn = e.target.closest(".btn-vote");
      if (voteBtn) {
        e.preventDefault();
        openModal(voteBtn.innerText || voteBtn.textContent);
      }
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.classList.contains("modal-overlay")) {
          closeModal();
        }
      });
    }

    if (voteForm) {
      voteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const emailInput = select("#voter-email") || select("#user-email");
        const nameInput = select("#user-name");

        const formData = {
          candidate: candidateInput ? candidateInput.value : "",
          fullname: nameInput ? nameInput.value : "",
          email: emailInput ? emailInput.value : ""
        };

        console.log("Odeslaná data:", formData);
        alert(`Děkujeme za hlas pro: ${formData.candidate}!`);
        
        closeModal();
      });
    }
  }

  // Bezpečné spuštění až po kompletním načtení DOM stromu
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();