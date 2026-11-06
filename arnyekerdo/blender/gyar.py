# Shinobi – szereplőgyár Blenderhez (MPFB 2 bővítménnyel). © 2026 Fejes Géza. Minden jog fenntartva.
# Betöltés Blenderben: exec(open(r"...\gyar.py",encoding="utf-8").read()) ; utána a lenti függvények hívhatók.
# A szereplők receptjei a szereplok.py-ban vannak.
import bpy,os,glob,importlib,bmesh,math
import numpy as np
from mathutils import Vector,Matrix
HS=importlib.import_module("bl_ext.blender_org.mpfb.services.humanservice").HumanService
LS=importlib.import_module("bl_ext.blender_org.mpfb.services.locationservice").LocationService
U=LS.get_user_data()
OUT=os.path.join(os.path.expanduser("~"),"Documents","Shinobi-karakterek")
TEX=os.path.join(OUT,"tex");os.makedirs(TEX,exist_ok=True)

def clear():
    for o in list(bpy.data.objects):
        if o.name not in ("Kamera","Nap"): bpy.data.objects.remove(o,do_unlink=True)
    for coll in (bpy.data.meshes,bpy.data.armatures,bpy.data.materials,bpy.data.images):
        for x in list(coll):
            if x.users==0: coll.remove(x)

def lin(c): return tuple(((x+0.055)/1.055)**2.4 if x>0.04045 else x/12.92 for x in c)

