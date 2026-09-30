"""
Hong Kong courtyard-tower diorama for Blender.

Named collections match `revealSpecs()` in src/scene/hkTimeline.ts:
Ground, Hoarding, Foundation, Tower*_Storey_*, Tower*_Core,
Crane_Product (with Crane_Slew / Crane_Hook / Crane_Cable),
Bamboo, GreenNet, CatchFan, Alimak, Precast, MiC_Top, Guards, Workers, IoT.

The website loads public/site-hk-timelapse.glb. This script is the Blender
authoring pass. If Blender is not on PATH, scripts/export-hk-glb.ts writes
the same names from src/scene/hkModel.ts.

  blender.exe --background --python blender/build_designed_site.py
"""

from __future__ import annotations

from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
BLEND_PATH = ROOT / "site-designed.blend"
GLB_PATH = ROOT / "site-hk-timelapse.glb"

H = 0.78
TOWERS = (
    ("A", -5.4, -1.5, 9),
    ("B", 0.0, 1.6, 10),
    ("C", 5.4, -1.5, 8),
)

PALETTE = {
    "sand": "#E6DFD0",
    "pad": "#DDD6C6",
    "slab": "#E7E1D4",
    "frame": "#F7F5F0",
    "column": "#243044",
    "glass": "#8FA4B8",
    "steel": "#1E293B",
    "crane": "#FF5500",
    "white": "#F4F1EA",
    "red": "#DC2626",
    "bamboo": "#C6A15B",
    "net": "#1B7A3A",
    "fan": "#8E9AA6",
    "vest": "#D6F25A",
    "helmetY": "#F5C400",
    "helmetW": "#F7F7F2",
    "mic": "#E4DDD0",
    "sensor": "#FF5500",
    "paper": "#F4F1EA",
}


def hex_rgba(value: str) -> tuple[float, float, float, float]:
    raw = value.removeprefix("#")
    return (
        int(raw[0:2], 16) / 255,
        int(raw[2:4], 16) / 255,
        int(raw[4:6], 16) / 255,
        1.0,
    )


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE"
    world = bpy.data.worlds.new("Paper")
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background:
        background.inputs[0].default_value = hex_rgba(PALETTE["paper"])
        background.inputs[1].default_value = 0.9
    scene.world = world


def material(name: str, color: str) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get("Principled BSDF")
    if node:
        node.inputs["Base Color"].default_value = hex_rgba(color)
        if "Roughness" in node.inputs:
            node.inputs["Roughness"].default_value = 0.78
    return mat


def collection(name: str) -> bpy.types.Collection:
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def link(obj: bpy.types.Object, col: bpy.types.Collection) -> bpy.types.Object:
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    col.objects.link(obj)
    return obj


