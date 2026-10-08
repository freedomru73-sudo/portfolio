// =========================================================
// BRAGIN MEDIA — PORTFOLIO SCRIPT
// =========================================================


// =========================================================
// PORTFOLIO DATA
// =========================================================

// === PORTFOLIO DATA START ===
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
    "Интервью": []
  }
};
// === PORTFOLIO DATA END ===
// === PORTFOLIO DATA END ===


// =========================================================
// FALLBACK THUMBNAIL
// =========================================================

const fallbackThumbnail =
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80";


// =========================================================
// YANDEX DISK — ПОЛУЧЕНИЕ МЕТАДАННЫХ
// =========================================================

async function getYandexData(path) {

    const apiUrl =
        `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(path)}`;

    const response = await fetch(
        apiUrl,
        {
            method: "GET",
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Yandex metadata HTTP ${response.status}`
        );

    }

    return await response.json();

}


// =========================================================
// YANDEX DISK — ПОЛУЧЕНИЕ ПРЯМОЙ ССЫЛКИ
// =========================================================

async function getYandexDownloadUrl(path) {

    const apiUrl =
        `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(path)}`;

    const response = await fetch(
        apiUrl,
        {
            method: "GET",
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Yandex download HTTP ${response.status}`
        );

    }

    const data = await response.json();

    if (!data.href) {

        throw new Error(
            "Yandex API не вернул download href"
        );

    }

    return data.href;

}


// =========================================================
// ПОЛУЧЕНИЕ ОБЛОЖКИ
// =========================================================

async function fetchThumbnail(path) {

    try {

        const data =
            await getYandexData(path);

        return data.preview ||
            fallbackThumbnail;

    }

    catch (error) {

        console.warn(
            "Не удалось загрузить обложку:",
            path,
            error
        );

        return fallbackThumbnail;

    }

}


// =========================================================
// ОПРЕДЕЛЕНИЕ ТИПА ФАЙЛА
// =========================================================

function isVideoFile(path) {

    return (
        typeof path === "string" &&
        path.startsWith("http") &&
        !/\.(jpg|jpeg|png|webp|gif|heic)$/i.test(path)
    );

}


// =========================================================
// ЭКРАН ОШИБКИ
// =========================================================

function showFileError(item) {

    const modal =
        document.getElementById(
            "media-modal"
        );

    const modalBody =
        document.getElementById(
            "modal-body"
        );


    if (!modal || !modalBody) {
        return;
    }


    modal.style.display = "flex";


    modalBody.innerHTML = `

        <div
            style="
                color:#fff;
                padding:40px 25px;
                text-align:center;
                font-family:Inter,sans-serif;
            ">

            <div
                style="
                    width:56px;
                    height:56px;
                    margin:0 auto 18px;
                    border:1px solid rgba(255,255,255,0.25);
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:24px;
                ">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <div
                style="
                    font-size:20px;
                    font-weight:600;
                    margin-bottom:10px;
                ">

                Не удалось открыть файл

            </div>


            <div
                style="
                    font-size:14px;
                    line-height:1.5;
                    color:#aaa;
                    margin-bottom:24px;
                ">

                Проверьте, что файл опубликован
                и доступен по ссылке Яндекс.Диска.

            </div>


            <a
                href="${item.path}"
                target="_blank"
                rel="noopener"
                style="
                    display:inline-flex;
                    align-items:center;
                    gap:8px;
                    padding:12px 20px;
                    background:#fff;
                    color:#000;
                    border-radius:999px;
                    text-decoration:none;
                    font-weight:600;
                ">

                <i class="fa-solid fa-arrow-up-right-from-square"></i>

                Открыть на Яндекс.Диске

            </a>

        </div>

    `;
}


// =========================================================
// СОЗДАНИЕ ПОРТФОЛИО
// =========================================================

const accordionContainer =
    document.getElementById(
        "portfolio-accordion"
    );


