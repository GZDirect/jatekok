# Shinobi – a játékos saját keze (első személyű nézet). © 2026 Fejes Géza. Minden jog fenntartva.
# A gyar.py betöltése után: build_kez()  →  kez.glb (kez_jobb, kez_bal: ököl + alkar a ruhaujjal, csuklópólyával)
# A játék koordinátáiban: az ököl közepe az origó, az alkar a kamera felé (+z) és kissé lefelé fut, a kézhát felfelé néz.

def build_kez():
    import bpy,bmesh,math
    from mathutils import Vector,Matrix
    P="Kez";clear()
    human(P,macro(age=0.35,muscle=0.72,weight=0.45,height=0.6),"young_asian_male",None,["male_casualsuit01"])
    cl=obj(P,"male_casualsuit01");body=bpy.data.objects[P];body.hide_viewport=False;body.hide_render=False  # a részletes alaptest (külön ujjakkal), nem a könnyített
    retex(cl,P+"_ruha",('lum',(0.07,0.075,0.09)),512,0.95)
    retex(body,P+"_bor",('keep',),512,0.7)
    rig=bpy.data.objects[P+".rig"]
    # ujjak ökölbe (a csont saját x tengelye körül), hüvelykujj kevésbé
    bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='POSE')
    for pb in rig.pose.bones:
        n=pb.name
        if any(n.startswith(f) for f in ("index","middle","ring","pinky")):
            pb.rotation_mode='XYZ';pb.rotation_euler=(1.35 if "_01_" in n else 1.5,0,0)
        elif n.startswith("thumb"):
            pb.rotation_mode='XYZ';pb.rotation_euler=(0.5,0,0.3 if n.endswith("_l") else -0.3)
    bpy.ops.object.mode_set(mode='OBJECT')
    dg=bpy.context.evaluated_depsgraph_get()
    W=rig.matrix_world
    def bpos(name,tail=False):
        pb=rig.pose.bones[name];return W@(pb.tail if tail else pb.head)
    DBG=[];out=[];bones={b.name for b in rig.data.bones}
    for s in ("r","l"):
        keepg={"hand_"+s,"lowerarm_"+s}|{f"{f}_0{i}_{s}" for f in ("index","middle","ring","pinky","thumb") for i in (1,2,3)}
        parts=[]
        for src,mat in ((body,body.data.materials[0]),(cl,cl.data.materials[0])):
            e=src.evaluated_get(dg);me=bpy.data.meshes.new_from_object(e,depsgraph=dg)
            names={g.index:g.name for g in src.vertex_groups}
            bm=bmesh.new();bm.from_mesh(me);dl=bm.verts.layers.deform.active
            el=bpos("lowerarm_"+s);hd=bpos("hand_"+s)
            def ok(v):
                if dl is None: return False
                d=v[dl]
                if not d: return False
                its=[kv for kv in d.items() if names.get(kv[0]) in bones]
                if not its: return False
                gi=max(its,key=lambda kv:kv[1])[0]
                if names.get(gi) not in keepg: return False
                # az alkarból csak a csukló felőli ~26 cm
                p=src.matrix_world@v.co;ax=(el-hd);t=(p-hd).dot(ax.normalized())
                return t<0.26
            dead=[v for v in bm.verts if not ok(v)];DBG.append((src.name,len(bm.verts),len(dead)))
            bmesh.ops.delete(bm,geom=dead,context='VERTS')
            for v in bm.verts: v.co=src.matrix_world@v.co
            bm.to_mesh(me);bm.free()
            o=bpy.data.objects.new(P+"_"+s+"_"+src.name,me);bpy.context.collection.objects.link(o)
            o.data.materials.clear();o.data.materials.append(mat)
            for p in o.data.polygons:p.use_smooth=True
            parts.append(o)
        # csuklópólya (sötét szövet) a csukló körül
        hd=bpos("hand_"+s);el=bpos("lowerarm_"+s);ax=(el-hd).normalized()
        bpy.ops.mesh.primitive_cylinder_add(vertices=14,radius=0.036,depth=0.06,location=hd+ax*0.055)
        w=bpy.context.active_object;w.rotation_euler=ax.to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
        w.data.materials.clear();w.data.materials.append(M("G_"+P+"_polya",(0.18,0.17,0.16),0.95));parts.append(w)
        bpy.ops.object.select_all(action='DESELECT')
        for p in parts:p.select_set(True)
        bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();k=bpy.context.active_object;k.name="kez_"+("jobb" if s=="r" else "bal")
        # igazítás: markolási pont az origóba; alkar iránya és kézhát felfelé a játék szerint
        grip=hd.lerp(bpos("middle_01_"+s),0.75)
        fwd=(bpos("middle_01_"+s)-hd).normalized();lat=(bpos("index_01_"+s)-bpos("pinky_01_"+s)).normalized()
        back=fwd.cross(lat).normalized()
        if s=="l": back=-back
        # forrás bázis: e1 = alkar felé (könyök), e2 = kézhát
        e1=(el-hd).normalized();e2=(back-e1*back.dot(e1)).normalized();e3=e1.cross(e2)
        # cél (Blender-koordinátában; three (x,y,z) = Blender (x,-z?)): a three-beli (0,-0.39,0.92) könyökirány = Blender (0,-0.92,-0.39)
        t1=Vector((0,-0.92,-0.39)).normalized();t2=Vector((0,-0.39*0,1));t2=(t2-t1*t2.dot(t1)).normalized();t3=t1.cross(t2)
        S=Matrix((e1,e2,e3)).transposed();T=Matrix((t1,t2,t3)).transposed()
        R=(T@S.inverted()).to_4x4()
        k.data.transform(R@Matrix.Translation(-grip))
        k.matrix_world=Matrix.Identity(4)
        out.append(k)
    # a teljes test és a csontváz törlése, csak a két kéz marad
    for o in list(bpy.data.objects):
        if o not in out and o.name not in ("Kamera","Nap"): bpy.data.objects.remove(o,do_unlink=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in out:o.select_set(True)
    bpy.context.view_layer.objects.active=out[0]
    p=os.path.join(OUT,"kez.glb")
    bpy.ops.export_scene.gltf(filepath=p,export_format='GLB',use_selection=True,export_apply=True,export_skins=False,export_animations=False,export_image_format='AUTO',export_jpeg_quality=80,export_yup=True)
    # előnézet: a két kéz a kamera előtt
    cam=bpy.data.objects["Kamera"];cam.location=(0,-0.5,0.14);cam.rotation_euler=(math.radians(84),0,0);cam.data.lens=30
    out[0].location=(0.12,0,0);out[1].location=(-0.12,0,0)
    sc=bpy.context.scene;sc.render.resolution_x=640;sc.render.resolution_y=480;sc.render.image_settings.file_format='JPEG'
    sc.render.filepath=os.path.join(OUT,"elonezet","kez.jpg");bpy.ops.render.render(write_still=True)
    return {"bytes":os.path.getsize(p),"tris":sum(len(o.data.polygons) for o in out),"dbg":DBG}