def box(
    name: str,
    size: tuple[float, float, float],
    location: tuple[float, float, float],
    mat: bpy.types.Material,
    col: bpy.types.Collection,
    parent: bpy.types.Object | None = None,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    link(obj, col)
    if parent:
        obj.parent = parent
    obj.location = Vector(location)
    return obj


def empty(name: str, location: tuple[float, float, float], col: bpy.types.Collection) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.4
    obj.location = location
    col.objects.link(obj)
    return obj


def build() -> None:
    reset_scene()
    mats = {key: material(key, value) for key, value in PALETTE.items() if key != "paper"}
    site = collection("HKSite")

    ground = empty("Ground", (0, 0, 0), site)
    box("sand", (18, 16, 0.16), (0, 0, -0.08), mats["sand"], site, ground)
    box("courtyard", (6.2, 4.2, 0.18), (0, 0, 0.02), mats["pad"], site, ground)

    hoarding = empty("Hoarding", (0, 0, 0), site)
    box("north", (17.2, 0.08, 0.9), (0, -7.6, 0.45), mats["pad"], site, hoarding)
    box("south", (17.2, 0.08, 0.9), (0, 7.6, 0.45), mats["pad"], site, hoarding)
    box("west", (0.08, 15.2, 0.9), (-8.6, 0, 0.45), mats["pad"], site, hoarding)
    box("east", (0.08, 15.2, 0.9), (8.6, 0, 0.45), mats["pad"], site, hoarding)

    foundation = empty("Foundation", (0, 0, 0), site)
    for tower_id, x, y, floors in TOWERS:
        box(f"raft_{tower_id}", (4.1, 3.4, 0.28), (x, y, 0.12), mats["column"], site, foundation)
        tower = empty(f"Tower{tower_id}", (x, y, 0), site)
        for level in range(floors):
            storey = empty(f"Tower{tower_id}_Storey_{level:02d}", (0, 0, 0.28 + level * H + 0.08), site)
            storey.parent = tower
            box("slab", (3.5, 2.9, 0.16), (0, 0, 0), mats["slab"], site, storey)
            for cx in (-1.55, 1.55):
                for cy in (-1.25, 1.25):
                    box("column", (0.22, 0.22, H * 0.92), (cx, cy, 0.34), mats["column"], site, storey)
            if level < floors - 1:
                for bay in (-1.05, 0.0, 1.05):
                    box("glass", (0.72, 0.04, 0.42), (bay, 1.52, 0.38), mats["glass"], site, storey)
        core_h = floors * H
        core = empty(f"Tower{tower_id}_Core", (0, 0, 0), site)
        core.parent = tower
        box("core", (1.15, 1.05, core_h), (0.15, -0.15, core_h / 2 + 0.2), mats["column"], site, core)

    crane = empty("Crane_Product", (0.9, 2.55, 0), site)
    for index in range(8):
        box("mast", (0.72, 0.72, 1.02), (0, 0, 0.55 + index * 1.05), mats["steel"], site, crane)
    slew = empty("Crane_Slew", (0, 0, 8.7), site)
    slew.parent = crane
    box("jib", (7.6, 0.22, 0.16), (4.1, 0, 0.42), mats["crane"], site, slew)
    box("jibWhite", (7.4, 0.26, 0.05), (4.1, 0, 0.54), mats["white"], site, slew)
    box("jibRed", (1.3, 0.28, 0.06), (7.2, 0, 0.54), mats["red"], site, slew)
    box("cab", (0.9, 1.05, 0.7), (0.1, -0.85, 0.55), mats["frame"], site, slew)
    box("counter", (2.4, 0.28, 0.18), (-1.6, 0, 0.42), mats["steel"], site, slew)
    box("Crane_Hook", (0.28, 0.22, 0.36), (6.6, 0, -1.5), mats["crane"], site, slew)
    box("Crane_Cable", (0.04, 0.04, 1.5), (6.6, 0, -0.7), mats["steel"], site, slew)

    bamboo = empty("Bamboo", (-5.4, -3.15, 0), site)
    for x in (-1.6, -0.5, 0.6, 1.6):
        box("pole", (0.08, 0.08, 7.2), (x, 0, 3.7), mats["bamboo"], site, bamboo)

    net = empty("GreenNet", (-5.4, -3.28, 0), site)
    sheet = box("sheet", (3.6, 0.02, 6.6), (0, 0, 3.6), mats["net"], site, net)
    sheet.rotation_euler[1] = 0.78

    fans = empty("CatchFan", (-5.4, -1.5, 0), site)
    for level in (2, 5, 8):
        box("fan", (3.3, 1.15, 0.06), (0, -2.15, 0.5 + level * H), mats["fan"], site, fans)

    hoist = empty("Alimak", (7.35, -1.5, 0), site)
    box("mast", (0.28, 0.28, 6.4), (0, 0, 3.3), mats["steel"], site, hoist)
    cage = empty("Alimak_Cage", (0.35, 0, 2.2), site)
    cage.parent = hoist
    box("cage", (0.7, 0.7, 0.9), (0, 0, 0), mats["crane"], site, cage)

    precast = empty("Precast", (5.4, -1.5, 0), site)
    for level in range(1, 7):
        box("panel", (3.2, 0.08, 0.62), (0, 1.52, 0.45 + level * H), mats["frame"], site, precast)

    mic = empty("MiC_Top", (0, 1.6, 0.4 + 10 * H), site)
    box("boxA", (1.55, 1.35, 0.7), (-0.85, 0, 0.4), mats["mic"], site, mic)
    box("boxB", (1.55, 1.35, 0.7), (0.85, 0.15, 0.4), mats["mic"], site, mic)
    box("seam", (0.06, 1.4, 0.72), (0, 0.05, 0.4), mats["red"], site, mic)

    guards = empty("Guards", (0, 1.6, 0.55 + 9 * H), site)
    for index in range(8):
        box(
            "rail",
            (0.42, 0.06, 0.28),
            (-1.6 + index * 0.46, 1.45, 0.7),
            mats["red"] if index % 2 == 0 else mats["white"],
            site,
            guards,
        )

    workers = empty("Workers", (0, 0, 0), site)
    spots = (
        (-5.2, -1.2, 0.7 + 2 * H, True),
        (0.4, 2.2, 0.7 + 4 * H, False),
        (5.2, -1.2, 0.7 + 3 * H, True),
        (-6.8, -4.2, 0.35, False),
    )
    for index, (x, y, z, yellow) in enumerate(spots):
        person = empty(f"Worker_{index:02d}", (x, y, z), site)
        person.parent = workers
        box("vest", (0.24, 0.16, 0.16), (0, 0, 0.22), mats["vest"], site, person)
        box("helmet", (0.18, 0.18, 0.1), (0, 0, 0.38), mats["helmetY"] if yellow else mats["helmetW"], site, person)

    iot = empty("IoT", (0, 0, 0), site)
    for index, (x, y, z) in enumerate(((-5.4, -1.5, 0.9 + 3 * H), (0.2, 1.6, 0.9 + 6 * H), (5.4, -1.5, 0.9 + 4 * H))):
        box(f"Sensor_{index:02d}", (0.22, 0.22, 0.22), (x, y, z), mats["sensor"], site, iot)
    gateway = empty("Gateway", (-7.6, 4.2, 0), site)
    gateway.parent = iot
    box("body", (1.8, 1.15, 1.15), (0, 0, 0.65), mats["frame"], site, gateway)
    box("roof", (1.95, 1.28, 0.1), (0, 0, 1.28), mats["crane"], site, gateway)

    cam_data = bpy.data.cameras.new("IsoCamera")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 28
    camera = bpy.data.objects.new("IsoCamera", cam_data)
    camera.location = Vector((16, -16, 12))
    camera.rotation_euler = (Vector((0, 0, 3.6)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    bpy.ops.export_scene.gltf(filepath=str(GLB_PATH), export_format="GLB", use_selection=False)
    print(f"Wrote {BLEND_PATH}")
    print(f"Wrote {GLB_PATH}")


if __name__ == "__main__":
    build()
