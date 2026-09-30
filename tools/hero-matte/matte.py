import cv2, numpy as np, mediapipe as mp
from PIL import Image
SRC='/home/user/newwebsite/brand-source/photography/hero-candidates/IDT-46.jpg'
CANVA='/root/.claude/projects/-home-user-newwebsite/fcc09d3a-7b55-5896-8942-c3b51cd796ec/tool-results/mcp-Canva-blob-1790778069891-ziunyq.png'
full = cv2.imread(SRC)                      # BGR 6192x4128
H, W = full.shape[:2]
X0, X1, Y0, Y1 = 1900, 5700, 0, H           # region around the subject
roi = full[Y0:Y1, X0:X1]
s = 0.5
work = cv2.resize(roi, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
h, w = work.shape[:2]
# 1. MediaPipe selfie segmentation (bundled model), general model
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
m_mp = seg.process(cv2.cvtColor(work, cv2.COLOR_BGR2RGB)).segmentation_mask.astype(np.float32)
# 2. Canva background-removal preview alpha (whole frame) -> roi -> work size
ca = np.array(Image.open(CANVA).convert('RGBA'))[:, :, 3].astype(np.float32) / 255
ca = cv2.resize(ca, (W, H), interpolation=cv2.INTER_LINEAR)[Y0:Y1, X0:X1]
m_cv = cv2.resize(ca, (w, h), interpolation=cv2.INTER_AREA)
np.save('m_mp.npy', m_mp); np.save('m_cv.npy', m_cv)
# 3. trimap from agreement
fg = (m_mp > 0.8) & (m_cv > 0.8)
bg = (m_mp < 0.2) & (m_cv < 0.2)
k = np.ones((15, 15), np.uint8)
fg = cv2.erode(fg.astype(np.uint8), k)
bg = cv2.erode(bg.astype(np.uint8), k)
gc = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
gc[(m_mp + m_cv) / 2 > 0.5] = cv2.GC_PR_FGD
gc[fg == 1] = cv2.GC_FGD
gc[bg == 1] = cv2.GC_BGD
bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(work, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
hard = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 1.0, 0.0).astype(np.float32)
# keep largest component
n, lab, stats, _ = cv2.connectedComponentsWithStats(hard.astype(np.uint8))
if n > 1:
    big = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]); hard = (lab == big).astype(np.float32)
# 4. upscale and refine edges with a guided filter at full resolution
hard_full = cv2.resize(hard, (roi.shape[1], roi.shape[0]), interpolation=cv2.INTER_LINEAR)
guide = roi.astype(np.float32) / 255
alpha = cv2.ximgproc.guidedFilter(guide, hard_full, 10, 1e-3)
alpha = np.clip(np.nan_to_num(alpha), 0, 1)
np.save('alpha_roi.npy', alpha.astype(np.float16))
print('roi', roi.shape, 'fg frac', hard.mean().round(3))
# previews: composite on navy
navy = np.zeros_like(roi); navy[:] = (0x70, 0x13, 0x10)
comp = (roi * alpha[..., None] + navy * (1 - alpha[..., None])).astype(np.uint8)
cv2.imwrite('comp.jpg', cv2.resize(comp, None, fx=0.25, fy=0.25), [cv2.IMWRITE_JPEG_QUALITY, 85])
head = comp[250:1500, 700:2800]   # head region at full res
cv2.imwrite('head.jpg', cv2.resize(head, None, fx=0.6, fy=0.6), [cv2.IMWRITE_JPEG_QUALITY, 88])
dbg = np.hstack([m_mp, m_cv, hard]); cv2.imwrite('masks.jpg', (cv2.resize(dbg, None, fx=0.3, fy=0.3) * 255).astype(np.uint8))
