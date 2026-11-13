# Shinobi – a játékos kézben tartott eszközei (első személyű nézet). © 2026 Mom’s Couch Studios. Minden jog fenntartva.
# A gyar.py betöltése után: build_fegyverek() → fegyverek.glb (tanto, tekko, kampo, kampo_bal, shuriken, fukiya, fust)
# Koordináták: Blenderben készül, a glTF-ben a játék kézkeretébe kerül: origó = az ököl közepe,
# előre (a penge iránya) = Blender +Y (three −Z), fel = Blender +Z (three +Y).

def build_fegyverek():
    import bpy,bmesh,math,os
    import numpy as np
    from mathutils import Vector,Matrix
    clear()
    def mat(name,col,rough=0.5,metal=0.0,img=None):
        m=M("W_"+name,col,rough,img,metal=metal);return m
    STEEL=mat("acel",(0.78,0.8,0.82),0.22,1.0);HAMON=mat("hamon",(0.93,0.94,0.95),0.15,1.0)
    IRON=mat("vas",(0.22,0.22,0.23),0.45,0.9);BRASS=mat("sargarez",(0.72,0.55,0.25),0.3,1.0)
    BLACK=mat("lakk",(0.04,0.035,0.03),0.25);ROPE=mat("kotel",(0.55,0.45,0.3),0.95);WOOD=mat("fa",(0.36,0.24,0.14),0.7)
    BAMBOO=mat("bambusz",(0.72,0.64,0.36),0.6);NODE=mat("bambuszgyuru",(0.45,0.38,0.18),0.6);CLAY=mat("agyag",(0.2,0.18,0.16),0.9);PAPER=mat("papir",(0.85,0.8,0.66),0.9)
    # markolatfonat (tsukaito) kép: sötét zsinór rombuszai fehér rájabőrön
    W,H=64,256;A=np.zeros((H,W,4),dtype=np.float32)
    for y in range(H):
        for x in range(W):
            u=(x/W)*2-1;v=(y%32)/32*2-1;d=abs(u)+abs(v)
            if d<0.55: c=(0.88,0.86,0.8)       # rájabőr a rombusz közepén
            else: c=(0.06,0.05,0.07) if (x+y)%7 else (0.12,0.1,0.13)
            A[y,x]=(*c,1)
    im=bpy.data.images.new("w_tsukaito",W,H);im.pixels.foreach_set(A.ravel())
    im.filepath_raw=os.path.join(TEX,"w_tsukaito.png");im.file_format='PNG';im.save()
    ITO=M("W_tsukaito",(1,1,1),0.8,im)
    objs={}
    def done(parts,name):
        o=join(parts,name);objs[name]=o;return o
    def add(prim,m,loc=(0,0,0),rot=(0,0,0),scale=(1,1,1),**kw):
        getattr(bpy.ops.mesh,prim)(location=loc,rotation=rot,**kw);o=bpy.context.active_object;o.scale=scale
        bpy.ops.object.transform_apply(location=False,rotation=True,scale=True);o.data.materials.clear();o.data.materials.append(m);return o
    R90=(math.radians(90),0,0)   # henger tengelye Y irányba
    # ---------- tantó ----------
    p=[]
    h=add('primitive_cylinder_add',ITO,(0,0.02,0.005),R90,(1,1,0.8),vertices=16,radius=0.015,depth=0.11)
    # UV: a fonat a henger hosszában ismétlődjön
    for l in h.data.uv_layers[0].data: l.uv=(l.uv[0],l.uv[1]*3)
    p.append(h)
    p.append(add('primitive_cylinder_add',BRASS,(0,-0.038,0.005),R90,(1,1,0.8),vertices=16,radius=0.0158,depth=0.012))   # kashira
    p.append(add('primitive_cylinder_add',BRASS,(0,0.078,0.005),R90,(1,1,0.8),vertices=16,radius=0.0158,depth=0.008))    # fuchi
    p.append(add('primitive_cylinder_add',IRON,(0,0.086,0.005),R90,(1.25,1,1.05),vertices=24,radius=0.026,depth=0.005))  # tsuba
    p.append(add('primitive_cube_add',BRASS,(0,0.094,0.006),scale=(0.007,0.012,0.022),size=1))                          # habaki
    # penge: enyhe ívű, a gerinc felül vastagabb, az él alul vékony; a hegy (kissaki) ferdén vágott
    bm=bmesh.new();L=0.29;N=24;prof=[]
    for i in range(N+1):
        t=i/N;y=0.1+t*L;wid=0.024-0.006*t;sori=0.008*(t**2)
        if t>0.86: wid*= max(0.0,(1-t)/0.14)**0.8
        zt=0.006+sori+0.003;zb=zt-wid
        ring=[(0.0024,y,zt),(0.0028,y,zt-wid*0.35),(0.0004,y,zb),(-0.0004,y,zb),(-0.0028,y,zt-wid*0.35),(-0.0024,y,zt)]
        prof.append([bm.verts.new(c) for c in ring])
    for i in range(N):
        a,b=prof[i],prof[i+1]
        for k in range(6):
            f=bm.faces.new((a[k],a[(k+1)%6],b[(k+1)%6],b[k]));f.material_index=1 if k in (1,2,3) else 0
    bm.faces.new(list(reversed(prof[0])))
    tip=bm.verts.new((0,0.1+L+0.012,0.006+0.008+0.002));[bm.faces.new((prof[N][k],prof[N][(k+1)%6],tip)) for k in range(6)]
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    me=bpy.data.meshes.new("penge");bm.to_mesh(me);bm.free();me.materials.append(STEEL);me.materials.append(HAMON)
    bl=bpy.data.objects.new("penge",me);bpy.context.collection.objects.link(bl);p.append(bl)
    done(p,"tanto")
    # ---------- tekko: vaslemez a bütykökön négy tüskével, markolórúd ----------
    p=[add('primitive_cube_add',IRON,(0,0.035,0.014),scale=(0.09,0.03,0.026),size=1)]
    for i in range(4):
        p.append(add('primitive_cone_add',STEEL,(-0.033+i*0.022,0.058,0.016),(math.radians(-90),0,0),vertices=6,radius1=0.007,depth=0.024))
    p.append(add('primitive_cylinder_add',IRON,(0,0.0,-0.022),(0,math.radians(90),0),vertices=10,radius=0.007,depth=0.095))
    for s in (-1,1): p.append(add('primitive_cube_add',IRON,(s*0.045,0.018,-0.004),scale=(0.006,0.03,0.04),size=1))
    done(p,"tekko")
    # ---------- kampó (kaginawa): három horog egy gyűrűn, kötél ----------
    p=[add('primitive_cylinder_add',IRON,(0,0.02,0.012),R90,vertices=10,radius=0.009,depth=0.06)]
    p.append(add('primitive_torus_add',IRON,(0,-0.014,0.012),R90,major_radius=0.014,minor_radius=0.004,major_segments=14,minor_segments=6))
    for k in range(3):
        a=k*2*math.pi/3
        bpy.ops.mesh.primitive_torus_add(location=(0,0,0),major_radius=0.03,minor_radius=0.0045,major_segments=16,minor_segments=6)
        hk=bpy.context.active_object
        bm=bmesh.new();bm.from_mesh(hk.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.x<-0.004 and v.co.y<0.01],context='VERTS');bm.to_mesh(hk.data);bm.free()
        hk.rotation_euler=(0,math.radians(90),a);hk.location=(0.03*math.cos(a)*0.0,0.06,0.012);hk.location.x+=0.03*math.cos(a);hk.location.z+=0.03*math.sin(a)
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        hk.data.materials.clear();hk.data.materials.append(STEEL);p.append(hk)
    # kötél a kéz felé
    p.append(add('primitive_cylinder_add',ROPE,(0.008,-0.07,-0.02),(math.radians(60),0,0),vertices=8,radius=0.0045,depth=0.13))
    done(p,"kampo")
    p=[add('primitive_torus_add',ROPE,(0.02,0.0,0.012),(0.3,0.6,0),major_radius=0.06,minor_radius=0.012,major_segments=20,minor_segments=8)]
    p.append(add('primitive_torus_add',ROPE,(0.016,0.004,0.014),(0.45,0.5,0.2),major_radius=0.054,minor_radius=0.011,major_segments=20,minor_segments=8))
    done(p,"kampo_bal")
    # ---------- shuriken: négyágú csillag, középen lyuk ----------
    bm=bmesh.new();pts=[]
    for i in range(16):
        a=i*2*math.pi/16;r=0.055 if i%4==0 else (0.018 if i%4==2 else 0.024)
        pts.append((r*math.cos(a),0,r*math.sin(a)))
    top=[bm.verts.new((x,0.0015,z)) for x,y,z in pts];bot=[bm.verts.new((x,-0.0015,z)) for x,y,z in pts]
    bm.faces.new(top);bm.faces.new(list(reversed(bot)))
    for i in range(16): bm.faces.new((top[i],bot[i],bot[(i+1)%16],top[(i+1)%16]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);me=bpy.data.meshes.new("csillag");bm.to_mesh(me);bm.free();me.materials.append(STEEL)
    sh=bpy.data.objects.new("csillag",me);bpy.context.collection.objects.link(sh);sh.location=(0,0.065,0.03);sh.rotation_euler=(math.radians(-20),0,math.radians(15))
    bpy.ops.object.select_all(action='DESELECT');sh.select_set(True);bpy.context.view_layer.objects.active=sh;bpy.ops.object.transform_apply(location=True,rotation=True)
    done([sh,add('primitive_cylinder_add',BLACK,(0,0.065,0.03),(math.radians(70),0,0),vertices=10,radius=0.006,depth=0.0035)],"shuriken")
    # ---------- köpőcső: bambusz, csomókkal ----------
    p=[add('primitive_cylinder_add',BAMBOO,(-0.05,0.2,0.07),R90,vertices=12,radius=0.012,depth=0.62)]
    for y in (0.0,0.18,0.36):
        p.append(add('primitive_torus_add',NODE,(-0.05,y+0.02,0.07),R90,major_radius=0.0125,minor_radius=0.0028,major_segments=14,minor_segments=5))
    done(p,"fukiya")
    # ---------- füstbomba: égetett agyaggolyó, papírral bekötött kanóc ----------
    p=[add('primitive_uv_sphere_add',CLAY,(0,0.04,0.035),segments=16,ring_count=10,radius=0.036)]
    p.append(add('primitive_cylinder_add',PAPER,(0,0.04,0.073),vertices=10,radius=0.014,depth=0.014))
    p.append(add('primitive_cylinder_add',ROPE,(0.004,0.04,0.09),(0,0.3,0),vertices=6,radius=0.0025,depth=0.03))
    done(p,"fust")
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs.values(): o.select_set(True);o.matrix_world=Matrix.Identity(4) if False else o.matrix_world
    path=os.path.join(OUT,"fegyverek.glb")
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_apply=True,export_image_format='AUTO',export_yup=True)
    # előnézet: egymás mellett
    for i,(k,o) in enumerate(objs.items()): o.location=((i%4-1.5)*0.2,0,-(i//4)*0.18)
    cam=bpy.data.objects["Kamera"];cam.location=(0.25,-0.75,0.25);cam.rotation_euler=(math.radians(68),0,math.radians(20));cam.data.lens=30
    sc=bpy.context.scene;sc.render.resolution_x=800;sc.render.resolution_y=500;sc.render.image_settings.file_format='JPEG'
    sc.render.filepath=os.path.join(OUT,"elonezet","fegyverek.jpg");bpy.ops.render.render(write_still=True)
    return {"bytes":os.path.getsize(path),"objs":list(objs)}
