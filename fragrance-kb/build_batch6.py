#!/usr/bin/env python3
"""
Noir Vault Fragrance KB — Batch 6 builder (Armaf, added on request).
Adds 20 Armaf fragrances (Club de Nuit, Odyssey, Hunter lines + Ventana, Tag Him, Aura Fresh).
Prior batches pulled from their modules unchanged.
"""
import json
import build_batch5 as b5
b4 = b5.b4
b3 = b5.b3
b2 = b5.b2
b1 = b5.b1

# ===========================================================================
# ARMAF (20)
# ===========================================================================
ARMAF = [
 dict(name="Club de Nuit Intense Man EDT", g="men", c="EDT", y=2015, fam="Fruity Chypre",
      style="citrus smoky fruity", lon="very long", proj="strong",
      prof="The definitive budget Creed Aventus clone — a bright, slightly harsh lemon-pineapple blast over smoky birch, oakmoss and ambergris. Beast performance.",
      acc=["fruity","pineapple","smoky","woody","chypre"],
      top=["lemon","pineapple","bergamot","black currant","apple"], heart=["rose","jasmine","birch"],
      base=["musk","ambergris","vanilla","oakmoss","vetiver"]),
 dict(name="Club de Nuit Intense Man EDP", g="men", c="EDP", y=2021, fam="Fruity Chypre",
      style="smoother smoky fruity", lon="very long", proj="strong",
      prof="A smoother, deeper, smokier/muskier EDP take on the Aventus-clone DNA — less citrus-harsh than the EDT.",
      acc=["fruity","pineapple","smoky","woody","chypre"],
      top=["lemon","pineapple","bergamot"], heart=["rose","jasmine","birch"],
      base=["musk","ambergris","vanilla","oakmoss"]),
 dict(name="Club de Nuit Intense Man Limited Edition", g="men", c="Parfum", y=2021, fam="Fruity Chypre",
      style="refined smoky fruity parfum", lon="very long", proj="strong",
      prof="Parfum concentration that refines the pineapple-smoke-amber balance for a denser, smoother drydown — widely called the best Aventus alternative of the three.",
      acc=["fruity","pineapple","smoky","woody","amber"],
      top=["pineapple","bergamot","lemon"], heart=["rose","jasmine","birch"],
      base=["musk","ambergris","oakmoss","vanilla"]),
 dict(name="Club de Nuit Precieux", g="unisex", c="EDP", y=2024, fam="Fruity Chypre",
      style="peppery sweet fruity chypre", lon="long", proj="strong",
      prof="Pineapple/pear/caramel/pepper over an oakmoss-white-wood heart with an ambroxan-leather-vanilla base — an Aventus Absolu interpretation with a Hacivat-style mossy heart and gourmand sweetness.",
      acc=["fruity","pineapple","chypre","sweet","woody"],
      top=["pineapple","lemon","bergamot","caramel","pink pepper","pear","black pepper"],
      heart=["oakmoss","white wood","jasmine","lily-of-the-valley","anise"],
      base=["ambroxan","white musk","cedar","amber","patchouli","leather","vanilla"]),
 dict(name="Club de Nuit Sillage", g="unisex", c="EDP", y=2020, fam="Woody Aromatic",
      style="metallic fresh woody", lon="long", proj="strong",
      prof="Huge bergamot/metallic-lemon and blackcurrant over rose-iris with an ambroxan-musk-sandalwood base — a Creed Silver Mountain Water clone that out-projects the original.",
      acc=["fresh","citrus","green","woody","musky"],
      top=["bergamot","lemon","lime","black currant","violet leaf","ginger"], heart=["rose","jasmine","iris"],
      base=["ambroxan","musk","sandalwood","cedar"]),
 dict(name="Club de Nuit Milestone", g="unisex", c="EDP", y=2019, fam="Woody Floral Musk",
      style="watery fruity woody", lon="long", proj="strong",
      prof="Watermelon-ish fresh-fruity opening drying to woody fruit with ambroxan and violet — a Creed Millésime Impérial clone, stronger and fruitier than the original.",
      acc=["fresh","fruity","woody","musky","aquatic"],
      top=["bergamot","lemon","sea notes"], heart=["iris","violet"], base=["ambroxan","musk","sandalwood","woods"]),
 dict(name="Club de Nuit Untold", g="unisex", c="EDP", y=2022, fam="Amber Woody Floral",
      style="saffron amberwood", lon="long", proj="strong",
      prof="Saffron/jasmine over amberwood-ambergris with a fir-resin-cedar base — an ~85-90% Baccarat Rouge 540 clone.",
      acc=["sweet","amber","woody","saffron","floral"],
      top=["saffron","jasmine"], heart=["amberwood","ambergris"], base=["fir resin","cedar"]),
 dict(name="Club de Nuit Urban Man Elixir", g="men", c="EDP", y=2022, fam="Amber Spicy",
      style="spicy sweet woody", lon="long", proj="strong",
      prof="A mature, spicy-sweet woody most compared to Dior Sauvage Elixir (with Tom Ford Noir de Noir / LNDH facets some also cite).",
      acc=["warm spicy","sweet","amber","woody","aromatic"], nr=1),
 dict(name="Club de Nuit Iconic", g="men", c="EDP", y=2022, fam="Aromatic Woody",
      style="fresh spicy woody", lon="long", proj="strong",
      prof="A Bleu de Chanel-style fresh spicy-woody with amped-up ginger/spice and stronger performance than the original.",
      acc=["citrus","aromatic","woody","incense","fresh"],
      top=["grapefruit","lemon","mint","pink pepper"], heart=["ginger","nutmeg","jasmine"],
      base=["incense","amber","cedar","sandalwood","labdanum"], nr=1),
 dict(name="Club de Nuit Blue Iconic", g="men", c="EDP", y=2022, fam="Aromatic Woody",
      style="brighter fresh spicy woody", lon="long", proj="strong",
      prof="Grapefruit/lemon/mint over ginger-nutmeg-jasmine-melon with a woody incense-amber base — a brighter, gingery Bleu de Chanel clone (EDT opening, EDP heart; ~65-75%).",
      acc=["citrus","aromatic","woody","incense","fresh"],
      top=["grapefruit","lemon","mint","pink pepper","coriander"], heart=["ginger","nutmeg","jasmine","melon"],
      base=["incense","amber","cedar","sandalwood","patchouli","labdanum"]),
 dict(name="Odyssey Mandarin Sky", g="men", c="EDP", y=2023, fam="Amber Fougere",
      style="sweet spicy caramel", lon="long", proj="strong",
      prof="Mandarin/orange/saffron/sage over caramel-tonka-marigold with an ambroxan-cedar-vetiver base — a JPG Scandal Pour Homme clone.",
      acc=["sweet","warm spicy","amber","citrus","aromatic"],
      top=["mandarin","orange","saffron","sage"], heart=["caramel","tonka bean","marigold"],
      base=["ambroxan","cedar","vetiver"]),
 dict(name="Odyssey Mega", g="men", c="EDP", y=2023, fam="Aromatic Fresh Spicy",
      style="fresh aromatic", lon="long", proj="strong",
      prof="Orange/bergamot/ginger/mint over pineapple-sage-juniper-geranium with a musk-cedar-tonka-vetiver base — an overt YSL Y EDP clone.",
      acc=["aromatic","fresh spicy","citrus","woody","fruity"],
      top=["orange","bergamot","lemon","ginger","mint"], heart=["pineapple","sage","juniper berries","geranium"],
      base=["musk","cedar","tonka bean","vetiver"]),
 dict(name="Odyssey Aqua", g="men", c="EDP", y=2023, fam="Aromatic Aquatic",
      style="fresh aquatic woody", lon="long", proj="strong",
      prof="A fresher aquatic Odyssey — reviewed as a Paco Rabanne Invictus Platinum clone.",
      acc=["aquatic","fresh","woody","citrus","aromatic"], nr=1),
 dict(name="Odyssey Homme", g="men", c="EDP", y=2018, fam="Amber Spicy",
      style="spicy amber woody", lon="long", proj="strong",
      prof="Cardamom/neroli/mandarin over orange blossom-rose with a vanilla-sandalwood-amber base — reviewers cite Tom Ford Noir Extreme (with Spicebomb Extreme facets).",
      acc=["warm spicy","amber","sweet","woody","floral"],
      top=["cardamom","neroli","mandarin"], heart=["orange blossom","rose"],
      base=["vanilla","sandalwood","woods","amber"], nr=1),
 dict(name="Odyssey Wild One", g="men", c="EDP", y=2023, fam="Woody Spicy",
      style="fresh spicy woody", lon="long", proj="strong",
      prof="Bergamot/pepper/lemon/mint over pink pepper-lavender-vetiver-ginger with a patchouli-sandalwood-cedar base — a Bleu de Chanel-leaning fresh woody (some cite Sauvage too).",
      acc=["woody","warm spicy","aromatic","fresh","citrus"],
      top=["bergamot","pepper","lemon","mint"], heart=["pink pepper","lavender","vetiver","ginger"],
      base=["patchouli","sandalwood","vetiver","cedar","elemi","musk"], nr=1),
 dict(name="Hunter Intense", g="men", c="EDT", y=2016, fam="Aromatic Fresh Spicy",
      style="fresh spicy", lon="moderate", proj="strong",
      prof="Bright citrus (pomelo/mandarin/lemon) over lavender-geranium-ylang with a woody base — reviewers read it as a Sauvage × Invictus mixture.",
      acc=["citrus","aromatic","fresh spicy","woody","aquatic"],
      top=["bergamot","pomelo","mandarin","lemon"], heart=["lavender","geranium","ylang-ylang","tuberose"],
      base=["woods","amber","musk"], nr=1),
 dict(name="Hunter Killer", g="men", c="EDP", y=2023, fam="Tobacco Woody",
      style="spicy tobacco woody", lon="long", proj="strong",
      prof="Incense/pepper/nutmeg/cinnamon/saffron/green apple over patchouli-jasmine-lavender with a tobacco-vetiver-guaiac-amber-vanilla base — inspired by Mancera Red Tobacco.",
      acc=["tobacco","warm spicy","woody","incense","amber"],
      top=["incense","pepper","nutmeg","cinnamon","saffron","green apple"], heart=["patchouli","jasmine","lavender"],
      base=["tobacco","vetiver","guaiac wood","amber","vanilla"]),
 dict(name="Ventana", g="men", c="EDP", y=2021, fam="Aromatic Fougere",
      style="fresh spicy ambroxan", lon="long", proj="strong",
      prof="A Dior Sauvage clone with near-identical performance — fresh-spicy pepper/bergamot over an ambroxan-woody base.",
      acc=["fresh spicy","ambroxan","citrus","aromatic","woody"], nr=1),
 dict(name="Tag Him Uomo Rosso", g="men", c="EDP", y=2024, fam="Amber Spicy",
      style="spicy sweet woody", lon="long", proj="strong",
      prof="Lavender/cardamom over spicy black pepper with a vanilla-tonka-incense-patchouli base — an ~95%, near-1:1 Paco Rabanne Invictus Victory Elixir clone (also matches Zimaya Al Embratur Elixir).",
      acc=["warm spicy","sweet","amber","aromatic","woody"],
      top=["lavender","cardamom","aromatic notes"], heart=["spicy notes","black pepper"],
      base=["vanilla","tonka bean","incense","patchouli"]),
 dict(name="Aura Fresh", g="unisex", c="EDP", y=2023, fam="Woody Aromatic",
      style="zesty fresh spicy", lon="moderate", proj="moderate",
      prof="Star-fruit/lemon/bergamot/cardamom over sage-pepper with a woody-musk-cedar-amber-saffron base — a close Versace Eau Fraiche clone (with Dylan Blue / Sauvage-freshness facets).",
      acc=["citrus","fresh","aromatic","woody","warm spicy"],
      top=["carambola","lemon","bergamot","cardamom"], heart=["sage","pepper"],
      base=["woods","musk","cedar","amber","saffron"]),
]

