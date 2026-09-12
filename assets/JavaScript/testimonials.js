"use strict";

/* ==========================================
   HOMEPAGE TESTIMONIALS
   Toyin Portfolio
========================================== */

const testimonialsContainer =
    document.getElementById("testimonials-container");

async function loadPublishedTestimonials() {
    if (!testimonialsContainer) return;

    try {
        const {
            data,
            error
        } = await supabaseClient
            .from("portfolio_testimonials")
            .select(`
                id,
                client_name,
                client_role,
                client_company,
                testimonial,
                rating
            `)
            .eq("is_published", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            testimonialsContainer.innerHTML = `
                <article class="testimonial-card">
                    <div class="testimonial-quote">
                        <i class="bx bxs-quote-alt-left"></i>
                    </div>

                    <div class="testimonial-rating">
                        <i class="bx bx-star"></i>
                        <i class="bx bx-star"></i>
                        <i class="bx bx-star"></i>
                        <i class="bx bx-star"></i>
                        <i class="bx bx-star"></i>
                    </div>

                    <p class="testimonial-text">
                        Client testimonials will appear here as
                        feedback is added and published.
                    </p>

                    <div class="testimonial-client">
                        <div class="testimonial-avatar">
                            <i class="bx bx-user"></i>
                        </div>

                        <div class="testimonial-client-info">
                            <h3>Client Feedback</h3>
                            <span>Coming soon</span>
                        </div>
                    </div>
                </article>
            `;

            return;
        }

        testimonialsContainer.innerHTML =
            data.map((testimonial) => {
                const stars =
                    createHomepageStars(
                        testimonial.rating
                    );

                const clientInfo =
                    buildHomepageClientInfo(
                        testimonial.client_role,
                        testimonial.client_company
                    );

                return `
                    <article
                        class="testimonial-card"
                        data-testimonial-id="${testimonial.id}"
                    >
                        <div class="testimonial-quote">
                            <i class="bx bxs-quote-alt-left"></i>
                        </div>

                        <div
                            class="testimonial-rating"
                            aria-label="${testimonial.rating} out of 5 stars"
                        >
                            ${stars}
                        </div>

                        <p class="testimonial-text">
                            ${escapeTestimonialHTML(
                                testimonial.testimonial
                            )}
                        </p>

                        <div class="testimonial-client">

                            <div class="testimonial-avatar">
                                <i class="bx bx-user"></i>
                            </div>

                            <div class="testimonial-client-info">

                                <h3>
                                    ${escapeTestimonialHTML(
                                        testimonial.client_name
                                    )}
                                </h3>

                                <span>
                                    ${escapeTestimonialHTML(
                                        clientInfo
                                    )}
                                </span>

                            </div>

                        </div>
                    </article>
                `;
            }).join("");

    } catch (error) {
        console.error(
            "Failed to load published testimonials:",
            error
        );

        testimonialsContainer.innerHTML = `
            <article class="testimonial-card">
                <div class="testimonial-quote">
                    <i class="bx bx-error-circle"></i>
                </div>

                <p class="testimonial-text">
                    Testimonials are temporarily unavailable.
                    Please try again later.
                </p>
            </article>
        `;
    }
}

function createHomepageStars(rating) {
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

function buildHomepageClientInfo(
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

function escapeTestimonialHTML(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadPublishedTestimonials();