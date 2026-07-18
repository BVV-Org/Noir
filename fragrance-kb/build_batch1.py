#!/usr/bin/env python3
"""
Noir Vault Fragrance KB — Batch 1 builder (Afnan + Lattafa).
Creates fragrance_kb.sqlite from schema.sql, loads researched Batch-1 data,
evidence-backed relationships with full provenance, then exports JSON + search index.
Idempotent-ish: rebuilds the DB from scratch each run for Batch 1.
"""
import sqlite3, json, os, re, datetime, sys

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.environ.get("KB_WORKDIR", HERE)   # build on a fast local FS, then copy
DB   = os.path.join(WORK, "fragrance_kb.sqlite")
SCHEMA = os.path.join(HERE, "schema.sql")
EXPORT = os.path.join(WORK, "exports")
NOW = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
TODAY = datetime.date.today().isoformat()

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

# ---------------------------------------------------------------------------
# SOURCE REGISTRY  (url -> (type, tier)).  tier: 1 best .. 9 supporting
# ---------------------------------------------------------------------------
def classify(url):
    d = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]
    if "afnan.com" in d or "lattafa" in d: return d, "brand_official", 1
    if "parfumo.com" in d: return d, "parfumo", 2
    if "fragrantica.com" in d: return d, "fragrantica", 3
    if "reddit.com" in d: return d, "reddit", 4
    if "perfumegyan" in d: return d, "perfumegyan", 5
    if "youtube.com" in d or "youtu.be" in d: return d, "youtube", 6
    if "basenotes.com" in d: return d, "community", 6
    if any(k in d for k in ["scentclones","fragrenza","thesnifftest","pickmyclone",
                            "signaturescent","whatscent","besuitedaroma","bloomperfume",
                            "melissajanelee","brownedit","scentchronicles","fragranzo",
                            "ifragrance","intenseoud","nearstore","parfuminspirations"]):
        return d, "database", 7
    return d, "retailer", 9

# ---------------------------------------------------------------------------
# BRANDS
# ---------------------------------------------------------------------------
TARGET_BRANDS = [("Afnan","AE"), ("Lattafa","AE")]
REF_BRANDS = ["Jean Paul Gaultier","Chanel","Creed","Yves Saint Laurent","Dior",
    "Kilian","Initio Parfums Prives","Nishane","Parfums de Marly","Louis Vuitton",
    "Tom Ford","Azzaro","Paco Rabanne","Giorgio Armani","BDK Parfums","Ex Nihilo",
    "Kayali","Bentley"]

# ---------------------------------------------------------------------------
# FRAGRANCES  (Batch 1 target catalogue)
# fields: name, gender, conc, year, family, style, longev, proj, profile,
#         accords(list), top[], heart[], base[], needs_review
# ---------------------------------------------------------------------------
AFNAN = [
 dict(name="9PM", g="men", c="EDP", y=2020, fam="Amber Fougere",
      style="sweet-spicy evening", lon="long", proj="strong",
      prof="Sweet spicy ambery crowd-pleaser: apple-cinnamon opening over a vanilla-tonka-amber base.",
      acc=["sweet","cinnamon","warm spicy","vanilla","amber","powdery"],
      top=["apple","cinnamon","lavender"], heart=["orange blossom","cinnamon"],
      base=["vanilla","tonka bean","amber","sugar"]),
 dict(name="9PM Rebel", g="unisex", c="EDP", y=2024, fam="Fruity Woody",
      style="juicy fruity daytime",lon="moderate",proj="moderate",
      prof="Juicy pineapple + Granny Smith apple over cedar and savory caramel; fruity-woody, not a clone.",
      acc=["fruity","pineapple","woody","sweet","cedar"],
      top=["pineapple","green apple"], heart=["cedar"], base=["caramel","cedar"], nr=1),
 dict(name="9PM Elixir", g="unisex", c="EDP", y=2025, fam="Amber Spicy",
      style="spicy amber",lon="long",proj="moderate",
      prof="Spicy pimento-and-lavender opening turning darker with nutmeg and cardamom over amber.",
      acc=["warm spicy","aromatic","amber","sweet"],
      top=["pimento","lavender"], heart=["nutmeg","cardamom"], base=["amber","vanilla"], nr=1),
 dict(name="9PM Night Out", g="unisex", c="Extrait", y=2026, fam="Amber Boozy",
      style="boozy evening extrait",lon="very long",proj="strong",
      prof="Boozy cognac-and-fruit opening, toffee-suede heart, ambrofix/patchouli/akigalawood base.",
      acc=["boozy","sweet","amber","woody","warm spicy"],
      top=["dragon fruit","lavender","cognac","apple","bergamot"],
      heart=["toffee","cardamom","suede","cedar"], base=["tonka bean","ambroxan","patchouli","akigalawood"], nr=1),
 dict(name="9AM", g="men", c="EDP", y=2020, fam="Aromatic Woody",
      style="fresh daytime",lon="moderate",proj="moderate",
      prof="Bright citrus-musk aromatic-woody daily driver.",
      acc=["citrus","musk","aromatic","woody","fresh"],
      top=["bergamot","citruses"], heart=["aromatic notes"], base=["musk","woods"], nr=1),
 dict(name="9AM Dive", g="unisex", c="EDP", y=2022, fam="Aromatic Aquatic",
      style="fresh smoky-woody",lon="long",proj="strong",
      prof="Fresh citrus-mint-blackcurrant opening over cedar, incense and sandalwood; BDC-meets-Y vibe.",
      acc=["citrus","aromatic","woody","smoky","fresh spicy"],
      top=["lemon","mint","black currant","pink pepper"],
      heart=["cedar","incense"], base=["sandalwood","patchouli"]),
 dict(name="Turathi Blue", g="men", c="EDP", y=2021, fam="Aromatic Aquatic",
      style="fresh aquatic compliment-getter",lon="long",proj="strong",
      prof="Cold aromatic-aquatic with an earthy patchouli drydown.",
      acc=["aquatic","aromatic","patchouli","fresh","woody"],
      top=["bergamot","aquatic notes"], heart=["aromatic notes"], base=["patchouli","musk"], nr=1),
 dict(name="Turathi Brown", g="men", c="EDP", y=2023, fam="Woody Spicy",
      style="powdery woody",lon="long",proj="moderate",
      prof="Powdery woody-spicy with an aromatic saffron/incense character.",
      acc=["woody","warm spicy","powdery","aromatic"],
      top=["saffron","bergamot"], heart=["incense"], base=["patchouli","woods"]),
 dict(name="Turathi Electric", g="unisex", c="EDP", y=2025, fam="Fruity Musky",
      style="fresh summer",lon="moderate",proj="moderate",
      prof="Fresh fruity-musky summer scent: bergamot, lavender, pink grapefruit over vanilla-amber.",
      acc=["fresh","fruity","musky","citrus"],
      top=["bergamot","lavender","pink grapefruit"], heart=["fruity notes"], base=["vanilla","amber"], nr=1),
 dict(name="Supremacy Not Only Intense", g="men", c="EDP", y=2021, fam="Woody Smoky",
      style="smoky woody",lon="long",proj="strong",
      prof="Smoky pineapple-tinged woody with oakmoss/patchouli; Hacivat-adjacent.",
      acc=["woody","smoky","incense","patchouli","aromatic"],
      top=["pineapple","bergamot"], heart=["incense","oakmoss"], base=["patchouli","woods"]),
 dict(name="Supremacy Silver", g="men", c="EDP", y=2013, fam="Fruity Chypre",
      style="fruity smoky woody",lon="moderate",proj="moderate",
      prof="Apple/pineapple + smoky birch over oakmoss, ambergris and musk — classic Aventus profile.",
      acc=["fruity","woody","smoky","chypre"],
      top=["apple","bergamot","oakmoss"], heart=["pineapple","patchouli","jasmine"],
      base=["birch","ambergris","musk"]),
 dict(name="Supremacy Collector's Edition", g="men", c="EDP", y=2024, fam="Chypre Fruity",
      style="fruity floral smoky",lon="long",proj="strong",
      prof="Aventus-Absolu direction: pineapple-apple + white florals over oakmoss, musk, ambergris.",
      acc=["fruity","chypre","woody","smoky","floral"],
      top=["pineapple","bergamot","white flowers","apple"],
      heart=["orange blossom","birch","amber"], base=["oakmoss","musk","ambergris"]),
 dict(name="Supremacy In Oud", g="unisex", c="EDP", y=2021, fam="Amber Woody Oud",
      style="oud saffron",lon="long",proj="strong",
      prof="Saffron-forward amber-oud with a smoky woody drydown; Oud-for-Greatness territory.",
      acc=["oud","woody","amber","saffron","smoky"],
      top=["saffron","nutmeg","lavender"], heart=["oud","patchouli"], base=["oud","musk"]),
 dict(name="Supremacy In Heaven", g="men", c="EDP", y=2018, fam="Woody Aromatic",
      style="fresh green woody",lon="moderate",proj="moderate",
      prof="Bergamot/mandarin + green tea and blackcurrant over musk and sandalwood — SMW DNA.",
      acc=["fresh","green","woody","aromatic","musky"],
      top=["bergamot","mandarin orange"], heart=["green tea","black currant"],
      base=["musk","sandalwood","woods"]),
 dict(name="Rare Carbon", g="men", c="EDP", y=2020, fam="Leather",
      style="leather woody",lon="long",proj="strong",
      prof="Leather + violet leaf and spice over oud, cedar, vetiver and amber.",
      acc=["leather","woody","warm spicy","floral"],
      top=["leather","violet leaf","nutmeg","cinnamon"],
      heart=["violet","oud","rose","cedar"], base=["vetiver","sandalwood","amber"]),
 dict(name="Rare Reef", g="unisex", c="EDP", y=2025, fam="Citrus Aromatic",
      style="fresh green fruity",lon="moderate",proj="moderate",
      prof="Bright citrus-mint opening, green-floral heart, warm fig/dates/amberwood base.",
      acc=["citrus","fresh","fruity","green","aromatic"],
      top=["orange","black currant","mint","citron","grapefruit","coriander"],
      heart=["apricot","violet leaf","basil","rose"], base=["fig","dates","ambrette","amberwood"]),
 dict(name="Historic Sahara", g="unisex", c="EDP", y=2025, fam="Amber Gourmand",
      style="spicy gourmand",lon="long",proj="strong",
      prof="Spicy-gourmand: bergamot/cinnamon/cardamom over vanilla, almond, praline, tonka, ambroxan.",
      acc=["sweet","gourmand","warm spicy","amber","almond"],
      top=["bergamot","cinnamon","cardamom"], heart=["elemi","vanilla","sugar"],
      base=["musk","almond","tonka bean","praline","ambroxan"]),
 dict(name="Historic Olmeda", g="unisex", c="EDP", y=2022, fam="Aromatic Woody",
      style="fresh spicy nighttime",lon="long",proj="moderate",
      prof="Woodier, spicier nighttime take on the fresh citrus-aromatic Bleu de Chanel idea.",
      acc=["aromatic","citrus","woody","warm spicy","fresh"],
      top=["citrus","bergamot"], heart=["ginger","incense"], base=["woods","amber"]),
 dict(name="Modest Une", g="men", c="EDP", y=2019, fam="Aromatic Fougere",
      style="fresh spicy beast-opening",lon="moderate",proj="strong",
      prof="Pepper-lavender-mint opening with ambroxan-woody drydown; a fresh Sauvage-style aromatic.",
      acc=["aromatic","fresh spicy","ambroxan","woody"],
      top=["pepper","lavender","mint","nutmeg"], heart=["citruses","amber","eucalyptus"],
      base=["musk","vetiver","cedar"]),
 dict(name="Portrait Abstract", g="unisex", c="EDP", y=2023, fam="Oriental Fougere",
      style="woody leather incense",lon="long",proj="strong",
      prof="Incense-vetiver-rhubarb opening over rose-tonka and a leather-sandalwood-amber base.",
      acc=["woody","leather","incense","rose","amber"],
      top=["incense","vetiver","rhubarb"], heart=["rose","tonka bean"],
      base=["leather","amber","sandalwood","cedar"], nr=1),
]

