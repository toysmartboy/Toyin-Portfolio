"use strict";

/* ==========================================
   TESTIMONIAL MANAGEMENT
   Toyin Portfolio
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

const testimonialsContainer =
    document.getElementById("admin-testimonials");

const addTestimonialBtn =
    document.getElementById("add-testimonial-btn");

const testimonialModal =
    document.getElementById("testimonial-modal");

const testimonialModalTitle =
    document.getElementById("testimonial-modal-title");

const testimonialModalClose =
    document.getElementById("testimonial-modal-close");

const testimonialCancelBtn =
    document.getElementById("testimonial-cancel-btn");

const testimonialForm =
    document.getElementById("testimonial-form");

const testimonialId =
    document.getElementById("testimonial-id");

const testimonialClientName =
    document.getElementById("testimonial-client-name");

const testimonialClientRole =
    document.getElementById("testimonial-client-role");

const testimonialClientCompany =
    document.getElementById("testimonial-client-company");

const testimonialRating =
    document.getElementById("testimonial-rating");

const testimonialText =
    document.getElementById("testimonial-text");

const testimonialPublished =
    document.getElementById("testimonial-published");

const testimonialFormMessage =
    document.getElementById("testimonial-form-message");

const testimonialSaveBtn =
    document.getElementById("testimonial-save-btn");


let testimonials = [];


/* ==========================================
   LOAD TESTIMONIALS
========================================== */

async function loadTestimonials() {

    if (!testimonialsContainer) return;

    testimonialsContainer.innerHTML = `
        <div class="admin-loading-state">
            <i class="bx bx-loader-alt bx-spin"></i>
            <p>Loading testimonials...</p>
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("portfolio_testimonials")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        testimonials = data || [];

        renderTestimonials();

    } catch (error) {

        console.error(
            "Failed to load testimonials:",
            error
        );

        testimonialsContainer.innerHTML = `
            <div class="admin-error-state">
                <i class="bx bx-error-circle"></i>

                <h3>
                    Unable to load testimonials
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>
            </div>
        `;
    }
}


/* ==========================================
   RENDER TESTIMONIALS
========================================== */

function renderTestimonials() {

    if (!testimonialsContainer) return;


    if (!testimonials.length) {

        testimonialsContainer.innerHTML = `
            <div class="admin-empty-state">

                <i class="bx bx-message-square-detail"></i>

                <h3>No testimonials yet</h3>

                <p>
                    Add your first client testimonial
                    to get started.
                </p>

            </div>
        `;

        return;
    }


    testimonialsContainer.innerHTML =
        testimonials.map((testimonial) => {

            const statusClass =
                testimonial.is_published
                    ? "published"
                    : "draft";

            const statusText =
                testimonial.is_published
                    ? "Published"
                    : "Draft";


            const stars =
                createStars(testimonial.rating);


            return `
                <article
                    class="admin-testimonial-card"
                    data-id="${testimonial.id}"
                >

                    <div class="admin-testimonial-top">

                        <div class="admin-testimonial-client">

                            <div class="admin-testimonial-avatar">
                                <i class="bx bx-user"></i>
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        testimonial.client_name
                                    )}
                                </h3>

                                <span>
                                    ${escapeHTML(
                                        buildClientInfo(
                                            testimonial.client_role,
                                            testimonial.client_company
                                        )
                                    )}
                                </span>

                            </div>

                        </div>


                        <span
                            class="testimonial-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    <div class="admin-testimonial-rating">
                        ${stars}
                    </div>


                    <p class="admin-testimonial-text">
                        ${escapeHTML(
                            testimonial.testimonial
                        )}
                    </p>


                    <div class="admin-testimonial-actions">

                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            onclick="editTestimonial(${testimonial.id})"
                        >
                            <i class="bx bx-edit"></i>
                            Edit
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-secondary"
                            onclick="toggleTestimonialPublish(
                                ${testimonial.id},
                                ${!testimonial.is_published}
                            )"
                        >
                            <i class="bx ${
                                testimonial.is_published
                                    ? "bx-hide"
                                    : "bx-show"
                            }"></i>

                            ${
                                testimonial.is_published
                                    ? "Unpublish"
                                    : "Publish"
                            }
                        </button>


                        <button
                            type="button"
                            class="admin-btn admin-btn-danger"
                            onclick="deleteTestimonial(${testimonial.id})"
                        >
                            <i class="bx bx-trash"></i>
                            Delete
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


