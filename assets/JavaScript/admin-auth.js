"use strict";

/*
=========================================================
TOYIN PORTFOLIO
ADMIN AUTHENTICATION
SUPABASE AUTH
=========================================================
*/

const adminLoginForm =
    document.getElementById("admin-login-form");

const adminEmail =
    document.getElementById("admin-email");

const adminPassword =
    document.getElementById("admin-password");

const adminSubmit =
    document.getElementById("admin-submit");

const adminMessage =
    document.getElementById("admin-message");

const passwordToggle =
    document.getElementById("password-toggle");


/*
=========================================================
CHECK EXISTING SESSION
=========================================================
*/

async function checkExistingAdminSession() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (session) {

            window.location.href =
                "admin-dashboard.html";

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }
}


/*
=========================================================
LOGIN
=========================================================
*/

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                adminEmail.value.trim();

            const password =
                adminPassword.value;

            if (!email || !password) {

                showAdminMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            /*
            ---------------------------------------------
            DISABLE BUTTON
            ---------------------------------------------
            */

            adminSubmit.disabled = true;

            adminSubmit.innerHTML = `
                <span>Signing In...</span>
                <i class="bx bx-loader-alt bx-spin"></i>
            `;


            try {

                const {
                    data,
                    error
                } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


                if (error) {
                    throw error;
                }


                if (!data.session) {

                    throw new Error(
                        "Login session could not be created."
                    );

                }


                showAdminMessage(
                    "Login successful. Opening dashboard...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "admin-dashboard.html";

                }, 700);


            } catch (error) {

                console.error(
                    "Admin login failed:",
                    error
                );


                let message =
                    "Unable to sign in. Please check your details and try again.";


                if (
                    error.message &&
                    error.message.toLowerCase().includes(
                        "invalid login credentials"
                    )
                ) {

                    message =
                        "Incorrect email or password.";

                }


                showAdminMessage(
                    message,
                    "error"
                );


            } finally {

                adminSubmit.disabled = false;

                adminSubmit.innerHTML = `
                    <span>Sign In</span>
                    <i class="bx bx-log-in"></i>
                `;

            }

        }
    );

}


/*
=========================================================
PASSWORD VISIBILITY
=========================================================
*/

if (passwordToggle && adminPassword) {

    passwordToggle.addEventListener(
        "click",
        () => {

            const isPassword =
                adminPassword.type === "password";

            adminPassword.type =
                isPassword
                    ? "text"
                    : "password";


            const icon =
                passwordToggle.querySelector("i");


            if (isPassword) {

                icon.classList.remove("bx-show");
                icon.classList.add("bx-hide");

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                icon.classList.remove("bx-hide");
                icon.classList.add("bx-show");

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


/*
=========================================================
MESSAGE
=========================================================
*/

function showAdminMessage(
    message,
    type
) {

    if (!adminMessage) return;

    adminMessage.textContent =
        message;

    adminMessage.className =
        `admin-message ${type}`;

}


/*
=========================================================
INITIAL SESSION CHECK
=========================================================
*/

checkExistingAdminSession();