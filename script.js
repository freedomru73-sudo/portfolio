// =========================================================
// BRAGIN MEDIA — PORTFOLIO SCRIPT
// =========================================================
// === PORTFOLIO DATA START ===
const portfolioData = {
 "Видео": {
  "Бьюти": [],
  "Реклама": [],
  "Обычные рилсы": [],
  "Машины": [
   {
    "name": "Dada",
    "path": "https://disk.yandex.ru/i/2iG3UfwlYwKA8g"
   }
  ],
  "Подкасты": [],
  "АЕ-плашки": [],
  "Дрон": [],
  "Художественный": []
 },
 "Фото": {
  "Свадьбы": [],
  "Интервью": [
   {
    "name": "1",
    "path": "https://disk.yandex.ru/i/pP2s-CibZ3ziYw"
   }
  ],
  "Портреты": [],
  "Репортаж": [],
  "Предметная съемка": [],
  "Love Story": [],
  "Бьюти": []
 }
};
// === PORTFOLIO DATA END ===

const fallbackThumbnail = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80";
const CORS_PROXY = "https://corsproxy.io/?";

async function fetchYandex(url) {
 try {
     const r = await fetch(url, { method: "GET", cache: "no-store", referrerPolicy: "no-referrer" });
     if (r.ok) return r;
 } catch (e) {}
 const proxyUrl = CORS_PROXY + encodeURIComponent(url);
 const r2 = await fetch(proxyUrl, { method: "GET", cache: "no-store", referrerPolicy: "no-referrer" });
 if (!r2.ok) throw new Error(`Proxy HTTP ${r2.status}`);
 return r2;
}

async function getYandexData(path) {
 const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(path)}`;
 const response = await fetchYandex(apiUrl);
 return await response.json();
}

async function getYandexDownloadUrl(path) {
 const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(path)}`;
 const response = await fetchYandex(apiUrl);
 const data = await response.json();
 if (!data.href) throw new Error("Yandex API не вернул download href");
 return data.href;
}

async function fetchThumbnail(path) {
 try {
     const data = await getYandexData(path);
     return data.preview || fallbackThumbnail;
 } catch (error) {
     return fallbackThumbnail;
 }
}

function showFileError(item) {
 const modal = document.getElementById("media-modal");
 const modalBody = document.getElementById("modal-body");
 if (!modal || !modalBody) return;
 modal.style.display = "flex";
 modalBody.innerHTML = `
     <div style="color:#fff; padding:40px 25px; text-align:center; font-family:Inter,sans-serif;">
         <div style="width:56px; height:56px; margin:0 auto 18px; border:1px solid rgba(255,255,255,0.25); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px;">
             <i class="fa-solid fa-triangle-exclamation"></i>
         </div>
         <div style="font-size:20px; font-weight:600; margin-bottom:10px;">Не удалось открыть файл</div>
         <a href="${item.path}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; padding:12px 20px; background:#fff; color:#000; border-radius:999px; text-decoration:none; font-weight:600;">
             <i class="fa-solid fa-arrow-up-right-from-square"></i> Открыть на Яндекс.Диске
         </a>
     </div>
 `;
}

// =========================================================
// СОЗДАНИЕ ПОРТФОЛИО
// =========================================================
const accordionContainer = document.getElementById("portfolio-accordion");
const toggleContainer = document.getElementById("portfolio-toggle");

