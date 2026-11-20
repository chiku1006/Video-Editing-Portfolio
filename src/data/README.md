# Portfolio media

My Work uses a wide showreel poster and three two-card motion rows. Short-Form
Editing stays in its own section. Edit `featuredShowreel` and
`motionGalleryProjects` in `projects.ts` to rename or reorder the gallery.
The FLOW entry is shared with Home and can be renamed in `projects`.

Place the videos at:

- `public/videos/showreel.mp4`
- `public/videos/motion-01.mp4` through `public/videos/motion-06.mp4`
- `public/videos/short-01.mp4`

Replace thumbnails at the matching paths in `public/images/` (for example,
`showreel.webp` or `motion-03.webp`). Use landscape WebP images with some
space around important content. The showreel card uses a 2.25:1 desktop crop,
and the gallery cards crop their posters to fill each row without stretching.
Update `posterAlt` if the artwork changes. The expanded player preserves the
video's original aspect ratio independently of the poster.

Rebuild after adding media or editing data. Video availability and showreel
duration are read during rendering. The gallery requests the video on desktop
hover or when the expanded player opens. Short-Form Editing retains its
existing inline player.
