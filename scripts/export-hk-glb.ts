import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { buildHkDiorama } from "../src/scene/hkModel.ts";

class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;

  readAsArrayBuffer(blob: Blob): void {
    void blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader as unknown as typeof FileReader;

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exporter = new GLTFExporter();
const scene = buildHkDiorama();
const glb = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });

if (!(glb instanceof ArrayBuffer)) {
  throw new Error("Expected a binary glTF.");
}

const bytes = Buffer.from(glb);
for (const relative of ["public/site-hk-timelapse.glb", "blender/site-hk-timelapse.glb"]) {
  const path = resolve(rootDir, relative);
  writeFileSync(path, bytes);
  console.log(`Wrote ${path} (${bytes.byteLength} bytes)`);
}
