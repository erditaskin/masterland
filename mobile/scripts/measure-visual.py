"""Measure actual rendered geometry and stable cell art; never invent a global score.

Usage: python measure-visual.py --geometry <XCTest JSON> --screen <PNG> --out <JSON>
Requires Pillow. Reference decorations, live values and OS safe areas have different
semantics; this tool reports cell texture similarity separately from layout checks.
"""
import argparse,json,math
from pathlib import Path
from PIL import Image,ImageChops,ImageStat,ImageCms
from io import BytesIO
p=argparse.ArgumentParser();p.add_argument('--geometry',required=True);p.add_argument('--screen',required=True);p.add_argument('--out',required=True);args=p.parse_args()
def srgb(path):
    im=Image.open(path).convert('RGB')
    if im.info.get('icc_profile'):
        im=ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(BytesIO(im.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
    return im

g=json.loads(Path(args.geometry).read_text());screen=srgb(args.screen);cells=g['cells'];scale=screen.width/g['screen']['width'];root=Path(__file__).resolve().parents[1]
source=srgb(root/'assets/art/skin-reference.png')
# Index 18 is empty in the visual fixture and has no selection highlight.
r=cells[18];box=(round(r['x']*scale),round(r['y']*scale),round((r['x']+r['width'])*scale),round((r['y']+r['height'])*scale))
actual=screen.crop(box);target=source.crop((185,904,306,984)).resize(actual.size,Image.Resampling.BILINEAR)
margin=4;inner=(margin,margin,actual.width-margin,actual.height-margin)
diff=ImageChops.difference(actual.crop(inner),target.crop(inner));stats=ImageStat.Stat(diff);mae=sum(stats.mean)/3;mse=sum(v*v for v in stats.rms)/3
nav=[g['tab-'+k] for k in ['board','collection','cities','storage','market']]
checks={
 '54_cells':len(cells)==54,
 'reference_cell_proportions':max(abs(c['width']/c['height']-((732/6)/(710/8))) for c in cells)<0.015,
 'equal_last_row':max(abs(c['height']-cells[0]['height'])*scale for c in cells[-6:])<=1.01,
 'minimum_44_point_cell':min(min(c['width'],c['height']) for c in cells)>=44,
 'board_above_navigation':max(c['y']+c['height'] for c in cells)<min(n['y'] for n in nav),
 'equal_navigation_width':(max(n['width'] for n in nav)-min(n['width'] for n in nav))*scale<=1.01,
}
result={'screen_pixels':list(screen.size),'pixel_scale':scale,'reference_pixels':list(source.size),'reference_art_bounds':[25,27,800,1401],
 'checks':checks,'cell_point_size':{'width':cells[0]['width'],'height':cells[0]['height']},'reference_cell_aspect':(732/6)/(710/8),'maximum_cell_ratio_error':max(abs(c['width']/c['height']-((732/6)/(710/8))) for c in cells),
 'cell_texture':{'sample_index':18,'crop_pixels':list(box),'mean_absolute_channel_error':mae,'psnr_db':None if mse==0 else 20*math.log10(255/math.sqrt(mse)),'similarity_percent':100*(1-mae/255),'method':'both inputs converted to sRGB; bilinear reference ROI; 4 px edge excluded'},
 'full_frame_pixel_identity_claimed':False,'limitations':['Live order values and items differ from the reference.','Reference cell proportions are user-approved; 54 inventory slots remain as 6x9 rather than deleting a row.','Generated UI-free background is an art-direction match, not an identical pixel plate.','Cell similarity is not a whole-screen aesthetic score.']}
Path(args.out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))

if not all(checks.values()):
    raise SystemExit("Measured layout checks failed; inspect the JSON report.")
