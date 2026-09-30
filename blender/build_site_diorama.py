"""
Build the Hero construction-site voxel model in Blender.

Cell layout must stay aligned with `layoutSite()` in
`src/scene/createSiteScene.ts`. Three.js is Y-up; Blender is Z-up.

Usage:
  blender --background --python blender/build_site_diorama.py
"""

from __future__ import annotations

from pathlib import Path

import bpy
from mathutils import Vector

SIZE = 0.92
LOOK_AT = Vector((0.0, 0.0, 3.2))
CRANE_ROOT = Vector((-6.0, 5.0, 0.0))  # three (-6, 0, 5) → blender (x, z, y)
BLEND_PATH = Path(__file__).resolve().parent / "site-diorama.blend"

PALETTE = {
    "sand": "#E6DFD0",
    "pad": "#DDD6C6",
    "slab": "#C9C3B6",
    "column": "#0F172A",
    "scaffold": "#334155",
    "steel": "#1E293B",
    "crane": "#FF5500",
    "cabin": "#F7F5F0",
    "roof": "#FF5500",
    "fence": "#D8D2C4",
    "pallet": "#B45309",
    "sensor": "#FF5500",
    "paper": "#F4F1EA",
}


def hex_rgba(value: str) -> tuple[float, float, float, float]:
    raw = value.removeprefix("#")
    r = int(raw[0:2], 16) / 255
    g = int(raw[2:4], 16) / 255
    b = int(raw[4:6], 16) / 255
    return (r, g, b, 1.0)


def to_blender(cell: tuple[int, int, int]) -> Vector:
    x, y, z = cell
    return Vector((x + 0.5, z + 0.5, y + 0.5))


def push_fill(
    out: list[tuple[int, int, int]],
    x0: int,
    x1: int,
    y0: int,
    y1: int,
    z0: int,
    z1: int,
    skip=None,
) -> None:
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            for z in range(z0, z1 + 1):
                if skip and skip(x, y, z):
                    continue
                out.append((x, y, z))


def push_ring(
    out: list[tuple[int, int, int]],
    x0: int,
    x1: int,
    y: int,
    z0: int,
    z1: int,
    skip=None,
) -> None:
    for x in range(x0, x1 + 1):
        for z in range(z0, z1 + 1):
            edge = x in (x0, x1) or z in (z0, z1)
            if edge and not (skip and skip(x, z)):
                out.append((x, y, z))


def layout_site() -> dict[str, list[tuple[int, int, int]]]:
    sand: list[tuple[int, int, int]] = []
    pad: list[tuple[int, int, int]] = []
    slab: list[tuple[int, int, int]] = []
    column: list[tuple[int, int, int]] = []
    scaffold: list[tuple[int, int, int]] = []
    mast: list[tuple[int, int, int]] = []
    jib: list[tuple[int, int, int]] = []
    cabin: list[tuple[int, int, int]] = []
    roof: list[tuple[int, int, int]] = []
    fence: list[tuple[int, int, int]] = []
    pallet: list[tuple[int, int, int]] = []

    for x in range(-8, 9):
        for z in range(-8, 9):
            inner = -4 <= x <= 4 and -4 <= z <= 3
            (pad if inner else sand).append((x, 0, z))

    for cx, cz in ((-2, -2), (2, -2), (-2, 2), (2, 2)):
        push_fill(column, cx, cx, 1, 8, cz, cz)

    push_ring(slab, -2, 2, 1, -2, 2)
    push_ring(slab, -2, 2, 3, -2, 2)
    push_fill(slab, -2, 1, 5, 5, -2, 1, lambda x, _y, z: x == 2 and z == 2)
    push_fill(slab, -2, 0, 7, 7, -2, 0)

    for x in (-3, 3):
        for z in (-2, 0, 2):
            push_fill(scaffold, x, x, 1, 6, z, z)
        push_fill(scaffold, x, x, 2, 2, -2, 2)
        push_fill(scaffold, x, x, 4, 4, -2, 2)
        push_fill(scaffold, x, x, 6, 6, -2, 2)

    push_fill(cabin, 5, 7, 1, 2, -7, -5, lambda x, y, z: x == 6 and y == 1 and z == -5)
    push_fill(roof, 5, 7, 3, 3, -7, -5)
    roof.append((6, 4, -6))

    push_fill(pallet, 5, 6, 1, 1, 4, 5)
    pallet.extend(((5, 2, 4), (6, 2, 4), (5, 2, 5)))

    for x in range(-8, 9):
        if x % 2 == 0:
            fence.extend(((x, 1, -8), (x, 1, 8)))
    for z in range(-7, 8):
        if z % 2 == 0:
            fence.extend(((-8, 1, z), (8, 1, z)))

    push_fill(mast, 0, 0, 1, 14, 0, 0)
    push_fill(jib, 2, 12, 0, 0, 0, 0)
    push_fill(jib, -4, -2, 0, 0, 0, 0)
    jib.extend(((0, 0, 0), (1, 0, 0), (-1, 0, 0), (12, -1, 0), (-4, 1, 0)))

    return {
        "sand": sand,
        "pad": pad,
        "slab": slab,
        "column": column,
        "scaffold": scaffold,
        "mast": mast,
        "jib": jib,
        "cabin": cabin,
        "roof": roof,
        "fence": fence,
        "pallet": pallet,
    }


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE"
    scene.world = bpy.data.worlds.new("Paper")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = hex_rgba(PALETTE["paper"])
        bg.inputs[1].default_value = 1.0


