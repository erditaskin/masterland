"""Author fixed device design references from layers and fixtures, never app screenshots."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/references/device-v2"
ART = ROOT / "mobile/assets/art"
DATA = json.loads((ROOT / "data/content-reference.json").read_text())
PALETTES = json.loads((OUT / "palettes.json").read_text())
CHROME = json.loads((ART / "cities-v1/chrome-bounds.json").read_text())
FRAMES = json.loads((ART / "cities-v1/frame-bounds.json").read_text())
NAMES = DATA["locales"]["tr"]
CITY_NAMES = ["Belenyaka", "Badınca", "Yalıkoru", "Demirdere", "İpekyolu"]
CONCEPTS = ["01-belenyaka", "02-badinca", "03-yalikoru", "04-demirdere", "05-ipekyolu"]
PLANS = DATA["city1_opening_plan"]["producers"]
GROUPS = [[p["item_id"] for p in g["product_unlocks"]] for g in PLANS]
KNOWN_COUNTS = [4, 3, 4, 3, 4]
KNOWN = [item for group, count in zip(GROUPS, KNOWN_COUNTS) for item in group[:count]]
STORAGE = [GROUPS[g][tier] for g, tier in [(0, 0), (0, 1), (1, 1), (2, 3), (3, 0), (4, 0), (2, 0), (1, 0)]]
BOUNDS = {key: json.loads((ART / filename).read_text()) for key, filename in [("skara", "skara-items-v2-bounds.json"), ("haven", "haven-items-v1-bounds.json")]}
ITEMS = {p["item_id"]: (index, p["tier"]) for index, group in enumerate(PLANS + DATA["city2_opening_plan"]["producers"]) for p in group["product_unlocks"]}
ITEM_BOUNDS = json.loads((ART / "item-bounds.json").read_text())
ALL_ASSETS = set()


class Screen:
    def __init__(self, city, view, title=None, tab="Tahta"):
        self.city, self.view, self.p = city, view, PALETTES[city]
        self.commands, self.clip = [], None
        self.id = city + "-" + view
        self.rect(0, 0, 1206, 2622, "#fff0d1")
        scene = ART / f"cities-v1/{city}-scene.png"
        with Image.open(scene) as image:
            sw, sh = image.size
        self.image(scene, 0, 0, 1206, 2622, [0, 80, sw, min(sh - 80, round(sw * 2622 / 1206))])
        self.hud()
        if title:
            self.panel(48, 664, 1110, 1660)
            self.plaque(title, 180, 550, 846, 120)
            self.button("×", 1038, 552, 132, tone="secondary", height=132)
            self.clip = [72, 712, 1062, 1596]
        self.tab = tab

    def add(self, kind, rect, **props):
        row = dict(kind=kind, rect=[round(x, 3) for x in rect], **props)
        if self.clip:
            row["clip"] = self.clip
        self.commands.append(row)

    def rect(self, x, y, w, h, fill, end=None, stroke=None, radius=24, line=3):
        self.add("rect", [x, y, w, h], fill=fill, end=end, stroke=stroke, radius=radius, line=line)

    def text(self, text, x, y, w=990, h=72, size=44, bold=False, color=None, align="left", font=None):
        self.add("text", [x, y, w, h], text=str(text), size=size, bold=bold, fill=color or self.p["ink"], align=align, font=font)

    def image(self, file, x, y, w, h, crop=None, fit=False, radius=None):
        file = Path(file)
        ALL_ASSETS.add(file)
        self.add("image", [x, y, w, h], file=str(file), crop=crop, fit=fit, radius=radius)

    def frame(self, x, y, w, h, paper=True):
        if paper:
            self.rect(x + 10, y + 10, w - 20, h - 20, self.p["paperLight"], self.p["paper"], radius=40)
        sx, sy, sw, sh = FRAMES[self.city]
        b, edge = 128, 48
        for row in range(3):
            for col in range(3):
                if row == col == 1:
                    continue
                srcx, srcy = [sx, sx + b, sx + sw - b][col], [sy, sy + b, sy + sh - b][row]
                srcw, srch = [b, sw - 2 * b, b][col], [b, sh - 2 * b, b][row]
                dx, dy = [x, x + edge, x + w - edge][col], [y, y + edge, y + h - edge][row]
                dw, dh = [edge, w - 2 * edge, edge][col], [edge, h - 2 * edge, edge][row]
                self.image(ART / f"cities-v1/{self.city}-frame.png", dx, dy, dw, dh, [srcx, srcy, srcw, srch])

    def panel(self, x, y, w, h):
        self.frame(x, y, w, h)

    def card(self, x, y, w, h, selected=False, danger=False):
        edge = "#a83929" if danger else "#36872c" if selected else self.p["edge"]
        self.rect(x, y + 5, w, h, "#c99a59", radius=36)
        self.rect(x, y, w, h, self.p["paperLight"], "#e6f3ba" if selected else self.p["paper"], edge, 36, 4 if selected else 3)
        self.rect(x + 8, y + 8, w - 16, h - 16, None, stroke="#fff3d4", radius=29, line=3)

    def plaque(self, title, x, y, w, h):
        self.image(ART / f"cities-v1/{self.city}-chrome.png", x, y, w, h, CHROME[self.city][0])
        self.text(title, x + w * .17, y, w * .66, h, 64, True, self.p["onHeading"], "center")

    def tray(self, x, y, w, h):
        self.image(ART / f"cities-v1/{self.city}-chrome.png", x, y, w, h, CHROME[self.city][1])

    def button(self, text, x, y, w, tone="primary", height=132, disabled=False):
        fill = "#a7aaa9" if disabled else self.p["primary"] if tone == "primary" else self.p["paper"]
        start = "#d0d1cd" if disabled else self.p["primaryLight"] if tone == "primary" else self.p["paperLight"]
        ink = "#f5f4ef" if disabled else self.p["onPrimary"] if tone == "primary" else "#a93929" if tone == "danger" else self.p["ink"]
        self.rect(x, y + 6, w, height, "#9c6e38", radius=height / 2)
        self.rect(x, y, w, height, start, fill, self.p["edge"], height / 2, 3)
        self.rect(x + 6, y + 6, w - 12, height - 12, None, stroke="#fff0c5", radius=height / 2 - 6, line=2)
        self.text(text, x + 18, y + 4, w - 36, height - 8, 44, True, ink, "center")

    def sprite(self, index, x, y, size):
        file = ART / "icons.png"
        with Image.open(file) as image:
            w, h = image.size
        self.image(file, x, y, size, size, [(index % 4) * w / 4, (index // 4) * h / 2, w / 4, h / 2], True)

    def item(self, item, x, y, size):
        art = DATA["item_art"].get(item)
        if art:
            sheet = art["sheet"]
            self.image(ART / ("skara-items-v2.png" if sheet == "skara" else "haven-items-v1.png"), x, y, size, size, BOUNDS[sheet][art["index"]], True)
        elif item == "item50":
            self.image(ART / "flour-packet-v1.png", x, y, size, size, json.loads((ART / "flour-packet-v1-bounds.json").read_text()), True)
        else:
            producer, tier = ITEMS[item]
            approved = producer < 4 and tier <= 2
            kind = "approved" if approved else "products"
            index = producer * 2 + tier - 1 if approved else producer * 4 + tier - 1
            self.image(ART / ("products-approved.png" if approved else "products.png"), x, y, size, size, ITEM_BOUNDS[kind][index], True)

    def portrait(self, index, x, y, w, h):
        self.image(ART / "skara-ui-chrome-v1.png", x, y, w, h, [128 + index * 130.5, 400, 98, 68])

    def progress(self, x, y, w, value, total):
        self.rect(x, y, w, 52, "#dfc397", stroke=self.p["edge"], radius=26)
        self.rect(x + 4, y + 4, (w - 8) * value / total, 44, "#83b23e", "#3b851e", radius=22)
        self.text(f"{value} / {total}", x, y, w, 52, 34, True, "#fff7db", "center")

    def hud(self):
        self.image(ART / "level-shield-v11.png", 26, 145, 140, 142, [161,85,930,1050], True)
        self.text(str([12,12,15,24,33][int(self.city[-1])-1]), 26, 145, 140, 128, 65, True, "#fff2bf", "center")
        for index, value, x, width in [(5, "75", 190, 324), (6, "2.480", 530, 324), (7, "24", 870, 310)]:
            self.rect(x, 157, width, 105, "#163749", "#071f2e", "#d8ae58", 46, 4)
            self.sprite(index, x - 4, 156, 103)
            self.text(value, x + 100, 162, width - 152, 92, 51, True, "#fff0c2", "center")
            self.text("+", x + width - 48, 166, 44, 80, 40, False, "#edcb7b", "center")

    def finish(self):
        self.clip = None
        self.tray(42, 2360, 1122, 160)
        for index, label in enumerate(["Tahta", "Koleksiyon", "Şehirler", "Depo", "Market"]):
            x = 60 + index * 220
            active = label == self.tab
            if active:
                self.rect(x, 2371, 212, 137, self.p["navSelectedLight"], self.p["navSelected"], self.p["highlight"], 27, 4)
            self.sprite(index, x + 67, 2372, 78)
            self.text(label, x, 2450, 212, 51, 34, True, self.p["navSelectedInk"] if active else "#fff0cb", "center")
        self.add("system-home-indicator", [402,2572,402,15], fill="#5d503f", radius=8)
        document = dict(id=self.id, width=1206, height=2622, commands=self.commands)
        (OUT / "specs" / (self.id + ".json")).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")


def board(city):
    s = Screen(city, "board")
    s.plaque(CITY_NAMES[int(city[-1]) - 1], 270, 365, 666, 102)
    s.button("Tümü", 48, 367, 198, "secondary", 100)
    s.button("●", 1008, 367, 132, "secondary", 100)
    for i in range(3):
        x = 48 + i * 376
        s.card(x, 486, 358, 132, True)
        if city in ("city1", "city2"):
            ids = GROUPS[0] if city == "city1" else [p["item_id"] for p in DATA["city2_opening_plan"]["producers"][0]["product_unlocks"]]
            s.item((ids[0] if city == "city2" else [GROUPS[0][0], GROUPS[2][0], GROUPS[4][0]][i]), x + 14, 496, 101)
        else:
            reference = ROOT / "assets/concepts/city-refresh-v2" / (CONCEPTS[int(city[-1]) - 1] + "-approval-v1.png")
            col, row = [(0,0),(5,0),(1,1)][i]
            s.image(reference, x + 14, 496, 101, 101, [45 + col * 79, 555 + row * 75, 69, 64], True)
        s.text("Ver ✓", x + 128, 485, 212, 47, 35, True, "#34852b", "center")
        s.text("1/1", x + 24, 577, 100, 32, 26, True)
        s.text("13 altın", x + 132, 532, 200, 37, 30, True)
        s.text("XP 3", x + 132, 574, 200, 36, 29, True, "#178cc4")
    s.tray(48, 632, 1110, 150)
    for i in range(5 if city != "city2" else 4):
        x = 84 + i * 210
        s.rect(x, 644, 192, 125, s.p["heading"], stroke=s.p["edge"], radius=23)
        if city == "city1":
            s.portrait(i, x + 6, 649, 180, 85)
        elif city == "city2":
            s.image(ART / "haven-items-v1.png", x + 40, 645, 112, 100, BOUNDS["haven"][36 + i], True)
        else:
            reference = ROOT / "assets/concepts/city-refresh-v2" / (CONCEPTS[int(city[-1]) - 1] + "-approval-v1.png")
            s.image(reference, x + 6, 648, 180, 82, [49 + i * 94, 447, 78, 50])
        s.text("1 enerji", x + 5, 728, 182, 36, 28, True, "#fff0c2", "center")
    x, y, cell = 111, 824, 164
    s.rect(87, 800, 1032, 1524, s.p["paper"], radius=30)
    for index in range(54):
        s.rect(x + index % 6 * cell, y + index // 6 * cell, cell, cell, s.p["paperLight"], s.p["paper"], "#fff2d7", 10, 2)
    positions = [0, 5, 7, 10, 14, 16, 20, 23, 24, 28, 32, 35, 36, 40, 43, 48, 51, 53]
    if city in ("city1", "city2"):
        ids = [g[t] for g, t in [(GROUPS[0], 0), (GROUPS[1], 0), (GROUPS[0], 1), (GROUPS[4], 0), (GROUPS[2], 0), (GROUPS[3], 0)]] if city == "city1" else [p["item_id"] for g in DATA["city2_opening_plan"]["producers"] for p in g["product_unlocks"][:2]]
        for index, position in enumerate(positions):
            s.item(ids[index % len(ids)], x + position % 6 * cell + 9, y + position // 6 * cell + 9, 146)
    else:
        reference = ROOT / "assets/concepts/city-refresh-v2" / (CONCEPTS[int(city[-1]) - 1] + "-approval-v1.png")
        original = {"city3": [(0,0),(5,0),(1,1),(3,1),(2,2),(4,2),(2,3),(5,3),(0,4),(4,4),(2,5),(5,5),(0,6),(4,6),(1,7),(0,8),(3,8),(5,8)], "city4": [(0,0),(5,0),(1,1),(4,1),(0,2),(3,2),(1,3),(4,3),(0,4),(3,4),(5,4),(0,5),(2,5),(1,6),(4,6),(3,7),(1,8),(5,8)], "city5": [(0,0),(5,0),(2,1),(1,2),(4,2),(0,3),(5,3),(1,4),(3,4),(0,5),(5,5),(2,6),(1,7),(4,7),(0,8),(2,8),(5,8)]}[city]
        for position, (col, row) in zip(positions, original):
            s.image(reference, x + position % 6 * cell + 16, y + position // 6 * cell + 16, 132, 132, [45 + col * 79, 555 + row * 75, 69, 64], True, 8)
    s.frame(87, 800, 1032, 1524, False)
    s.finish()


def city_list(city):
    s = Screen(city, "cities", "Şehirler", "Şehirler")
    for index, title in enumerate(CITY_NAMES):
        y, here = 716 + index * 318, city == f"city{index + 1}"
        s.card(90, y, 1026, 312, here)
        file = ART / f"cities-v1/city{index + 1}-scene.png"
        s.image(file, 105, y + 15, 540, 282, [0, 130, 789, 430], radius=25)
        s.text(title, 670, y + 18, 418, 83, 58, True)
        rule = DATA["city_economy"][index]
        s.text("Mevcut Şehir" if here else "Açık" if index < int(city[-1]) else f"Seviye {rule['level']}" if rule["enabled"] else "Önizleme", 670, y + 100, 415, 48, 36, False, "#34852b" if here else s.p["mutedInk"])
        s.button("✓ Buradasın" if here else "Git" if index < int(city[-1]) else "Kilitli" if rule["enabled"] else "Yakında", 670, y + 166, 414, height=132, disabled=not here and index >= int(city[-1]))
    s.finish()


def secondary(view):
    titles = {"account-registered":"Hesap", "account-guest":"Hesap", "collection":"Koleksiyon", "collection-chain":"Ürün zinciri", "storage":"Depo", "storage-board-full":"Depo", "market":"Market", "energy":"Enerji hediyesi", "producer-cooldown":"Buğday Tarlası", "item":"Eşya", "orders":"Şehir İlanları", "order-guide":"Üretim Rehberi", "achievements":"Belenyaka Başarıları", "achievement":"Başarı", "cloud-choice":"Bulut kaydı", "account-deletion":"Hesabımı sil"}
    tab = "Koleksiyon" if view.startswith("collection") else "Depo" if view.startswith("storage") else "Market" if view == "market" else "Şehirler" if view.startswith("achievement") else "Tahta"
    s = Screen("city1", view, titles[view], tab)
    if view in ("account-registered", "account-guest"):
        registered = view.endswith("registered")
        s.card(90, 730, 1026, 260)
        s.image(ART / "shared-profile-v1.png", 115, 750, 210, 210, fit=True)
        s.text("Gezgin" if registered else "Hesapsız oynuyorsun", 355, 750, 716, 100, 57, True)
        s.text("Seviye 12 · Belenyaka" if registered else "İlerlemen bu cihazda korunur.", 355, 857, 716, 105, 39)
        s.card(90, 1020, 1026, 277, registered)
        s.text("İlerlemen buluta kaydedildi" if registered else "İlerlemeni buluta kaydet", 126, 1038, 950, 84, 47, True, "#34852b" if registered else None)
        s.text("Son eşitleme: Az önce" if registered else "Hesabını bağlayarak farklı cihazlarda da devam et.", 126, 1123, 950, 98, 37)
        if registered:
            s.button("Şimdi eşitle", 340, 1215, 530, "secondary", 72)
            start = 1330
        else:
            s.rect(90, 1330, 1026, 144, "#111111", stroke="#333333", radius=24)
            s.commands[-1]["previewOnly"] = True
            s.text("  Apple ile devam et", 150, 1330, 906, 144, 47, True, "#ffffff", "center", "HelveticaNeue-Medium")
            s.commands[-1]["previewOnly"] = True
            s.add("native-apple", [90,1330,1026,144])
            s.rect(90, 1500, 1026, 144, "#ffffff", stroke="#747775", radius=24)
            s.image(ROOT / "mobile/assets/brand/google-g.png", 125, 1540, 66, 66, fit=True)
            s.text("Google ile devam et", 210, 1500, 840, 144, 47, False, "#1f1f1f", "center", "HelveticaNeue-Medium")
            s.button("Giriş yapmadan devam et", 90, 1674, 1026, "secondary")
            start = 1840
        s.card(90, start, 1026, 560)
        s.text("Ayarlar", 126, start + 15, 950, 80, 54, True)
        for n, (label, checked) in enumerate([("Ses", True), ("Hareketi azalt", False)]):
            y = start + 110 + n * 130
            s.text(label, 140, y, 770, 105, 44)
            s.rect(970, y + 15, 72, 72, s.p["paperLight"], stroke=s.p["edge"], radius=10)
            if checked:s.text("✓", 965, y + 10, 84, 84, 61, True, "#34852b", "center")
        s.button("✓ Türkçe", 360, start + 385, 330, height=100)
        s.button("English", 720, start + 385, 330, "secondary", 100)
        if registered:
            s.button("Hesaptan çık", 90, start + 600, 1026, "secondary")
            s.button("Hesabımı sil", 90, start + 760, 1026, "danger")
    elif view == "collection":
        s.card(90, 730, 1026, 230)
        s.text("Belenyaka", 126, 745, 940, 80, 62, True)
        s.text("18 / 46 keşif", 126, 825, 940, 55, 38, False, "#34852b")
        s.progress(126, 888, 940, 18, 46)
        y = 990
        for index, group in enumerate(GROUPS):
            rows = (len(group) + 3) // 4
            s.card(90, y, 1026, 122 + rows * 244)
            s.portrait(index, 112, y + 21, 132, 88)
            s.text(NAMES[PLANS[index]["producer_id"] + "_name_tr"] + f" · {KNOWN_COUNTS[index]}/{len(group)}", 268, y + 15, 795, 92, 42, True)
            for i, item in enumerate(group):
                x, yy = 114 + i % 4 * 244, y + 120 + i // 4 * 244
                s.card(x, yy, 232, 232)
                if item in KNOWN:
                    s.item(item, x + 16, yy + 10, 194)
                    s.text("✓", x + 170, yy + 168, 50, 52, 35, True, "#34852b", "center")
                else:s.text("?", x, yy, 232, 232, 111, True, s.p["mutedInk"], "center")
            y += 146 + rows * 244
    elif view.startswith("storage"):
        s.text("Belenyaka · 8 / 12 alan", 90, 730, 1026, 90, 56, True, align="center")
        s.progress(126, 840, 954, 8, 12)
        for i in range(12):
            x, y = 114 + i % 4 * 244, 930 + i // 4 * 244
            s.card(x, y, 232, 232, i == 1)
            if i < 8:s.item(STORAGE[i], x + 20, y + 20, 192)
        s.text("Eşyayı tahtaya geri almak için seç.", 114, 1680, 990, 85, 38, align="center")
        s.card(90, 1780, 1026, 280, True)
        s.item(GROUPS[0][1], 120, 1805, 170)
        s.text("Buğday demeti", 320, 1800, 740, 93, 50, True)
        full = view.endswith("full")
        s.button("Tahtada boş alan yok" if full else "Tahtaya geri al", 320, 1910, 750, height=132, disabled=full)
        s.text("Depoyu genişlet", 90, 2080, 1026, 75, 48, True, align="center")
        s.button("+4 alan · 100 altın", 90, 2170, 495, "secondary", 132)
        s.button("+4 alan · 5 elmas", 615, 2170, 495, "secondary", 132)
    elif view == "market":
        s.text("Gezginin Kesesi", 90, 740, 1026, 108, 66, True, align="center")
        s.text("2.480 altın       24 elmas", 90, 860, 1026, 85, 44, True, align="center")
        for y, label, price, icon in [(990, "25 enerji", "3 elmas · Al", 5), (1410, "500 altın", "5 elmas · Al", 6)]:
            s.card(90, y, 1026, 380)
            s.sprite(icon, 125, y + 65, 250)
            s.text(label, 410, y + 45, 660, 120, 68, True)
            s.button(price, 410, y + 210, 660)
        s.text("Gerçek para satışı bu sürümde kapalı.", 114, 1850, 990, 120, 38, align="center")
        s.button("Enerji hediyesi", 90, 2030, 1026, "secondary")
    elif view == "energy":
        s.sprite(5, 372, 760, 462)
        s.text("+25 enerji", 90, 1250, 1026, 156, 100, True, align="center")
        s.text("İsteğe bağlı reklamı tamamla.", 110, 1430, 986, 90, 43, align="center")
        s.card(250, 1570, 706, 132)
        s.text("Günlük hediyeler: 2/4", 250, 1570, 706, 132, 39, True, align="center")
        s.button("Reklamı izle · +25 enerji", 90, 1770, 1026)
        s.button("Vazgeç", 240, 1940, 726, "secondary")
        s.text("Reklam tamamlanmadan ödül verilmez.", 110, 2160, 986, 110, 37, align="center")
    elif view in ("collection-chain", "producer-cooldown", "item", "order-guide"):
        if view == "item":
            s.item(GROUPS[0][1], 350, 740, 506)
            s.text("Buğday demeti", 90, 1280, 1026, 115, 70, True, align="center")
            s.text("Basamak 2 · Buğday Tarlası", 90, 1410, 1026, 90, 42, align="center")
            s.text("Bu ürünü ilanlarda teslim edebilir veya depoya kaldırabilirsin.", 130, 1530, 946, 150, 43, align="center")
            s.button("Depoya gönder", 90, 1740, 1026)
            s.button("Üreticiyi gör", 90, 1910, 1026, "secondary")
        elif view == "order-guide":
            s.card(90, 730, 1026, 250, True)
            s.item(GROUPS[0][1], 120, 760, 195)
            s.text("Hedef ürün", 350, 750, 700, 78, 39)
            s.text("Buğday demeti", 350, 835, 700, 103, 59, True)
            s.portrait(0, 90, 1020, 440, 270)
            s.text("Buğday Tarlası", 570, 1030, 510, 120, 48, True)
            s.text("Dokunarak ilk ürünü çıkar.", 570, 1165, 510, 130, 39)
            s.card(90, 1360, 1026, 370)
            s.item(GROUPS[0][0], 135, 1430, 230)
            s.text("+", 380, 1470, 105, 120, 66, True, align="center")
            s.item(GROUPS[0][0], 490, 1430, 230)
            s.text("=", 728, 1470, 105, 120, 66, True, align="center")
            s.item(GROUPS[0][1], 850, 1430, 230)
            s.text("Yalnız iki aynı ürün birleşir.", 90, 1810, 1026, 110, 43, align="center")
            s.button("Tahtaya dön", 90, 2040, 1026)
        else:
            s.image(ART / "skara-field-hero-v2.png", 110, 730, 986, 360, fit=True)
            y = 1120
            if view == "producer-cooldown":
                s.card(90, y, 1026, 550)
                s.text("Üretici hazırlanıyor", 120, y + 15, 966, 90, 54, True, align="center")
                s.text("02:14", 120, y + 105, 966, 110, 70, True, align="center")
                s.button("Şimdi hazırla · 3 elmas", 120, y + 230, 966, height=132)
                s.button("Reklamla hazırla", 120, y + 390, 966, "secondary", 132)
                y += 580
            for i, item in enumerate(GROUPS[0]):
                x, yy = 114 + i % 4 * 244, y + i // 4 * 244
                s.card(x, yy, 232, 232, i == 0)
                if i < 4:s.item(item, x + 15, yy + 15, 202)
                else:s.text("?", x, yy, 232, 232, 111, True, s.p["mutedInk"], "center")
            if view == "collection-chain":
                s.text("Buğday başağı", 90, y + 520, 1026, 100, 62, True, align="center")
                s.text("Basamak 1 · Keşfedildi", 90, y + 625, 1026, 90, 42, align="center")
                s.text("İki aynı ürünü birleştirerek zincirde ilerle.", 120, y + 745, 966, 160, 44, align="center")
                s.button("Üreticiyi gör", 220, y + 950, 766, "secondary")
    elif view == "orders":
        for index, (title, requirements, gold, xp, ready) in enumerate([("Günün hasadı", [(GROUPS[0][1],2,2),(GROUPS[2][0],1,1)],32,8,True), ("Fırın siparişi",[(GROUPS[1][1],1,2),(GROUPS[2][3],0,1)],45,9,False), ("Köyün ihtiyaçları",[(GROUPS[3][0],0,2),(GROUPS[4][0],1,1)],26,6,False)]):
            y = 730 + index * 600
            s.card(90, y, 1026, 570, ready)
            s.text(title, 125, y + 20, 950, 90, 57, True)
            for i, (item, count, required) in enumerate(requirements):
                x = 220 + i * 440
                s.item(item, x, y + 115, 170)
                s.text(f"{count}/{required}", x, y + 292, 170, 60, 40, True, "#34852b" if count >= required else "#a93929", "center")
            s.text(f"{gold} altın  ·  XP {xp}", 120, y + 352, 956, 58, 39, True, align="center")
            s.button("✓ Ver" if ready else "Nasıl elde edilir?", 120, y + 410, 966, "primary" if ready else "secondary", 132)
    elif view in ("achievements", "achievement"):
        if view == "achievements":
            for index, (label, progress, total, state) in enumerate([("İlk Işık",1,1,"✓ Alındı"),("İki Tezgâh",2,2,"✓ Alındı"),("Tarla Kâşifi",4,4,"Ödül hazır"),("Gezginin Kesesi",10,10,"✓ Alındı")]):
                y = 730 + index * 390
                s.card(90, y, 1026, 360, index == 2)
                s.sprite(6, 115, y + 70, 210)
                s.text(label, 360, y + 30, 710, 98, 56, True)
                s.progress(365, y + 155, 700, progress, total)
                s.text(state, 360, y + 230, 710, 90, 42, True, "#34852b" if index != 1 else None)
        else:
            s.sprite(6, 375, 760, 456)
            s.text("Tarla Kâşifi", 90, 1245, 1026, 135, 80, True, align="center")
            s.text("Buğday Tarlası'nın 4 ürününü keşfet.", 130, 1400, 946, 150, 45, align="center")
            s.progress(126, 1580, 954, 4, 4)
            s.card(90, 1690, 1026, 300)
            s.text("Ödül", 126, 1700, 954, 80, 52, True, align="center")
            s.text("Tarla Kâşifi unvanı\n+50 altın", 126, 1790, 954, 170, 49, True, align="center")
            s.button("Ödülü al", 90, 2060, 1026)
    elif view == "cloud-choice":
        s.text("Hangi kayıtla devam etmek istiyorsun?", 120, 735, 966, 160, 58, True, align="center")
        s.text("Kaynaklar birleştirilmez.", 120, 910, 966, 80, 41, align="center")
        for index, (label, level, gold, gems) in enumerate([("Bu cihaz",12,2480,24),("Bulut",10,1920,18)]):
            y = 1030 + index * 380
            s.card(90, y, 1026, 340, index == 0)
            s.image(ART / "cities-v1/city1-scene.png", 110, y + 20, 370, 300, [0,130,789,430], radius=25)
            s.text(label, 520, y + 20, 545, 100, 58, True)
            s.text(f"Seviye {level}\n{gold:,} altın\n{gems} elmas".replace(",", "."), 520, y + 135, 545, 180, 43)
        s.text("Bu cihazdaki ilerleme buluta kaydedilecek.", 120, 1830, 966, 150, 42, align="center")
        s.button("Seçimimi onayla", 90, 2030, 1026)
        s.button("Vazgeç", 250, 2190, 706, "secondary", 96)
    elif view == "account-deletion":
        s.text("Hesabımı sil", 90, 750, 1026, 130, 76, True, "#a93929", "center")
        s.card(90, 950, 1026, 370, danger=True)
        s.text("Bulut hesabın ve bu cihazdaki ilerlemen silinecek.\nBu işlem geri alınamaz.", 140, 980, 926, 300, 56, True, "#a93929", "center")
        s.card(90, 1380, 1026, 260)
        s.rect(120, 1450, 75, 75, s.p["paperLight"], stroke=s.p["edge"], radius=10)
        s.text("Hesabımı ve ilerlememi kalıcı olarak silmeyi onaylıyorum.", 235, 1400, 830, 220, 45)
        s.button("Apple ile yeniden doğrula", 90, 1720, 1026, disabled=True)
        s.button("Kalıcı olarak sil", 90, 1910, 1026, disabled=True)
        s.button("Vazgeç", 90, 2140, 1026, "secondary")
    s.finish()


def main():
    (OUT / "specs").mkdir(parents=True, exist_ok=True)
    for city in PALETTES:
        board(city)
        city_list(city)
    for view in ["account-registered", "account-guest", "collection", "collection-chain", "storage", "storage-board-full", "market", "energy", "producer-cooldown", "item", "orders", "order-guide", "achievements", "achievement", "cloud-choice", "account-deletion"]:
        secondary(view)
    inputs = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(ALL_ASSETS)}
    (OUT / "source-assets.json").write_text(json.dumps(inputs, indent=2) + "\n")
    fixture = dict(level=12, xp=5500, gold=2480, gems=24, energy=75, discovered_item_ids=KNOWN, storage_item_ids=STORAGE, storage_capacity=12, ad_daily_used=2, ad_daily_limit=4, real_money_enabled=False, gender_fields=[], account_art="shared-back-to-back-pair", owned_producer_ids=[p["producer_id"] for p in PLANS], state_overrides={"storage-board-full":{"board_count":54},"producer-cooldown":{"ready_in_seconds":134},"cloud-choice":{"remote_level":10,"remote_gold":1920,"remote_gems":18},"account-deletion":{"consent":False,"reauthenticated":False}}, future_cities="concept-only; not an engine save")
    (OUT / "fixtures.json").write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + "\n")
    print("26 independent design scene graphs; no app screenshots read")


if __name__ == "__main__":
    main()