def M(name,col,rough=0.7,img=None,alpha=False,metal=0.0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree
    for n in list(nt.nodes):
        if n.type not in ('OUTPUT_MATERIAL','BSDF_PRINCIPLED'): nt.nodes.remove(n)
    b=nt.nodes["Principled BSDF"];b.inputs["Roughness"].default_value=rough;b.inputs["Metallic"].default_value=metal
    b.inputs["Base Color"].default_value=(*lin(col),1)
    if img:
        t=nt.nodes.new('ShaderNodeTexImage');t.image=img;nt.links.new(t.outputs["Color"],b.inputs["Base Color"])
        if alpha: nt.links.new(t.outputs["Alpha"],b.inputs["Alpha"])
    return m

def human(P,macro,skin,hair,clothes,brow="eyebrow001"):
    bm=HS.create_human(scale=0.1,macro_detail_dict=macro);bm.name=P
    rig=HS.add_builtin_rig(bm,"game_engine");rig.name=P+".rig"
    f=lambda sub,n,e: glob.glob(os.path.join(U,sub,n,"*."+e))[0]
    lst=[("proxymeshes","male1591","Proxymeshes"),("eyes","low-poly","Eyes"),("eyebrows",brow,"Eyebrows")]
    if hair: lst.append(("hair",hair,"Hair"))
    lst+=[("clothes",c,"Clothes") for c in clothes]
    for sub,n,typ in lst:
        HS.add_mhclo_asset(f(sub,n,"proxy" if sub=="proxymeshes" else "mhclo"),bm,asset_type=typ,subdiv_levels=0,material_type='MAKESKIN')
    HS.set_character_skin(glob.glob(os.path.join(U,"skins",skin,"*.mhmat"))[0],bm,skin_type='GAMEENGINE')
    bm.hide_render=True;bm.hide_viewport=True
    return bm,rig

def obj(P,suffix):
    for o in bpy.data.objects:
        if o.name.startswith(P+".") and suffix in o.name and o.type=='MESH': return o

def difimg(o):
    best=None
    for m in o.data.materials:
        if not m or not m.node_tree: continue
        for n in m.node_tree.nodes:
            if n.type=='TEX_IMAGE' and n.image:
                nm=n.image.name.lower()
                if any(k in nm for k in ('norm','_ao','spec','bump')): continue
                best=n.image
    return best

def px(img):
    a=np.empty(img.size[0]*img.size[1]*4,dtype=np.float32);img.pixels.foreach_get(a);return a.reshape(img.size[1],img.size[0],4)

def retex(o,name,mode=('keep',),size=1024,rough=0.85,alpha=False,fmt=None):
    """Egyszerű, játékba való anyag egyetlen, kicsinyített színképpel.
    mode: ('keep',) eredeti | ('lum',(r,g,b)) átszínezés a világosság megtartásával | ('mul',(r,g,b)) szorzás"""
    src=difimg(o)
    if src is None:
        o.data.materials.clear();o.data.materials.append(M("G_"+name,mode[1] if len(mode)>1 else (0.1,0.1,0.1),rough));return
    A=px(src);h,w=A.shape[:2]
    if mode[0]=='lum':
        lum=0.3*A[...,0]+0.59*A[...,1]+0.11*A[...,2];v=lum[A[...,3]>0.5];p=np.percentile(v,70) if v.size else 1.0
        lum=np.clip(lum/max(p,1e-3),0,1.6);c=np.array(mode[1])
        for i in range(3): A[...,i]=np.clip(c[i]*(0.5+0.5*lum),0,1)
    elif mode[0]=='dark':
        lum=0.3*A[...,0]+0.59*A[...,1]+0.11*A[...,2];f=np.where(lum<mode[2],mode[1],1.0)
        for i in range(3): A[...,i]=np.clip(A[...,i]*f,0,1)
    elif mode[0]=='mul':
        for i in range(3): A[...,i]=np.clip(A[...,i]*mode[1][i],0,1)
    k=max(1,w//size)
    if k>1: A=A[:h//k*k,:w//k*k].reshape(h//k,k,w//k,k,4).mean(axis=(1,3))
    im=bpy.data.images.new("g_"+name,A.shape[1],A.shape[0],alpha=True);im.pixels.foreach_set(A.ravel())
    fmt=fmt or ('PNG' if alpha else 'JPEG')
    im.filepath_raw=os.path.join(TEX,"g_"+name+(".png" if fmt=='PNG' else ".jpg"));im.file_format=fmt;im.save()
    o.data.materials.clear();o.data.materials.append(M("G_"+name,(1,1,1),rough,im,alpha))

def evalpts(o):
    dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg);m=e.to_mesh();P=[o.matrix_world@v.co for v in m.vertices];e.to_mesh_clear();return P

def headinfo(P):
    pts=evalpts(obj(P,"male1591"))
    hp=[p for p in pts if p.z>1.45 and abs(p.x)<0.13 and p.y<0.12]
    top=max(p.z for p in hp)
    br=obj(P,"eyebrow");bz=max(p.z for p in evalpts(br)) if br else top-0.1
    hh=[p for p in hp if bz+0.012<p.z<top]
    mny=min(p.y for p in hh);mxy=max(p.y for p in hh);rx=max(abs(p.x) for p in hh)
    return dict(top=top,brow=bz,cy=(mny+mxy)/2,rx=rx,ry=(mxy-mny)/2,front=mny)

def hairobj(P):
    for k in ("short","long","ponytail","bob","braid","afro"):
        o=obj(P,k)
        if o: return o

def cut_hair(P,z):
    hr=hairobj(P)
    if not hr: return
    w=hr.matrix_world;bm=bmesh.new();bm.from_mesh(hr.data)
    bmesh.ops.delete(bm,geom=[v for v in bm.verts if (w@v.co).z>z],context='VERTS');bm.to_mesh(hr.data);bm.free()

def bone_parent(o,P,bone):
    rig=bpy.data.objects[P+".rig"];m0=o.matrix_world.copy();o.parent=rig;o.parent_type='BONE';o.parent_bone=bone;o.matrix_world=m0

def join(parts,name):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:p.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();o=bpy.context.active_object;o.name=name
    for p in o.data.polygons:p.use_smooth=True
    return o

def peaked_cap(P,crown,band,badge):
    """Ellenzős sapka (rendőr, kalauz)."""
    H=headinfo(P);cx=0.0;cy=H['cy']-0.006;rx=H['rx']+0.013;ry=H['ry']+0.016
    Z0=H['brow']+0.015;ZB=Z0+0.034;ZT=H['top']+0.004
    MC=M("G_"+P+"_korona",crown,0.7);MB=M("G_"+P+"_szalag",band,0.3);MG=M("G_"+P+"_jelveny",badge,0.35,metal=0.6)
    bm=bmesh.new();N=32
    def ell(z,sx,sy,dy=0.0,tilt=0.0): return [bm.verts.new((cx+sx*math.cos(2*math.pi*i/N),cy+dy+sy*math.sin(2*math.pi*i/N),z-tilt*math.sin(2*math.pi*i/N))) for i in range(N)]
    def br(a,b,mi):
        for i in range(N): bm.faces.new((a[i],a[(i+1)%N],b[(i+1)%N],b[i])).material_index=mi
    r0=ell(Z0,rx,ry);r1=ell(ZB,rx,ry);br(r0,r1,1)
    r2=ell(ZB+0.014,rx*1.07,ry*1.07,-0.004,0.006);br(r1,r2,0)
    r3=ell(ZT,rx*1.13,ry*1.12,-0.01,0.01);br(r2,r3,0)
    r4=ell(ZT+0.005,rx*0.98,ry*0.97,-0.01,0.01);br(r3,r4,0)
    c=bm.verts.new((cx,cy-0.01,ZT+0.007))
    for i in range(N): bm.faces.new((r4[i],r4[(i+1)%N],c)).material_index=0
    K=16;T=0.005;inner=[];outer=[]
    for i in range(K+1):
        a=math.pi+math.pi*i/K;k=math.sin(math.pi*i/K)
        inner.append(Vector((cx+rx*math.cos(a),cy+ry*math.sin(a),Z0+0.002)))
        outer.append(Vector((cx+rx*1.04*math.cos(a),cy+ry*math.sin(a)-0.05*k,Z0-0.017*k+0.002)))
    it=[bm.verts.new(p+Vector((0,0,T))) for p in inner];ot=[bm.verts.new(p+Vector((0,0,T))) for p in outer]
    ib=[bm.verts.new(p) for p in inner];ob=[bm.verts.new(p) for p in outer]
    for i in range(K):
        for q in ((it[i],it[i+1],ot[i+1],ot[i]),(ib[i],ob[i],ob[i+1],ib[i+1]),(ot[i],ot[i+1],ob[i+1],ob[i])): bm.faces.new(q).material_index=1
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    me=bpy.data.meshes.new(P+"_sapka");bm.to_mesh(me);bm.free()
    for m in (MC,MB,MG):me.materials.append(m)
    cap=bpy.data.objects.new(P+".sapka",me);bpy.context.collection.objects.link(cap)
    bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=0.012,depth=0.004,location=(cx,cy-ry*1.08-0.005,ZB+0.018),rotation=(math.radians(76),0,0))
    b=bpy.context.active_object;b.data.materials.clear();b.data.materials.append(MG)
    cap=join([cap,b],P+".sapka");cut_hair(P,Z0+0.012);bone_parent(cap,P,'head');return cap

def dome(P,name,col,lo,scale=1.0,brim=0.0,brimcol=None,pom=None):
    """Kupola-fejfedő: védősisak (brim), kötött sapka (pom)."""
    H=headinfo(P);cy=H['cy']-0.004;rx=(H['rx']+0.014)*scale;ry=(H['ry']+0.016)*scale;Z0=H['brow']+lo
    hgt=H['top']-Z0+0.02
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=1,location=(0,cy,Z0))
    o=bpy.context.active_object;o.scale=(rx,ry,hgt);bpy.ops.object.transform_apply(scale=True)
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<-0.001],context='VERTS');bm.to_mesh(o.data);bm.free()
    o.data.materials.clear();o.data.materials.append(M("G_"+P+"_"+name,col,0.8));parts=[o]
    if brim>0:
        bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=1,depth=0.008,location=(0,cy-0.006,Z0+0.004))
        b=bpy.context.active_object;b.scale=(rx+brim,ry+brim*1.3,1);bpy.ops.object.transform_apply(scale=True)
        b.data.materials.clear();b.data.materials.append(M("G_"+P+"_"+name+"k",brimcol or col,0.6));parts.append(b)
    if pom:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=0.035,location=(0,cy,Z0+hgt+0.015))
        b=bpy.context.active_object;b.data.materials.clear();b.data.materials.append(M("G_"+P+"_pom",pom,0.9));parts.append(b)
    o=join(parts,P+"."+name);cut_hair(P,Z0+0.01);bone_parent(o,P,'head');return o