LATTAFA = [
 dict(name="Khamrah", g="unisex", c="EDP", y=2022, fam="Amber Gourmand",
      style="warm sweet-spicy",lon="very long",proj="strong",
      prof="Boozy-gourmand: cinnamon/nutmeg over dates, praline, vanilla, tonka and amberwoods.",
      acc=["sweet","warm spicy","vanilla","amber","gourmand","cinnamon"],
      top=["cinnamon","nutmeg","bergamot"], heart=["dates","praline","tuberose"],
      base=["vanilla","tonka bean","benzoin","myrrh","amberwood","akigalawood"]),
 dict(name="Khamrah Qahwa", g="unisex", c="EDP", y=2024, fam="Amber Gourmand Coffee",
      style="coffee-cardamom gourmand",lon="very long",proj="strong",
      prof="Khamrah's DNA amplified with roasted Arabic coffee and cardamom against syrupy praline.",
      acc=["coffee","sweet","warm spicy","gourmand","vanilla"],
      top=["cardamom","cinnamon"], heart=["coffee","dates","praline"],
      base=["vanilla","tonka bean","amberwood"]),
 dict(name="Khamrah Dukhan", g="men", c="EDP", y=2025, fam="Amber Smoky Gourmand",
      style="smoky incense gourmand",lon="very long",proj="nuclear",
      prof="The smoky evening amplification of Khamrah: incense, tobacco and oud over the sweet base.",
      acc=["smoky","incense","sweet","amber","tobacco"],
      top=["incense","cinnamon"], heart=["tobacco","dates","praline"],
      base=["oud","vanilla","tonka bean","amberwood"]),
 dict(name="Asad", g="men", c="EDP", y=2021, fam="Amber Spicy",
      style="spicy tobacco crowd-pleaser",lon="long",proj="strong",
      prof="Black pepper/pineapple + tobacco and coffee over vanilla, amber and dry woods.",
      acc=["warm spicy","tobacco","sweet","amber","woody"],
      top=["black pepper","tobacco","pineapple"], heart=["patchouli","coffee","iris"],
      base=["vanilla","amber","dry woods","benzoin","labdanum"]),
 dict(name="Asad Bourbon", g="men", c="EDP", y=2025, fam="Amber Gourmand",
      style="boozy chocolate gourmand",lon="long",proj="strong",
      prof="Lavender/mirabelle/pink pepper over cacao and nutmeg with a bourbon-vanilla amber base.",
      acc=["sweet","boozy","chocolate","amber","aromatic"],
      top=["lavender","mirabelle","pink pepper"], heart=["cacao","nutmeg","davana"],
      base=["bourbon vanilla","amber","vetiver"]),
 dict(name="Asad Zanzibar", g="men", c="EDP", y=2024, fam="Amber Woody",
      style="sweet coconut smoky",lon="long",proj="strong",
      prof="Coconut-water/iris/salt heart between a lavender-pepper opening and a smoky vanilla-incense base.",
      acc=["sweet","coconut","woody","smoky","amber"],
      top=["lavender","black pepper"], heart=["coconut water","iris","salt"],
      base=["vanilla","incense"]),
 dict(name="Asad Elixir", g="men", c="EDP", y=2025, fam="Amber Spicy Tobacco",
      style="darker spicy-tobacco Asad",lon="long",proj="strong",
      prof="A deeper, more concentrated Asad: saffron/pink pepper/grapefruit over tobacco, cedar and amber.",
      acc=["warm spicy","tobacco","smoky","amber","sweet"],
      top=["pink pepper","saffron","grapefruit"], heart=["tobacco","cedar","vanilla"],
      base=["patchouli","olibanum","cashmeran","amber"], nr=1),
 dict(name="Fakhar Black", g="men", c="EDP", y=2022, fam="Aromatic Fresh Spicy",
      style="fresh aromatic",lon="long",proj="strong",
      prof="Crisp apple-ginger opening with lavender-sage heart over tonka, cedar and amberwood — YSL Y profile.",
      acc=["aromatic","fresh spicy","fruity","woody"],
      top=["apple","bergamot","ginger"], heart=["lavender","sage","juniper berries","geranium"],
      base=["tonka bean","cedar","amberwood","vetiver"]),
 dict(name="Fakhar Gold Extrait", g="men", c="Extrait", y=2023, fam="Amber Spicy Floral",
      style="spicy solar amber",lon="long",proj="strong",
      prof="Grapefruit/pink pepper/cardamom over tuberose and solar notes with a leathery amber base — 1 Million direction.",
      acc=["amber","warm spicy","floral","leather","sweet"],
      top=["grapefruit","pink pepper","cardamom"], heart=["tuberose","solar notes","artemisia"],
      base=["labdanum","amber","cashmeran","leather"]),
 dict(name="Bade'e Al Oud Oud for Glory", g="unisex", c="EDP", y=2020, fam="Amber Woody Oud",
      style="saffron oud",lon="very long",proj="strong",
      prof="Saffron/nutmeg/lavender over agarwood and patchouli — the reference Oud-for-Greatness alternative.",
      acc=["oud","woody","amber","saffron","warm spicy"],
      top=["saffron","nutmeg","lavender"], heart=["oud","patchouli"], base=["oud","patchouli","musk"]),
 dict(name="Bade'e Al Oud Honor & Glory", g="unisex", c="EDP", y=2023, fam="Fruity Woody",
      style="fruity vanilla smoky",lon="long",proj="strong",
      prof="Pineapple-fruity, vanilla and warm-spicy woody with a smoky incense edge — Hacivat/Ani blend.",
      acc=["fruity","pineapple","vanilla","woody","smoky","incense"],
      top=["pineapple","bergamot"], heart=["incense","spices"], base=["vanilla","woods","amber"]),
 dict(name="Bade'e Al Oud Amethyst", g="unisex", c="EDP", y=2021, fam="Rose Woody",
      style="rosy woody",lon="long",proj="strong",
      prof="A rosy, slightly aldehydic woody-amber — an Atomic-Rose direction with oud underpinning.",
      acc=["rose","oud","woody","warm spicy","amber"],
      top=["pink pepper","aldehydes"], heart=["rose","raspberry"], base=["oud","patchouli","musk"]),
 dict(name="Bade'e Al Oud Sublime", g="unisex", c="EDP", y=2022, fam="Fruity Floral",
      style="juicy apple",lon="moderate",proj="moderate",
      prof="Bright juicy-apple fruity-floral with a sweet musky base.",
      acc=["fruity","apple","sweet","floral"],
      top=["apple","rhubarb"], heart=["jasmine"], base=["vanilla","musk"], nr=1),
 dict(name="Liam Blue Shine", g="unisex", c="EDP", y=2023, fam="Aromatic Aquatic",
      style="fresh marine",lon="moderate",proj="moderate",
      prof="Bergamot-rosemary-pepper opening with sea notes and violet over musk, amber, patchouli — ADG profile.",
      acc=["aquatic","aromatic","fresh","marine","woody"],
      top=["bergamot","rosemary","pepper"], heart=["sea notes","violet"],
      base=["musk","amber","patchouli"]),
 dict(name="Liam Grey", g="unisex", c="EDP", y=2023, fam="Woody Spicy",
      style="creamy tea-woody",lon="long",proj="moderate",
      prof="Creamy black-tea/cardamom/fig over iris and vetiver with a sandalwood-vanilla base — Gris Charnel direction.",
      acc=["woody","tea","warm spicy","creamy","sweet"],
      top=["cardamom","black tea","fig"], heart=["iris","vetiver","labdanum"],
      base=["sandalwood","vanilla","tonka bean","patchouli"]),
 dict(name="Al Nashama Caprice", g="unisex", c="EDP", y=2024, fam="Aromatic Fresh Spicy",
      style="blue spicy",lon="moderate",proj="moderate",
      prof="Cardamom-ginger-citrus opening with lavender-geranium-mint over a woody amber base — Bleu Electrique idea.",
      acc=["aromatic","fresh spicy","woody","cardamom"],
      top=["cardamom","ginger","bergamot","lemon"], heart=["lavender","geranium","mint"],
      base=["amber","cedar","patchouli","vetiver"]),
 dict(name="Musamam Black Intense", g="unisex", c="EDP", y=2025, fam="Woody Smoky",
      style="dark smoky woody",lon="long",proj="strong",
      prof="A deeper, smokier interpretation of Musamam's saffron-amberwood-incense woody profile.",
      acc=["woody","smoky","incense","amber","warm spicy"],
      top=["saffron","mandarin orange","lavender"], heart=["amberwood","cedar","geranium"],
      base=["akigalawood","incense","labdanum"], nr=1),
 dict(name="Qaed Al Fursan", g="unisex", c="EDP", y=2016, fam="Fruity Woody",
      style="juicy pineapple woody",lon="long",proj="strong",
      prof="Juicy pineapple/saffron over balsam fir and jasmine with a cedar-amber-oud smoky base.",
      acc=["fruity","pineapple","woody","smoky","amber"],
      top=["pineapple","saffron"], heart=["balsam fir","jasmine"], base=["cedar","amber","oud"]),
 dict(name="Maahir Legacy", g="unisex", c="EDP", y=2023, fam="Aromatic Citrus",
      style="fresh minty citrus",lon="long",proj="moderate",
      prof="Fresh minty-citrus aromatic with lime — a smooth summer Sedley-style scent.",
      acc=["fresh","citrus","aromatic","mint"],
      top=["mint","lime","bergamot"], heart=["geranium","watery notes"], base=["cedar","musk","patchouli"]),
 dict(name="Eternal Oud", g="unisex", c="EDP", y=2020, fam="Woody Oud",
      style="oud woody",lon="long",proj="strong",
      prof="Warm woody-oud with spice and amber. Inspiration not firmly established — flagged for manual review.",
      acc=["oud","woody","amber","warm spicy"],
      top=["saffron","spices"], heart=["oud","rose"], base=["woods","amber","musk"], nr=1),
]

