/*==================================================
    TOYIN PORTFOLIO
    MAIN JAVASCRIPT
==================================================*/

"use strict";

/*==================================================
    ELEMENTS
==================================================*/

const header = document.getElementById("header");
const navbar = document.getElementById("navbar");
const menuBtn = document.getElementById("menu-btn");
const themeBtn = document.getElementById("theme-btn");


/*==================================================
    MOBILE MENU
==================================================*/

if (menuBtn && navbar) {

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("active");

        const icon = menuBtn.querySelector("i");

        if (navbar.classList.contains("active")) {

            icon.classList.remove("bx-menu");
            icon.classList.add("bx-x");

            menuBtn.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

        } else {

            icon.classList.remove("bx-x");
            icon.classList.add("bx-menu");

            menuBtn.setAttribute(
                "aria-label",
                "Open navigation menu"
            );
        }

    });
}


/*==================================================
    CLOSE MOBILE MENU
==================================================*/

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        if (!navbar || !menuBtn) return;

        navbar.classList.remove("active");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("bx-x");
        icon.classList.add("bx-menu");

        menuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    });

});


/*==================================================
    HEADER SCROLL EFFECT
==================================================*/

function handleHeaderScroll() {

    if (!header) return;

    if (window.scrollY > 30) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

}

window.addEventListener("scroll", handleHeaderScroll);

handleHeaderScroll();


/*==================================================
    DARK MODE
==================================================*/

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const icon = themeBtn.querySelector("i");

        if (document.body.classList.contains("dark-mode")) {

            icon.classList.remove("bx-moon");
            icon.classList.add("bx-sun");

            themeBtn.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            localStorage.setItem(
                "toyin-theme",
                "dark"
            );

        } else {

            icon.classList.remove("bx-sun");
            icon.classList.add("bx-moon");

            themeBtn.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            localStorage.setItem(
                "toyin-theme",
                "light"
            );

        }

    });

}


/*==================================================
    LOAD SAVED THEME
==================================================*/

const savedTheme = localStorage.getItem("toyin-theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    if (themeBtn) {

        const icon = themeBtn.querySelector("i");

        icon.classList.remove("bx-moon");
        icon.classList.add("bx-sun");

        themeBtn.setAttribute(
            "aria-label",
            "Switch to light mode"
        );
    }
}








/* ==================================================
   PROJECT FILTER
================================================== */

const projectFilters = document.querySelectorAll(".project-filter");
const projectCards = document.querySelectorAll(".project-card");


/* ==================================================
   PROJECT FILTER
================================================== */

projectFilters.forEach((filter) => {

    filter.addEventListener("click", () => {

        const selectedFilter = filter.getAttribute("data-filter");

        /* Remove active state from all filters */
        projectFilters.forEach((item) => {
            item.classList.remove("active");
        });

        /* Activate clicked filter */
        filter.classList.add("active");

        /*
            IMPORTANT:
            Query project cards here instead of outside the
            click event because the cards may be created
            dynamically from Supabase.
        */
        const projectCards =
            document.querySelectorAll(".project-card");

        /* Filter project cards */
        projectCards.forEach((card) => {

            const cardCategory =
                card.getAttribute("data-category");

            if (
                selectedFilter === "all" ||
                cardCategory === selectedFilter
            ) {

                card.style.display = "block";

                setTimeout(() => {

                    card.style.opacity = "1";
                    card.style.transform = "translateY(0)";

                }, 10);

            } else {

                card.style.opacity = "0";
                card.style.transform = "translateY(15px)";

                setTimeout(() => {

                    card.style.display = "none";

                }, 250);

            }

        });

    });

});










/* ==================================================
   SCROLL REVEAL ANIMATION
================================================== */

const revealElements = document.querySelectorAll(
    ".section-heading, " +
    ".about-container, " +
    ".skills-container, " +
    ".services-container, " +
    ".services-cta, " +
    ".projects-filters, " +
    ".projects-container, " +
    ".experience-container, " +
    ".testimonials-container, " +
    ".testimonial-cta, " +
    ".contact-container, " +
    ".footer-container"
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
});


const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("reveal-active");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach((element) => {
    revealObserver.observe(element);
});