def headband(P,col,lo=0.025,width=0.03):
    H=headinfo(P);z=H['brow']+lo
    bpy.ops.mesh.primitive_cylinder_add(vertices=28,radius=1,depth=width,location=(0,H['cy'],z),end_fill_type='NOTHING')
    o=bpy.context.active_object;o.scale=(H['rx']+0.012,H['ry']+0.014,1);bpy.ops.object.transform_apply(scale=True)
    o.data.materials.clear();o.data.materials.append(M("G_"+P+"_fejpant",col,0.8));o.name=P+".fejpant"
    sm=o.modifiers.new("S",'SOLIDIFY');sm.thickness=0.005
    with bpy.context.temp_override(object=o): bpy.ops.object.modifier_apply(modifier="S")
    for p in o.data.polygons:p.use_smooth=True
    bone_parent(o,P,'head');return o

def vest(P,cl,col=(0.75,0.85,0.18),band=(0.92,0.93,0.92),z0=1.01,z1=1.40,xw=0.165,off=0.012):
    v=cl.copy();v.data=cl.data.copy();v.name=P+".melleny";bpy.context.collection.objects.link(v)
    for mo in list(v.modifiers):
        if mo.type!='ARMATURE': v.modifiers.remove(mo)
    me=v.data;mw=v.matrix_world;inv=mw.inverted();bm=bmesh.new();bm.from_mesh(me)
    keep=set(f for f in bm.faces if z0-0.02<(mw@f.calc_center_median()).z<z1+0.03 and abs((mw@f.calc_center_median()).x)<xw+0.02)
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if f not in keep],context='FACES')
    for vv in bm.verts: vv.co+=vv.normal*off
    def cut(co,no):
        g=bm.verts[:]+bm.edges[:]+bm.faces[:];bmesh.ops.bisect_plane(bm,geom=g,plane_co=inv@Vector(co),plane_no=(inv.to_3x3()@Vector(no)).normalized(),clear_outer=True)
    cut((0,0,z1),(0,0,1));cut((0,0,z0),(0,0,-1));cut((xw,0,0),(1,0,0));cut((-xw,0,0),(-1,0,0))
    bands=[(z0+0.10,z0+0.13),(z0+0.30,z0+0.33)]
    for a,b in bands:
        for z in (a,b):
            g=bm.verts[:]+bm.edges[:]+bm.faces[:];bmesh.ops.bisect_plane(bm,geom=g,plane_co=inv@Vector((0,0,z)),plane_no=(0,0,1))
    bm.to_mesh(me);bm.free()
    me.materials.clear();me.materials.append(M("G_"+P+"_mell",col,0.6));me.materials.append(M("G_"+P+"_csik",band,0.4))
    for p in me.polygons:
        z=(mw@p.center).z;p.material_index=1 if any(a<z<b for a,b in bands) else 0
    d=v.modifiers.new("K",'DECIMATE');d.decimate_type='DISSOLVE';d.angle_limit=0.12;d.delimit={'MATERIAL','SEAM','UV'}
    with bpy.context.temp_override(object=v): bpy.ops.object.modifier_move_to_index(modifier="K",index=0)
    return v