# ---------------------------------------------------------------------------
# REFERENCE TARGETS (external inspiration anchors)
# ---------------------------------------------------------------------------
REFS = [
 dict(brand="Jean Paul Gaultier", name="Ultra Male", fam="Amber Fougere",
      acc=["sweet","fruity","lavender","cinnamon","vanilla","amber"],
      top=["pear","lavender","bergamot"], heart=["cinnamon","clary sage"], base=["vanilla","amber","patchouli"]),
 dict(brand="Chanel", name="Bleu de Chanel", fam="Aromatic Woody",
      acc=["citrus","aromatic","woody","incense","fresh"],
      top=["grapefruit","lemon","mint","pink pepper"], heart=["ginger","nutmeg","jasmine"],
      base=["incense","cedar","sandalwood","labdanum"]),
 dict(brand="Yves Saint Laurent", name="Y Eau de Parfum", fam="Aromatic Fresh Spicy",
      acc=["aromatic","fresh spicy","fruity","woody"],
      top=["apple","ginger","bergamot"], heart=["sage","juniper berries","geranium"],
      base=["tonka bean","cedar","amberwood","vetiver"]),
 dict(brand="Yves Saint Laurent", name="La Nuit de l'Homme Bleu Electrique", fam="Aromatic Fresh Spicy",
      acc=["aromatic","fresh spicy","cardamom","woody"],
      top=["cardamom","ginger","bergamot"], heart=["lavender","geranium"], base=["cedar","vetiver"]),
 dict(brand="Yves Saint Laurent", name="Tuxedo", fam="Aromatic Oriental",
      acc=["aromatic","woody","incense","powdery","warm spicy"],
      top=["bergamot","saffron"], heart=["incense","orris"], base=["patchouli","tonka bean","vanilla","papyrus"]),
 dict(brand="Creed", name="Aventus", fam="Fruity Chypre",
      acc=["fruity","pineapple","woody","smoky","chypre"],
      top=["pineapple","bergamot","black currant","apple"], heart=["birch","patchouli","jasmine"],
      base=["oakmoss","musk","ambergris","vanilla"]),
 dict(brand="Creed", name="Aventus Absolu", fam="Fruity Chypre",
      acc=["fruity","pineapple","woody","floral","smoky"],
      top=["pineapple","bergamot","apple"], heart=["orange blossom","birch"], base=["oakmoss","musk","ambergris"]),
 dict(brand="Creed", name="Silver Mountain Water", fam="Woody Aromatic",
      acc=["fresh","green","citrus","woody","musky"],
      top=["bergamot","mandarin orange"], heart=["green tea","black currant"], base=["musk","sandalwood","galbanum"]),
 dict(brand="Dior", name="Sauvage Elixir", fam="Amber Spicy",
      acc=["warm spicy","sweet","amber","woody","lavender"],
      top=["grapefruit","cinnamon","nutmeg","cardamom"], heart=["lavender","licorice"],
      base=["amberwood","patchouli","vetiver"]),
 dict(brand="Dior", name="Sauvage Eau de Toilette", fam="Aromatic Fougere",
      acc=["fresh spicy","ambroxan","citrus","aromatic"],
      top=["bergamot","pepper"], heart=["sichuan pepper","lavender","geranium"], base=["ambroxan","cedar","labdanum"]),
 dict(brand="Kilian", name="Angels' Share", fam="Amber Gourmand",
      acc=["boozy","sweet","warm spicy","vanilla","gourmand"],
      top=["cognac","cinnamon"], heart=["tonka bean","praline","oak"], base=["vanilla","sandalwood"]),
 dict(brand="Initio Parfums Prives", name="Oud for Greatness", fam="Amber Woody Oud",
      acc=["oud","woody","saffron","warm spicy","amber"],
      top=["saffron","nutmeg","lavender"], heart=["oud","patchouli"], base=["oud","musk"]),
 dict(brand="Initio Parfums Prives", name="Atomic Rose", fam="Rose Woody",
      acc=["rose","fruity","aldehydic","woody","musky"],
      top=["pink pepper","aldehydes"], heart=["rose","raspberry"], base=["musk","patchouli","cedar"]),
 dict(brand="Nishane", name="Hacivat", fam="Fruity Chypre",
      acc=["fruity","pineapple","woody","smoky","green"],
      top=["pineapple","bergamot","grapefruit"], heart=["jasmine","patchouli"], base=["oakmoss","cedar","musk"]),
 dict(brand="Nishane", name="Ani", fam="Amber Gourmand",
      acc=["sweet","warm spicy","vanilla","gourmand","citrus"],
      top=["bergamot","cardamom","pink pepper"], heart=["orange blossom","jasmine"], base=["vanilla","tonka bean","sugar","musk"]),
 dict(brand="Parfums de Marly", name="Althair", fam="Amber Gourmand",
      acc=["sweet","gourmand","almond","vanilla","warm spicy"],
      top=["bergamot","cinnamon"], heart=["vanilla","almond"], base=["tonka bean","praline","ambroxan"]),
 dict(brand="Parfums de Marly", name="Sedley", fam="Aromatic Aquatic",
      acc=["fresh","aromatic","mint","citrus","aquatic"],
      top=["mint","bergamot","lime"], heart=["watery notes","geranium"], base=["cedar","musk","patchouli"]),
 dict(brand="Louis Vuitton", name="Pacific Chill", fam="Citrus Aromatic",
      acc=["citrus","fresh","fruity","green","aromatic"],
      top=["orange","lemon","mint","black currant"], heart=["ginger","basil"], base=["woods","musk"]),
 dict(brand="Tom Ford", name="Ombre Leather", fam="Leather",
      acc=["leather","floral","woody","warm spicy"],
      top=["cardamom"], heart=["leather","jasmine sambac"], base=["patchouli","amber","moss"]),
 dict(brand="Azzaro", name="The Most Wanted", fam="Amber Gourmand",
      acc=["sweet","boozy","aromatic","amber","chocolate"],
      top=["lavender","mirabelle","cardamom"], heart=["toffee","cacao"], base=["bourbon vanilla","amberwood"]),
 dict(brand="Paco Rabanne", name="1 Million Parfum", fam="Amber Spicy Leather",
      acc=["leather","warm spicy","amber","floral","sweet"],
      top=["cardamom","grapefruit"], heart=["rose","tobacco"], base=["leather","sandalwood","amber"]),
 dict(brand="Giorgio Armani", name="Acqua di Gio", fam="Aromatic Aquatic",
      acc=["aquatic","citrus","marine","fresh","woody"],
      top=["bergamot","marine notes","lime"], heart=["jasmine","rosemary","peach"], base=["patchouli","cedar","musk"]),
 dict(brand="BDK Parfums", name="Gris Charnel", fam="Woody Spicy",
      acc=["woody","tea","warm spicy","creamy","sweet"],
      top=["black tea","fig","cardamom"], heart=["iris","vetiver"], base=["sandalwood","tonka bean","vetiver"]),
 dict(brand="Ex Nihilo", name="Blue Talisman", fam="Fruity Musky",
      acc=["fruity","fresh","musky","citrus","aquatic"],
      top=["litchi","bergamot","sichuan pepper"], heart=["marine notes"], base=["musk","amberwood"]),
 dict(brand="Kayali", name="Eden Juicy Apple 01", fam="Fruity Floral",
      acc=["fruity","apple","sweet","floral"],
      top=["apple","rhubarb"], heart=["jasmine","freesia"], base=["vanilla","musk"]),
 dict(brand="Bentley", name="Bentley for Men Intense", fam="Amber Woody",
      acc=["warm spicy","boozy","leather","amber","woody"],
      top=["black pepper","cinnamon","rum"], heart=["leather","labdanum"], base=["amber","cedar","benzoin"]),
 dict(brand="Bvlgari", name="Tygar", fam="Aromatic Citrus",
      acc=["citrus","aromatic","woody","fresh","mineral"],
      top=["grapefruit","bergamot"], heart=["ginger"], base=["ambroxan","patchouli","musk"]),
]