/* ==========================================
   BUILD CLIENT INFO
========================================== */

function buildClientInfo(
    role,
    company
) {

    const parts = [];

    if (role) {
        parts.push(role);
    }

    if (company) {
        parts.push(company);
    }

    return parts.length
        ? parts.join(" • ")
        : "Client";
}


/* ==========================================
   CREATE STAR DISPLAY
========================================== */

function createStars(rating) {

    const totalStars = 5;

    let html = "";

    for (
        let i = 1;
        i <= totalStars;
        i++
    ) {

        html += `
            <i class="bx ${
                i <= rating
                    ? "bxs-star"
                    : "bx-star"
            }"></i>
        `;
    }

    return html;
}


/* ==========================================
   OPEN ADD MODAL
========================================== */

function openAddTestimonialModal() {

    resetTestimonialForm();

    testimonialModalTitle.textContent =
        "Add Testimonial";

    testimonialSaveBtn.innerHTML = `
        <i class="bx bx-save"></i>
        Save Testimonial
    `;

    testimonialModal.classList.add("active");

    testimonialModal.setAttribute(
        "aria-hidden",
        "false"
    );

    testimonialClientName.focus();
}


/* ==========================================
   OPEN EDIT MODAL
========================================== */

function editTestimonial(id) {

    const testimonial =
        testimonials.find(
            (item) => item.id === id
        );

    if (!testimonial) return;


    testimonialId.value =
        testimonial.id;

    testimonialClientName.value =
        testimonial.client_name || "";

    testimonialClientRole.value =
        testimonial.client_role || "";

    testimonialClientCompany.value =
        testimonial.client_company || "";

    testimonialRating.value =
        testimonial.rating || 5;

    testimonialText.value =
        testimonial.testimonial || "";

    testimonialPublished.checked =
        testimonial.is_published === true;


    testimonialModalTitle.textContent =
        "Edit Testimonial";

    testimonialSaveBtn.innerHTML = `
        <i class="bx bx-save"></i>
        Update Testimonial
    `;

    clearTestimonialMessage();

    testimonialModal.classList.add("active");

    testimonialModal.setAttribute(
        "aria-hidden",
        "false"
    );

    testimonialClientName.focus();
}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeTestimonialModal() {

    testimonialModal.classList.remove(
        "active"
    );

    testimonialModal.setAttribute(
        "aria-hidden",
        "true"
    );

    resetTestimonialForm();
}


/* ==========================================
   RESET FORM
========================================== */

function resetTestimonialForm() {

    if (!testimonialForm) return;

    testimonialForm.reset();

    testimonialId.value = "";

    testimonialRating.value = "5";

    testimonialPublished.checked =
        false;

    clearTestimonialMessage();
}


/* ==========================================
   SAVE / UPDATE TESTIMONIAL
========================================== */