def belt(P,cl,holster=True,radio=True,col=(0.03,0.03,0.035)):
    pts=[p for p in evalpts(cl) if abs(p.z-0.98)<0.015]
    if not pts: return
    xr=max(abs(p.x) for p in pts);yf=min(p.y for p in pts);yb=max(p.y for p in pts);mat=M("G_"+P+"_ov",col,0.5);parts=[]
    bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=1,depth=0.04,location=(0,(yf+yb)/2,0.985));o=bpy.context.active_object;o.scale=(xr+0.008,(yb-yf)/2+0.008,1);bpy.ops.object.transform_apply(scale=True);parts.append(o)
    def box(loc,sc):
        bpy.ops.mesh.primitive_cube_add(size=1,location=loc);b=bpy.context.active_object;b.scale=sc;bpy.ops.object.transform_apply(scale=True);parts.append(b)
    if holster: box((-(xr+0.02),(yf+yb)/2+0.01,0.94),(0.045,0.085,0.15))
    if radio: box((xr+0.015,(yf+yb)/2-0.03,0.96),(0.035,0.06,0.10))
    for p in parts: p.data.materials.clear();p.data.materials.append(mat)
    o=join(parts,P+".ov");bone_parent(o,P,'pelvis');return o

def fox_mask(P):
    """Fehér rókamaszk vörös jelekkel, felálló fülekkel."""
    H=headinfo(P);cy=H['front'];fz=H['brow']-0.01
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=(0,cy+0.07,fz))
    o=bpy.context.active_object;o.scale=(H['rx']+0.012,0.085,0.115);bpy.ops.object.transform_apply(scale=True)
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.y>-0.03],context='VERTS')
    for v in bm.verts:
        if v.co.z<-0.02: v.co.y-=0.06*min(1,(-v.co.z-0.02)/0.08)*max(0,1-abs(v.co.x)/0.05)
    bm.to_mesh(o.data);bm.free()
    W=M("G_"+P+"_roka",(0.96,0.94,0.9),0.5);Rr=M("G_"+P+"_rokapiros",(0.78,0.08,0.06),0.5);Bk=M("G_"+P+"_rokafek",(0.05,0.04,0.04),0.5)
    o.data.materials.clear();o.data.materials.append(W);o.data.materials.append(Rr);o.data.materials.append(Bk)
    for p in o.data.polygons:
        x,y,z=p.center
        if abs(z-0.025)<0.018 and 0.015<abs(x)<0.06: p.material_index=2
        elif 0.035<z<0.07 and abs(x)<0.05: p.material_index=1
        elif z<-0.07 and abs(x)<0.02: p.material_index=2
    parts=[o]
    for s in (-1,1):
        bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=0.035,depth=0.08,location=(s*0.06,cy+0.05,H['top']-0.01),rotation=(math.radians(-10),s*math.radians(14),0))
        e=bpy.context.active_object;e.data.materials.clear();e.data.materials.append(Rr);parts.append(e)
    o=join(parts,P+".maszk");bone_parent(o,P,'head');return o

