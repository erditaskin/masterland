"""Prepare reusable material sprites from the user's immutable approved drawing."""
from pathlib import Path
import hashlib,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'assets/references/approved-belenyaka-20261118/source.png'
OUT=ROOT/'mobile/assets/art/approved-iphone-v1'
OUT.mkdir(parents=True,exist_ok=True)
regions={
 'city1-cell':[273,731,391,849], 'city1-frame':[4,707,780,1828],
 'city1-heading':[181,291,601,370], 'city1-filter-tr':[22,303,162,365],
 'city1-account':[676,301,746,371],
 'city1-producer-field':[46,549,167,641], 'city1-producer-mill':[187,549,310,641],
 'city1-producer-oven':[334,549,457,641], 'city1-producer-barn':[479,549,601,641],
 'city1-producer-orchard':[623,549,746,641],
}
with Image.open(SOURCE) as original:
 for name,bounds in regions.items():original.crop(tuple(bounds)).save(OUT/(name+'.png'))
with Image.open(OUT/'city1-frame.png') as frame:
 cap=22
 for index in range(9):
  if index==4:continue
  row,col=divmod(index,3);x=[0,cap,frame.width-cap][col];y=[0,cap,frame.height-cap][row]
  w=[cap,frame.width-2*cap,cap][col];h=[cap,frame.height-2*cap,cap][row]
  frame.crop((x,y,x+w,y+h)).save(OUT/f'city1-frame-{index}.png')
(OUT/'provenance.json').write_text(json.dumps({'source':str(SOURCE.relative_to(ROOT)),'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'operation':'unchanged source crops','regions_ltrb':regions,'frame_cap_source_pixels':22},indent=2)+'\n')

# Reuse approved environmental pixels, never a screenshot of working controls.
# Only the formerly hidden HUD background comes from the separate inpaint asset.
INPAINT=ROOT/'assets/concepts/device-iphone-v1/candidates/hud-inpaint-v1.png'
clear_regions=[
 [181,291,601,370], [22,303,162,365], [676,301,746,371],
 [37,541,174,692], [179,541,317,692], [325,541,465,692],
 [469,541,610,692], [614,541,755,692],
 [2,705,782,1832], [8,1860,777,1998],
]
with Image.open(SOURCE).convert('RGBA') as background, Image.open(INPAINT).convert('RGBA') as infill:
 patch=(90,84,676,162)
 if infill.width != background.width or infill.height < patch[3]:
  raise ValueError('HUD inpaint does not cover the source crop at its native pixel width')
 background.paste(infill.crop(patch),patch[:2])
 from PIL import ImageDraw
 alpha=background.getchannel('A');draw=ImageDraw.Draw(alpha)
 for x1,y1,x2,y2 in clear_regions:draw.rectangle((x1,y1,x2-1,y2-1),fill=0)
 for box in [(14,383,260,518),(267,383,514,518),(519,383,770,518)]:draw.rounded_rectangle(box,radius=18,fill=0)
 background.putalpha(alpha);background.save(OUT/'city1-environment.png')
p=OUT/'environment-provenance.json';p.write_text(json.dumps({'approved_source':str(SOURCE.relative_to(ROOT)),'inpaint':str(INPAINT.relative_to(ROOT)),'inpaint_sha256':hashlib.sha256(INPAINT.read_bytes()).hexdigest(),'inpaint_region_ltrb':list(patch),'transparent_control_regions_ltrb':clear_regions+[[4,535,781,706]],'transparent_order_regions_ltrb':[[14,383,260,518],[267,383,514,518],[519,383,770,518]],'order_corner_radius':18,'policy':'All visible source pixels outside the HUD infill are preserved; control pixels are removed, not used as fake UI.'},indent=2)+'\n')

# Navigation rim: all tab faces, icons and labels are transparent native slots.
with Image.open(SOURCE).convert('RGBA') as original:
 nav=original.crop((8,1860,777,1998));alpha=nav.getchannel('A');ImageDraw.Draw(alpha).rectangle((14,9,754,125),fill=0);nav.putalpha(alpha);nav.save(OUT/'city1-navigation-frame.png')

# The shelf rim is a separate movable composite; no fixed UI remains in the scene.
with Image.open(OUT/'city1-environment.png').convert('RGBA') as environment:
 environment.crop((5,536,779,704)).save(OUT/'city1-shelf-frame.png')
 alpha=environment.getchannel('A');ImageDraw.Draw(alpha).rectangle((4,535,780,705),fill=0);environment.putalpha(alpha);environment.save(OUT/'city1-environment.png')

# Full faces retain approved rim/photo artwork; live code paints an opaque footer
# interior before drawing its current cost, lock and timer values.
slots=[(37,540,175,692),(180,540,317,692),(325,540,465,692),(469,540,610,692),(614,540,755,692)]
with Image.open(SOURCE).convert('RGBA') as original:
 for index,box in enumerate(slots):original.crop(box).save(OUT/f'city1-producer-face-{index}.png')
