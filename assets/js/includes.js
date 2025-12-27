(() => {
    const headerTarget = document.getElementById("site-header");
    const footerTarget = document.getElementById("site-footer");

    const fallbackHeader = `
<header>
    <h1>The Family Archive</h1>
    <nav>
        <a href="/">Home</a>
        <a href="/about/">About</a>
        <a href="/family-lines/">Family Lines</a>
        <a href="/timeline/">Timeline</a>
        <a href="/stories/">Stories</a>
        <a href="/gallery/">Gallery</a>
        <a href="/tree/">Family Tree <span class="lock-badge" aria-label="Private area" title="Private area">🔒</span></a>
        <a class="nav-cta" href="/request-access/">Request Access</a>
    </nav>
</header>
`.trim();

    const fallbackFooter = `
<footer>
    <p>© Family Archive — Private family history site</p>
</footer>
`.trim();

    function loadInclude(target, url, fallback) {
        if (!target) {
            return Promise.resolve(false);
        }

        return fetch(url, { credentials: "same-origin" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Include request failed");
                }
                return response.text();
            })
            .then((html) => {
                target.innerHTML = html;
                return true;
            })
            .catch(() => {
                target.innerHTML = fallback;
                return false;
            });
    }

    function parseIsoDate(value) {
        if (!value || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
            return null;
        }

        const parts = value.split("-").map(Number);
        const date = new Date(parts[0], parts[1] - 1, parts[2]);

        if (
            date.getFullYear() !== parts[0] ||
            date.getMonth() !== parts[1] - 1 ||
            date.getDate() !== parts[2]
        ) {
            return null;
        }

        return date;
    }

    function toIsoDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function setLastUpdated() {
        const timeEl = document.getElementById("last-updated");
        if (!timeEl) {
            return;
        }

        const meta = document.querySelector('meta[name="site-last-updated"]');
        const metaDate = parseIsoDate(meta ? meta.getAttribute("content") : "");
        const date = metaDate || new Date();

        const formatted = new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);

        timeEl.textContent = formatted;
        timeEl.setAttribute("datetime", toIsoDate(date));
    }

    Promise.all([
        loadInclude(headerTarget, "/assets/includes/header.html", fallbackHeader),
        loadInclude(footerTarget, "/assets/includes/footer.html", fallbackFooter)
    ]).then(setLastUpdated);
})();