def sunglasses(P):
    H=headinfo(P);y=H['front']+0.006;z=H['brow']-0.022;parts=[]
    for s in (-1,1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=0.021,depth=0.004,location=(s*0.033,y-0.006,z),rotation=(math.radians(90),0,0));parts.append(bpy.context.active_object)
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,y-0.006,z+0.008));b=bpy.context.active_object;b.scale=(0.11,0.004,0.004);bpy.ops.object.transform_apply(scale=True);parts.append(b)
    m=M("G_"+P+"_szemuveg",(0.02,0.02,0.025),0.1,metal=0.3)
    for p in parts:p.data.materials.clear();p.data.materials.append(m)
    o=join(parts,P+".szemuveg");bone_parent(o,P,'head');return o

def armband(P,col):
    rig=bpy.data.objects[P+".rig"];b=rig.data.bones['upperarm_l'];h=rig.matrix_world@b.head_local;t=rig.matrix_world@b.tail_local
    c=h.lerp(t,0.45);d=(t-h).normalized()
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=0.056,depth=0.06,location=c,end_fill_type='NOTHING')
    o=bpy.context.active_object;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();o.data.materials.clear();o.data.materials.append(M("G_"+P+"_karszalag",col,0.7));o.name=P+".karszalag"
    bone_parent(o,P,'upperarm_l');return o

def scarf(P,col):
    rig=bpy.data.objects[P+".rig"];n=rig.matrix_world@rig.data.bones['neck_01'].head_local
    bpy.ops.mesh.primitive_torus_add(major_radius=0.072,minor_radius=0.03,major_segments=20,minor_segments=8,location=(n.x,n.y-0.005,n.z+0.01))
    o=bpy.context.active_object;o.scale=(1.0,1.1,0.8);bpy.ops.object.transform_apply(scale=True)
    bpy.ops.mesh.primitive_cube_add(size=1,location=(n.x+0.05,n.y-0.095,n.z-0.11));t=bpy.context.active_object;t.scale=(0.06,0.02,0.2);t.rotation_euler=(0,0.1,0);bpy.ops.object.transform_apply(scale=True,rotation=True)
    m=M("G_"+P+"_sal",col,0.9)
    for p in (o,t):p.data.materials.clear();p.data.materials.append(m)
    o=join([o,t],P+".sal");bone_parent(o,P,'neck_01');return o