# ===========================================================================
# NEW REFERENCE TARGETS for Batch 6
# ===========================================================================
REFS6 = [
 dict(brand="Creed", name="Millesime Imperial", fam="Woody Floral Musk",
      acc=["fresh","fruity","aquatic","woody","musky"],
      top=["bergamot","lemon","sea notes"], heart=["iris","musk"], base=["sandalwood","musk","woods"]),
 dict(brand="Jean Paul Gaultier", name="Scandal Pour Homme", fam="Amber Fougere",
      acc=["sweet","warm spicy","amber","aromatic","caramel"],
      top=["mandarin","clary sage"], heart=["caramel","tonka bean"], base=["vetiver","amberwood"]),
 dict(brand="Paco Rabanne", name="Invictus Platinum", fam="Aromatic Aquatic",
      acc=["aquatic","fresh","woody","sweet","citrus"],
      top=["mandarin","mint","marine notes"], heart=["rum","cardamom"], base=["vanilla","tonka bean","patchouli"]),
 dict(brand="Tom Ford", name="Noir Extreme", fam="Amber Spicy",
      acc=["sweet","warm spicy","amber","woody","floral"],
      top=["cardamom","nutmeg","saffron","mandarin"], heart=["kulfi","orange blossom","rose"],
      base=["vanilla","sandalwood","amber"]),
 dict(brand="Mancera", name="Red Tobacco", fam="Tobacco Woody",
      acc=["tobacco","warm spicy","woody","amber","incense"],
      top=["spicy notes","nutmeg","saffron"], heart=["oud","incense"], base=["tobacco","vetiver","amber","vanilla"]),
 dict(brand="Paco Rabanne", name="Invictus Victory Elixir", fam="Amber Spicy",
      acc=["warm spicy","sweet","amber","aromatic","woody"],
      top=["lavender","cardamom"], heart=["cinnamon","black pepper"], base=["vanilla","tonka bean","patchouli"]),
 dict(brand="Versace", name="Eau Fraiche", fam="Woody Aromatic",
      acc=["citrus","aromatic","woody","fresh","warm spicy"],
      top=["lemon","bergamot","star fruit"], heart=["tarragon","pepper","sage"], base=["woods","musk","cedar","amber"]),
]

