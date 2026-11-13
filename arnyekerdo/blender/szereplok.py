# Shinobi – szereplők receptjei a gyar.py-hoz. © 2026 Mom’s Couch Studios. Minden jog fenntartva.
# Használat Blenderben (a gyar.py betöltése után): exec(open(r"...\szereplok.py",encoding="utf-8").read()); build("testor")
BOOTS="toigo_ankle_boots_male"
def base(P,mac,skin,hair,clothes,hairmode=('keep',)):
    clear();human(P,mac,skin,hair,clothes)
    return obj(P,clothes[0])

def finish(P,cl,clothes_target=4200,hairmode=('keep',)):
    body_mats(P,hairmode)
    slim(cl,clothes_target);slim(obj(P,BOOTS),900)
    b=obj(P,BOOTS)
    if b: b.data.materials.clear();b.data.materials.append(M("G_"+P+"_cipo",(0.03,0.03,0.035),0.45))

SUITDARK=('dark',0.42,0.42)
def build(name):
    P=name.capitalize()
    if name=="testor" or name.startswith("testor_") and name in ("testor_fesztival","testor_templom"):
        cl=base(P,macro(age=0.45,muscle=0.72,weight=0.6,height=0.65),"middleage_asian_male","short04",["toigo_male_suit_3",BOOTS])
        retex(cl,P+"_ruha",SUITDARK,1024,0.8)
        if name=="testor_templom": headband(P,(0.94,0.92,0.88))
        else: sunglasses(P)
        if name=="testor_fesztival": armband(P,(0.72,0.1,0.08))
        finish(P,cl)
    elif name=="testor_kikoto":
        cl=base(P,macro(age=0.45,muscle=0.7,weight=0.62),"middleage_asian_male","short01",["male_casualsuit05",BOOTS])
        retex(cl,P+"_ruha",('lum',(0.16,0.17,0.2)),1024,0.9)
        vest(P,cl,col=(0.95,0.45,0.08),band=(0.9,0.9,0.86),off=0.02)
        dome(P,"sisak",(0.95,0.78,0.12),0.03,scale=1.08,brim=0.02)
        finish(P,cl)
    elif name=="testor_fogado":
        cl=base(P,macro(age=0.5,muscle=0.66,weight=0.62),"middleage_asian_male","short01",["male_casualsuit05",BOOTS])
        retex(cl,P+"_ruha",('lum',(0.2,0.24,0.2)),1024,0.9)
        dome(P,"kotott",(0.2,0.24,0.34),0.03,scale=1.02,pom=(0.9,0.88,0.84))
        scarf(P,(0.62,0.14,0.12))
        finish(P,cl)
    elif name=="kuroda":
        cl=base(P,macro(age=0.82,muscle=0.4,weight=0.68,height=0.55),"old_asian_male","short02",["toigo_male_suit_tie_and_jacket",BOOTS])
        retex(cl,P+"_ruha",('keep',),1024,0.8)
        finish(P,cl,hairmode=('lum',(0.55,0.55,0.55)))
    elif name in ("mori","vip_roka"):
        cl=base(P,macro(age=0.62,muscle=0.45,weight=0.55,height=0.58),"middleage_asian_male","short03",["toigo_male_double-breasted_suit",BOOTS])
        retex(cl,P+"_ruha",('keep',),1024,0.8)
        if name=="vip_roka": fox_mask(P)
        finish(P,cl)
    elif name=="kalauz":
        cl=base(P,macro(age=0.55,muscle=0.5,weight=0.6),"middleage_asian_male","short02",["male_casualsuit01",BOOTS])
        retex(cl,P+"_ruha",('lum',(0.12,0.15,0.26)),1024,0.85)
        peaked_cap(P,(0.08,0.1,0.2),(0.5,0.1,0.1),(0.75,0.6,0.25))
        belt(P,cl,holster=False,radio=False)
        finish(P,cl)
    elif name=="tanitvany":
        cl=base(P,macro(age=0.22,muscle=0.62,weight=0.45,height=0.6),"young_asian_male","short01",["male_casualsuit01",BOOTS])
        retex(cl,P+"_ruha",('lum',(0.17,0.18,0.33)),1024,0.9)
        headband(P,(0.94,0.92,0.88))
        finish(P,cl)
    elif name=="mester":
        cl=base(P,macro(age=0.97,muscle=0.3,weight=0.42,height=0.48),"old_asian_male","short02",["male_casualsuit05",BOOTS])
        retex(cl,P+"_ruha",('lum',(0.42,0.4,0.36)),1024,0.9)
        finish(P,cl,hairmode=('lum',(0.9,0.9,0.88)))
    elif name=="naruse":
        cl=base(P,macro(age=0.66,muscle=0.66,weight=0.52,height=0.68),"middleage_asian_male","ponytail01",["toigo_male_suit_3",BOOTS])
        retex(cl,P+"_ruha",('dark',0.3,0.5),1024,0.8)
        finish(P,cl,hairmode=('lum',(0.12,0.11,0.1)))
    elif name=="civil_a":
        cl=base(P,macro(age=0.3,muscle=0.5,weight=0.5,height=0.55),"young_asian_male","short03",["male_casualsuit03",BOOTS])
        retex(cl,P+"_ruha",('keep',),1024,0.85)
        finish(P,cl)
    elif name=="civil_b":
        cl=base(P,macro(age=0.55,muscle=0.4,weight=0.65,height=0.5),"middleage_asian_male","short02",["male_casualsuit02",BOOTS])
        retex(cl,P+"_ruha",('keep',),1024,0.85)
        finish(P,cl)
    elif name=="konyvelo":
        cl=base(P,macro(age=0.6,muscle=0.3,weight=0.6,height=0.45),"middleage_asian_male","short02",["male_elegantsuit01",BOOTS])
        retex(cl,P+"_ruha",('mul',(0.85,0.85,0.9)),1024,0.85)
        sunglasses(P)
        finish(P,cl)
    else: raise ValueError(name)
    t=tris(P);sz=export(P,name);preview(name)
    return {"name":name,"tris":t,"bytes":sz}
