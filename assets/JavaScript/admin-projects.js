
"use strict";

/* ==========================================================
   TOYIN PORTFOLIO
   ADMIN PROJECT MANAGEMENT
   Supabase + Storage
========================================================== */


// ==========================================================
// CONFIGURATION
// ==========================================================

const PROJECTS_BUCKET = "portfolio-projects";

const MAX_PROJECT_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_PROJECT_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const projectModal =
    document.getElementById("project-modal");

const projectModalTitle =
    document.getElementById("project-modal-title");

const projectModalClose =
    document.getElementById("project-modal-close");

const addProjectBtn =
    document.getElementById("add-project-btn");

const projectCancelBtn =
    document.getElementById("project-cancel-btn");

const projectForm =
    document.getElementById("project-form");

const projectId =
    document.getElementById("project-id");

const projectTitle =
    document.getElementById("project-title");

const projectCategory =
    document.getElementById("project-category");

const projectDescription =
    document.getElementById("project-description");

const projectTechnologies =
    document.getElementById("project-technologies");

const projectImage =
    document.getElementById("project-image");

const projectImagePreview =
    document.getElementById("project-image-preview");

const projectLiveUrl =
    document.getElementById("project-live-url");

const projectGithubUrl =
    document.getElementById("project-github-url");

const projectCaseStudyUrl =
    document.getElementById("project-case-study-url");

const projectFeatured =
    document.getElementById("project-featured");

const projectPublished =
    document.getElementById("project-published");

const projectFormMessage =
    document.getElementById("project-form-message");

const projectSaveBtn =
    document.getElementById("project-save-btn");

const adminProjectsContainer =
    document.getElementById("admin-projects");


// ==========================================================
// STATE
// ==========================================================

let adminProjects = [];

let currentPreviewUrl = null;


// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeProjectManagement
);


async function initializeProjectManagement() {

    // Make sure required elements exist.
    if (
        !projectModal ||
        !projectForm ||
        !adminProjectsContainer
    ) {
        console.error(
            "Project management elements were not found."
        );

        return;
    }


    // Check authentication and admin access.
    const isAuthorized =
        await checkProjectAdminAccess();

    if (!isAuthorized) {
        return;
    }


    // Load projects.
    await loadProjects();


    // Event listeners.
    setupProjectEventListeners();

}


// ==========================================================
// ADMIN ACCESS
// ==========================================================

async function checkProjectAdminAccess() {

    try {

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session =
            sessionData?.session;


        if (!session) {

            window.location.href =
                "admin-login.html";

            return false;
        }


        const user =
            session.user;


        const {
            data: adminRecord,
            error: adminError
        } =
            await supabaseClient
                .from("portfolio_admin_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();


        if (adminError) {
            throw adminError;
        }


        if (!adminRecord) {

            alert(
                "You do not have permission to manage portfolio projects."
            );

            window.location.href =
                "index.html";

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "Project admin authorization error:",
            error
        );

        showProjectMessage(
            "Unable to verify administrator access.",
            "error"
        );

        return false;
    }
}


// ==========================================================
// EVENT LISTENERS
// ==========================================================

function setupProjectEventListeners() {

    // Add project.
    addProjectBtn?.addEventListener(
        "click",
        openAddProjectModal
    );


    // Close modal.
    projectModalClose?.addEventListener(
        "click",
        closeProjectModal
    );


    // Cancel.
    projectCancelBtn?.addEventListener(
        "click",
        closeProjectModal
    );


    // Click outside modal.
    projectModal?.addEventListener(
        "click",
        (event) => {

            if (
                event.target === projectModal
            ) {
                closeProjectModal();
            }

        }
    );


    // Escape key.
    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                projectModal?.classList.contains("active")
            ) {
                closeProjectModal();
            }

        }
    );


    // Image preview.
    projectImage?.addEventListener(
        "change",
        handleProjectImageChange
    );


    // Submit form.
    projectForm?.addEventListener(
        "submit",
        handleProjectFormSubmit
    );


    // Project action buttons.
    adminProjectsContainer?.addEventListener(
        "click",
        handleProjectActions
    );
}


