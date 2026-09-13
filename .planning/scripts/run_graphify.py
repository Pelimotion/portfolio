import json
import sys
from pathlib import Path
from datetime import datetime, timezone
import networkx as nx

from graphify.extract import extract, _file_node_id, _make_id
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report
from graphify.detect import save_manifest
from graphify.cli import _stamped_manifest_files

print("=== 1. PREPARING EXTRACTION (AST + MARKDOWN + SEMANTIC) ===")
ast = json.loads(Path("graphify-out/.graphify_ast.json").read_text(encoding="utf-8"))
detect = json.loads(Path("graphify-out/.graphify_detect.json").read_text(encoding="utf-8"))

doc_files = [Path(f) for f in detect.get("files", {}).get("document", []) if Path(f).suffix.lower() == ".md"]
print(f"Extracting {len(doc_files)} markdown files...")
md_res = extract(doc_files, cache_root=Path("."))

# Combine nodes (deduplicated by id)
seen_node_ids = set()
merged_nodes = []

for n in ast["nodes"]:
    if n["id"] not in seen_node_ids:
        seen_node_ids.add(n["id"])
        merged_nodes.append(n)

for n in md_res["nodes"]:
    if n["id"] not in seen_node_ids:
        seen_node_ids.add(n["id"])
        merged_nodes.append(n)

# Combine edges
merged_edges = list(ast["edges"]) + list(md_res["edges"])

# Add Architectural & Creative Direction Semantic Concepts
semantic_concepts = [
    {
        "id": "concept_bunny_cdn_edge_streaming",
        "label": "Bunny.net CDN Edge Storage & Byte-Range Streaming",
        "file_type": "concept",
        "source_file": "ARCHITECTURE.md",
        "source_location": "L120",
        "source_url": None,
        "captured_at": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_zero_origin_bandwidth_vercel",
        "label": "Zero-Bandwidth Vercel Origin Protection",
        "file_type": "concept",
        "source_file": "README.md",
        "source_location": "L110",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_threejs_webgl_rendering_pipeline",
        "label": "Three.js WebGL Rendering Pipeline & Shaders",
        "file_type": "concept",
        "source_file": "ARCHITECTURE.md",
        "source_location": "L35",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_web_audio_procedural_engine",
        "label": "Web Audio API Spatial Sound Engine",
        "file_type": "concept",
        "source_file": "ARCHITECTURE.md",
        "source_location": "L80",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_cd_jewel_case_pov_system",
        "label": "CD Jewel Case Interactive Viewmodel & Physical POV",
        "file_type": "concept",
        "source_file": "gigantera/README.md",
        "source_location": "L45",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_prancheta_multisheet_system",
        "label": "Multi-Sheet Prancheta Texture Switcher",
        "file_type": "concept",
        "source_file": "gigantera/README.md",
        "source_location": "L50",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_loupe_magnification_mode",
        "label": "Loupe High-Magnification 2.5x Canvas Inspection",
        "file_type": "concept",
        "source_file": "gigantera/README.md",
        "source_location": "L55",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_mobile_spatial_experience",
        "label": "Mobile Spatial Gyroscope & Stepper Navigation",
        "file_type": "concept",
        "source_file": "ARCHITECTURE.md",
        "source_location": "L180",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    },
    {
        "id": "concept_admin_supabase_management",
        "label": "Admin Management Portal & Supabase RLS Engine",
        "file_type": "concept",
        "source_file": "admin/SPEC_01_ADMIN_PANEL_ARCHITECTURE.md",
        "source_location": "L1",
        "source_url": None,
        "author": "Felipe Conceição",
        "contributor": "Antigravity"
    }
]

for sc in semantic_concepts:
    if sc["id"] not in seen_node_ids:
        seen_node_ids.add(sc["id"])
        merged_nodes.append(sc)