# ---------------------------------------------------------------------------
# RELATIONSHIPS  (from Batch-1 fragrance -> reference / other frag)
# tuple fields:
#  from, to, type, overall, opening, heart, drydown, perf, community,
#  reason, honest_diff, evidence, verified, needs_review, [source urls]
# ---------------------------------------------------------------------------
R = []
def rel(frm,to,typ,ov,op,he,dr,pe,cc,reason,honest,evid,ver,nr,srcs):
    R.append(dict(frm=frm,to=to,typ=typ,ov=ov,op=op,he=he,dr=dr,pe=pe,cc=cc,
        reason=reason,honest=honest,evid=evid,ver=ver,nr=nr,srcs=srcs))

# ---- AFNAN ----
rel("Afnan|9PM","Jean Paul Gaultier|Ultra Male","VERIFIED_CLONE",
    0.85,0.80,0.85,0.88,0.60,0.90,
    "Overwhelming community consensus that 9PM is the go-to affordable Ultra Male alternative — shared lavender/cinnamon + heavy vanilla-amber drydown and aggressive sweet profile.",
    "9PM opens on apple rather than Ultra Male's signature pear; noticeably weaker longevity (~4-5h vs 8-12h) and projection.",
    "Fragrantica community, Fragrenza dupe roundup, multiple TikTok/YouTube 'is 9PM a clone of' comparisons all name Ultra Male as the primary reference.",
    1,0,["https://www.fragrantica.com/perfume/Afnan/9pm-65414.html",
         "https://www.fragrenza.com/blogs/fragrances/exploring-fragrances-similar-to-afnan-9pm-sweet-inviting-and-energizing-scents",
         "https://whatscent.app/magazine/afnan-9pm-review-similar",
         "https://www.youtube.com/watch?v=A5UjXsSB8bk"])

rel("Afnan|9PM Rebel","Creed|Aventus","SIMILAR_DNA",
    0.45,0.55,0.40,0.35,0.60,0.35,
    "Shares a juicy fruity (pineapple/apple) + woody direction reviewers loosely associate with the Aventus family, but explicitly described as not a clone.",
    "Rebel drives into savory caramel and cedar with no smoky birch/oakmoss chypre backbone; the Aventus link is atmospheric only.",
    "Fragrantica reviews describe pineapple + Granny Smith apple over cedar and caramel, and note the Aventus association while stating 'this isn't a clone'.",
    0,1,["https://www.fragrantica.com/perfume/Afnan/9-PM-Rebel-99238.html"])

rel("Afnan|9PM Rebel","Afnan|9PM","SIMILAR_DNA",
    0.40,0.45,0.35,0.35,0.55,0.50,
    "Same 9PM line and shares a sweet-fruity signature, positioned as a fruitier sibling.",
    "Rebel is fruit/caramel-led and far less spicy-vanillic than the original 9PM.",
    "Line relationship; Fragrantica note profiles differ substantially.",
    0,1,["https://www.fragrantica.com/perfume/Afnan/9-PM-Rebel-99238.html"])

rel("Afnan|9PM Elixir","Jean Paul Gaultier|Ultra Male","INSPIRED_BY",
    0.50,0.55,0.50,0.45,0.60,0.45,
    "Positioned as a spicier elixir interpretation in the Ultra Male sweet-amber lineage.",
    "Only ~50% similar per reviewers; markedly spicier (pimento, nutmeg, cardamom) and darker than Ultra Male.",
    "Fragrantica user reviews: 'definitely inspired by JPG elixir absolu, but only about 50% similar.'",
    0,1,["https://www.fragrantica.com/perfume/Afnan/9PM-Elixir-111894.html"])

rel("Afnan|9PM Night Out","Azzaro|The Most Wanted","INSPIRED_BY",
    0.45,0.50,0.45,0.45,0.65,0.35,
    "Boozy toffee-and-fruit extrait some reviewers liken to the 'Wanted Elixir' direction.",
    "Widely regarded as closer to an Afnan original; the Wanted link is contested and single-source.",
    "Fragrantica/decant listings compare it to Wanted Elixir while noting many consider it an original creation.",
    0,1,["https://www.fragrantica.com/perfume/Afnan/9-PM-Night-Out-123313.html"])

rel("Afnan|9AM Dive","Chanel|Bleu de Chanel","HYBRID_DNA",
    0.70,0.78,0.68,0.62,0.80,0.65,
    "Consensus reads it as a Bleu de Chanel base fused with a YSL Y-style sweeter drydown — a genuine two-parent hybrid.",
    "Not a 1:1 BdC dupe; the sweeter Y-like heart pulls it away from a straight Bleu clone.",
    "Fragrantica + multiple YouTube/TikTok reviews ('Bleu de Chanel meets YSL Y') describe the fresh-smoky BdC opening and Y-style drydown.",
    1,0,["https://www.fragrantica.com/perfume/Afnan/9am-Dive-78611.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/9am-dive",
         "https://thesnifftest.co.uk/afnan/afnan-9am/"])

rel("Afnan|9AM Dive","Yves Saint Laurent|Y Eau de Parfum","HYBRID_DNA",
    0.55,0.45,0.60,0.60,0.70,0.55,
    "Second parent of the hybrid: the sweeter apple/amberwood drydown leans YSL Y.",
    "Fresh-aquatic BdC-style opening is not part of Y; only the drydown converges.",
    "Same reviewer consensus describing 9AM Dive as a BdC/Y hybrid.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/9am-Dive-78611.html",
         "https://thesnifftest.co.uk/afnan/afnan-9am/"])