# ===========================================================================
# BATCH-6 RELATIONSHIPS
# ===========================================================================
R6 = []
def rel(frm,to,typ,ov,op,he,dr,pe,cc,reason,honest,evid,ver,nr,srcs):
    R6.append(dict(frm=frm,to=to,typ=typ,ov=ov,op=op,he=he,dr=dr,pe=pe,cc=cc,
        reason=reason,honest=honest,evid=evid,ver=ver,nr=nr,srcs=srcs,batch=6))
AR="https://www.fragrantica.com/perfume/Armaf/"

# ---- Club de Nuit / Aventus lineage ----
rel("Armaf|Club de Nuit Intense Man EDT","Creed|Aventus","VERIFIED_CLONE",
    0.85,0.82,0.85,0.88,0.90,0.92,
    "The single most recommended Creed Aventus clone in the hobby — same pineapple-smoke-birch-oakmoss DNA, often out-projecting and out-lasting the original.",
    "Sharper, more synthetic 'Lemon Pledge' opening than Aventus' smoother start.",
    "Fragrantica + Basenotes + DecantPlanet + multiple guides universally sell/describe it as the Aventus clone.",
    1,0,[AR+"Club-de-Nuit-Intense-Man-18406.html","https://basenotes.com/fragrances/club-de-nuit-intense-for-men-by-armaf.26148985/reviews/","https://decantplanet.com/products/armaf-club-de-nuit-intense-man"])
