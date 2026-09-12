"use strict";

/* ==================================================
   PORTFOLIO PROJECTS
   Supabase → Existing Project Cards
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const projectsContainer =
        document.getElementById("projects-container");

    if (!projectsContainer) {
        return;
    }


    /* ==================================================
       LOAD PUBLISHED PROJECTS
    ================================================== */

    async function loadProjects() {

        /* Show loading state */
        projectsContainer.innerHTML = `
            <div class="projects-loading">
                <i class="bx bx-loader-alt bx-spin"></i>
                <span>Loading projects...</span>
            </div>
        `;


        try {

            const {
                data: projects,
                error
            } = await supabaseClient

                .from("portfolio_projects")

                .select(`
                    id,
                    title,
                    short_description,
                    category,
                    technologies,
                    image_url,
                    live_url,
                    github_url,
                    case_study_url,
                    is_featured,
                    is_published,
                    created_at
                `)

                .eq("is_published", true)

                .order("is_featured", {
                    ascending: false
                })

                .order("created_at", {
                    ascending: false
                });


            if (error) {
                throw error;
            }


            /* No published projects */
            if (!projects || projects.length === 0) {

                projectsContainer.innerHTML = `
                    <div class="projects-empty">

                        <i class="bx bx-folder-open"></i>

                        <h3>No projects available yet</h3>

                        <p>
                            New projects will appear here soon.
                        </p>

                    </div>
                `;

                return;
            }


            /* Render projects */
            projectsContainer.innerHTML =
                projects
                    .map((project) => createProjectCard(project))
                    .join("");


            /* Apply current filter */
            applyProjectFilter("all");

        } catch (error) {

            console.error(
                "Failed to load portfolio projects:",
                error
            );


            projectsContainer.innerHTML = `
                <div class="projects-empty">

                    <i class="bx bx-error-circle"></i>

                    <h3>Unable to load projects</h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;

        }

    }


    /* ==================================================
       CREATE PROJECT CARD
    ================================================== */

    function createProjectCard(project) {

        const category =
            project.category || "other";


        const categoryLabel =
            getCategoryLabel(category);


        const imageHTML =
            createProjectImage(project);


        const technologyHTML =
            createTechnologyTags(
                project.technologies
            );


        const actionHTML =
            createProjectAction(project);


        const projectLink =
            getPrimaryProjectLink(project);


        const projectLinkHTML =
            projectLink
                ? `
                    <a
                        href="${escapeHTML(projectLink.url)}"
                        class="project-link"
                        ${projectLink.external ? 'target="_blank" rel="noopener noreferrer"' : ""}
                    >
                        ${escapeHTML(projectLink.label)}

                        <i class="bx bx-right-arrow-alt"></i>
                    </a>
                `
                : "";


        const featuredBadge =
            project.is_featured
                ? `
                    <span class="project-badge">
                        Featured Project
                    </span>
                `
                : "";


        return `
            <article
                class="project-card"
                data-category="${escapeHTML(category)}"
            >

                <div class="project-image">

                    ${imageHTML}

                    ${actionHTML}

                    ${featuredBadge}

                </div>


                <div class="project-content">

                    <div class="project-category">
                        ${escapeHTML(categoryLabel)}
                    </div>


                    <h3>
                        ${escapeHTML(project.title)}
                    </h3>


                    <p>
                        ${escapeHTML(project.short_description)}
                    </p>


                    <div class="project-tech">

                        ${technologyHTML}

                    </div>


                    ${projectLinkHTML}

                </div>

            </article>
        `;
    }


    /* ==================================================
       PROJECT IMAGE
    ================================================== */

    function createProjectImage(project) {

        if (project.image_url) {

            return `
                <img
                    src="${escapeHTML(project.image_url)}"
                    alt="${escapeHTML(project.title)}"
                    class="project-real-image"
                    loading="lazy"
                />
            `;

        }


        /* Fallback placeholder */

        const icon =
            getCategoryIcon(project.category);


        return `
            <div class="project-placeholder">

                <i class="bx ${icon}"></i>

                <span>
                    ${escapeHTML(project.title)}
                </span>

            </div>
        `;

    }


    /* ==================================================
       PROJECT ACTION
    ================================================== */

    function createProjectAction(project) {

        const url =
            project.case_study_url ||
            project.live_url ||
            project.github_url;


        if (!url) {
            return "";
        }


        return `
            <div class="project-overlay">

                <a
                    href="${escapeHTML(url)}"
                    class="project-action"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View ${escapeHTML(project.title)}"
                >
                    <i class="bx bx-link-external"></i>
                </a>

            </div>
        `;

    }


    /* ==================================================
       PRIMARY PROJECT LINK
    ================================================== */

    function getPrimaryProjectLink(project) {

        if (project.case_study_url) {

            return {
                url: project.case_study_url,
                label: "View Case Study",
                external: true
            };

        }


        if (project.live_url) {

            return {
                url: project.live_url,
                label: "View Live Website",
                external: true
            };

        }


        if (project.github_url) {

            return {
                url: project.github_url,
                label: "View on GitHub",
                external: true
            };

        }


        return null;

    }


    /* ==================================================
       TECHNOLOGY TAGS
    ================================================== */

    function createTechnologyTags(technologies) {

        if (!technologies) {
            return "";
        }


        const techList =
            technologies
                .split(",")
                .map((tech) => tech.trim())
                .filter(Boolean);


        return techList
            .map((tech) => `
                <span>
                    ${escapeHTML(tech)}
                </span>
            `)
            .join("");

    }


    /* ==================================================
       CATEGORY LABEL
    ================================================== */

    function getCategoryLabel(category) {

        const labels = {

            web: "Web Development",

            design: "Graphic Design",

            other: "Other"

        };


        return labels[category] || "Other";

    }


    /* ==================================================
       CATEGORY ICON
    ================================================== */

    function getCategoryIcon(category) {

        const icons = {

            web: "bx-code-alt",

            design: "bx-palette",

            other: "bx-folder"

        };


        return icons[category] || "bx-folder";

    }


    /* ==================================================
       PROJECT FILTER
    ================================================== */

    function applyProjectFilter(selectedFilter) {

        const projectCards =
            projectsContainer.querySelectorAll(
                ".project-card"
            );


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

                    card.style.transform =
                        "translateY(0)";

                }, 10);

            } else {

                card.style.opacity = "0";

                card.style.transform =
                    "translateY(15px)";


                setTimeout(() => {

                    card.style.display = "none";

                }, 250);

            }

        });

    }


    /* ==================================================
       CONNECT FILTER BUTTONS
    ================================================== */

    const projectFilters =
        document.querySelectorAll(".project-filter");


    projectFilters.forEach((filter) => {

        filter.addEventListener("click", () => {

            const selectedFilter =
                filter.getAttribute("data-filter");


            applyProjectFilter(selectedFilter);

        });

    });


    /* ==================================================
       HTML ESCAPE
    ================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ==================================================
       START
    ================================================== */

    loadProjects();

});