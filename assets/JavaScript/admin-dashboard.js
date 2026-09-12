"use strict";

/*
=========================================================
TOYIN PORTFOLIO
ADMIN DASHBOARD
=========================================================
*/

const adminMessagesContainer =
    document.getElementById("admin-messages");

const totalMessages =
    document.getElementById("total-messages");

const newMessages =
    document.getElementById("new-messages");

const repliedMessages =
    document.getElementById("replied-messages");

const archivedMessages =
    document.getElementById("archived-messages");

const refreshMessages =
    document.getElementById("refresh-messages");

const logoutButton =
    document.getElementById("admin-logout");

const modal =
    document.getElementById("message-modal");

const modalClose =
    document.getElementById("modal-close");

const messageDetails =
    document.getElementById("message-details");

const markReadButton =
    document.getElementById("mark-read-btn");

const markRepliedButton =
    document.getElementById("mark-replied-btn");

const archiveButton =
    document.getElementById("archive-btn");

const replyEmailButton =
    document.getElementById("reply-email-btn");

let currentMessage = null;
let allMessages = [];


/*
=========================================================
CHECK ADMIN SESSION
=========================================================
*/

async function checkAdminSession() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (!session) {

            window.location.href =
                "admin-login.html";

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Session verification failed:",
            error
        );

        window.location.href =
            "admin-login.html";

        return false;
    }
}


/*
=========================================================
LOAD MESSAGES
=========================================================
*/

