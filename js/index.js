(function() {
  /* ==========================================================================
     1. POMOCNÉ FUNKCE A SCROLLOVÁNÍ
  ========================================================================== */
  const select = (el, all = false) => {
    if (!el) return null;
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  const onscroll = (el, listener) => {
    if (el) el.addEventListener('scroll', listener);
  };

  const scrollto = (el) => {
    const targetElement = select(el);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ==========================================================================
     2. ODPOČTY (HORNÍ PANEL + KARTY)
  ========================================================================== */
  const fixedFutureDate = new Date();
  fixedFutureDate.setMonth(fixedFutureDate.getMonth() + 2);
  fixedFutureDate.setHours(23, 59, 59, 999);
  const cardTargetTime = fixedFutureDate.getTime();

  function initCountdowns() {
    const topCountdown = document.querySelector('.info-bar-item.countdown-item');
    if (topCountdown) {
      const targetDateStr = topCountdown.getAttribute('data-end-date');
      if (targetDateStr) {
        const targetTime = new Date(targetDateStr).getTime();
        const now = new Date().getTime();
        const difference = targetTime - now;

        const dEl = document.getElementById('days');
        const hEl = document.getElementById('hours');
        const mEl = document.getElementById('minutes');
        const sEl = document.getElementById('seconds');

        if (dEl && hEl && mEl && sEl) {
          if (difference <= 0) {
            dEl.textContent = '00';
            hEl.textContent = '00';
            mEl.textContent = '00';
            sEl.textContent = '00';
          } else {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            dEl.textContent = String(days).padStart(2, '0');
            hEl.textContent = String(hours).padStart(2, '0');
            mEl.textContent = String(minutes).padStart(2, '0');
            sEl.textContent = String(seconds).padStart(2, '0');
          }
        }
      }
    }

    // 2. Odpocet v kartach
    const cardCountdowns = document.querySelectorAll('.card-countdown');
    cardCountdowns.forEach(item => {
      const numbers = item.querySelectorAll('.card-timer span, .number');
      if (numbers.length < 4) return;

      const now = new Date().getTime();
      const difference = cardTargetTime - now;

      if (difference <= 0) {
        numbers[0].textContent = '00';
        numbers[1].textContent = '00';
        numbers[2].textContent = '00';
        numbers[3].textContent = '00';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      numbers[0].textContent = String(days).padStart(2, '0');
      numbers[1].textContent = String(hours).padStart(2, '0');
      numbers[2].textContent = String(minutes).padStart(2, '0');
      numbers[3].textContent = String(seconds).padStart(2, '0');
    });
  }

  /* ==========================================================================
     3. INICIALIZACE ZBYTKU WEBU
  ========================================================================== */
  function initMain() {
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

    const navbarlinks = select('#navbar .scrollto', true);
    const navbarlinksActive = () => {
      let position = window.scrollY + 200;
      navbarlinks.forEach(navbarlink => {
        if (!navbarlink.hash) return;
        let section = select(navbarlink.hash);
        if (!section) return;
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      });
    };
    navbarlinksActive();
    onscroll(window, navbarlinksActive);

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

    initCountdowns();
    setInterval(initCountdowns, 1000);

    const modal = select("#vote-modal");
    const modalCloseBtn = select("#modal-close");
    const candidateText = select("#selected-candidate");
    const candidateInput = select("#candidate-input");
    const voteForm = select("#vote-form");
    const modalMsg = select("#modal-msg");

    function showModalMsg(text, isError = true) {
      if (!modalMsg) return;
      modalMsg.textContent = text;
      modalMsg.style.display = "block";
      modalMsg.style.padding = "0px";
      modalMsg.style.marginBottom = "15px";
      modalMsg.style.fontSize = "14px";
      modalMsg.style.textAlign = "center";

      if (isError) {
        modalMsg.style.color = "#ff4d4d";
      } else {
        modalMsg.style.color = "#2ecc71";
      }
    }

    function clearModalMsg() {
      if (!modalMsg) return;
      modalMsg.textContent = "";
      modalMsg.style.display = "none";
    }

    function openModal(candidateName) {
      if (!modal) return;

      const activeCard = select(".challenge-card.active");
      const challengeId = activeCard ? (activeCard.getAttribute("data-id") || "global-vote") : "global-vote";

      const selectionWrapper = candidateText ? candidateText.parentElement : null;

      if (localStorage.getItem(`voted_${challengeId}`) === "true") {
        modal.classList.add("is-open");
        modal.style.display = "flex";
        if (voteForm) voteForm.style.display = "none";
        
        if (selectionWrapper) {
          selectionWrapper.style.display = "none";
        }

        showModalMsg("Z tohoto zarizeni jiz byl hlas v teto vyzve odeslan. Dekujeme!", false);
        return;
      }

      if (selectionWrapper) {
        selectionWrapper.style.display = "block";
      }

      const cleanName = candidateName ? candidateName.replace(/\s+/g, ' ').trim() : '';
      if (candidateText) candidateText.textContent = cleanName;
      if (candidateInput) candidateInput.value = cleanName;
      
      clearModalMsg();
      if (voteForm) voteForm.style.display = "block";

      modal.classList.add("is-open");
      modal.style.display = "flex";
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.style.display = "none";
      clearModalMsg();
      if (voteForm) {
        voteForm.reset();
        voteForm.style.display = "block";
      }

      const selectionWrapper = candidateText ? candidateText.parentElement : null;
      if (selectionWrapper) {
        selectionWrapper.style.display = "block";
      }
    }

    document.documentElement.addEventListener("click", (e) => {
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
      voteForm.setAttribute("novalidate", "true");

      voteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearModalMsg();
        
        const nameInput = select("#user-name");
        const emailInput = select("#voter-email") || select("#user-email");
        const termsCheckbox = select("#terms-agree");

        if (!nameInput || !nameInput.value.trim()) {
          showModalMsg("Vyplnte prosim vase jmeno a prijmeni.");
          if (nameInput) nameInput.focus();
          return;
        }

        if (!emailInput || !emailInput.value.trim()) {
          showModalMsg("Vyplnte prosim vas e-mail.");
          if (emailInput) emailInput.focus();
          return;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
          showModalMsg("Pro odeslani hlasu musite souhlasit se zpracovanim osobnich udaju.");
          if (termsCheckbox) termsCheckbox.focus();
          return;
        }

        const formData = {
          candidate: candidateInput ? candidateInput.value : "",
          fullname: nameInput.value.trim(),
          email: emailInput.value.trim(),
          termsAccepted: termsCheckbox ? termsCheckbox.checked : false
        };

        const activeCard = select(".challenge-card.active");
        const challengeId = activeCard ? (activeCard.getAttribute("data-id") || "global-vote") : "global-vote";
        localStorage.setItem(`voted_${challengeId}`, "true");

        voteForm.style.display = "none";

        showModalMsg(`Dekujeme za hlas pro kandidata: ${formData.candidate}!`, false);
        
        setTimeout(() => {
          closeModal();
        }, 2500);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMain);
  } else {
    initMain();
  }
})();