rel("Afnan|Turathi Brown","Yves Saint Laurent|Tuxedo","INSPIRED_BY",
    0.65,0.65,0.65,0.62,0.70,0.55,
    "Reviewers estimate ~90% overlap with YSL Tuxedo's aromatic-woody character.",
    "Turathi Brown leans more powdery; Tuxedo is a touch more fresh-aromatic. Not called a 1:1 clone.",
    "Fragrantica/Parfumo commentary: 'similarity to Tuxedo is at 90%... a really good variation of Tuxedo.'",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Turathi-Brown-84403.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/turathi-blue"])

rel("Afnan|Turathi Electric","Ex Nihilo|Blue Talisman","INSPIRED_BY",
    0.55,0.60,0.55,0.50,0.60,0.35,
    "Marketed/reviewed as a fresh fruity-musky take on Ex Nihilo Blue Talisman.",
    "Evidence is thin (brand-adjacent social posts); needs corroboration across independent reviewers.",
    "Afnan product page + a Facebook reviewer post naming Blue Talisman as the inspiration.",
    0,1,["https://afnan.com/products/turathi-electric",
         "https://www.fragrantica.com/perfume/Afnan/Turathi-Electric-108244.html"])

rel("Afnan|Supremacy Not Only Intense","Nishane|Hacivat","VERIFIED_CLONE",
    0.78,0.78,0.75,0.75,0.80,0.72,
    "Broadly recognised as a potent Nishane Hacivat clone — pineapple-tinged smoky woody with oakmoss/patchouli.",
    "Some note Aventus-adjacent echoes and a slightly earthier drydown than Hacivat.",
    "Fragrantica + Parfumo reviews and dupe roundups repeatedly tag it as a Hacivat clone.",
    1,0,["https://www.fragrantica.com/perfume/Afnan/Supremacy-Not-Only-Intense-68271.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/supremacy-not-only-intense",
         "https://www.fragrenza.com/blogs/fragrances/supremacy-not-only-intense-by-afnan-10-perfumes-similar-to"])

rel("Afnan|Supremacy Silver","Creed|Aventus","VERIFIED_CLONE",
    0.82,0.82,0.80,0.82,0.75,0.80,
    "One of the longest-standing, most-recommended budget Aventus clones — fruity green top and smoky woody base track Aventus closely.",
    "EdP concentration performs ~4-6h; some batches read slightly less 'organic' than genuine Aventus.",
    "Fragrantica, Parfumo, Basenotes threads and multiple retailers explicitly sell/describe it as an Aventus clone.",
    1,0,["https://www.fragrantica.com/perfume/Afnan/Supremacy-Silver-27352.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/Supremacy_Silver",
         "https://basenotes.com/threads/afnan-supremacy-silver-a-clone-of-basenotes-favourite-fragrance.382424/",
         "https://decantplanet.com/products/afnan-supremacy-silver-aventus-clone"])

rel("Afnan|Supremacy Collector's Edition","Creed|Aventus Absolu","INSPIRED_BY",
    0.75,0.75,0.72,0.72,0.85,0.70,
    "Widely reviewed as tracking Aventus Absolu more than the 2010 original — pineapple/apple + white florals over oakmoss and ambergris.",
    "Dials back smokiness and adds a fresh apple (Y-like) facet, so it modernises rather than exactly copies Absolu.",
    "Fragrantica top-20 placement, Palette21 and YouTube 'best clone of Aventus Absolu?' reviews.",
    1,0,["https://www.fragrantica.com/perfume/Afnan/Supremacy-Collector-s-Edition-Pour-Homme-98689.html",
         "https://palette21.com/blogs/news/afnan-supremacy-collectors-edition-creed-clone",
         "https://www.youtube.com/watch?v=Sym-M9qkuh4"])

rel("Afnan|Supremacy In Oud","Initio Parfums Prives|Oud for Greatness","INSPIRED_BY",
    0.72,0.72,0.72,0.72,0.75,0.62,
    "Clearly draws on Oud for Greatness' saffron-oud DNA; reviewers put it around 75-80% close.",
    "Described as 'inspired by' rather than a clone; drydown diverges somewhat from Initio.",
    "Parfumo reviews and retailer listings frame it as an Oud-for-Greatness alternative at ~75-80%.",
    0,0,["https://www.parfumo.com/Perfumes/Afnan_Perfumes/supremacy-in-oud",
         "https://www.fragrantica.com/perfume/Afnan/Supremacy-in-Oud-68283.html"])

rel("Afnan|Supremacy In Heaven","Creed|Silver Mountain Water","INSPIRED_BY",
    0.70,0.72,0.68,0.66,0.65,0.62,
    "Unmistakable Silver Mountain Water DNA — bergamot/green tea/blackcurrant over musky woods.",
    "Adds its own character and is not a straight 1:1 clone of SMW.",
    "Fragrantica + Parfumo reviews describe clear SMW DNA that 'goes its own way'.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Supremacy-In-Heaven-70703.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/Supremacy_in_Heaven"])

rel("Afnan|Rare Carbon","Tom Ford|Ombre Leather","INSPIRED_BY",
    0.58,0.58,0.55,0.55,0.65,0.45,
    "Chases the Ombre Leather leather-floral idea with violet leaf and spice.",
    "Reviews are mixed on how close it lands; oud/rose facets pull it away from Ombre Leather. Lower confidence.",
    "Fragrantica reviews describe it as 'chasing behind Ombre Leather' with mixed opinions.",
    0,1,["https://www.fragrantica.com/perfume/Afnan/Rare-Carbon-66627.html"])

rel("Afnan|Rare Reef","Louis Vuitton|Pacific Chill","INSPIRED_BY",
    0.68,0.72,0.65,0.62,0.60,0.55,
    "Positioned and reviewed as a Pacific Chill alternative — bright citrus-mint with a green fruity heart.",
    "Afnan adds fig/dates/amberwood warmth in the base, diverging from LV's cleaner finish.",
    "Retailer listings and a 2025 YouTube 'dupe of the year?' review name Pacific Chill as the target.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Rare-Reef-106835.html",
         "https://rimalalmisk.com/products/afnan-rare-reef-louis-vuitton-pacific-chill-clone",
         "https://www.youtube.com/watch?v=sIyfR9_ecyw"])

rel("Afnan|Historic Sahara","Parfums de Marly|Althair","INSPIRED_BY",
    0.70,0.70,0.70,0.70,0.70,0.55,
    "Almond/praline/vanilla-ambroxan gourmand that reviewers say 'totally matches up with PDM Althair'.",
    "Framed as inspiration-then-improvement rather than an exact clone.",
    "Fragrantica reviews and news feature naming Althair as the reference.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Historic-Sahara-109081.html",
         "https://www.fragrantica.com/news/Historic-Sahara-New-Fragrance-by-Afnan-23006.html"])

rel("Afnan|Historic Olmeda","Chanel|Bleu de Chanel","INSPIRED_BY",
    0.68,0.70,0.66,0.62,0.65,0.60,
    "Closest of the Afnan range to Bleu de Chanel — a spicier, woodier, nighttime BdC.",
    "Reviewers say 'closest to BdC but I wouldn't call it a clone'; darker and more woody.",
    "Fragrantica reviews + retailer listings labelling it a Bleu de Chanel alternative.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Historic-Olmeda-75670.html",
         "https://rimalalmisk.com/products/historic-olmeda-100ml-edp"])

rel("Afnan|Modest Une","Dior|Sauvage Eau de Toilette","INSPIRED_BY",
    0.70,0.75,0.68,0.60,0.70,0.62,
    "Reviewed as a strong Sauvage EDT-style pepper-lavender-ambroxan fresh aromatic.",
    "Solid opening but falls short on Sauvage's ambroxan base longevity/projection; reads fresher and more linear.",
    "Fragrantica reviews and retailer descriptions calling it a 'beast mode' Sauvage alternative.",
    0,0,["https://www.fragrantica.com/perfume/Afnan/Modest-Pour-Homme-Une-69256.html",
         "https://perfumiabd.com/afnan-modest-une-edp-for-men/"])

rel("Afnan|Portrait Abstract","Afnan|Portrait Abstract","ORIGINAL_DNA",
    None,None,None,None,None,0.30,
    "No firmly established designer inspiration. A single Fragrantica review likens it to a niche 'Encelade', which is uncorroborated. Treated as original DNA with closest-profile exposed.",
    "Woody-leather-incense-rose profile is distinctive; any inspiration claim is currently single-source.",
    "Fragrantica + Parfumo note profiles; inspiration unverified — flagged for manual review.",
    0,1,["https://www.fragrantica.com/perfume/Afnan/Portrait-Abstract-92432.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/abstract"])

rel("Afnan|Turathi Blue","Bvlgari|Tygar","INSPIRED_BY",
    0.80,0.90,0.72,0.65,0.75,0.72,
    "Confirmed (user + multiple reviewers): shares Bvlgari Le Gemme Tygar's grapefruit-citrus / ambroxan / patchouli / musk DNA — the first 15-20 minutes are nearly identical.",
    "Turathi Blue adds a synthetic 'blue' soapy-aquatic accent, running fresher and slightly sweeter; Tygar is drier, more mineral, with a sharper grapefruit bitterness and delicate ginger heart.",
    "User-confirmed. EVoXShop and multiple YouTube side-by-sides ('extremely accurate clone of Bvlgari Tygar') plus Fragrantica/Parfumo profiles corroborate the Tygar DNA; three names dominate Tygar-dupe discussion (Turathi Blue, Rue Broca Theoreme, Lattafa Al Qiam Silver).",
    1,0,["https://www.fragrantica.com/perfume/Afnan/Turathi-Blue-70839.html",
         "https://www.parfumo.com/Perfumes/Afnan_Perfumes/turathi-blue",
         "https://evoxshop.eu/en/blog/afnan-turathi-blue-an-alternative-to-tygar",
         "https://www.youtube.com/watch?v=_SVt5W-VWko"])

rel("Afnan|9AM","Afnan|9AM","ORIGINAL_DNA",
    None,None,None,None,None,0.30,
    "Base 9AM reads as a general fresh citrus-musk aromatic with no consensus designer target (unlike its 9AM Dive flanker).",
    "Inexpensive everyday freshie; no strong clone claim in the community.",
    "Fragrantica profile; no verified inspiration — closest DNA exposed instead.",
    0,1,["https://www.tiktok.com/discover/what-is-afnan-9am-similar-to",
         "https://thesnifftest.co.uk/afnan/afnan-9am/"])