async function loadMessages() {

    if (!adminMessagesContainer) return;

    adminMessagesContainer.innerHTML = `
        <div class="admin-loading">
            <i class="bx bx-loader-alt bx-spin"></i>
            Loading messages...
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("portfolio_contact_messages")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        allMessages = data || [];

        updateStatistics(allMessages);

        renderMessages(allMessages);

    } catch (error) {

        console.error(
            "Failed to load messages:",
            error
        );

        adminMessagesContainer.innerHTML = `
            <div class="admin-empty">
                <i class="bx bx-error-circle"></i>
                <h3>Unable to load messages</h3>
                <p>
                    Please check your connection
                    and try again.
                </p>
            </div>
        `;
    }
}


/*
=========================================================
STATISTICS
=========================================================
*/

function updateStatistics(messages) {

    const total =
        messages.length;

    const newCount =
        messages.filter(
            message => message.status === "new"
        ).length;

    const repliedCount =
        messages.filter(
            message => message.status === "replied"
        ).length;

    const archivedCount =
        messages.filter(
            message => message.status === "archived"
        ).length;

    if (totalMessages) {
        totalMessages.textContent =
            total;
    }

    if (newMessages) {
        newMessages.textContent =
            newCount;
    }

    if (repliedMessages) {
        repliedMessages.textContent =
            repliedCount;
    }

    if (archivedMessages) {
        archivedMessages.textContent =
            archivedCount;
    }
}


/*
=========================================================
RENDER MESSAGES
=========================================================
*/

function renderMessages(messages) {

    if (!adminMessagesContainer) return;

    if (!messages.length) {

        adminMessagesContainer.innerHTML = `
            <div class="admin-empty">
                <i class="bx bx-envelope-open"></i>
                <h3>No messages yet</h3>
                <p>
                    Messages submitted through
                    your contact form will appear here.
                </p>
            </div>
        `;

        return;
    }


    adminMessagesContainer.innerHTML =
        messages.map(message => {

            const status =
                message.status || "new";

            const isUnread =
                status === "new";

            const date =
                formatDate(message.created_at);

            return `

                <article
                    class="admin-message-item
                    ${isUnread ? "unread" : ""}"
                >

                    <div class="admin-message-info">

                        <div class="admin-message-meta">

                            <span class="admin-message-name">
                                ${escapeHTML(message.name)}
                            </span>

                            <span
                                class="
                                    admin-message-status
                                    status-${escapeHTML(status)}
                                "
                            >
                                ${escapeHTML(status)}
                            </span>

                            <span class="admin-message-date">
                                ${date}
                            </span>

                        </div>

                        <div class="admin-message-subject">
                            ${escapeHTML(message.subject)}
                        </div>

                        <div class="admin-message-preview">
                            ${escapeHTML(message.message)}
                        </div>

                        <div class="admin-message-email">
                            ${escapeHTML(message.email)}
                        </div>

                    </div>


                    <div class="admin-message-actions">

                        <button
                            type="button"
                            class="admin-message-action"
                            data-action="view"
                            data-id="${message.id}"
                            aria-label="View message"
                        >
                            <i class="bx bx-show"></i>
                        </button>

                        <button
                            type="button"
                            class="admin-message-action delete"
                            data-action="delete"
                            data-id="${message.id}"
                            aria-label="Delete message"
                        >
                            <i class="bx bx-trash"></i>
                        </button>

                    </div>

                </article>
            `;

        }).join("");


    /*
    -----------------------------------------------------
    ACTION BUTTONS
    -----------------------------------------------------
    */

    adminMessagesContainer
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;

                    if (action === "view") {
                        openMessage(id);
                    }

                    if (action === "delete") {
                        deleteMessage(id);
                    }

                }
            );

        });
}


/*
=========================================================
OPEN MESSAGE
=========================================================
*/

async function openMessage(id) {

    const message =
        allMessages.find(
            item => String(item.id) === String(id)
        );

    if (!message) return;

    currentMessage = message;

    /*
    -----------------------------------------------------
    MARK NEW MESSAGE AS READ
    -----------------------------------------------------
    */

    if (message.status === "new") {

        await updateMessageStatus(
            message.id,
            "read",
            false
        );

        message.status = "read";

        updateStatistics(allMessages);

        renderMessages(allMessages);
    }


    /*
    -----------------------------------------------------
    DISPLAY DETAILS
    -----------------------------------------------------
    */

    messageDetails.innerHTML = `

        <div class="message-detail">

            <span class="message-detail-label">
                Name
            </span>

            <div class="message-detail-value">
                ${escapeHTML(message.name)}
            </div>

        </div>


        <div class="message-detail">

            <span class="message-detail-label">
                Email
            </span>

            <div class="message-detail-value">
                ${escapeHTML(message.email)}
            </div>

        </div>


        <div class="message-detail">

            <span class="message-detail-label">
                Project Type
            </span>

            <div class="message-detail-value">
                ${escapeHTML(message.subject)}
            </div>

        </div>


        <div class="message-detail">

            <span class="message-detail-label">
                Received
            </span>

            <div class="message-detail-value">
                ${formatDate(message.created_at)}
            </div>

        </div>


        <div class="message-detail">

            <span class="message-detail-label">
                Message
            </span>

            <div class="
                message-detail-value
                message-detail-message
            ">
                ${escapeHTML(message.message)}
            </div>

        </div>

    `;


    /*
    -----------------------------------------------------
    REPLY LINK
    -----------------------------------------------------
    */

    replyEmailButton.href =
        `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
            "Re: " + message.subject
        )}`;


    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


/*
=========================================================
UPDATE MESSAGE STATUS
=========================================================
*/

async function updateMessageStatus(
    id,
    status,
    closeAfter = true
) {

    try {

        const {
            error
        } = await supabaseClient
            .from("portfolio_contact_messages")
            .update({
                status: status
            })
            .eq("id", id);

        if (error) {
            throw error;
        }


        const message =
            allMessages.find(
                item => String(item.id) === String(id)
            );

        if (message) {
            message.status = status;
        }


        updateStatistics(allMessages);

        renderMessages(allMessages);


        if (
            closeAfter &&
            currentMessage &&
            String(currentMessage.id) === String(id)
        ) {
            closeModal();
        }

    } catch (error) {

        console.error(
            "Status update failed:",
            error
        );

        alert(
            "Unable to update this message."
        );
    }
}


/*
=========================================================
DELETE MESSAGE
=========================================================
*/

async function deleteMessage(id) {

    const message =
        allMessages.find(
            item => String(item.id) === String(id)
        );

    if (!message) return;


    const confirmed =
        window.confirm(
            `Delete the message from ${message.name}?`
        );

    if (!confirmed) return;


    try {

        const {
            error
        } = await supabaseClient
            .from("portfolio_contact_messages")
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }


        allMessages =
            allMessages.filter(
                item => String(item.id) !== String(id)
            );


        updateStatistics(allMessages);

        renderMessages(allMessages);


        if (
            currentMessage &&
            String(currentMessage.id) === String(id)
        ) {
            closeModal();
        }

    } catch (error) {

        console.error(
            "Delete failed:",
            error
        );

        alert(
            "Unable to delete this message."
        );
    }
}


/*
=========================================================
CLOSE MODAL
=========================================================
*/

function closeModal() {

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow =
        "";

    currentMessage = null;
}


/*
=========================================================
DATE FORMAT
=========================================================
*/

function formatDate(dateString) {

    if (!dateString) {
        return "Unknown date";
    }

    return new Date(dateString)
        .toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
}


/*
=========================================================
HTML ESCAPING
=========================================================
*/

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


/*
=========================================================
REFRESH
=========================================================
*/

if (refreshMessages) {

    refreshMessages.addEventListener(
        "click",
        loadMessages
    );

}


/*
=========================================================
LOGOUT
=========================================================
*/

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to log out?"
                );

            if (!confirmed) return;


            try {

                const {
                    error
                } = await supabaseClient.auth.signOut();

                if (error) {
                    throw error;
                }

                window.location.href =
                    "admin-login.html";

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

                alert(
                    "Unable to log out. Please try again."
                );
            }

        }
    );

}


/*
=========================================================
MODAL CONTROLS
=========================================================
*/

if (modalClose) {
    modalClose.addEventListener(
        "click",
        closeModal
    );
}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeModal();
            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeModal();
        }

    }
);


/*
=========================================================
STATUS BUTTONS
=========================================================
*/

if (markReadButton) {

    markReadButton.addEventListener(
        "click",
        () => {

            if (!currentMessage) return;

            updateMessageStatus(
                currentMessage.id,
                "read"
            );

        }
    );

}


if (markRepliedButton) {

    markRepliedButton.addEventListener(
        "click",
        () => {

            if (!currentMessage) return;

            updateMessageStatus(
                currentMessage.id,
                "replied"
            );

        }
    );

}


if (archiveButton) {

    archiveButton.addEventListener(
        "click",
        () => {

            if (!currentMessage) return;

            updateMessageStatus(
                currentMessage.id,
                "archived"
            );

        }
    );

}


/*
=========================================================
INITIALIZE DASHBOARD
=========================================================
*/

(async function initializeDashboard() {

    const authenticated =
        await checkAdminSession();

    if (!authenticated) {
        return;
    }

    await loadMessages();

})();