rel("Armaf|Club de Nuit Intense Man EDP","Creed|Aventus","VERIFIED_CLONE",
    0.85,0.80,0.86,0.88,0.90,0.85,
    "The EDP concentration of the canonical Aventus clone — smoother, deeper and smokier than the EDT.",
    "Leans muskier/smokier with a Middle-Eastern edge vs the fresher genuine Aventus.",
    "Vivir + My Scent Stories EDT/EDP/Parfum comparisons; Fragrantica.",
    1,0,["https://vivir.com/article/armaf-club-de-nuit-intense-man-edt-review","https://www.myscentstories.com/perfumes/club-de-nuit-intense-man/"])
rel("Armaf|Club de Nuit Intense Man Limited Edition","Creed|Aventus","VERIFIED_CLONE",
    0.86,0.84,0.86,0.90,0.90,0.85,
    "Parfum-concentration Aventus clone that refines the pineapple-smoke-amber balance for a denser, smoother drydown — often called the best of the three.",
    "Tones down the harsh lemon; richer and juicier than EDT/EDP.",
    "Fragrantica (Limited Edition Parfum) + Aromatick + Vivir naming Aventus.",
    1,0,[AR+"Club-de-Nuit-Intense-Man-Limited-Edition-Parfum-77861.html","https://aromatick.com/blogs/fragrance-reviews/why-armafs-limited-edition-is-the-best-creed-aventus-alternative"])