if (accordionContainer) {

    for (
        const [
            mainCategory,
            subCategories
        ]
        of Object.entries(portfolioData)
    ) {

        for (
            const [
                subCategory,
                items
            ]
            of Object.entries(subCategories)
        ) {

            // Пустые категории пропускаем
            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {
                continue;
            }


            // =================================================
            // ACCORDION ITEM
            // =================================================

            const itemDiv =
                document.createElement("div");

            itemDiv.className =
                "accordion-item";


            // =================================================
            // ACCORDION HEADER
            // =================================================

            const header =
                document.createElement("button");

            header.type = "button";

            header.className =
                "accordion-header";

            header.setAttribute(
                "aria-expanded",
                "false"
            );


            header.innerHTML = `

                <span>
                    ${mainCategory} / ${subCategory}
                </span>

                <span
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        font-weight:400;
                        font-size:14px;
                        color:#666;
                    ">

                    (${items.length})

                    <i
                        class="fa-solid fa-chevron-down accordion-arrow"
                        style="
                            font-size:12px;
                            transition:transform .25s ease;
                        ">
                    </i>

                </span>

            `;


            // =================================================
            // CONTENT
            // =================================================

            const content =
                document.createElement("div");

            content.className =
                "accordion-content";


            const inner =
                document.createElement("div");

            inner.className =
                "accordion-inner";


            // =================================================
            // MEDIA CARDS
            // =================================================

            items.forEach(item => {

                const card =
                    document.createElement("div");

                card.className =
                    "media-card";


                const isVideo =
                    isVideoFile(item.path);


                // -------------------------------------------------
                // IMAGE
                // -------------------------------------------------

                const img =
                    document.createElement("img");

                img.src =
                    fallbackThumbnail;

                img.alt =
                    item.name || "Работа BRAGIN MEDIA";

                img.loading =
                    "lazy";


                // -------------------------------------------------
                // OVERLAY
                // -------------------------------------------------

                const overlay =
                    document.createElement("div");

                overlay.className =
                    "media-card-overlay";


                const title =
                    document.createElement("div");

                title.className =
                    "media-card-title";


                if (isVideo) {

                    title.innerHTML = `

                        <div class="play-icon">

                            <i class="fa-solid fa-play"></i>

                        </div>

                        ${item.name}

                    `;

                }

                else {

                    title.textContent =
                        item.name;

                }


                overlay.appendChild(title);


                card.appendChild(img);

                card.appendChild(overlay);


                // -------------------------------------------------
                // ЗАГРУЗКА ОБЛОЖКИ
                // -------------------------------------------------

                fetchThumbnail(
                    item.path
                )
                .then(
                    thumbnail => {

                        if (
                            thumbnail &&
                            typeof thumbnail === "string"
                        ) {

                            img.src =
                                thumbnail;

                        }

                    }
                )
                .catch(
                    () => {}
                );


                // -------------------------------------------------
                // ОТКРЫТИЕ ФАЙЛА
                // -------------------------------------------------

                card.addEventListener(
                    "click",
                    async () => {

                        try {

                            card.style.pointerEvents =
                                "none";

                            card.style.opacity =
                                "0.65";


                            // -------------------------------------
                            // VIDEO
                            // -------------------------------------

                            if (isVideo) {

                                const videoUrl =
                                    await getYandexDownloadUrl(
                                        item.path
                                    );


                                openModal({

                                    type: "video",

                                    url: videoUrl,

                                    poster: img.src,

                                    name: item.name

                                });

                            }


                            // -------------------------------------
                            // IMAGE
                            // -------------------------------------

                            else {

                                const data =
                                    await getYandexData(
                                        item.path
                                    );


                                openModal({

                                    type: "image",

                                    url:
                                        data.file ||
                                        data.preview,

                                    poster:
                                        data.preview,

                                    name:
                                        item.name

                                });

                            }

                        }

                        catch (error) {

                            console.error(
                                "Ошибка открытия:",
                                error
                            );

                            showFileError(item);

                        }

                        finally {

                            card.style.pointerEvents =
                                "";

                            card.style.opacity =
                                "";

                        }

                    }
                );


                inner.appendChild(card);

            });


            // =================================================
            // СОБИРАЕМ ACCORDION
            // =================================================

            content.appendChild(inner);

            itemDiv.appendChild(header);

            itemDiv.appendChild(content);

            accordionContainer.appendChild(itemDiv);


            // =================================================
            // ACCORDION CLICK
            // =================================================

            header.addEventListener(
                "click",
                () => {

                    const isActive =
                        itemDiv.classList.contains(
                            "active"
                        );


                    // Закрываем остальные
                    document
                        .querySelectorAll(
                            ".accordion-item"
                        )
                        .forEach(otherItem => {

                            otherItem
                                .classList
                                .remove("active");


                            const otherContent =
                                otherItem.querySelector(
                                    ".accordion-content"
                                );


                            const otherHeader =
                                otherItem.querySelector(
                                    ".accordion-header"
                                );


                            const otherArrow =
                                otherItem.querySelector(
                                    ".accordion-arrow"
                                );


                            if (otherContent) {

                                otherContent.style.maxHeight =
                                    null;

                            }


                            if (otherHeader) {

                                otherHeader.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );

                            }


                            if (otherArrow) {

                                otherArrow.style.transform =
                                    "rotate(0deg)";

                            }

                        });


                    // Если текущий был закрыт —
                    // открываем его
                    if (!isActive) {

                        itemDiv.classList.add(
                            "active"
                        );


                        content.style.maxHeight =
                            content.scrollHeight + "px";


                        header.setAttribute(
                            "aria-expanded",
                            "true"
                        );


                        const arrow =
                            header.querySelector(
                                ".accordion-arrow"
                            );


                        if (arrow) {

                            arrow.style.transform =
                                "rotate(180deg)";

                        }

                    }

                }
            );

        }

    }

}