if (testimonialForm) {

    testimonialForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const id =
                testimonialId.value.trim();

            const clientName =
                testimonialClientName.value.trim();

            const clientRole =
                testimonialClientRole.value.trim();

            const clientCompany =
                testimonialClientCompany.value.trim();

            const rating =
                Number(
                    testimonialRating.value
                );

            const testimonial =
                testimonialText.value.trim();

            const isPublished =
                testimonialPublished.checked;


            if (
                !clientName ||
                !testimonial
            ) {

                showTestimonialMessage(
                    "Please enter the client name and testimonial.",
                    "error"
                );

                return;
            }


            if (
                testimonial.length < 10
            ) {

                showTestimonialMessage(
                    "The testimonial must contain at least 10 characters.",
                    "error"
                );

                return;
            }


            testimonialSaveBtn.disabled =
                true;

            testimonialSaveBtn.innerHTML = `
                <span>Saving...</span>
                <i class="bx bx-loader-alt bx-spin"></i>
            `;


            try {

                const testimonialData = {

                    client_name:
                        clientName,

                    client_role:
                        clientRole || null,

                    client_company:
                        clientCompany || null,

                    testimonial:
                        testimonial,

                    rating:
                        rating,

                    is_published:
                        isPublished
                };


                let error;


                if (id) {

                    const result =
                        await supabaseClient
                            .from(
                                "portfolio_testimonials"
                            )
                            .update(
                                testimonialData
                            )
                            .eq(
                                "id",
                                id
                            );

                    error =
                        result.error;

                } else {

                    const result =
                        await supabaseClient
                            .from(
                                "portfolio_testimonials"
                            )
                            .insert([
                                testimonialData
                            ]);

                    error =
                        result.error;
                }


                if (error) {
                    throw error;
                }


                showTestimonialMessage(
                    id
                        ? "Testimonial updated successfully."
                        : "Testimonial added successfully.",
                    "success"
                );


                await loadTestimonials();


                setTimeout(() => {

                    closeTestimonialModal();

                }, 600);


            } catch (error) {

                console.error(
                    "Failed to save testimonial:",
                    error
                );

                showTestimonialMessage(
                    "Unable to save testimonial. Please try again.",
                    "error"
                );

            } finally {

                testimonialSaveBtn.disabled =
                    false;

                testimonialSaveBtn.innerHTML = `
                    <i class="bx bx-save"></i>
                    ${id
                        ? "Update Testimonial"
                        : "Save Testimonial"
                    }
                `;
            }
        }
    );
}


/* ==========================================
   PUBLISH / UNPUBLISH
========================================== */

async function toggleTestimonialPublish(
    id,
    shouldPublish
) {

    try {

        const {
            error
        } = await supabaseClient
            .from(
                "portfolio_testimonials"
            )
            .update({
                is_published:
                    shouldPublish
            })
            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        await loadTestimonials();


    } catch (error) {

        console.error(
            "Failed to update testimonial status:",
            error
        );

        alert(
            "Unable to update testimonial status. Please try again."
        );
    }
}


/* ==========================================
   DELETE TESTIMONIAL
========================================== */

async function deleteTestimonial(id) {

    const testimonial =
        testimonials.find(
            (item) => item.id === id
        );


    if (!testimonial) return;


    const confirmed =
        confirm(
            `Delete the testimonial from ${testimonial.client_name}? This action cannot be undone.`
        );


    if (!confirmed) return;


    try {

        const {
            error
        } = await supabaseClient
            .from(
                "portfolio_testimonials"
            )
            .delete()
            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        await loadTestimonials();


    } catch (error) {

        console.error(
            "Failed to delete testimonial:",
            error
        );

        alert(
            "Unable to delete testimonial. Please try again."
        );
    }
}


/* ==========================================
   MESSAGE HELPERS
========================================== */

function showTestimonialMessage(
    message,
    type
) {

    if (!testimonialFormMessage) return;

    testimonialFormMessage.textContent =
        message;

    testimonialFormMessage.className =
        `admin-form-message ${type}`;
}


function clearTestimonialMessage() {

    if (!testimonialFormMessage) return;

    testimonialFormMessage.textContent =
        "";

    testimonialFormMessage.className =
        "admin-form-message";
}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
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


/* ==========================================
   EVENT LISTENERS
========================================== */

if (addTestimonialBtn) {

    addTestimonialBtn.addEventListener(
        "click",
        openAddTestimonialModal
    );
}


if (testimonialModalClose) {

    testimonialModalClose.addEventListener(
        "click",
        closeTestimonialModal
    );
}


if (testimonialCancelBtn) {

    testimonialCancelBtn.addEventListener(
        "click",
        closeTestimonialModal
    );
}


/* ==========================================
   CLOSE WHEN CLICKING OUTSIDE
========================================== */

if (testimonialModal) {

    testimonialModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                testimonialModal
            ) {

                closeTestimonialModal();

            }

        }
    );
}


/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            testimonialModal &&
            testimonialModal.classList.contains(
                "active"
            )
        ) {

            closeTestimonialModal();

        }

    }
);


/* ==========================================
   INITIAL LOAD
========================================== */

loadTestimonials();