rel("Armaf|Club de Nuit Intense Man EDP","Armaf|Club de Nuit Intense Man EDT","SIMILAR_DNA",
    0.85,0.80,0.86,0.88,0.85,0.85,
    "Same Club de Nuit Intense DNA at higher concentration — smoother and smokier than the EDT.",
    "EDP trades the EDT's citrus sharpness for depth.",
    "Vivir/My Scent Stories line comparisons.",
    0,0,["https://www.myscentstories.com/perfumes/club-de-nuit-intense-man/"])
rel("Armaf|Club de Nuit Precieux","Creed|Aventus Absolu","INSPIRED_BY",
    0.68,0.72,0.66,0.66,0.80,0.55,
    "An Aventus Absolu interpretation — pineapple/pepper/caramel over a mossy white-wood heart with gourmand sweetness and a Hacivat-style facet.",
    "Reviewers stress it's an interpretation, not a clone: sweeter and peppery, less fresh than Aventus.",
    "Fragrantica + Scent Grail + Parfumo naming Aventus Absolu.",
    0,1,[AR+"Club-de-Nuit-Precieux-I-93272.html","https://scentgrail.com/perfume-reviews/armaf-club-de-nuit-precieux-1-review/"])
rel("Armaf|Club de Nuit Sillage","Creed|Silver Mountain Water","VERIFIED_CLONE",
    0.80,0.82,0.78,0.78,0.85,0.75,
    "A Creed Silver Mountain Water clone — bergamot/metallic-lemon/blackcurrant over an ambroxan-musk base — that out-projects the original.",
    "A touch more metallic/tart than SMW; stronger performance.",
    "Fragrantica + Parfumo + Basenotes naming Silver Mountain Water.",
    1,0,[AR+"Club-de-Nuit-Sillage-64105.html","https://www.parfumo.com/Perfumes/Armaf/club-de-nuit-sillage-eau-de-parfum"])
