import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
import re
import webbrowser

DEFAULT_DATA = {
    "Видео": {
        "Бьюти": [], "Реклама": [], "Обычные рилсы": [], "Машины": [],
        "Подкасты": [], "АЕ-плашки": [], "Дрон": [], "Художественный": []
    },
    "Фото": {
        "Свадьбы": [], "Интервью": []
    }
}

DEFAULT_REVIEWS = [
    {"text": "«Отличный монтаж, всё сделано быстро и качественно. Видео набрало в 3 раза больше просмотров, чем обычно. Отдельное спасибо за работу со звуком!»", "author": "— Анна, Владелец бьюти-студии"},
    {"text": "«Профессиональный подход и красивый результат. Понял задачу с полуслова, предложил свои идеи по динамике, и в итоге мы получили именно то, что нужно для рекламы.»", "author": "— Сергей, Автоспорт и Детейлинг"},
    {"text": "«Работаем на постоянной основе уже полгода. Всегда креативные решения, соблюдение дедлайнов и адекватная коммуникация. Искренне рекомендую!»", "author": "— Маркетинг-директор, Компания «КИФТОН»"},
    {"text": "«Делали интервью и подкаст. Картинка сочная, переходы плавные, плашки стильные. Гости в восторге от того, как они выглядят в кадре.»", "author": "— Руслан, Продюсер подкастов"}
]


