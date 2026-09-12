"use strict";

/*
=========================================================
TOYIN PORTFOLIO
REAL CONTACT FORM BACKEND
SUPABASE
=========================================================
*/

const contactForm = document.getElementById("contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const subjectInput = document.getElementById("subject");
        const messageInput = document.getElementById("message");

        if (
            !submitButton ||
            !nameInput ||
            !emailInput ||
            !subjectInput ||
            !messageInput
        ) {
            console.error("Contact form elements are missing.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        /*
        =====================================================
        BASIC VALIDATION
        =====================================================
        */

        if (name.length < 2) {
            showContactMessage(
                "Please enter your name.",
                "error"
            );
            nameInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            showContactMessage(
                "Please enter a valid email address.",
                "error"
            );
            emailInput.focus();
            return;
        }

        if (!subject) {
            showContactMessage(
                "Please select a project type.",
                "error"
            );
            subjectInput.focus();
            return;
        }

        if (message.length < 10) {
            showContactMessage(
                "Please tell me a little more about your project.",
                "error"
            );
            messageInput.focus();
            return;
        }

        /*
        =====================================================
        DISABLE BUTTON WHILE SUBMITTING
        =====================================================
        */

        const originalButtonHTML = submitButton.innerHTML;

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span>Sending...</span>
            <i class="bx bx-loader-alt bx-spin"></i>
        `;

        try {

            /*
            =================================================
            SEND MESSAGE TO SUPABASE
            =================================================
            */

            const { error } = await supabaseClient
                .from("portfolio_contact_messages")
                .insert([
                    {
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    }
                ]);

            if (error) {
                throw error;
            }

            /*
            =================================================
            SUCCESS
            =================================================
            */

            contactForm.reset();

            showContactMessage(
                "Your message has been sent successfully. I'll get back to you as soon as possible.",
                "success"
            );

        } catch (error) {

            console.error(
                "Contact form submission failed:",
                error
            );

            showContactMessage(
                "Something went wrong while sending your message. Please try again.",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML = originalButtonHTML;
        }

    });

}


/*
=========================================================
EMAIL VALIDATION
=========================================================
*/

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}


/*
=========================================================
CONTACT FORM MESSAGE
=========================================================
*/

function showContactMessage(message, type) {

    let messageElement =
        document.getElementById("contact-form-message");

    /*
    -----------------------------------------------------
    CREATE MESSAGE ELEMENT IF IT DOES NOT EXIST
    -----------------------------------------------------
    */

    if (!messageElement) {

        messageElement =
            document.createElement("div");

        messageElement.id =
            "contact-form-message";

        messageElement.setAttribute(
            "role",
            "alert"
        );

        const form =
            document.getElementById("contact-form");

        if (form) {
            form.appendChild(messageElement);
        }
    }

    messageElement.textContent = message;

    messageElement.className =
        `contact-form-message ${type}`;

    /*
    -----------------------------------------------------
    AUTO REMOVE ERROR MESSAGE
    -----------------------------------------------------
    */

    if (type === "error") {

        setTimeout(() => {

            if (messageElement) {
                messageElement.classList.remove(type);
            }

        }, 6000);
    }
}