// =========================================================
// MODAL
// =========================================================

const modal =
    document.getElementById(
        "media-modal"
    );


const modalBody =
    document.getElementById(
        "modal-body"
    );


const modalClose =
    document.querySelector(
        ".modal-close"
    );


// =========================================================
// OPEN MODAL
// =========================================================

function openModal(media) {

    if (!modal || !modalBody) {
        return;
    }


    modal.style.display =
        "flex";


    document.body.classList.add(
        "modal-open"
    );


    // =======================================================
    // VIDEO
    // =======================================================

    if (media.type === "video") {

        const safePoster =
            media.poster &&
            media.poster.startsWith("http")
                ? media.poster
                : "";


        modalBody.innerHTML = `

            <video
                controls
                autoplay
                playsinline
                preload="metadata"

                ${safePoster
                    ? `poster="${safePoster}"`
                    : ""
                }

                style="
                    width:100%;
                    height:auto;
                    max-height:80vh;
                    display:block;
                    background:#000;
                    border-radius:16px;
                "
            >

                <source
                    src="${media.url}"
                    type="video/mp4"
                >

                Ваш браузер
                не поддерживает видео.

            </video>

        `;


        const video =
            modalBody.querySelector(
                "video"
            );


        if (video) {

            video
                .play()
                .catch(
                    () => {}
                );

        }

    }


    // =======================================================
    // IMAGE
    // =======================================================

    else {

        modalBody.innerHTML = `

            <img
                src="${media.url}"
                alt="${media.name || ""}"

                style="
                    display:block;
                    max-width:100%;
                    max-height:80vh;
                    width:auto;
                    height:auto;
                    object-fit:contain;
                    border-radius:16px;
                "
            >

        `;

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {

    if (!modal || !modalBody) {
        return;
    }


    const video =
        modalBody.querySelector(
            "video"
        );


    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();

    }


    modal.style.display =
        "none";


    modalBody.innerHTML =
        "";


    document.body.classList.remove(
        "modal-open"
    );

}


// =========================================================
// MODAL CLOSE BUTTON
// =========================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


// =========================================================
// CLICK OUTSIDE MODAL
// =========================================================

window.addEventListener(
    "click",
    event => {

        if (
            modal &&
            event.target === modal
        ) {

            closeModal();

        }

    }
);


// =========================================================
// ESC — CLOSE MODAL
// =========================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


// =========================================================
// MOBILE MENU
// =========================================================
// ВАЖНО:
// Само открытие меню делает CSS через checkbox.
// JavaScript здесь нужен только для:
// 1. закрытия меню после перехода по ссылке;
// 2. закрытия меню при переходе на другой раздел.
// =========================================================

const mobileMenuCheckbox =
    document.getElementById(
        "mobile-menu-toggle"
    );


const mainNav =
    document.getElementById(
        "main-nav"
    );


if (
    mobileMenuCheckbox &&
    mainNav
) {

    // -------------------------------------------------------
    // Закрытие меню при нажатии на ссылку
    // -------------------------------------------------------

    mainNav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenuCheckbox.checked =
                        false;

                }
            );

        });


    // -------------------------------------------------------
    // Закрытие меню при Escape
    // -------------------------------------------------------

    window.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                mobileMenuCheckbox.checked =
                    false;

            }

        }
    );

}


// =========================================================
// RESIZE — ПЕРЕСЧЁТ ACCORDION
// =========================================================

window.addEventListener(
    "resize",
    () => {

        document
            .querySelectorAll(
                ".accordion-item.active"
            )
            .forEach(item => {

                const content =
                    item.querySelector(
                        ".accordion-content"
                    );


                if (content) {

                    content.style.maxHeight =
                        content.scrollHeight + "px";

                }

            });

    }
);


// =========================================================
// REVEAL ANIMATION
// =========================================================

const observerOptions = {

    threshold: 0.1,

    rootMargin:
        "0px 0px -50px 0px"

};


if (
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add("active");

                        }

                    }
                );

            },

            observerOptions

        );


    document
        .querySelectorAll(
            ".reveal"
        )
        .forEach(
            element =>
                observer.observe(element)
        );

}

else {

    // Если браузер не поддерживает
    // IntersectionObserver

    document
        .querySelectorAll(
            ".reveal"
        )
        .forEach(
            element =>
                element.classList.add(
                    "active"
                )
        );

		}