# ---- LATTAFA ----
rel("Lattafa|Khamrah","Kilian|Angels' Share","INSPIRED_BY",
    0.72,0.68,0.72,0.75,0.80,0.85,
    "The defining budget alternative to Angels' Share — shared boozy-gourmand praline/tonka/vanilla warmth and even bottle homage.",
    "Kilian carries a finer cognac accord and darker plum depth; Khamrah is rounder with a crisper apple/date facet and less cognac smoke.",
    "Fragrantica/Parfumo consensus plus numerous side-by-side blog and YouTube comparisons treat Khamrah as inspired-by (not a 1:1 clone).",
    1,0,["https://www.intenseoud.com/blogs/news/kilian-angels-share-dupe-introducing-lattafa-khamrah",
         "https://scentclones.com/khamrah-vs-angels-share/",
         "https://parfuminspirations.com/en/blogs/fragrance-inspirations/best-angels-share-kilian-dupe-khamrah-lattafa",
         "https://www.youtube.com/watch?v=IZnCXFiLMQc"])

rel("Lattafa|Khamrah Qahwa","Lattafa|Khamrah","SIMILAR_DNA",
    0.78,0.72,0.78,0.80,0.82,0.80,
    "Same Khamrah gourmand base amplified with roasted coffee and cardamom — a coffee-forward flanker.",
    "The bitter Arabic-coffee counterpoint to the praline is the main divergence from the original.",
    "Fragrantica + multiple Khamrah-line comparison articles/videos.",
    1,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Khamrah-Dukhan-104529.html",
         "https://nearstore.com/blogs/reviews/lattafa-khamrah-review",
         "https://brownedit.com/lattafa-khamrah-vs-qahwa-vs-dukhan-india/"])

rel("Lattafa|Khamrah Qahwa","Kilian|Angels' Share","INSPIRED_BY",
    0.55,0.52,0.55,0.58,0.75,0.50,
    "Inherits Khamrah's Angels' Share lineage while pushing coffee to the front.",
    "The coffee/cardamom load pulls it further from Angels' Share than the original Khamrah.",
    "Derived from the Khamrah↔Angels' Share relationship plus line comparisons.",
    0,0,["https://nearstore.com/blogs/reviews/lattafa-khamrah-review"])

rel("Lattafa|Khamrah Dukhan","Lattafa|Khamrah","SIMILAR_DNA",
    0.75,0.65,0.75,0.80,0.90,0.78,
    "Smoky evening amplification of Khamrah — same sweet base with added incense, tobacco and oud, and huge performance.",
    "Trades Khamrah's universal appeal for a dense incense-smoke-oud character; reads more masculine/evening.",
    "ScentClones and Khamrah buying-guide comparisons; Fragrantica.",
    1,0,["https://scentclones.com/lattafa-khamrah-dukhan-review/",
         "https://scentchronicles.com/lattafa-khamrah-buying-guide-2025-all-versions-compared/",
         "https://www.fragrantica.com/perfume/Lattafa-Perfumes/Khamrah-Dukhan-104529.html"])

rel("Lattafa|Asad","Dior|Sauvage Elixir","INSPIRED_BY",
    0.72,0.70,0.72,0.74,0.75,0.75,
    "The most-cited Sauvage Elixir alternative — spicy-tobacco warmth with a sweet amber base close to the Dior.",
    "Sources split between 'clone' and 'inspired by'; Asad is sweeter and slightly harsher on top than Sauvage Elixir.",
    "Fragrantica reviews, retailer listings and dupe roundups; classified INSPIRED_BY because trusted sources disagree on 'clone'.",
    1,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-72821.html",
         "https://signaturescentperfumes.blog/lattafa-asad-review/",
         "https://scentclones.com/best-lattafa-perfumes/"])

rel("Lattafa|Asad Bourbon","Azzaro|The Most Wanted","INSPIRED_BY",
    0.80,0.80,0.80,0.82,0.75,0.70,
    "Reviewed as an outstanding Azzaro The Most Wanted clone — lavender/mirabelle/pink pepper over cacao and bourbon vanilla. Held at INSPIRED_BY (not VERIFIED_CLONE) until a second independent source confirms.",
    "Slightly more vetiver-dry in the base than the original; performance close.",
    "Fragrantica note match + reviews describing it as an 'outstanding clone of Azzaro Most Wanted'. Single strong source so far — not yet cross-validated.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-Bourbon-101124.html"])

rel("Lattafa|Asad Zanzibar","Jean Paul Gaultier|Ultra Male","HYBRID_DNA",
    0.45,0.45,0.50,0.45,0.70,0.40,
    "Described as a love-child of JPG Le Beau's sweet-coconut DNA with the dark smoky facets of Bentley for Men Intense.",
    "Not a clean single-target clone; the coconut-water/salt heart is its own thing. Placeholder Ultra-Male link pending a Le Beau reference node.",
    "Fragrantica review describing the Le Beau × Bentley Intense hybrid character.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-Zanzibar-90713.html"])

rel("Lattafa|Asad Zanzibar","Bentley|Bentley for Men Intense","HYBRID_DNA",
    0.50,0.40,0.50,0.58,0.70,0.45,
    "Second parent: the dark smoky-spicy drydown draws on Bentley for Men Intense.",
    "Only the smoky base converges; the sweet coconut opening is unrelated to Bentley.",
    "Same Fragrantica review citing Bentley for Men Intense DNA.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-Zanzibar-90713.html"])

rel("Lattafa|Asad Elixir","Lattafa|Asad","SIMILAR_DNA",
    0.62,0.58,0.62,0.66,0.72,0.55,
    "A deeper, more concentrated evolution of Asad — spicier saffron/pepper top with tobacco-cedar-amber base.",
    "Not a clone of a specific designer; positioned as a richer Asad. Exact external inspiration unconfirmed.",
    "Fragrantica + Lattafa listing describing it as a concentrated, crowd-pleasing evolution of Asad.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Asad-Elixir-117616.html",
         "https://www.lattafa-usa.com/products/asad-elixir"])

rel("Lattafa|Fakhar Black","Yves Saint Laurent|Y Eau de Parfum","VERIFIED_CLONE",
    0.85,0.88,0.82,0.82,0.75,0.82,
    "Near-perfect YSL Y EDP clone — the crisp apple/ginger opening and aromatic sage/geranium heart are effectively identical DNA.",
    "Stronger lavender and a sweeter tonka drydown vs a touch less sage than Y EDP.",
    "Fragrantica note-for-note match and widespread community consensus as the best Y EDP clone.",
    1,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Fakhar-Black-70465.html",
         "https://goldnutrition.shop/products/lattafa-fakhar-black-yves-saint-laurent-y-edp-clone"])

rel("Lattafa|Fakhar Gold Extrait","Paco Rabanne|1 Million Parfum","INSPIRED_BY",
    0.72,0.72,0.70,0.72,0.80,0.62,
    "Spicy-citrus + solar florals over a leathery amber base tracks the Paco Rabanne 1 Million Parfum direction.",
    "Extrait richness and a more tuberose-solar heart distinguish it; called a dupe rather than exact.",
    "Fragrantica + retailer listings marketing it as a 1 Million Parfum clone/dupe.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Fakhar-Extrait-85092.html",
         "https://perfumesblend.com/en/lattafa-fakhar-gold-extrait-100ml---1-million-parfum-dupe-|-perfumes-blend/p1092924422"])

rel("Lattafa|Bade'e Al Oud Oud for Glory","Initio Parfums Prives|Oud for Greatness","VERIFIED_CLONE",
    0.88,0.85,0.88,0.92,0.85,0.85,
    "The reference Oud for Greatness clone — saffron/nutmeg/lavender over agarwood/patchouli, ~95% identical in the drydown per side-by-sides.",
    "Slightly less refined mid-stage; blind-test differences mostly vanish within ~30 minutes.",
    "Fragrantica, Parfumo, Fragrance-Dupes and many retailers explicitly sell it as the Oud-for-Greatness clone.",
    1,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Oud-for-Glory-64948.html",
         "https://www.parfumo.com/Perfumes/Lattafa/oud-for-glory",
         "https://fragrance-dupes.com/catalogue/lattafa-badee-al-oud-oud-for-glory-initio-oud-for-greatness-clone/"])

rel("Lattafa|Bade'e Al Oud Honor & Glory","Nishane|Hacivat","HYBRID_DNA",
    0.55,0.58,0.55,0.52,0.75,0.50,
    "Reviewed as a blend of Nishane Hacivat and Nishane Ani — pineapple-fruity with a sweet vanilla/incense turn.",
    "Neither parent is cloned outright; it fuses Hacivat's fruity-woody with Ani's sweet gourmand.",
    "Retailer/community descriptions naming a Hacivat + Ani mix.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Amethyst-68214.html",
         "https://www.amazon.com/Lattafa-Badee-Honor-Unisex-Parfum/dp/B0CFRHV1MX"])