rel("Armaf|Club de Nuit Milestone","Creed|Millesime Imperial","VERIFIED_CLONE",
    0.82,0.82,0.80,0.82,0.85,0.75,
    "Pretty much identical to Creed Millésime Impérial — a watery-fruity woody-floral-musk, stronger and fruitier than the original.",
    "Creed MI is lighter/airier; Milestone is denser and more fruit-forward.",
    "Fragrantica + Parfumo + Basenotes naming Millésime Impérial.",
    1,0,[AR+"Club-de-Nuit-Milestone-64104.html","https://www.parfumo.com/Perfumes/Armaf/club-de-nuit-milestone-eau-de-parfum"])
rel("Armaf|Club de Nuit Untold","Maison Francis Kurkdjian|Baccarat Rouge 540","VERIFIED_CLONE",
    0.86,0.86,0.86,0.86,0.80,0.80,
    "An ~85-90% Baccarat Rouge 540 clone — same saffron/jasmine → amberwood/ambergris → cedar/fir-resin structure; hard to tell apart in the air.",
    "A hair less refined/expensive-smelling than the MFK original.",
    "Fragrantica + iFragrance ('best BR540 clone') + retailer listings.",
    1,0,[AR+"Club-de-Nuit-Untold-78476.html","https://ifragranceofficial.com/armaf-club-de-nuit-untold-review/"])
rel("Armaf|Club de Nuit Urban Man Elixir","Dior|Sauvage Elixir","INSPIRED_BY",
    0.55,0.55,0.55,0.55,0.80,0.42,
    "Most commonly compared to Dior Sauvage Elixir — a mature spicy-sweet woody.",
    "Multiple targets cited (also Tom Ford Noir de Noir and LNDH); not a clean single-target clone.",
    "Perfume Nez + Parfumo + PerfumenCologne discussing the Sauvage Elixir / Noir de Noir / LNDH comparisons.",
    0,1,[AR+"Club-De-Nuit-Urban-Elixir-77860.html","https://perfumenez.com/blogs/arabian/what-is-armaf-club-de-nuit-urban-man-elixir-a-clone-of"])
rel("Armaf|Club de Nuit Iconic","Chanel|Bleu de Chanel","INSPIRED_BY",
    0.70,0.70,0.70,0.68,0.80,0.60,
    "A Bleu de Chanel clone with amped-up ginger/spice and stronger performance.",
    "More overtly gingery/spicy than BdC.",
    "Fragrantica + Parfumo + YouTube naming Bleu de Chanel.",
    0,0,["https://www.parfumo.com/Perfumes/Armaf/club-de-nuit-iconic","https://www.youtube.com/watch?v=51MjytrMvnE"])
rel("Armaf|Club de Nuit Blue Iconic","Chanel|Bleu de Chanel","INSPIRED_BY",
    0.68,0.72,0.66,0.66,0.80,0.55,
    "A brighter, gingery Bleu de Chanel clone — EDT-like opening, EDP-like heart/base; ~65-75% overall.",
    "Ginger and citrus are amped up; the full drydown converges more than the opening.",
    "Fragrantica + fragplace comparison + iFragrance naming Bleu de Chanel.",
    0,0,[AR+"Club-de-Nuit-Blue-Iconic-78475.html","https://fragplace.com/en-US/compare/1287-chanel-bleu-de-chanel-vs-1327-armaf-club-de-nuit-blue-iconic"])
# ---- Odyssey line ----
rel("Armaf|Odyssey Mandarin Sky","Jean Paul Gaultier|Scandal Pour Homme","INSPIRED_BY",
    0.74,0.74,0.74,0.72,0.75,0.60,
    "A JPG Scandal Pour Homme clone — mandarin/saffron/sage over caramel-tonka with an ambroxan-vetiver base.",
    "A touch sweeter/cheaper-smelling than the original.",
    "Fragrantica + Jomashop 'Armaf Odyssey designer dupes' + retailer naming Scandal Pour Homme.",
    0,0,[AR+"Odyssey-Mandarin-Sky-83132.html","https://www.jomashop.com/blog/articles/armaf-odyssey-designer-dupes"])