class PortfolioManager:
    def __init__(self, root):
        self.root = root
        self.root.title("BRAGIN MEDIA — Менеджер")
        self.root.geometry("1050x720")
        self.root.minsize(900, 600)

        self.site_dir = ""
        self.script_path = ""
        self.html_path = ""
        self.data = {}
        self.reviews = []

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview", rowheight=28, font=("Segoe UI", 10))
        style.configure("Treeview.Heading", font=("Segoe UI", 11, "bold"))
        style.configure("TButton", font=("Segoe UI", 10), padding=6)
        style.configure("Title.TLabel", font=("Segoe UI", 16, "bold"))
        style.configure("Dir.TLabel", font=("Segoe UI", 10), foreground="gray")

        self.create_widgets()
        self.choose_directory()

    # ============================================================
    #  ВЫБОР ПАПКИ
    # ============================================================
    def choose_directory(self):
        folder = filedialog.askdirectory(title="Выберите папку с файлами сайта (где лежат script.js и index.html)")
        if not folder:
            self.root.quit()
            return

        script = os.path.join(folder, "script.js")
        html = os.path.join(folder, "index.html")

        if not os.path.exists(script):
            messagebox.showerror("Ошибка", f"Не найден script.js в:\n{folder}")
            self.choose_directory()
            return
        if not os.path.exists(html):
            messagebox.showerror("Ошибка", f"Не найден index.html в:\n{folder}")
            self.choose_directory()
            return

        self.site_dir = folder
        self.script_path = script
        self.html_path = html
        self.dir_label.config(text=f"📁 {folder}")

        self.data = self.load_data()
        self.reviews = self.load_reviews()

        self.cat_cb['values'] = list(self.data.keys())
        self.refresh_tree()
        self.refresh_reviews()

    # ============================================================
    #  ЧТЕНИЕ ДАННЫХ
    # ============================================================
    def load_data(self):
        try:
            with open(self.script_path, "r", encoding="utf-8") as f:
                content = f.read()
            match = re.search(r"const portfolioData\s*=\s*(\{[\s\S]*?\});", content)
            if match:
                raw_data = json.loads(match.group(1))
                clean_data = {}
                for cat, subs in raw_data.items():
                    clean_cat = cat.strip()
                    clean_data[clean_cat] = {}
                    for sub, items in subs.items():
                        clean_sub = sub.strip()
                        clean_data[clean_cat][clean_sub] = [
                            {"name": str(i.get("name", "")).strip(), "path": str(i.get("path", "")).strip()}
                            for i in items if i.get("path")
                        ]
                return clean_data
        except Exception as e:
            messagebox.showerror("Ошибка чтения script.js", str(e))
        return DEFAULT_DATA

    def load_reviews(self):
        try:
            with open(self.html_path, "r", encoding="utf-8") as f:
                content = f.read()
            pattern = r'<div class="review-card">\s*<p>(.*?)</p>\s*<b>(.*?)</b>\s*</div>'
            matches = re.findall(pattern, content, re.DOTALL)
            if matches:
                return [{"text": t.strip(), "author": a.strip()} for t, a in matches]
        except Exception as e:
            print(f"Ошибка чтения отзывов: {e}")
        return DEFAULT_REVIEWS

    # ============================================================
    #  СОХРАНЕНИЕ
    # ============================================================
    def save_data(self):
        try:
            new_block = (
                "// === PORTFOLIO DATA START ===\n"
                "const portfolioData = "
                + json.dumps(self.data, ensure_ascii=False, indent=2)
                + ";\n"
                "// === PORTFOLIO DATA END ==="
            )
            with open(self.script_path, "r", encoding="utf-8") as f:
                content = f.read()

            pattern = r"// === PORTFOLIO DATA START ===.*?// === PORTFOLIO DATA END ==="
            new_content = re.sub(pattern, new_block, content, flags=re.DOTALL)

            if new_content == content:
                pattern2 = r"const portfolioData\s*=\s*\{[\s\S]*?\};"
                new_content = re.sub(pattern2, new_block, content)

            with open(self.script_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True
        except Exception as e:
            messagebox.showerror("Ошибка сохранения script.js", str(e))
            return False

    def save_reviews(self):
        try:
            with open(self.html_path, "r", encoding="utf-8") as f:
                content = f.read()

            reviews_html = "\n".join([
                f'                <div class="review-card">\n'
                f'                    <p>{r["text"]}</p>\n'
                f'                    <b>{r["author"]}</b>\n'
                f'                </div>' for r in self.reviews
            ])

            # Удаляем все старые review-card блоки
            content_no_reviews = re.sub(r'\s*<div class="review-card">.*?</div>', '', content, flags=re.DOTALL)

            # Вставляем новые после <div class="reviews-grid...">
            new_content = re.sub(
                r'(<div class="reviews-grid[^"]*">)',
                r'\1\n' + reviews_html,
                content_no_reviews,
                count=1
            )

            with open(self.html_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True
        except Exception as e:
            messagebox.showerror("Ошибка сохранения отзывов", str(e))
            return False

    def save_all(self):
        ok1 = self.save_data()
        ok2 = self.save_reviews()
        if ok1 and ok2:
            messagebox.showinfo("Успех", "✅ Все изменения сохранены!\n- script.js обновлён\n- index.html обновлён")

    # ============================================================
    #  ИНТЕРФЕЙС
    # ============================================================
    def create_widgets(self):
        # Верхняя панель
        top = ttk.Frame(self.root, padding="12")
        top.pack(fill=tk.X)

        ttk.Label(top, text="🎬 BRAGIN MEDIA — Менеджер", style="Title.TLabel").pack(side=tk.LEFT)
        ttk.Button(top, text="📂 Сменить папку", command=self.choose_directory).pack(side=tk.RIGHT, padx=4)
        ttk.Button(top, text="💾 Сохранить всё", command=self.save_all).pack(side=tk.RIGHT, padx=4)
        ttk.Button(top, text="🌐 Открыть сайт", command=self.open_browser).pack(side=tk.RIGHT, padx=4)

        self.dir_label = ttk.Label(top, text="📁 Папка не выбрана", style="Dir.TLabel")
        self.dir_label.pack(fill=tk.X, pady=(6, 0))

        # Вкладки
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=12, pady=(0, 12))

        # ==================== ВКЛАДКА ПОРТФОЛИО ====================
        tab_portfolio = ttk.Frame(notebook, padding="12")
        notebook.add(tab_portfolio, text="📁 Портфолио")

        left = ttk.LabelFrame(tab_portfolio, text="Элементы портфолио", padding="8")
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 8))

        cols = ("cat", "sub", "name", "path")
        self.tree = ttk.Treeview(left, columns=cols, show="headings", selectmode="browse")
        self.tree.heading("cat", text="Категория")
        self.tree.heading("sub", text="Подкатегория")
        self.tree.heading("name", text="Название")
        self.tree.heading("path", text="Ссылка")
        self.tree.column("cat", width=90)
        self.tree.column("sub", width=110)
        self.tree.column("name", width=180)
        self.tree.column("path", width=260)

        sb = ttk.Scrollbar(left, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=sb.set)
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        sb.pack(side=tk.RIGHT, fill=tk.Y)

        right = ttk.LabelFrame(tab_portfolio, text="Добавить видео/фото", padding="12")
        right.pack(side=tk.RIGHT, fill=tk.Y)

        ttk.Label(right, text="Категория:").grid(row=0, column=0, sticky=tk.W, pady=4)
        self.cat_var = tk.StringVar()
        self.cat_cb = ttk.Combobox(right, textvariable=self.cat_var, state="readonly", width=28)
        self.cat_cb.grid(row=0, column=1, sticky=tk.EW, pady=4)

        ttk.Label(right, text="Подкатегория:").grid(row=1, column=0, sticky=tk.W, pady=4)
        self.sub_var = tk.StringVar()
        self.sub_cb = ttk.Combobox(right, textvariable=self.sub_var, width=28)
        self.sub_cb.grid(row=1, column=1, sticky=tk.EW, pady=4)

        ttk.Label(right, text="Название:").grid(row=2, column=0, sticky=tk.W, pady=4)
        self.name_var = tk.StringVar()
        ttk.Entry(right, textvariable=self.name_var, width=30).grid(row=2, column=1, sticky=tk.EW, pady=4)

        ttk.Label(right, text="Ссылка:").grid(row=3, column=0, sticky=tk.W, pady=4)
        self.path_var = tk.StringVar()
        ttk.Entry(right, textvariable=self.path_var, width=30).grid(row=3, column=1, sticky=tk.EW, pady=4)

        ttk.Label(right, text="https://disk.yandex.ru/i/...", foreground="gray", font=("Segoe UI", 9)).grid(row=4, column=1, sticky=tk.W)

        btns = ttk.Frame(right)
        btns.grid(row=5, column=0, columnspan=2, sticky=tk.EW, pady=12)
        ttk.Button(btns, text="➕ Добавить", command=self.add_item).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        ttk.Button(btns, text=" Удалить", command=self.delete_item).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(4, 0))

        ttk.Button(right, text="🧹 Очистить форму", command=self.clear_form).grid(row=6, column=0, columnspan=2, sticky=tk.EW)

        right.columnconfigure(1, weight=1)
        btns.columnconfigure(0, weight=1)
        btns.columnconfigure(1, weight=1)

        self.cat_cb.bind("<<ComboboxSelected>>", self.update_subs)
        self.tree.bind("<Double-1>", self.on_double_click)

        # ==================== ВКЛАДКА ОТЗЫВЫ ====================
        tab_reviews = ttk.Frame(notebook, padding="12")
        notebook.add(tab_reviews, text="💬 Отзывы")

        rev_left = ttk.LabelFrame(tab_reviews, text="Текущие отзывы", padding="8")
        rev_left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 8))

        rev_cols = ("text", "author")
        self.rev_tree = ttk.Treeview(rev_left, columns=rev_cols, show="headings", selectmode="browse")
        self.rev_tree.heading("text", text="Текст отзыва")
        self.rev_tree.heading("author", text="Автор")
        self.rev_tree.column("text", width=450)
        self.rev_tree.column("author", width=200)

        rev_sb = ttk.Scrollbar(rev_left, orient=tk.VERTICAL, command=self.rev_tree.yview)
        self.rev_tree.configure(yscroll=rev_sb.set)
        self.rev_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        rev_sb.pack(side=tk.RIGHT, fill=tk.Y)

        rev_right = ttk.LabelFrame(tab_reviews, text="Добавить отзыв", padding="12")
        rev_right.pack(side=tk.RIGHT, fill=tk.Y)

        ttk.Label(rev_right, text="Текст отзыва:").grid(row=0, column=0, sticky=tk.W, pady=4)
        self.rev_text_var = tk.StringVar()
        self.rev_text_entry = ttk.Entry(rev_right, textvariable=self.rev_text_var, width=35)
        self.rev_text_entry.grid(row=0, column=1, sticky=tk.EW, pady=4)

        ttk.Label(rev_right, text="Автор:").grid(row=1, column=0, sticky=tk.W, pady=4)
        self.rev_author_var = tk.StringVar()
        ttk.Entry(rev_right, textvariable=self.rev_author_var, width=35).grid(row=1, column=1, sticky=tk.EW, pady=4)

        ttk.Label(rev_right, text="Пример: — Анна, Владелец студии", foreground="gray", font=("Segoe UI", 9)).grid(row=2, column=1, sticky=tk.W)

        rev_btns = ttk.Frame(rev_right)
        rev_btns.grid(row=3, column=0, columnspan=2, sticky=tk.EW, pady=12)
        ttk.Button(rev_btns, text="➕ Добавить", command=self.add_review).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        ttk.Button(rev_btns, text="🗑 Удалить", command=self.delete_review).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(4, 0))

        ttk.Button(rev_right, text="🧹 Очистить форму", command=self.clear_review_form).grid(row=4, column=0, columnspan=2, sticky=tk.EW)

        rev_right.columnconfigure(1, weight=1)
        rev_btns.columnconfigure(0, weight=1)
        rev_btns.columnconfigure(1, weight=1)

        self.rev_tree.bind("<Double-1>", self.on_rev_double_click)

    # ============================================================
    #  ЛОГИКА ПОРТФОЛИО
    # ============================================================
    def update_subs(self, _=None):
        cat = self.cat_var.get()
        if cat in self.data:
            self.sub_cb['values'] = list(self.data[cat].keys())
            self.sub_cb.set("")

    def refresh_tree(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for cat, subs in self.data.items():
            for sub, items in subs.items():
                for it in items:
                    self.tree.insert("", tk.END, values=(cat, sub, it.get("name", ""), it.get("path", "")))

    def add_item(self):
        cat = self.cat_var.get().strip()
        sub = self.sub_var.get().strip()
        name = self.name_var.get().strip()
        path = self.path_var.get().strip()

        if not all([cat, sub, name, path]):
            messagebox.showwarning("Внимание", "Заполните все поля!")
            return
        if not path.startswith("http"):
            messagebox.showwarning("Внимание", "Ссылка должна начинаться с http:// или https://")
            return

        if cat not in self.data:
            self.data[cat] = {}
        if sub not in self.data[cat]:
            self.data[cat][sub] = []
            self.cat_cb['values'] = list(self.data.keys())
            self.sub_cb['values'] = list(self.data[cat].keys())

        self.data[cat][sub].append({"name": name, "path": path})
        self.refresh_tree()
        self.clear_form()
        messagebox.showinfo("Готово", f"«{name}» добавлено.\nНажмите  Сохранить всё.")

    def delete_item(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showwarning("Внимание", "Выберите строку в таблице!")
            return

        vals = self.tree.item(sel[0])["values"]
        cat = str(vals[0]).strip()
        sub = str(vals[1]).strip()
        name = str(vals[2]).strip()
        path = str(vals[3]).strip()

        if messagebox.askyesno("Подтверждение", f"Удалить '{name}'?"):
            deleted = False
            for c_key in list(self.data.keys()):
                if c_key.strip() == cat:
                    for s_key in list(self.data[c_key].keys()):
                        if s_key.strip() == sub:
                            original_len = len(self.data[c_key][s_key])
                            self.data[c_key][s_key] = [
                                i for i in self.data[c_key][s_key]
                                if not (str(i.get("name", "")).strip() == name and str(i.get("path", "")).strip() == path)
                            ]
                            if len(self.data[c_key][s_key]) < original_len:
                                deleted = True

            if deleted:
                self.refresh_tree()
                messagebox.showinfo("Успех", "Элемент удален. Нажмите '💾 Сохранить всё'.")
            else:
                messagebox.showwarning("Ошибка", "Не удалось найти элемент.")

    def clear_form(self):
        self.name_var.set("")
        self.path_var.set("")
        self.sub_var.set("")

    def on_double_click(self, _):
        sel = self.tree.selection()
        if not sel:
            return
        v = self.tree.item(sel[0])["values"]
        self.cat_var.set(str(v[0]).strip())
        self.update_subs()
        self.sub_var.set(str(v[1]).strip())
        self.name_var.set(str(v[2]).strip())
        self.path_var.set(str(v[3]).strip())

    # ============================================================
    #  ЛОГИКА ОТЗЫВОВ
    # ============================================================
    def refresh_reviews(self):
        for i in self.rev_tree.get_children():
            self.rev_tree.delete(i)
        for r in self.reviews:
            text_short = r["text"][:80] + "..." if len(r["text"]) > 80 else r["text"]
            self.rev_tree.insert("", tk.END, values=(text_short, r["author"]))

    def add_review(self):
        text = self.rev_text_var.get().strip()
        author = self.rev_author_var.get().strip()

        if not all([text, author]):
            messagebox.showwarning("Внимание", "Заполните текст и автора!")
            return

        # Автоматически добавляем кавычки и тире если их нет
        if not text.startswith("«"):
            text = "«" + text
        if not text.endswith("»"):
            text = text + "»"
        if not author.startswith("—"):
            author = "— " + author

        self.reviews.append({"text": text, "author": author})
        self.refresh_reviews()
        self.clear_review_form()
        messagebox.showinfo("Готово", "Отзыв добавлен.\nНажмите 💾 Сохранить всё.")

    def delete_review(self):
        sel = self.rev_tree.selection()
        if not sel:
            messagebox.showwarning("Внимание", "Выберите отзыв в таблице!")
            return

        idx = self.rev_tree.index(sel[0])
        if messagebox.askyesno("Подтверждение", "Удалить этот отзыв?"):
            if 0 <= idx < len(self.reviews):
                self.reviews.pop(idx)
                self.refresh_reviews()
                messagebox.showinfo("Успех", "Отзыв удален. Нажмите '💾 Сохранить всё'.")

    def clear_review_form(self):
        self.rev_text_var.set("")
        self.rev_author_var.set("")

    def on_rev_double_click(self, _):
        sel = self.rev_tree.selection()
        if not sel:
            return
        idx = self.rev_tree.index(sel[0])
        if 0 <= idx < len(self.reviews):
            r = self.reviews[idx]
            self.rev_text_var.set(r["text"])
            self.rev_author_var.set(r["author"])

    # ============================================================
    #  ОТКРЫТИЕ БРАУЗЕРА
    # ============================================================
    def open_browser(self):
        self.save_all()
        if os.path.exists(self.html_path):
            webbrowser.open(f"file://{os.path.abspath(self.html_path)}")
        else:
            messagebox.showerror("Ошибка", f"Файл не найден:\n{self.html_path}")


if __name__ == "__main__":
    root = tk.Tk()
    app = PortfolioManager(root)
    root.mainloop()