# Cross-linking semantic edges
semantic_edges = [
    # Bunny CDN connections
    {"source": "concept_bunny_cdn_edge_streaming", "target": "architecture", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L120", "weight": 1.0},
    {"source": "concept_bunny_cdn_edge_streaming", "target": "readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L110", "weight": 1.0},
    {"source": "concept_bunny_cdn_edge_streaming", "target": "gigantera_src_core_soundengine_soundengine", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/core/soundEngine.ts", "source_location": "L1", "weight": 1.0},
    {"source": "concept_bunny_cdn_edge_streaming", "target": "gigantera_src_data_artworks_authorial_tracks_catalog", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/data/artworks.ts", "source_location": "L1", "weight": 1.0},
    {"source": "concept_bunny_cdn_edge_streaming", "target": "concept_zero_origin_bandwidth_vercel", "relation": "rationale_for", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L135", "weight": 1.0},
    
    # Three.js 3D Pavilion connections
    {"source": "concept_threejs_webgl_rendering_pipeline", "target": "architecture", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L35", "weight": 1.0},
    {"source": "concept_threejs_webgl_rendering_pipeline", "target": "gigantera_readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/README.md", "source_location": "L1", "weight": 1.0},
    {"source": "concept_threejs_webgl_rendering_pipeline", "target": "gigantera_src_components_canvas_cdviewmodel3d_cdviewmodel3d_buildjewelcase", "relation": "references", "confidence": "INFERRED", "confidence_score": 0.95, "source_file": "gigantera/src/components/canvas/CDViewmodel3D.ts", "source_location": "L1", "weight": 1.0},

    # Audio Engine connections
    {"source": "concept_web_audio_procedural_engine", "target": "gigantera_src_core_soundengine_soundengine", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/core/soundEngine.ts", "source_location": "L1", "weight": 1.0},
    {"source": "concept_web_audio_procedural_engine", "target": "architecture", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L80", "weight": 1.0},
    {"source": "concept_web_audio_procedural_engine", "target": "gigantera_src_components_audio_cdjewelcasepov_cdjewelcasepov", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/components/audio/CDJewelCasePOV.tsx", "source_location": "L1", "weight": 1.0},

    # CD Jewel Case POV connections
    {"source": "concept_cd_jewel_case_pov_system", "target": "gigantera_src_components_audio_cdjewelcasepov_cdjewelcasepov", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/components/audio/CDJewelCasePOV.tsx", "source_location": "L1", "weight": 1.0},
    {"source": "concept_cd_jewel_case_pov_system", "target": "gigantera_src_components_canvas_cdviewmodel3d_cdviewmodel3d_buildjewelcase", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/src/components/canvas/CDViewmodel3D.ts", "source_location": "L1", "weight": 1.0},
    {"source": "concept_cd_jewel_case_pov_system", "target": "readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L45", "weight": 1.0},

    # Prancheta & Loupe connections
    {"source": "concept_prancheta_multisheet_system", "target": "gigantera_readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/README.md", "source_location": "L50", "weight": 1.0},
    {"source": "concept_loupe_magnification_mode", "target": "gigantera_readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "gigantera/README.md", "source_location": "L55", "weight": 1.0},

    # Mobile Experience connections
    {"source": "concept_mobile_spatial_experience", "target": "architecture", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L180", "weight": 1.0},
    {"source": "concept_mobile_spatial_experience", "target": "readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L80", "weight": 1.0},

    # Admin Supabase connections
    {"source": "concept_admin_supabase_management", "target": "admin_admin_v4", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "admin/admin-v4.js", "source_location": "L1", "weight": 1.0},

    # Documentation inter-references
    {"source": "readme", "target": "architecture", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L30", "weight": 1.0},
    {"source": "readme", "target": "claude", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L32", "weight": 1.0},
    {"source": "readme", "target": "status", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L34", "weight": 1.0},
    {"source": "readme", "target": "gigantera_readme", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "README.md", "source_location": "L36", "weight": 1.0},
    {"source": "architecture", "target": "status", "relation": "references", "confidence": "EXTRACTED", "confidence_score": 1.0, "source_file": "ARCHITECTURE.md", "source_location": "L10", "weight": 1.0}
]

# Ensure endpoints exist
endpoint_ids = {n["id"] for n in merged_nodes}
for edge in semantic_edges:
    if edge["source"] in endpoint_ids and edge["target"] in endpoint_ids:
        merged_edges.append(edge)

hyperedges = [
    {
        "id": "he_gigantera_runtime",
        "label": "Gigantera 3D Interactive Runtime",
        "nodes": [
            "concept_threejs_webgl_rendering_pipeline",
            "concept_web_audio_procedural_engine",
            "concept_cd_jewel_case_pov_system",
            "concept_prancheta_multisheet_system",
            "concept_loupe_magnification_mode",
            "gigantera_src_core_soundengine_soundengine"
        ],
        "relation": "form",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "ARCHITECTURE.md"
    },
    {
        "id": "he_bunny_cdn_zero_bandwidth",
        "label": "Bunny CDN Edge Storage & Zero Bandwidth Pipeline",
        "nodes": [
            "concept_bunny_cdn_edge_streaming",
            "concept_zero_origin_bandwidth_vercel",
            "architecture",
            "readme",
            "gigantera_src_data_artworks_authorial_tracks_catalog"
        ],
        "relation": "implement",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "ARCHITECTURE.md"
    },
    {
        "id": "he_knowledge_ecosystem",
        "label": "Senior Engineering & Creative Direction Ecosystem",
        "nodes": [
            "readme",
            "architecture",
            "claude",
            "status",
            "gigantera_readme"
        ],
        "relation": "participate_in",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": "README.md"
    }
]

# Write final extraction
extraction_payload = {
    "nodes": merged_nodes,
    "edges": merged_edges,
    "hyperedges": hyperedges,
    "input_tokens": 0,
    "output_tokens": 0
}

Path("graphify-out/.graphify_extract.json").write_text(json.dumps(extraction_payload, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Extraction saved: {len(merged_nodes)} nodes, {len(merged_edges)} edges, {len(hyperedges)} hyperedges.")

print("\n=== 2. BUILDING NETWORKX GRAPH & CLUSTERING ===")
G = build_from_json(extraction_payload, root=".", directed=False)
print(f"Graph constructed: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")

communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)

print(f"Identified {len(communities)} communities across {G.number_of_nodes()} nodes.")

# Initial placeholder labels
initial_labels = {cid: f"Community {cid}" for cid in communities}
initial_questions = suggest_questions(G, communities, initial_labels)

# Save graph.json with force=True if needed
to_json(G, communities, "graphify-out/graph.json", force=True)

# Generate initial report and analysis sidecar
report = generate(G, communities, cohesion, initial_labels, gods, surprises, detect, {"input": 0, "output": 0}, ".", suggested_questions=initial_questions)
Path("graphify-out/GRAPH_REPORT.md").write_text(report, encoding="utf-8")

analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": initial_questions,
}
Path("graphify-out/.graphify_analysis.json").write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")

print("\n=== 3. HEALTH CHECK ===")
diag = diagnose_extraction(extraction_payload, directed=False, root=".")
print(format_diagnostic_report(diag))

print("\n=== 4. LABELING COMMUNITIES (STEP 5) ===")
# Build smart human-readable labels based on community node content
labels = {}
for cid, nids in communities.items():
    sub_nodes = [n for n in merged_nodes if n["id"] in nids]
    labels_list = [n.get("label", "") for n in sub_nodes]
    labels_text = " ".join(labels_list).lower()
    
    if any(k in labels_text for k in ["soundengine", "audio", "spatial", "gain", "convolver", "biquad", "track"]):
        labels[cid] = "Spatial Audio & Sound Engine"
    elif any(k in labels_text for k in ["three", "galleryscene3d", "webgl", "renderer", "shader", "render"]):
        labels[cid] = "3D WebGL Rendering & Shaders"
    elif any(k in labels_text for k in ["jewelcase", "cdviewmodel", "cdjewelcase", "prancheta", "loupe"]):
        labels[cid] = "CD Viewmodel & Visual Inspection"
    elif any(k in labels_text for k in ["playercontroller", "physics", "wasd", "gyro", "stepper", "movement", "camera"]):
        labels[cid] = "Player Movement & Controls"
    elif any(k in labels_text for k in ["bunny", "cdn", "streaming", "storage", "vercel", "bandwidth"]):
        labels[cid] = "Bunny CDN & Zero-Bandwidth Pipeline"
    elif any(k in labels_text for k in ["admin", "supabase", "auth", "kanban", "scene", "role"]):
        labels[cid] = "Admin Portal & Supabase Auth"
    elif any(k in labels_text for k in ["readme", "architecture", "claude", "status", "guidelines", "spec"]):
        labels[cid] = "Core System Architecture & Documentation"
    elif any(k in labels_text for k in ["ffmpeg", "transcode", "video", "media", "format"]):
        labels[cid] = "FFmpeg Media Processing"
    elif any(k in labels_text for k in ["portfolio", "generator", "catalog", "curriculum"]):
        labels[cid] = "Portfolio Data & Content Catalog"
    elif any(k in labels_text for k in ["theme", "tokens", "css", "syne", "fraunces", "style"]):
        labels[cid] = "Design Tokens & Brutalist Typography"
    else:
        # Fallback to the most prominent label in the community
        best_label = max(labels_list, key=len) if labels_list else f"Community {cid}"
        labels[cid] = best_label[:40]

# Regenerate questions with real labels
questions = suggest_questions(G, communities, labels)

# Update GRAPH_REPORT.md and .graphify_labels.json
report_labeled = generate(G, communities, cohesion, labels, gods, surprises, detect, {"input": 0, "output": 0}, ".", suggested_questions=questions)
Path("graphify-out/GRAPH_REPORT.md").write_text(report_labeled, encoding="utf-8")
Path("graphify-out/.graphify_labels.json").write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")

# Re-write graph.json with final labels
to_json(G, communities, "graphify-out/graph.json", force=True, community_labels=labels)
print(f"Community labels generated: {len(labels)} communities labeled successfully.")

print("\n=== 5. MANIFEST & CLEANUP (STEP 9) ===")
_corpus = detect.get("all_files") or detect["files"]
_manifest_files = _stamped_manifest_files(_corpus, extraction_payload, Path("."))
_sem_types = ("document", "paper", "image")
_dispatched = {f for t, fl in detect["files"].items() if t in _sem_types for f in fl}
_stamped = {f for fl in _manifest_files.values() for f in fl}
_cleared = _dispatched - _stamped
_scan = {f for fl in _corpus.values() for f in fl}
save_manifest(_manifest_files, root=".", scan_corpus=_scan, clear_semantic=_cleared or None)

cost_path = Path("graphify-out/cost.json")
cost = json.loads(cost_path.read_text(encoding="utf-8")) if cost_path.exists() else {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}
cost["runs"].append({
    "date": datetime.now(timezone.utc).isoformat(),
    "input_tokens": 0,
    "output_tokens": 0,
    "nodes": G.number_of_nodes(),
    "edges": G.number_of_edges()
})
cost_path.write_text(json.dumps(cost, indent=2), encoding="utf-8")

print("\n>>> BUILD COMPLETED SUCCESSFULLY! <<<")
