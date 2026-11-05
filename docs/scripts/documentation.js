"use strict";

async function loadDocumentation() {
    const container = document.getElementById("documentation-content");
    const source = container.dataset.document;

    try {
        const response = await fetch(`./${source}`);

        if (!response.ok) {
            throw new Error("Documentation could not be loaded.");
        }

        const html = await response.text();
        const documentSource = new DOMParser().parseFromString(html, "text/html");
        const content = documentSource.querySelector(".page-with-toc");

        if (!content) {
            throw new Error("Documentation content is missing.");
        }

        container.replaceChildren(content);

        // Keep Markdown cross-references inside the public website shell.
        container.querySelectorAll("a[href]").forEach((link) => {
            const href = link.getAttribute("href");
            link.setAttribute("href", href
                .replace(/^(?:\.\/)?API\.md(?=#|$)/i, "./apireference.html")
                .replace(/^(?:\.\/)?MANUAL\.md(?=#|$)/i, "./usermanual.html"));
        });

        // Reuse the navigation behaviour shipped by the documentation generator.
        // It sits outside .page-with-toc and is not executed by HTML insertion.
        documentSource.querySelectorAll("body > script").forEach((sourceScript) => {
            const script = document.createElement("script");
            script.textContent = sourceScript.textContent;
            container.appendChild(script);
        });

        if (window.location.hash) {
            const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));

            if (target) {
                target.scrollIntoView();
            }
        }
    } catch {
        const message = document.createElement("p");
        message.textContent = "The documentation could not be loaded. Please reload this page, or open the document directly.";
        const link = document.createElement("a");
        link.href = `./${source}`;
        link.textContent = "Open documentation directly ↗";
        container.replaceChildren(message, link);
    } finally {
        container.setAttribute("aria-busy", "false");
    }
}

loadDocumentation();