rel("Armaf|Odyssey Mega","Yves Saint Laurent|Y Eau de Parfum","INSPIRED_BY",
    0.75,0.76,0.74,0.72,0.75,0.62,
    "An overt YSL Y EDP clone — apple/ginger-adjacent citrus over sage-geranium with a tonka-cedar base.",
    "A citrus-aromatic fougère reading of Y; slightly simpler.",
    "Fragrantica + Jomashop Odyssey dupes guide naming YSL Y EDP.",
    0,0,[AR+"Odyssey-Mega-Man-83133.html","https://www.jomashop.com/blog/articles/armaf-odyssey-designer-dupes"])
rel("Armaf|Odyssey Aqua","Paco Rabanne|Invictus Platinum","INSPIRED_BY",
    0.66,0.68,0.64,0.62,0.72,0.50,
    "Reviewed as a Paco Rabanne Invictus Platinum clone — a fresher aquatic Odyssey.",
    "Note pyramid thinly documented; single main source.",
    "Fragrantica + Jomashop Odyssey dupes guide naming Invictus Platinum.",
    0,1,[AR+"Odyssey-Aqua-Edition-83134.html","https://www.jomashop.com/blog/articles/armaf-odyssey-designer-dupes"])
rel("Armaf|Odyssey Homme","Tom Ford|Noir Extreme","INSPIRED_BY",
    0.58,0.62,0.56,0.54,0.72,0.45,
    "Cardamom/neroli/orange-blossom amber that reviewers open-compare to Tom Ford Noir Extreme (with Spicebomb Extreme facets).",
    "Multiple comparisons cited; more of an 'in the vein of' than a 1:1 clone.",
    "Fragrantica + retailer (Rimal Al Misk) + YouTube discussing Noir Extreme / Spicebomb Extreme.",
    0,1,[AR+"Odyssey-Homme-64464.html","https://rimalalmisk.com/products/armaf-odyssey-homme-spicebomb-extreme-viktor-rolf-clone"])
rel("Armaf|Odyssey Wild One","Chanel|Bleu de Chanel","INSPIRED_BY",
    0.62,0.64,0.60,0.58,0.75,0.48,
    "A Bleu de Chanel-leaning fresh woody (a lavender-based, non-smoky BdC reading); some reviewers also cite Dior Sauvage.",
    "Two-way comparison (BdC / Sauvage); not a clean single target.",
    "Fragrantica + Parfumo reviews naming Bleu de Chanel and Sauvage.",
    0,1,[AR+"Odyssey-Wild-One-Gold-Edition-83137.html","https://www.parfumo.com/Perfumes/Armaf/odyssey-wild-one"])
# ---- Hunter / Ventana / Tag Him / Aura ----
rel("Armaf|Hunter Intense","Dior|Sauvage Eau de Toilette","HYBRID_DNA",
    0.50,0.55,0.48,0.46,0.75,0.42,
    "Reviewers read it as a Sauvage × Invictus mixture — bright citrus with an ambroxan-woody freshness.",
    "Not a single-target clone; overlaps CDN Urban Man Elixir and Ventana in the Sauvage space.",
    "Fragrantica + Basenotes discussion describing a Sauvage/Invictus mix.",
    0,1,[AR+"Hunter-Intense-50327.html","https://basenotes.com/threads/best-of-armaf-beside-club-nuit-club-nuit-intense-hunter.456195/"])
rel("Armaf|Hunter Intense","Paco Rabanne|Invictus","HYBRID_DNA",
    0.48,0.50,0.46,0.44,0.75,0.40,
    "Second parent: the aquatic-fresh facet leans Paco Rabanne Invictus.",
    "Only the fresh aquatic side converges with Invictus.",
    "Same Sauvage/Invictus-mix community sourcing.",
    0,1,[AR+"Hunter-Intense-50327.html"])