// ==========================================================
// LOAD PROJECTS
// ==========================================================

async function loadProjects() {

    try {

        showProjectLoading();


        const {
            data,
            error
        } =
            await supabaseClient
                .from("portfolio_projects")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        adminProjects =
            data || [];


        renderAdminProjects();


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        adminProjectsContainer.innerHTML = `
            <div class="admin-empty-state">
                <i class="bx bx-error-circle"></i>
                <h3>Unable to load projects</h3>
                <p>
                    ${escapeProjectHTML(
                        error.message ||
                        "Please try again."
                    )}
                </p>
            </div>
        `;
    }
}


// ==========================================================
// RENDER PROJECTS
// ==========================================================

function renderAdminProjects() {

    if (!adminProjects.length) {

        adminProjectsContainer.innerHTML = `
            <div class="admin-empty-state">

                <i class="bx bx-folder-open"></i>

                <h3>No projects yet</h3>

                <p>
                    Add your first portfolio project
                    to get started.
                </p>

            </div>
        `;

        return;
    }


    adminProjectsContainer.innerHTML =
        adminProjects
            .map(
                (project) =>
                    createAdminProjectCard(project)
            )
            .join("");
}


// ==========================================================
// PROJECT CARD
// ==========================================================

function createAdminProjectCard(project) {

    const imageMarkup =
        project.image_url
            ? `
                <div class="admin-project-image">
                    <img
                        src="${escapeProjectAttribute(
                            project.image_url
                        )}"
                        alt="${escapeProjectAttribute(
                            project.title
                        )}"
                        loading="lazy"
                    >
                </div>
            `
            : `
                <div class="admin-project-image admin-project-image-placeholder">
                    <i class="bx bx-image"></i>
                </div>
            `;


    const technologies =
        project.technologies
            ? project.technologies
            : "No technologies added";


    const publishedStatus =
        project.is_published
            ? `
                <span class="project-status-badge project-status-published">
                    <i class="bx bx-check-circle"></i>
                    Published
                </span>
            `
            : `
                <span class="project-status-badge project-status-draft">
                    <i class="bx bx-edit"></i>
                    Draft
                </span>
            `;


    const featuredStatus =
        project.is_featured
            ? `
                <span class="project-status-badge project-status-featured">
                    <i class="bx bx-star"></i>
                    Featured
                </span>
            `
            : "";


    return `
        <article
            class="admin-project-card"
            data-project-id="${project.id}"
        >

            ${imageMarkup}


            <div class="admin-project-content">

                <div class="admin-project-top">

                    <div>

                        <h3>
                            ${escapeProjectHTML(
                                project.title
                            )}
                        </h3>

                        <span class="admin-project-category">
                            ${formatProjectCategory(
                                project.category
                            )}
                        </span>

                    </div>

                </div>


                <div class="admin-project-status">

                    ${publishedStatus}

                    ${featuredStatus}

                </div>


                <p class="admin-project-description">
                    ${escapeProjectHTML(
                        project.short_description
                    )}
                </p>


                <p class="admin-project-technologies">
                    <strong>Technologies:</strong>
                    ${escapeProjectHTML(
                        technologies
                    )}
                </p>


                <div class="admin-project-actions">

                    <button
                        type="button"
                        class="admin-message-action project-edit-btn"
                        data-action="edit"
                        data-id="${project.id}"
                    >
                        <i class="bx bx-edit"></i>
                        Edit
                    </button>


                    <button
                        type="button"
                        class="admin-message-action project-publish-btn"
                        data-action="publish"
                        data-id="${project.id}"
                    >
                        <i class="bx ${
                            project.is_published
                                ? "bx-hide"
                                : "bx-show"
                        }"></i>

                        ${
                            project.is_published
                                ? "Unpublish"
                                : "Publish"
                        }

                    </button>


                    <button
                        type="button"
                        class="admin-message-action project-feature-btn"
                        data-action="feature"
                        data-id="${project.id}"
                    >
                        <i class="bx ${
                            project.is_featured
                                ? "bxs-star"
                                : "bx-star"
                        }"></i>

                        ${
                            project.is_featured
                                ? "Unfeature"
                                : "Feature"
                        }

                    </button>


                    <button
                        type="button"
                        class="admin-message-action project-delete-btn"
                        data-action="delete"
                        data-id="${project.id}"
                    >
                        <i class="bx bx-trash"></i>
                        Delete
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ==========================================================
// OPEN ADD MODAL
// ==========================================================

function openAddProjectModal() {

    resetProjectForm();


    projectModalTitle.textContent =
        "Add Project";


    projectSaveBtn.innerHTML = `
        <i class="bx bx-save"></i>
        Save Project
    `;


    projectModal.classList.add("active");

    projectModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        projectTitle?.focus();

    }, 100);
}


// ==========================================================
// OPEN EDIT MODAL
// ==========================================================

function openEditProjectModal(project) {

    resetProjectForm();


    projectModalTitle.textContent =
        "Edit Project";


    projectSaveBtn.innerHTML = `
        <i class="bx bx-save"></i>
        Update Project
    `;


    projectId.value =
        project.id;


    projectTitle.value =
        project.title || "";


    projectCategory.value =
        project.category || "web";


    projectDescription.value =
        project.short_description || "";


    projectTechnologies.value =
        project.technologies || "";


    projectLiveUrl.value =
        project.live_url || "";


    projectGithubUrl.value =
        project.github_url || "";


    projectCaseStudyUrl.value =
        project.case_study_url || "";


    projectFeatured.checked =
        Boolean(project.is_featured);


    projectPublished.checked =
        Boolean(project.is_published);


    // Store current image data.
    projectForm.dataset.imageUrl =
        project.image_url || "";


    projectForm.dataset.imagePath =
        project.image_path || "";


    // Show existing image.
    if (project.image_url) {

        showProjectImagePreview(
            project.image_url
        );

    }


    projectModal.classList.add("active");

    projectModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        projectTitle?.focus();

    }, 100);
}


// ==========================================================
// CLOSE MODAL
// ==========================================================

function closeProjectModal() {

    projectModal?.classList.remove(
        "active"
    );


    projectModal?.setAttribute(
        "aria-hidden",
        "true"
    );


    clearProjectPreviewUrl();


    setTimeout(() => {

        resetProjectForm();

    }, 200);
}


// ==========================================================
// RESET FORM
// ==========================================================

function resetProjectForm() {

    projectForm?.reset();


    if (projectId) {
        projectId.value = "";
    }


    if (projectCategory) {
        projectCategory.value = "web";
    }


    if (projectFeatured) {
        projectFeatured.checked = false;
    }


    if (projectPublished) {
        projectPublished.checked = false;
    }


    if (projectForm) {

        delete projectForm.dataset.imageUrl;

        delete projectForm.dataset.imagePath;

    }


    clearProjectPreviewUrl();


    if (projectImagePreview) {

        projectImagePreview.innerHTML = `
            <div class="project-image-preview-empty">

                <i class="bx bx-image"></i>

                <span>
                    Project image preview
                </span>

            </div>
        `;
    }


    clearProjectMessage();
}


// ==========================================================
// IMAGE CHANGE
// ==========================================================

function handleProjectImageChange() {

    const file =
        projectImage?.files?.[0];


    if (!file) {
        return;
    }


    const validationError =
        validateProjectImage(file);


    if (validationError) {

        projectImage.value = "";

        showProjectMessage(
            validationError,
            "error"
        );

        return;
    }


    clearProjectMessage();


    clearProjectPreviewUrl();


    currentPreviewUrl =
        URL.createObjectURL(file);


    showProjectImagePreview(
        currentPreviewUrl
    );
}


// ==========================================================
// IMAGE VALIDATION
// ==========================================================

function validateProjectImage(file) {

    if (
        !ALLOWED_PROJECT_IMAGE_TYPES.includes(
            file.type
        )
    ) {

        return (
            "Invalid image format. " +
            "Please use JPG, PNG or WebP."
        );
    }


    if (
        file.size >
        MAX_PROJECT_IMAGE_SIZE
    ) {

        return (
            "Image is too large. " +
            "Maximum allowed size is 5MB."
        );
    }


    return null;
}


// ==========================================================
// IMAGE PREVIEW
// ==========================================================

function showProjectImagePreview(
    imageUrl
) {

    if (!projectImagePreview) {
        return;
    }


    projectImagePreview.innerHTML = `
        <img
            src="${escapeProjectAttribute(
                imageUrl
            )}"
            alt="Project image preview"
        >
    `;
}


// ==========================================================
// CLEAR PREVIEW OBJECT URL
// ==========================================================

function clearProjectPreviewUrl() {

    if (currentPreviewUrl) {

        URL.revokeObjectURL(
            currentPreviewUrl
        );

        currentPreviewUrl = null;
    }
}


// ==========================================================
// FORM SUBMIT
// ==========================================================

async function handleProjectFormSubmit(
    event
) {

    event.preventDefault();


    clearProjectMessage();


    const title =
        projectTitle.value.trim();


    const category =
        projectCategory.value;


    const description =
        projectDescription.value.trim();


    const technologies =
        projectTechnologies.value.trim();


    const liveUrl =
        projectLiveUrl.value.trim();


    const githubUrl =
        projectGithubUrl.value.trim();


    const caseStudyUrl =
        projectCaseStudyUrl.value.trim();


    const isFeatured =
        projectFeatured.checked;


    const isPublished =
        projectPublished.checked;


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (title.length < 2) {

        showProjectMessage(
            "Please enter a valid project title.",
            "error"
        );

        projectTitle.focus();

        return;
    }


    if (!description) {

        showProjectMessage(
            "Please enter a short project description.",
            "error"
        );

        projectDescription.focus();

        return;
    }


    try {

        // Validate URLs.
        const validLiveUrl =
            normalizeProjectUrl(
                liveUrl
            );

        const validGithubUrl =
            normalizeProjectUrl(
                githubUrl
            );

        const validCaseStudyUrl =
            normalizeProjectUrl(
                caseStudyUrl
            );


        // Disable save button.
        setProjectSaving(true);


        const editingId =
            projectId.value.trim();


        const existingProject =
            editingId
                ? adminProjects.find(
                    (project) =>
                        String(project.id) ===
                        editingId
                )
                : null;


        let uploadedImage = null;


        // --------------------------------------------------
        // IMAGE UPLOAD
        // --------------------------------------------------

        const selectedImage =
            projectImage?.files?.[0];


        if (selectedImage) {

            uploadedImage =
                await uploadProjectImage(
                    selectedImage
                );
        }


        // --------------------------------------------------
        // PROJECT DATA
        // --------------------------------------------------

        const projectData = {

            title,

            short_description:
                description,

            category,

            technologies:
                technologies || null,

            live_url:
                validLiveUrl,

            github_url:
                validGithubUrl,

            case_study_url:
                validCaseStudyUrl,

            is_featured:
                isFeatured,

            is_published:
                isPublished
        };


        // --------------------------------------------------
        // IMAGE DATA
        // --------------------------------------------------

        if (uploadedImage) {

            projectData.image_url =
                uploadedImage.url;

            projectData.image_path =
                uploadedImage.path;
        }


        // --------------------------------------------------
        // UPDATE
        // --------------------------------------------------

        if (existingProject) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "portfolio_projects"
                    )
                    .update(
                        projectData
                    )
                    .eq(
                        "id",
                        existingProject.id
                    );


            if (error) {

                // Remove newly uploaded image
                // if database update failed.
                if (uploadedImage) {

                    await deleteProjectImage(
                        uploadedImage.path
                    );
                }

                throw error;
            }


            // Delete old image after successful
            // database update.
            if (
                uploadedImage &&
                existingProject.image_path &&
                existingProject.image_path !==
                    uploadedImage.path
            ) {

                await deleteProjectImage(
                    existingProject.image_path
                );
            }


            showProjectMessage(
                "Project updated successfully.",
                "success"
            );

        }


        // --------------------------------------------------
        // CREATE
        // --------------------------------------------------

        else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "portfolio_projects"
                    )
                    .insert(
                        projectData
                    );


            if (error) {

                // Remove newly uploaded image
                // if database insert failed.
                if (uploadedImage) {

                    await deleteProjectImage(
                        uploadedImage.path
                    );
                }

                throw error;
            }


            showProjectMessage(
                "Project added successfully.",
                "success"
            );
        }


        // Reload project list.
        await loadProjects();


        // Close after short delay.
        setTimeout(() => {

            closeProjectModal();

        }, 700);


    } catch (error) {

        console.error(
            "Project save error:",
            error
        );


        showProjectMessage(
            error.message ||
            "Unable to save project.",
            "error"
        );

    } finally {

        setProjectSaving(false);
    }
}


// ==========================================================
// UPLOAD PROJECT IMAGE
// ==========================================================

async function uploadProjectImage(
    file
) {

    const validationError =
        validateProjectImage(file);


    if (validationError) {
        throw new Error(
            validationError
        );
    }


    const extensionMap = {

        "image/jpeg": "jpg",

        "image/png": "png",

        "image/webp": "webp"
    };


    const extension =
        extensionMap[file.type];


    const uniqueId =
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"

            ? window.crypto.randomUUID()

            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;


    const baseName =
        sanitizeProjectFileName(
            file.name
        );


    const filePath =
        `projects/${uniqueId}-${baseName}.${extension}`;


    const {
        error
    } =
        await supabaseClient
            .storage
            .from(PROJECTS_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );


    if (error) {
        throw error;
    }


    const {
        data: publicUrlData
    } =
        supabaseClient
            .storage
            .from(PROJECTS_BUCKET)
            .getPublicUrl(
                filePath
            );


    if (
        !publicUrlData ||
        !publicUrlData.publicUrl
    ) {

        // Cleanup if public URL could not
        // be generated.
        await deleteProjectImage(
            filePath
        );

        throw new Error(
            "Project image was uploaded but its public URL could not be generated."
        );
    }


    return {

        path: filePath,

        url:
            publicUrlData.publicUrl
    };
}


// ==========================================================
// SANITIZE FILE NAME
// ==========================================================

function sanitizeProjectFileName(
    fileName
) {

    const baseName =
        fileName
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[^a-zA-Z0-9-_]+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toLowerCase()
            .slice(
                0,
                60
            );


    return (
        baseName ||
        "project-image"
    );
}


// ==========================================================
// DELETE STORAGE IMAGE
// ==========================================================

async function deleteProjectImage(
    imagePath
) {

    if (!imagePath) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .storage
                .from(PROJECTS_BUCKET)
                .remove([
                    imagePath
                ]);


        if (error) {

            console.warn(
                "Unable to delete project image:",
                error
            );

            return false;
        }


        return true;

    } catch (error) {

        console.warn(
            "Project image cleanup failed:",
            error
        );

        return false;
    }
}


// ==========================================================
// PROJECT ACTIONS
// ==========================================================

async function handleProjectActions(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    if (!id) {
        return;
    }


    const project =
        adminProjects.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    if (!project) {

        showProjectMessage(
            "Project could not be found.",
            "error"
        );

        return;
    }


    // ------------------------------------------------------
    // EDIT
    // ------------------------------------------------------

    if (action === "edit") {

        openEditProjectModal(
            project
        );

        return;
    }


    // ------------------------------------------------------
    // PUBLISH / UNPUBLISH
    // ------------------------------------------------------

    if (action === "publish") {

        await toggleProjectPublished(
            project
        );

        return;
    }


    // ------------------------------------------------------
    // FEATURE / UNFEATURE
    // ------------------------------------------------------

    if (action === "feature") {

        await toggleProjectFeatured(
            project
        );

        return;
    }


    // ------------------------------------------------------
    // DELETE
    // ------------------------------------------------------

    if (action === "delete") {

        await deleteProject(
            project
        );
    }
}


// ==========================================================
// TOGGLE PUBLISHED
// ==========================================================

async function toggleProjectPublished(
    project
) {

    const newStatus =
        !project.is_published;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "portfolio_projects"
                )
                .update({
                    is_published:
                        newStatus
                })
                .eq(
                    "id",
                    project.id
                );


        if (error) {
            throw error;
        }


        await loadProjects();


    } catch (error) {

        console.error(
            "Publish status error:",
            error
        );


        showProjectMessage(
            error.message ||
            "Unable to update publish status.",
            "error"
        );
    }
}


// ==========================================================
// TOGGLE FEATURED
// ==========================================================

async function toggleProjectFeatured(
    project
) {

    const newStatus =
        !project.is_featured;


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "portfolio_projects"
                )
                .update({
                    is_featured:
                        newStatus
                })
                .eq(
                    "id",
                    project.id
                );


        if (error) {
            throw error;
        }


        await loadProjects();


    } catch (error) {

        console.error(
            "Featured status error:",
            error
        );


        showProjectMessage(
            error.message ||
            "Unable to update featured status.",
            "error"
        );
    }
}


// ==========================================================
// DELETE PROJECT
// ==========================================================

async function deleteProject(
    project
) {

    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "portfolio_projects"
                )
                .delete()
                .eq(
                    "id",
                    project.id
                );


        if (error) {
            throw error;
        }


        // Remove associated image.
        if (project.image_path) {

            const cleaned =
                await deleteProjectImage(
                    project.image_path
                );


            if (!cleaned) {

                showProjectMessage(
                    "Project deleted, but its image could not be removed from storage.",
                    "error"
                );
            }
        }


        await loadProjects();


    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );


        showProjectMessage(
            error.message ||
            "Unable to delete project.",
            "error"
        );
    }
}


// ==========================================================
// URL VALIDATION
// ==========================================================

function normalizeProjectUrl(
    value
) {

    const trimmed =
        value.trim();


    if (!trimmed) {
        return null;
    }


    try {

        const url =
            new URL(trimmed);


        if (
            ![
                "http:",
                "https:"
            ].includes(
                url.protocol
            )
        ) {

            throw new Error();
        }


        return url.href;

    } catch {

        throw new Error(
            "Please enter valid URLs starting with http:// or https://."
        );
    }
}


// ==========================================================
// CATEGORY LABEL
// ==========================================================

function formatProjectCategory(
    category
) {

    const categories = {

        web:
            "Web Development",

        design:
            "Graphic / Digital Design",

        other:
            "Other"
    };


    return (
        categories[category] ||
        "Other"
    );
}


// ==========================================================
// LOADING STATE
// ==========================================================

function showProjectLoading() {

    adminProjectsContainer.innerHTML = `
        <div class="admin-loading">

            <i class="bx bx-loader-alt bx-spin"></i>

            <p>
                Loading projects...
            </p>

        </div>
    `;
}


// ==========================================================
// FORM MESSAGE
// ==========================================================

function showProjectMessage(
    message,
    type = "error"
) {

    if (!projectFormMessage) {
        return;
    }


    projectFormMessage.textContent =
        message;


    projectFormMessage.className =
        `admin-form-message ${type}`;


    projectFormMessage.style.display =
        "block";
}


function clearProjectMessage() {

    if (!projectFormMessage) {
        return;
    }


    projectFormMessage.textContent =
        "";


    projectFormMessage.className =
        "admin-form-message";


    projectFormMessage.style.display =
        "none";
}


// ==========================================================
// SAVE BUTTON STATE
// ==========================================================

function setProjectSaving(
    saving
) {

    if (!projectSaveBtn) {
        return;
    }


    projectSaveBtn.disabled =
        saving;


    if (saving) {

        projectSaveBtn.innerHTML = `
            <i class="bx bx-loader-alt bx-spin"></i>
            Saving...
        `;

    } else {

        projectSaveBtn.innerHTML =
            projectId?.value
                ? `
                    <i class="bx bx-save"></i>
                    Update Project
                `
                : `
                    <i class="bx bx-save"></i>
                    Save Project
                `;
    }
}


// ==========================================================
// HTML ESCAPING
// ==========================================================

function escapeProjectHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeProjectAttribute(
    value
) {

    return escapeProjectHTML(
        value
    );
}

