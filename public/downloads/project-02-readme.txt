THE LAZY DRIVER

An autonomous-driving perception and path-prediction stack that runs on ordinary
dashcam footage. It segments the drivable surface and lane lines, detects and
tracks vehicles with metric distance estimates, reads road signs, and predicts a
driving line that follows the lead vehicle while staying inside the detected road
boundary.

PIPELINE
  Detection                  YOLO11m           vehicles, pedestrians, signs
  Lane + drivable surface    YOLOPv2           pixel-level road and lane masks
  Path prediction            openpilot         temporal net emitting a path
                             supercombo        polynomial
  Sign classes               Open Images V7    additional sign classes
  Depth                      monocular metric  per-object distance in metres

Detections are tracked across frames with coasting, so a vehicle whose detection
drops for a few frames keeps its identity instead of flickering. Distances,
lane-change state, road-surface condition and environment estimates are drawn
into a telemetry overlay.

The predicted path has three modes, shown in the status bar: FOLLOW when a lead
vehicle is tracked, a lane-centred path when lane geometry is available, and
NO LANE when neither is recoverable. The path is clamped to the segmented
drivable surface so it cannot leave the road.

RUNNING
  python -m venv .venv && ./.venv/bin/pip install -r requirements.txt
  ./.venv/bin/python render_to_desktop.py "clip.mov" --fps 10 --out result

--yolop-stride and --oiv7-stride run the segmentation and sign heads every N
frames to trade accuracy for speed. Model weights and datasets are fetched
separately and are not committed.

LIMITATIONS
  Ego speed is estimated, not read from CAN or GPS, so speed-derived values are
  approximate. Throughput is roughly 1 fps at full quality on Apple Silicon CPU.
  Monocular depth is metric-scaled but degrades past roughly 50 m.

ATTRIBUTION
  This composes open models and is not a from-scratch replacement for them:
  openpilot (comma.ai, MIT), YOLOPv2, and Ultralytics YOLO11.

Repository: github.com/jcooperkai-sys/The-Lazy-Driver