def decimate(P,decim):
    for suf,r in decim.items():
        o=obj(P,suf)
        if o and "K" not in o.modifiers:
            d=o.modifiers.new("K",'DECIMATE');d.ratio=r;d.use_collapse_triangulate=True
            with bpy.context.temp_override(object=o): bpy.ops.object.modifier_move_to_index(modifier="K",index=0)

def body_mats(P,hairmode=('keep',)):
    retex(obj(P,"male1591"),P+"_bor",('keep',),1024,0.7)
    retex(obj(P,"low-poly"),P+"_szem",('keep',),256,0.3)
    br=obj(P,"eyebrow")
    if br: retex(br,P+"_szemold",hairmode,256,0.8,alpha=True)
    h=hairobj(P)
    if h: retex(h,P+"_haj",hairmode,512,0.8,alpha=True)

def tris(P):
    dg=bpy.context.evaluated_depsgraph_get();t=0
    for o in bpy.data.objects:
        if o.type=='MESH' and not o.hide_render and o.name.startswith(P+"."):
            e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles();t+=len(m.loop_triangles);e.to_mesh_clear()
    return t

def export(P,fname):
    bpy.ops.object.select_all(action='DESELECT');rig=bpy.data.objects[P+".rig"];rig.select_set(True)
    for o in bpy.data.objects:
        if o.type=='MESH' and not o.hide_render and o.name.startswith(P+"."): o.select_set(True)
    bpy.context.view_layer.objects.active=rig
    p=os.path.join(OUT,fname+".glb")
    bpy.ops.export_scene.gltf(filepath=p,export_format='GLB',use_selection=True,export_apply=True,export_skins=True,export_animations=False,export_morph=False,export_image_format='AUTO',export_jpeg_quality=80,export_yup=True,export_tangents=False,export_def_bones=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,fname+".blend"),copy=True)
    return os.path.getsize(p)

def preview(fname,zoom=False):
    cam=bpy.data.objects["Kamera"]
    if zoom: cam.location=(0.55,-0.95,1.72);cam.rotation_euler=(math.radians(88),0,math.radians(30));cam.data.lens=60
    else: cam.location=(1.6,-2.9,1.0);cam.rotation_euler=(math.radians(90),0,math.radians(29));cam.data.lens=40
    sc=bpy.context.scene;sc.render.resolution_x=560;sc.render.resolution_y=800;sc.render.image_settings.file_format='JPEG'
    os.makedirs(os.path.join(OUT,"elonezet"),exist_ok=True)
    sc.render.filepath=os.path.join(OUT,"elonezet",fname+("_fej" if zoom else "")+".jpg")
    bpy.ops.render.render(write_still=True)

def macro(gender=1.0,age=0.5,muscle=0.55,weight=0.55,height=0.6,prop=0.7,asian=0.85):
    return {'gender':gender,'age':age,'muscle':muscle,'weight':weight,'height':height,'proportions':prop,'cupsize':0.5,'firmness':0.5,'race':{'african':0.0,'asian':asian,'caucasian':1-asian}}

def otris(o):
    dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg);m=e.to_mesh();m.calc_loop_triangles();n=len(m.loop_triangles);e.to_mesh_clear();return n

def slim(o,target):
    """Collapse-könnyítés a célzott háromszögszámra (a csontsúlyok megmaradnak)."""
    if not o: return
    n=otris(o)
    if n<=target: return
    d=o.modifiers.new("K",'DECIMATE');d.ratio=target/n;d.use_collapse_triangulate=True
    with bpy.context.temp_override(object=o): bpy.ops.object.modifier_move_to_index(modifier="K",index=0)
