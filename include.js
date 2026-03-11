
document.addEventListener("DOMContentLoaded", () => {
    const includes = document.querySelectorAll("[w3-include-html]");
    includes.forEach(el => {
        fetch(el.getAttribute("w3-include-html"))
            .then(r => r.text())
            .then(html => {
                el.innerHTML = html;
                el.removeAttribute("w3-include-html");

                // 自动高亮当前页面
                const currentPath = location.pathname;  // 例如 /img/index.html
                document.querySelectorAll(".header-btn").forEach(btn => {
                    const link = btn.parentElement.getAttribute("href") || "";
                    if (link === currentPath || (currentPath === "/" && link === "/index.html")) {
                        btn.classList.add("active");
                    }
                });
            });
    });
});