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
     2. SAMOSTATNÝ A FUNKČNÍ ODPOČET ČASU
  ========================================================================== */
  function initCountdowns() {
    const countdownItems = document.querySelectorAll('.countdown-item');

    countdownItems.forEach(item => {
      // Načtení data přímo z atributu data-end-date
      const targetDateStr = item.getAttribute('data-end-date');
      if (!targetDateStr) return;

      const targetTime = new Date(targetDateStr).getTime();
      if (isNaN(targetTime)) return;

      const numbers = item.querySelectorAll('.number');
      if (numbers.length < 4) return;

      function updateTimer() {
        const now = new Date().getTime();
        const difference = targetTime - now;

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
      }

      // Spustit ihned a pak každou sekundu
      updateTimer();
      setInterval(updateTimer, 1000);
    });
  }

  /* ==========================================================================
     3. INICIALIZACE VŠECH MODULŮ
  ========================================================================== */
  function init() {
    // 1. Spustíme odpočet
    initCountdowns();

    // 2. Efekt pro scrollující navbar
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

    // 3. Aktivní položka v navigaci
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

    // 4. Mobilní menu a kotvy
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

    // 5. Řízení karet výzev
    const cards = select(".challenge-card", true);
    if (cards.length > 0) {
      const today = new Date();
      let activeCardTarget = null;

      cards.forEach(card => {
        const dateAttr = card.getAttribute("data-date");
        const endDateAttr = card.getAttribute("data-end-date");
        const winnerAttr = card.getAttribute("data-winner");

        if (dateAttr) {
          const publishDate = new Date(dateAttr);
          publishDate.setHours(0, 0, 0, 0);
          const compareToday = new Date(today);
          compareToday.setHours(0, 0, 0, 0);

          card.classList.remove("active", "locked", "unlocked");

          if (compareToday >= publishDate) {
            card.classList.add("unlocked");
            activeCardTarget = card; 
          } else {
            card.classList.add("locked");
          }
        }

        if (endDateAttr) {
          const endDate = new Date(endDateAttr);
          const votingArea = card.querySelector(".voting-area");
          let endedArea = card.querySelector(".ended-area");

          if (today >= endDate) {
            if (votingArea) votingArea.style.display = "none";

            if (!endedArea) {
              endedArea = document.createElement("div");
              endedArea.className = "ended-area";
              card.appendChild(endedArea);
            }

            endedArea.style.display = "block";
            endedArea.innerHTML = `
              <div class="status-ended-box" style="text-align: center; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-top: 10px;">
                <h4 style="margin: 0 0 5px 0; color: #ff4d4d; text-transform: uppercase;">Hlasování ukončeno</h4>
                ${winnerAttr ? `<p style="margin: 0; font-weight: bold; font-size: 1.1em;">VÍTĚZ: <span style="color: #ffb703;">${winnerAttr}</span></p>` : ''}
              </div>
            `;
          }
        }
      });

      if (activeCardTarget) {
        activeCardTarget.classList.remove("locked");
        activeCardTarget.classList.add("active");
      } else if (cards[0]) {
        cards[0].classList.remove("locked");
        cards[0].classList.add("active");
      }
    }

    // 6. Modal a Formulář
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
      modalMsg.style.padding = "10px 15px";
      modalMsg.style.marginBottom = "15px";
      modalMsg.style.borderRadius = "6px";
      modalMsg.style.fontSize = "14px";
      modalMsg.style.textAlign = "center";

      if (isError) {
        modalMsg.style.backgroundColor = "rgba(255, 77, 77, 0.15)";
        modalMsg.style.color = "#ff4d4d";
        modalMsg.style.border = "1px solid #ff4d4d";
      } else {
        modalMsg.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
        modalMsg.style.color = "#2ecc71";
        modalMsg.style.border = "1px solid #2ecc71";
      }
    }

    function clearModalMsg() {
      if (!modalMsg) return;
      modalMsg.textContent = "";
      modalMsg.style.display = "none";
    }

    function openModal(candidateName) {
      if (!modal) return;
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
    }

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
      voteForm.setAttribute("novalidate", "true");

      voteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearModalMsg();
        
        const nameInput = select("#user-name");
        const emailInput = select("#voter-email") || select("#user-email");
        const termsCheckbox = select("#terms-agree");

        if (!nameInput || !nameInput.value.trim()) {
          showModalMsg("Vyplňte prosím vaše jméno a příjmení.");
          if (nameInput) nameInput.focus();
          return;
        }

        if (!emailInput || !emailInput.value.trim()) {
          showModalMsg("Vyplňte prosím váš e-mail.");
          if (emailInput) emailInput.focus();
          return;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
          showModalMsg("Pro odeslání hlasu musíte souhlasit se zpracováním osobních údajů.");
          if (termsCheckbox) termsCheckbox.focus();
          return;
        }

        const formData = {
          candidate: candidateInput ? candidateInput.value : "",
          fullname: nameInput.value.trim(),
          email: emailInput.value.trim(),
          termsAccepted: termsCheckbox ? termsCheckbox.checked : false
        };

        voteForm.style.display = "none";
        showModalMsg(`Děkujeme za hlas pro kandidáta: ${formData.candidate}!`, false);
        
        setTimeout(() => {
          closeModal();
        }, 2500);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