def make_material(name: str, color: str, emit: float = 0.0) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    principled = nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = hex_rgba(color)
        if "Roughness" in principled.inputs:
            principled.inputs["Roughness"].default_value = 0.82
        if emit and "Emission Color" in principled.inputs:
            principled.inputs["Emission Color"].default_value = hex_rgba(color)
            principled.inputs["Emission Strength"].default_value = emit
        elif emit and "Emission" in principled.inputs:
            principled.inputs["Emission"].default_value = hex_rgba(color)
    return material


def collection(name: str) -> bpy.types.Collection:
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def empty(name: str, parent=None, location=Vector((0, 0, 0))) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.4
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def add_cubes(
    name: str,
    cells: list[tuple[int, int, int]],
    material: bpy.types.Material,
    col: bpy.types.Collection,
    parent: bpy.types.Object | None = None,
    mesh_data: bpy.types.Mesh | None = None,
) -> bpy.types.Mesh:
    if mesh_data is None:
        bpy.ops.mesh.primitive_cube_add(size=SIZE, location=(0, 0, 0))
        proto = bpy.context.active_object
        mesh_data = proto.data
        mesh_data.name = f"{name}_voxel"
        bpy.data.objects.remove(proto, do_unlink=True)

    for index, cell in enumerate(cells):
        obj = bpy.data.objects.new(f"{name}_{index:04d}", mesh_data)
        obj.data.materials.append(material)
        col.objects.link(obj)
        if parent:
            obj.parent = parent
        obj.location = to_blender(cell)
    return mesh_data


def add_local_cube(
    name: str,
    location_three: tuple[float, float, float],
    size: float,
    material: bpy.types.Material,
    col: bpy.types.Collection,
    parent: bpy.types.Object | None = None,
) -> None:
    x, y, z = location_three
    bpy.ops.mesh.primitive_cube_add(size=size, location=(0.0, 0.0, 0.0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    col.objects.link(obj)
    if parent:
        obj.parent = parent
    obj.location = Vector((x, z, y))


def setup_camera_and_light() -> None:
    cam_data = bpy.data.cameras.new("IsoCamera")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 36
    camera = bpy.data.objects.new("IsoCamera", cam_data)
    camera.location = Vector((20.0, 20.0, 20.0))
    direction = LOOK_AT - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.collection.objects.link(camera)
    bpy.context.scene.camera = camera

    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.2
    sun_data.angle = 0.12
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.location = Vector((14.0, 10.0, 22.0))
    bpy.context.scene.collection.objects.link(sun)


def build() -> None:
    reset_scene()
    layout = layout_site()
    mats = {name: make_material(name, color) for name, color in PALETTE.items()}
    mats["sensor"] = make_material("sensor", PALETTE["sensor"], emit=0.45)

    ground = collection("Ground")
    structure = collection("Structure")
    crane = collection("Crane")
    site_kit = collection("SiteKit")
    iot = collection("IoT")

    add_cubes("sand", layout["sand"], mats["sand"], ground)
    add_cubes("pad", layout["pad"], mats["pad"], ground)
    add_cubes("fence", layout["fence"], mats["fence"], ground)
    add_cubes("column", layout["column"], mats["column"], structure)
    add_cubes("slab", layout["slab"], mats["slab"], structure)
    add_cubes("scaffold", layout["scaffold"], mats["scaffold"], structure)
    add_cubes("cabin", layout["cabin"], mats["cabin"], site_kit)
    add_cubes("roof", layout["roof"], mats["roof"], site_kit)
    add_cubes("pallet", layout["pallet"], mats["pallet"], site_kit)

    crane_root = empty("CraneRoot", location=CRANE_ROOT)
    boom = empty("Boom", parent=crane_root, location=Vector((0.5, 0.5, 15.0)))
    boom_inner = empty("BoomInner", parent=boom, location=Vector((-0.5, -0.5, 0.0)))

    add_cubes("mast", layout["mast"], mats["steel"], crane, parent=crane_root)
    add_cubes("jib", layout["jib"], mats["crane"], crane, parent=boom_inner)
    add_local_cube("hook", (11.5, -2.5, 0.5), 0.38, mats["crane"], crane, parent=boom_inner)
    add_local_cube("cable", (11.5, -1.25, 0.5), 0.12, mats["steel"], crane, parent=boom_inner)

    sensors = (
        (0.5, 4.2, 0.5),
        (-1.5, 6.2, -1.5),
        (1.5, 2.2, -1.5),
        (-3.5, 1.4, -3.5),
    )
    for index, position in enumerate(sensors):
        add_local_cube(f"sensor_{index:02d}", position, 0.46, mats["sensor"], iot)

    setup_camera_and_light()
    bpy.ops.file.pack_all()
    BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    print(f"Wrote {BLEND_PATH}")


if __name__ == "__main__":
    build()
