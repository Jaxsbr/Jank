# Media

## Create demo.gif

1. Record a short screen capture (5–10s) while the core attacks and the hive pulses.
   - macOS: Shift+Cmd+5 → Record Selection/Window
2. Convert to GIF (two options):
   - Quick & simple: https://ezgif.com/video-to-gif
   - CLI (ffmpeg + gifski):
     ```bash
     ffmpeg -i input.mov -vf scale=960:-1 -r 30 -f png frame-%04d.png
     gifski -o demo.gif --fps 20 frame-*.png
     rm frame-*.png
     ```
3. Save as `docs/media/demo.gif`.

Tip: Keep it under ~5MB for repo friendliness.