rel("Armaf|Hunter Killer","Mancera|Red Tobacco","INSPIRED_BY",
    0.68,0.66,0.68,0.70,0.78,0.55,
    "Inspired by Mancera Red Tobacco — spicy incense/saffron/green-apple over a tobacco-guaiac-amber base.",
    "Not a 1:1 clone; a strong fragrance in its own right per reviewers.",
    "Fragrantica + retailer (Shop with Hustle) naming Mancera Red Tobacco.",
    0,1,[AR+"Hunter-Killer-Man-87527.html","https://www.shopwithhustle.com/product/armaf-hunter-killer-3-4oz-edp-men-mancera-red-tobacco-clone/"])
rel("Armaf|Ventana","Dior|Sauvage Eau de Toilette","INSPIRED_BY",
    0.72,0.74,0.70,0.68,0.85,0.55,
    "A Dior Sauvage clone with near-identical performance per reviewers — fresh-spicy pepper/bergamot over ambroxan-woods.",
    "Note pyramid thinly documented; sits alongside Armaf's other Sauvage takes.",
    "Basenotes + Fragrantica community naming Sauvage.",
    0,1,["https://basenotes.com/threads/best-of-armaf-beside-club-nuit-club-nuit-intense-hunter.456195/"])
rel("Armaf|Tag Him Uomo Rosso","Paco Rabanne|Invictus Victory Elixir","VERIFIED_CLONE",
    0.86,0.84,0.86,0.90,0.80,0.75,
    "An ~95%, near-1:1 Paco Rabanne Invictus Victory Elixir clone — lavender/cardamom/pepper over a vanilla-tonka-incense base, basically indistinguishable in the drydown.",
    "Also matches Zimaya Al Embratur Elixir; a hair less refined than the original.",
    "Fragrantica + Parfumo + retailer listings naming Invictus Victory Elixir.",
    1,0,[AR+"Tag-Him-Uomo-Rosso-90407.html","https://www.parfumo.com/Perfumes/Armaf/tag-him-uomo-rosso"])
rel("Armaf|Aura Fresh","Versace|Eau Fraiche","INSPIRED_BY",
    0.72,0.74,0.70,0.68,0.68,0.55,
    "A close Versace Eau Fraiche clone — star-fruit/lemon/bergamot over sage-pepper with a woody-saffron base (with Dylan Blue / Sauvage-freshness facets).",
    "A budget reading of Eau Fraiche; moderate longevity.",
    "Fragrantica + Vivir + retailer naming Versace Eau Fraiche.",
    0,0,[AR+"Aura-Fresh-84603.html","https://vivir.com/article/armaf-aura-fresh-review"])

if __name__ == "__main__":
    rep = b1.build_kb(
        extra_target_groups=[
            ("Rayhaan","AE",b2.RAYHAAN,2), ("Rasasi","AE",b2.RASASI,2),
            ("Arabiyat Prestige","AE",b3.ARAB,3),
            ("Arabiyat Prestige","AE",b4.ARAB4,4), ("French Avenue","AE",b4.FA4,4),
            ("French Avenue","AE",b5.FA5,5), ("Aromatix × French Avenue","AE",b5.AROMATIX,5),
            ("Armaf","AE",ARMAF,6),
        ],
        extra_refs=b2.REFS2 + b3.REFS3 + b4.REFS4 + b5.REFS5 + REFS6,
        extra_rels=b2.R2 + b3.R3 + b4.R4 + b5.R5 + R6,
        batch_no=6,
        brands_covered=["Afnan","Lattafa","Rayhaan","Rasasi","Arabiyat Prestige",
                        "French Avenue","Aromatix × French Avenue","Armaf"],
        report_name="coverage_report_batch6.json",
    )
    print(json.dumps(rep, indent=2, ensure_ascii=False))