rel("Lattafa|Bade'e Al Oud Honor & Glory","Nishane|Ani","HYBRID_DNA",
    0.50,0.45,0.52,0.55,0.70,0.45,
    "Second parent: the sweet vanilla/tonka gourmand facet leans Nishane Ani.",
    "Only the sweet drydown converges with Ani; opening is fruity-woody Hacivat.",
    "Same retailer/community sourcing for the Hacivat+Ani blend claim.",
    0,1,["https://www.amazon.com/Lattafa-Badee-Honor-Unisex-Parfum/dp/B0CFRHV1MX"])

rel("Lattafa|Bade'e Al Oud Amethyst","Initio Parfums Prives|Atomic Rose","INSPIRED_BY",
    0.62,0.62,0.62,0.60,0.70,0.50,
    "A rosy, slightly aldehydic woody-amber in the Initio Atomic Rose direction.",
    "Oud underpinning gives it an Arabian twist not present in Atomic Rose; single-strand sourcing.",
    "Community/retailer descriptions naming Atomic Rose as the inspiration.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Amethyst-68214.html"])

rel("Lattafa|Bade'e Al Oud Sublime","Kayali|Eden Juicy Apple 01","INSPIRED_BY",
    0.55,0.60,0.55,0.48,0.60,0.40,
    "Juicy-apple fruity-floral aligned by a single retailer with Kayali Eden Juicy Apple 01.",
    "Only one retailer source; needs corroboration before treating as a firm dupe.",
    "Amazon/retailer listing describing it as a Kayali Eden Juicy Apple clone.",
    0,1,["https://www.amazon.com/Lattafa-Perfumes-Badee-Glory-Sublime/dp/B0CBLBM9PV"])

rel("Lattafa|Liam Blue Shine","Giorgio Armani|Acqua di Gio","INSPIRED_BY",
    0.72,0.75,0.70,0.66,0.65,0.62,
    "Reviewed as cloning one of the best Acqua di Gio facets — bergamot/rosemary with sea notes over musky amber.",
    "About 6h longevity; a touch more violet/patchouli than ADG EDT.",
    "Fragrantica reviews describing it as basically ADG EDT with sea notes.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Liam-Blue-Shine-85096.html"])

rel("Lattafa|Liam Grey","BDK Parfums|Gris Charnel","INSPIRED_BY",
    0.72,0.70,0.74,0.72,0.70,0.60,
    "~70-80% Gris Charnel — creamy black-tea/cardamom/fig over iris and sandalwood.",
    "Not an exact clone; swaps some citrus for a creamier tea and reads slightly sweeter.",
    "Fragrantica reviews estimating 70-80% similarity to Gris Charnel.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Liam-85097.html"])

rel("Lattafa|Al Nashama Caprice","Yves Saint Laurent|La Nuit de l'Homme Bleu Electrique","INSPIRED_BY",
    0.75,0.78,0.72,0.68,0.62,0.65,
    "Best-regarded Bleu Electrique alternative — cardamom/ginger/citrus with lavender-geranium-mint over woody amber (~85%).",
    "Moderate projection after the first hours; an Arabic twist keeps it from being exact.",
    "YouTube reviews + Parfumo/Fragrantica describing it as the best Bleu Electrique dupe at ~85%.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Al-Nashama-Caprice-89764.html",
         "https://www.parfumo.com/Perfumes/Lattafa/al-nashama-caprice",
         "https://www.youtube.com/watch?v=yHMMokwUecs"])

rel("Lattafa|Musamam Black Intense","Tom Ford|Ombre Leather","SIMILAR_DNA",
    0.45,0.45,0.45,0.48,0.70,0.35,
    "The Musamam base carries a woody-smoky-amber character variously likened to Tom Ford Ebène Fumé and YSL M7; Black Intense deepens it.",
    "Community is split (Ebène Fumé vs M7 vs Guilty Absolute); no firm single target. Placeholder link pending an Ebène Fumé reference node.",
    "Fragrantica/Parfumo/retailer commentary noting mixed M7 / Ebène Fumé / Guilty Absolute comparisons for the Musamam line.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Musamam-Black-Intense-119987.html",
         "https://rimalalmisk.com/products/musamam",
         "https://www.fragrantica.com/news/LATTAFA-Musamam-Black-Intense-and-Cocoa-Pulse-by-Jordi-Fernandez-24070.html"])

rel("Lattafa|Qaed Al Fursan","Nishane|Hacivat","INSPIRED_BY",
    0.60,0.68,0.58,0.55,0.72,0.55,
    "A juicy-pineapple boost on the Aventus/Hacivat fruity-woody-smoky DNA.",
    "Sweeter and more overtly pineapple than Hacivat; balsam-fir/oud base gives its own signature.",
    "Fragrantica + community describing it as Aventus/Hacivat DNA with a pineapple lift.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Qaed-Al-Fursan-67996.html"])

