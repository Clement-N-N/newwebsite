import cv2, numpy as np, json
from PIL import Image
SRC='/home/user/newwebsite/brand-source/photography/hero-candidates/IDT-46.jpg'
X0 = 1900                               # roi offset used by matte.py
alpha_roi = np.load('alpha_roi.npy').astype(np.float32)
full = Image.open(SRC).convert('RGB'); W, H = full.size
# Stage = the photographic frame's coordinate space (desktop and mobile share it)
SX, SY, SW = 1300, 700, 4600; SH = H - SY          # 4600 x 3428
stage = full.crop((SX, SY, SX + SW, SY + SH))
stage.save('/home/user/newwebsite/src/assets/hero/idt-46-stage.jpg', quality=90, subsampling=0)
# Foreground band: from above the crown to below the frame line
band_top, band_bot = 300, SY + 420
a = np.zeros((H, W), np.float32); a[:, X0:X0 + alpha_roi.shape[1]] = alpha_roi
band = a[band_top:band_bot]
cols = np.where(band[: SY - band_top].max(axis=0) > 0.5)[0]      # hair span above the line
bx0, bx1 = max(cols.min() - 120, SX), min(cols.max() + 120, SX + SW)
band = band[:, bx0:bx1].copy()
# Choke the soft edge slightly to drop the light fringe picked up from the wall
band = np.clip((band - 0.18) / 0.82, 0, 1)
import cv2
band = cv2.erode(band, np.ones((3, 3), np.uint8), iterations=1)
# Feather the lower edge (inside the frame, over identical pixels)
fade_start = SY + 180 - band_top; ramp = np.linspace(1, 0, band.shape[0] - fade_start)
band[fade_start:] *= ramp[:, None]
rgb = np.array(full)[band_top:band_bot, bx0:bx1]
out = np.dstack([rgb, (band * 255).round().astype(np.uint8)])
Image.fromarray(out, 'RGBA').save('/home/user/newwebsite/src/assets/hero/idt-46-foreground.png', optimize=True)
geo = dict(stage=dict(x=SX, y=SY, w=SW, h=SH),
           fg=dict(left=(bx0 - SX) / SW * 100, top=(band_top - SY) / SH * 100,
                   width=(bx1 - bx0) / SW * 100, height=(band_bot - band_top) / SH * 100,
                   px=[int(bx1 - bx0), int(band_bot - band_top)]))
print(json.dumps(geo, indent=1))
# preview: navy canvas with stage inset, fg on top
navy = (16, 19, 112); sc = 0.2
cv = Image.new('RGB', (int(SW * sc) + 200, int(SH * sc) + 200), navy)
st = stage.resize((int(SW * sc), int(SH * sc))); cv.paste(st, (100, 100))
fg = Image.fromarray(out, 'RGBA').resize((int((bx1 - bx0) * sc), int((band_bot - band_top) * sc)))
cv.paste(fg, (100 + int((bx0 - SX) * sc), 100 + int((band_top - SY) * sc)), fg)
cv.save('preview.jpg', quality=88)