if (accordionContainer && toggleContainer) {
    // 1. Генерация кнопок-переключателей
    const mainCategories = Object.keys(portfolioData);
    mainCategories.forEach((cat, index) => {
        const btn = document.createElement("button");
        btn.className = "toggle-btn" + (index === 0 ? " active" : "");
        btn.textContent = cat.trim();
        btn.dataset.category = cat;
        toggleContainer.appendChild(btn);
    });

    // 2. Функция рендера аккордеона
    function renderAccordion(mainCategory) {
        accordionContainer.innerHTML = "";
        const subCategories = portfolioData[mainCategory];
        if (!subCategories) return;

        for (const [subCategory, items] of Object.entries(subCategories)) {
            if (!Array.isArray(items) || items.length === 0) continue;

            const itemDiv = document.createElement("div");
            itemDiv.className = "accordion-item";

            const header = document.createElement("button");
            header.type = "button";
            header.className = "accordion-header";
            header.setAttribute("aria-expanded", "false");
            header.innerHTML = `
                <span>${subCategory}</span>
                <span style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:14px; color:#666;">
                    (${items.length})
                    <i class="fa-solid fa-chevron-down accordion-arrow" style="font-size:12px; transition:transform .25s ease;"></i>
                </span>
            `;

            const content = document.createElement("div");
            content.className = "accordion-content";
            const inner = document.createElement("div");
            inner.className = "accordion-inner";

            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "media-card";
                
                const img = document.createElement("img");
                img.src = fallbackThumbnail;
                img.alt = item.name || "Работа BRAGIN MEDIA";
                img.loading = "lazy";
                img.referrerPolicy = "no-referrer";

                const overlay = document.createElement("div");
                overlay.className = "media-card-overlay";
                const title = document.createElement("div");
                title.className = "media-card-title";
                
                // Иконка будет обновлена после проверки типа файла, пока ставим универсальную
                title.innerHTML = `<div class="play-icon"><i class="fa-solid fa-eye"></i></div> ${item.name}`;
                
                overlay.appendChild(title);
                card.appendChild(img);
                card.appendChild(overlay);

                fetchThumbnail(item.path).then(thumbnail => {
                    if (thumbnail && typeof thumbnail === "string") img.src = thumbnail;
                }).catch(() => {});

                // === ГЛАВНОЕ ИСПРАВЛЕНИЕ: ОПРЕДЕЛЕНИЕ ТИПА ФАЙЛА ПО ИМЕНИ С ЯНДЕКС ДИСКА ===
                card.addEventListener("click", async () => {
                    try {
                        card.style.pointerEvents = "none";
                        card.style.opacity = "0.65";
                        
                        // 1. Получаем метаданные, чтобы узнать реальное имя файла (например, "photo.jpg" или "video.mp4")
                        const data = await getYandexData(item.path);
                        const fileName = data.name || "";
                        
                        // 2. Проверяем расширение реального файла
                        const isVideo = /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(fileName);

                        if (isVideo) {
                            // Обновляем иконку на плеер
                            title.innerHTML = `<div class="play-icon"><i class="fa-solid fa-play"></i></div> ${item.name}`;
                            const videoUrl = await getYandexDownloadUrl(item.path);
                            openModal({ type: "video", url: videoUrl, poster: data.preview || img.src, name: item.name });
                        } else {
                            // Это фото
                            title.innerHTML = `<div class="play-icon"><i class="fa-solid fa-image"></i></div> ${item.name}`;
                            openModal({ type: "image", url: data.file || data.preview, poster: data.preview, name: item.name });
                        }
                    } catch (error) {
                        console.error("Ошибка открытия:", error);
                        showFileError(item);
                    } finally {
                        card.style.pointerEvents = "";
                        card.style.opacity = "";
                    }
                });
                inner.appendChild(card);
            });

            content.appendChild(inner);
            itemDiv.appendChild(header);
            itemDiv.appendChild(content);
            accordionContainer.appendChild(itemDiv);

            // Логика аккордеона
            header.addEventListener("click", () => {
                const isActive = itemDiv.classList.contains("active");
                document.querySelectorAll(".accordion-item").forEach(otherItem => {
                    otherItem.classList.remove("active");
                    const otherContent = otherItem.querySelector(".accordion-content");
                    const otherHeader = otherItem.querySelector(".accordion-header");
                    const otherArrow = otherItem.querySelector(".accordion-arrow");
                    if (otherContent) otherContent.style.maxHeight = null;
                    if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
                    if (otherArrow) otherArrow.style.transform = "rotate(0deg)";
                });
                if (!isActive) {
                    itemDiv.classList.add("active");
                    content.style.maxHeight = content.scrollHeight + "px";
                    header.setAttribute("aria-expanded", "true");
                    const arrow = header.querySelector(".accordion-arrow");
                    if (arrow) arrow.style.transform = "rotate(180deg)";
                }
            });
        }
    }

    // 3. Обработка кликов по переключателям
    toggleContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("toggle-btn")) {
            toggleContainer.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            renderAccordion(e.target.dataset.category);
        }
    });

    // 4. Первоначальный рендер
    renderAccordion(mainCategories[0]);
}

// =========================================================
// MODAL & MOBILE MENU & REVEAL
// =========================================================
const modal = document.getElementById("media-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.querySelector(".modal-close");

function openModal(media) {
 if (!modal || !modalBody) return;
 modal.style.display = "flex";
 document.body.classList.add("modal-open");
 if (media.type === "video") {
     const safePoster = media.poster && media.poster.startsWith("http") ? media.poster : "";
     modalBody.innerHTML = `<video controls autoplay playsinline preload="metadata" referrerpolicy="no-referrer" crossorigin="anonymous" ${safePoster ? `poster="${safePoster}"` : ""} style="width:100%; height:auto; max-height:80vh; display:block; background:#000; border-radius:16px;"><source src="${media.url}" type="video/mp4"></video>`;
     const video = modalBody.querySelector("video");
     if (video) video.play().catch(() => {});
 } else {
     modalBody.innerHTML = `<img src="${media.url}" alt="${media.name || ""}" referrerpolicy="no-referrer" style="display:block; max-width:100%; max-height:80vh; width:auto; height:auto; object-fit:contain; border-radius:16px;">`;
 }
}

function closeModal() {
 if (!modal || !modalBody) return;
 const video = modalBody.querySelector("video");
 if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
 modal.style.display = "none";
 modalBody.innerHTML = "";
 document.body.classList.remove("modal-open");
}

if (modalClose) modalClose.addEventListener("click", closeModal);
window.addEventListener("click", event => { if (modal && event.target === modal) closeModal(); });
window.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

const mobileMenuCheckbox = document.getElementById("mobile-menu-toggle");
const mainNav = document.getElementById("main-nav");
if (mobileMenuCheckbox && mainNav) {
 mainNav.querySelectorAll("a").forEach(link => {
     link.addEventListener("click", () => { mobileMenuCheckbox.checked = false; });
 });
 window.addEventListener("keydown", event => { if (event.key === "Escape") mobileMenuCheckbox.checked = false; });
}

window.addEventListener("resize", () => {
 document.querySelectorAll(".accordion-item.active").forEach(item => {
     const content = item.querySelector(".accordion-content");
     if (content) content.style.maxHeight = content.scrollHeight + "px";
 });
});

const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
if ("IntersectionObserver" in window) {
 const observer = new IntersectionObserver(entries => {
     entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); });
 }, observerOptions);
 document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
 }