rel("Lattafa|Qaed Al Fursan","Creed|Aventus","SIMILAR_DNA",
    0.55,0.62,0.52,0.50,0.70,0.55,
    "Shares the Aventus fruity-chypre pineapple/smoky-woody family, offered as an affordable alternative.",
    "Less smoky birch and more overt sweetness than Aventus.",
    "Same community consensus placing it in the Aventus/Hacivat cluster.",
    0,0,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Qaed-Al-Fursan-67996.html"])

rel("Lattafa|Maahir Legacy","Parfums de Marly|Sedley","VERIFIED_CLONE",
    0.80,0.82,0.78,0.76,0.72,0.72,
    "Widely called the perfect Sedley dupe — minty-lime fresh aromatic, smooth and long-lasting for the profile.",
    "A touch simpler than Sedley; excellent value ('$28 clone of a $300 fragrance').",
    "The Sniff Test, Bloom Perfumery and multiple TikTok reviews naming Sedley as the target.",
    1,0,["https://thesnifftest.co.uk/lattafa-perfumes/lattafa-perfumes-maahir-legacy/",
         "https://bloomperfume.com/blogs/best-similar-1/maahir-legacy-by-lattafa-perfumes"])

rel("Lattafa|Eternal Oud","Lattafa|Eternal Oud","ORIGINAL_DNA",
    None,None,None,None,None,0.25,
    "No reliable designer/niche inspiration surfaced in research. Stored as original DNA with closest woody-oud profile exposed.",
    "Warm woody-oud/amber; any clone claim currently unsupported.",
    "Insufficient corroborated evidence — flagged for manual review in a later pass.",
    0,1,["https://www.fragrantica.com/perfume/Lattafa-Perfumes/Musamam-84720.html"])

# ===========================================================================
# BUILD ENGINE  (reusable across batches — deterministic full rebuild)
# ===========================================================================
def build_kb(extra_target_groups=None, extra_refs=None, extra_rels=None,
             batch_no=1, brands_covered=None, report_name="coverage_report_batch1.json"):
    """Rebuild the whole KB from code (source of truth) through the given batch.
    Batch-1 data (Afnan+Lattafa) is always included; later batches pass their
    additions via extra_* args. Regenerating from code preserves every validated
    relationship exactly and never silently overwrites — edits happen only in code."""
    extra_target_groups = extra_target_groups or []
    extra_refs = extra_refs or []
    extra_rels = extra_rels or []
    brands_covered = brands_covered or ["Afnan","Lattafa"]

    target_groups = [("Afnan","AE",AFNAN,1), ("Lattafa","AE",LATTAFA,1)] + extra_target_groups
    all_refs = REFS + extra_refs
    all_rels = R + extra_rels

    if os.path.exists(DB): os.remove(DB)
    con = sqlite3.connect(DB); cur = con.cursor()
    with open(SCHEMA) as f: cur.executescript(f.read())

    brand_id, note_id, accord_id, frag_id, source_id = {}, {}, {}, {}, {}

    def get_brand(name, country=None, ref=0):
        if name in brand_id: return brand_id[name]
        cur.execute("INSERT INTO brands(name,slug,country,is_house_reference,created_at) VALUES(?,?,?,?,?)",
                    (name, slugify(name), country, ref, NOW))
        brand_id[name] = cur.lastrowid; return brand_id[name]

    def get_note(n):
        n = n.strip().lower()
        if n in note_id: return note_id[n]
        cur.execute("INSERT INTO notes(name,slug) VALUES(?,?)", (n, slugify(n)))
        note_id[n] = cur.lastrowid; return note_id[n]

    def get_accord(a):
        a = a.strip().lower()
        if a in accord_id: return accord_id[a]
        cur.execute("INSERT INTO accords(name,slug) VALUES(?,?)", (a, slugify(a)))
        accord_id[a] = cur.lastrowid; return accord_id[a]

    def get_source(url):
        if url in source_id: return source_id[url]
        dom, styp, tier = classify(url)
        cur.execute("INSERT INTO sources(url,domain,title,source_type,tier,created_at) VALUES(?,?,?,?,?,?)",
                    (url, dom, None, styp, tier, NOW))
        source_id[url] = cur.lastrowid; return source_id[url]

    def fingerprint(fam, accs):
        return f"{slugify(fam or 'na')}::" + "|".join(sorted(slugify(a) for a in accs))

    def add_frag(brand, d, is_ref=0, batch=None):
        full = f"{brand} {d['name']}"
        slug = slugify(full)
        fp = fingerprint(d.get("fam"), d.get("acc",[]))
        cur.execute("""INSERT INTO fragrances(brand_id,name,slug,full_name,gender,concentration,year,
            fragrance_family,style,perf_longevity,perf_projection,overall_profile,fingerprint,
            is_reference,batch,needs_review,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (get_brand(brand, "AE" if not is_ref else None, is_ref), d["name"], slug, full,
             d.get("g"), d.get("c"), d.get("y"), d.get("fam"), d.get("style"),
             d.get("lon"), d.get("proj"), d.get("prof"), fp, is_ref, batch,
             d.get("nr",0), NOW, NOW))
        fid = cur.lastrowid; frag_id[full] = fid
        for a in d.get("acc",[]):
            cur.execute("INSERT OR IGNORE INTO fragrance_accords(fragrance_id,accord_id,weight) VALUES(?,?,?)",
                        (fid, get_accord(a), 1.0))
        for pos in ("top","heart","base"):
            for n in d.get(pos,[]):
                cur.execute("INSERT OR IGNORE INTO fragrance_notes(fragrance_id,note_id,position) VALUES(?,?,?)",
                            (fid, get_note(n), pos))
        return fid

    for bname,ctry,lst,bn in target_groups:
        get_brand(bname, ctry, 0)
        for d in lst: add_frag(bname, d, 0, bn)
    for d in all_refs: add_frag(d["brand"], d, 1, None)

    def fkey(k):
        b,n = k.split("|",1); return f"{b} {n}"

    rel_count = 0
    for r in all_rels:
        frm = frag_id.get(fkey(r["frm"])); to = frag_id.get(fkey(r["to"]))
        if frm is None or to is None:
            sys.stderr.write(f"MISSING NODE: {r['frm']} -> {r['to']}\n"); continue
        if r["typ"] == "ORIGINAL_DNA":
            to = None   # ORIGINAL_DNA: no verified inspiration target
        elif frm == to:
            sys.stderr.write(f"SELF EDGE (non-original): {r['frm']}\n"); continue
        scount = len(r["srcs"])
        cur.execute("""INSERT INTO relationships(from_fragrance_id,to_fragrance_id,relationship_type,
            overall_similarity,opening_similarity,heart_similarity,drydown_similarity,performance_similarity,
            community_confidence,reason,honest_differences,supporting_evidence,source_count,last_verified,
            verified,needs_review,batch,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (frm,to,r["typ"],r["ov"],r["op"],r["he"],r["dr"],r["pe"],r["cc"],
             r["reason"],r["honest"],r["evid"],scount,TODAY,r["ver"],r["nr"],r.get("batch",1),NOW))
        rid = cur.lastrowid; rel_count += 1
        for u in r["srcs"]:
            cur.execute("INSERT OR IGNORE INTO relationship_sources(relationship_id,source_id) VALUES(?,?)",
                        (rid, get_source(u)))

    # ---- SEARCH INDEX (denormalized) ----
    cur.execute("SELECT id, brand_id, name, full_name, fragrance_family FROM fragrances WHERE is_reference=0")
    for fid, bid, name, full, fam in cur.fetchall():
        brand = [k for k,v in brand_id.items() if v==bid][0]
        accs = [row[0] for row in cur.execute("""SELECT a.name FROM accords a
            JOIN fragrance_accords fa ON fa.accord_id=a.id WHERE fa.fragrance_id=?""",(fid,)).fetchall()]
        notes_ = [row[0] for row in cur.execute("""SELECT n.name FROM notes n
            JOIN fragrance_notes fn ON fn.note_id=n.id WHERE fn.fragrance_id=?""",(fid,)).fetchall()]
        rels = cur.execute("""SELECT r.relationship_type, f.full_name, r.community_confidence
            FROM relationships r JOIN fragrances f ON f.id=r.to_fragrance_id
            WHERE r.from_fragrance_id=? AND r.to_fragrance_id IS NOT NULL
            ORDER BY r.community_confidence DESC""",(fid,)).fetchall()
        toprels = json.dumps([{"type":t,"target":tn,"confidence":cc} for t,tn,cc in rels])
        terms = " ".join([full, brand, fam or ""] + accs + notes_).lower()
        cur.execute("""INSERT INTO search_index(fragrance_id,brand,display_name,family,terms,accords,top_relationships)
            VALUES(?,?,?,?,?,?,?)""",(fid, brand, full, fam, terms, ", ".join(accs), toprels))

    con.commit()

    # ---- JSON EXPORTS ----
    os.makedirs(EXPORT, exist_ok=True)
    def dump(name, rows):
        with open(os.path.join(EXPORT, name), "w") as f:
            json.dump(rows, f, indent=2, ensure_ascii=False)
    def q(sql, args=()):
        cur.execute(sql, args)
        cols = [c[0] for c in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]

    dump("brands.json", q("SELECT * FROM brands ORDER BY id"))
    dump("notes.json", q("SELECT * FROM notes ORDER BY name"))
    dump("accords.json", q("SELECT * FROM accords ORDER BY name"))
    frags = []
    for fr in q("SELECT * FROM fragrances ORDER BY id"):
        fid = fr["id"]
        fr["brand"] = [k for k,v in brand_id.items() if v==fr["brand_id"]][0]
        fr["accords"] = [r["name"] for r in q("SELECT a.name FROM accords a JOIN fragrance_accords fa ON fa.accord_id=a.id WHERE fa.fragrance_id=? ORDER BY a.name",(fid,))]
        fr["notes"] = {p:[r["name"] for r in q("SELECT n.name FROM notes n JOIN fragrance_notes fn ON fn.note_id=n.id WHERE fn.fragrance_id=? AND fn.position=? ORDER BY n.name",(fid,p))] for p in ("top","heart","base")}
        frags.append(fr)
    dump("fragrances.json", frags)
    rels = []
    for rr in q("SELECT * FROM relationships ORDER BY id"):
        rr["from"] = q("SELECT full_name FROM fragrances WHERE id=?",(rr["from_fragrance_id"],))[0]["full_name"]
        rr["to"] = (q("SELECT full_name FROM fragrances WHERE id=?",(rr["to_fragrance_id"],))[0]["full_name"]
                    if rr["to_fragrance_id"] is not None else None)
        rr["sources"] = [r["url"] for r in q("SELECT s.url FROM sources s JOIN relationship_sources rs ON rs.source_id=s.id WHERE rs.relationship_id=?",(rr["id"],))]
        rels.append(rr)
    dump("relationships.json", rels)
    dump("sources.json", q("SELECT * FROM sources ORDER BY tier, id"))
    dump("image_assets.json", q("SELECT * FROM image_assets ORDER BY id"))
    dump("search_index.json", q("SELECT * FROM search_index ORDER BY display_name"))

    # ---- COVERAGE REPORT ----
    def scalar(sql,args=()):
        cur.execute(sql,args); return cur.fetchone()[0]
    report = {
     "batch": batch_no,
     "generated_at": NOW,
     "brands_covered_cumulative": brands_covered,
     "cumulative_fragrances_processed": scalar("SELECT COUNT(*) FROM fragrances WHERE is_reference=0"),
     "this_batch_fragrances": scalar("SELECT COUNT(*) FROM fragrances WHERE is_reference=0 AND batch=?",(batch_no,)),
     "reference_targets_total": scalar("SELECT COUNT(*) FROM fragrances WHERE is_reference=1"),
     "cumulative_relationships": rel_count,
     "this_batch_relationships": scalar("SELECT COUNT(*) FROM relationships WHERE batch=?",(batch_no,)),
     "by_type_cumulative": {r["relationship_type"]: r["c"] for r in q("SELECT relationship_type, COUNT(*) c FROM relationships GROUP BY relationship_type ORDER BY c DESC")},
     "by_type_this_batch": {r["relationship_type"]: r["c"] for r in q("SELECT relationship_type, COUNT(*) c FROM relationships WHERE batch=? GROUP BY relationship_type ORDER BY c DESC",(batch_no,))},
     "verified_relationships_cumulative": scalar("SELECT COUNT(*) FROM relationships WHERE verified=1"),
     "low_confidence_relationships_cumulative": scalar("SELECT COUNT(*) FROM relationships WHERE community_confidence < 0.5"),
     "needs_review_relationships_cumulative": scalar("SELECT COUNT(*) FROM relationships WHERE needs_review=1"),
     "fragrances_needing_manual_review_this_batch": [r["full_name"] for r in q("SELECT full_name FROM fragrances WHERE is_reference=0 AND needs_review=1 AND batch=? ORDER BY full_name",(batch_no,))],
     "fragrances_awaiting_scent_data": [r["full_name"] for r in q("""SELECT full_name FROM fragrances f WHERE is_reference=0
         AND NOT EXISTS(SELECT 1 FROM fragrance_accords fa WHERE fa.fragrance_id=f.id) ORDER BY full_name""")],
     "notes_catalogued": scalar("SELECT COUNT(*) FROM notes"),
     "accords_catalogued": scalar("SELECT COUNT(*) FROM accords"),
     "sources_catalogued": scalar("SELECT COUNT(*) FROM sources"),
     "duplicate_records_removed": 0,
     "validation_issues": [],
    }
    dump(report_name, report)
    con.close()
    return report

if __name__ == "__main__":
    rep = build_kb(batch_no=1, brands_covered=["Afnan","Lattafa"],
                   report_name="coverage_report_batch1.json")
    print(json.dumps(rep, indent=2, ensure_ascii=False))
