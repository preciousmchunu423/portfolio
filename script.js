const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  primaryNavigation.classList.toggle("is-open", !isOpen);
});

primaryNavigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNavigation.classList.remove("is-open");
  }
});

const main = document.querySelector("main");
const sectionOrder = ["about", "projects", "skills", "certificates", "cv", "contact"];
sectionOrder.forEach((sectionId) => {
  const section = document.getElementById(sectionId);
  if (!section) {
    throw new Error(`Missing portfolio section: ${sectionId}`);
  }
  main.append(section);
});

const navigationLinks = [...primaryNavigation.querySelectorAll('a[href^="#"]')];
const visibleSections = new Map();
const sectionsToObserve = [...document.querySelectorAll(".screen")];

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    const activeId = [...visibleSections.entries()].sort((first, second) => second[1] - first[1])[0]?.[0];
    navigationLinks.forEach((link) => {
      const active = link.hash === `#${activeId}`;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, { threshold: [0.15, 0.35, 0.55, 0.75] });

  sectionsToObserve.forEach((section) => sectionObserver.observe(section));
}

const certificates = [
  {
    title: "IT Essentials: PC Hardware and Software",
    year: "2025",
    description: "IT Essentials covers personal computer hardware, software and troubleshooting.",
    file: "it-essentials.pdf"
  },
  {
    title: "Introduction to Data Science",
    year: "2025",
    description: "Introduction to data science concepts and working with data.",
    file: "data-science.pdf"
  },
  {
    title: "Introduction to Cybersecurity",
    year: "2026",
    description: "Introduction to cybersecurity, online safety and digital threats.",
    file: "cybersecurity.pdf"
  }
];

const carousel = document.querySelector(".certificate-carousel");
const certificateName = document.querySelector("#certificate-name");
const certificateCounter = document.querySelector("#certificate-counter");
const certificateIssuer = document.querySelector("#certificate-issuer");
const certificateDescription = document.querySelector(".certificate-description");
const certificateDocument = document.querySelector(".certificate-document");
const certificateOpenLink = document.querySelector(".certificate-open");
const certificateDots = document.querySelector(".carousel-dots");
const certificateStage = document.querySelector(".certificate-stage");
const slideshowToggle = document.querySelector(".carousel-toggle");
let currentCertificate = 0;
let slideshowTimer;
let isPlaying = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let isCarouselVisible = false;
let isPointerOverCarousel = false;
let isFocusWithinCarousel = false;
let touchStartX;

function showCertificate(index) {
  currentCertificate = (index + certificates.length) % certificates.length;
  const certificate = certificates[currentCertificate];

  certificateCounter.textContent = `${String(currentCertificate + 1).padStart(2, "0")} / ${String(certificates.length).padStart(2, "0")}`;
  certificateName.textContent = certificate.title;
  certificateIssuer.textContent = `Cisco Networking Academy · ${certificate.year}`;
  certificateDescription.textContent = certificate.description;
  certificateDocument.title = `${certificate.title} certificate`;
  const documentUrl = `${certificate.file}#toolbar=0&navpanes=0&view=FitH`;
  if (certificateDocument.getAttribute("src") !== documentUrl) {
    certificateDocument.src = documentUrl;
  }
  certificateOpenLink.href = certificate.file;
  certificateOpenLink.setAttribute("aria-label", `Open ${certificate.title} certificate in a new tab`);

  certificateDots.querySelectorAll("button").forEach((dot, dotIndex) => {
    if (dotIndex === currentCertificate) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function updateSlideshowTimer() {
  window.clearInterval(slideshowTimer);
  slideshowTimer = undefined;

  if (isPlaying && isCarouselVisible && !isPointerOverCarousel && !isFocusWithinCarousel) {
    slideshowTimer = window.setInterval(() => {
      showCertificate(currentCertificate + 1);
    }, 6000);
  }
}

certificates.forEach((certificate, index) => {
  const dot = document.createElement("button");
  dot.className = "carousel-dot";
  dot.type = "button";
  dot.setAttribute("aria-label", `Show certificate ${index + 1}: ${certificate.title}`);
  dot.addEventListener("click", () => showCertificate(index));
  certificateDots.append(dot);
});

carousel.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    showCertificate(currentCertificate + Number(button.dataset.direction));
  });
});

slideshowToggle.addEventListener("click", () => {
  isPlaying = !isPlaying;
  slideshowToggle.textContent = isPlaying ? "Pause slideshow" : "Play slideshow";
  slideshowToggle.setAttribute("aria-pressed", String(!isPlaying));
  updateSlideshowTimer();
});

carousel.addEventListener("pointerenter", () => {
  isPointerOverCarousel = true;
  updateSlideshowTimer();
});

carousel.addEventListener("pointerleave", () => {
  isPointerOverCarousel = false;
  updateSlideshowTimer();
});

carousel.addEventListener("focusin", () => {
  isFocusWithinCarousel = true;
  updateSlideshowTimer();
});

carousel.addEventListener("focusout", (event) => {
  if (!carousel.contains(event.relatedTarget)) {
    isFocusWithinCarousel = false;
    updateSlideshowTimer();
  }
});

certificateStage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showCertificate(currentCertificate + (event.key === "ArrowRight" ? 1 : -1));
  }
});

certificateStage.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") {
    touchStartX = event.clientX;
  }
});

certificateStage.addEventListener("pointerup", (event) => {
  if (event.pointerType === "touch" && touchStartX !== undefined) {
    const distance = event.clientX - touchStartX;
    if (Math.abs(distance) > 48) {
      showCertificate(currentCertificate + (distance < 0 ? 1 : -1));
    }
    touchStartX = undefined;
  }
});

if ("IntersectionObserver" in window) {
  const carouselObserver = new IntersectionObserver(([entry]) => {
    isCarouselVisible = entry.isIntersecting;
    updateSlideshowTimer();
  }, { threshold: 0.2 });
  carouselObserver.observe(carousel);
} else {
  isCarouselVisible = true;
}

showCertificate(0);
slideshowToggle.textContent = isPlaying ? "Pause slideshow" : "Play slideshow";
slideshowToggle.setAttribute("aria-pressed", String(!isPlaying));
updateSlideshowTimer();
