"""Measure alpha bounds without editing atlas pixels. Requires requirements-visual.txt."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]/'assets/art'
result={}
for kind,rows in [('approved',2),('products',5)]:
    im=Image.open(root/('products-approved.png' if kind=='approved' else 'products.png'))
    w,h=im.size
    rects=[]
    for i in range(rows*4):
        x=round((i%4)*w/4);x2=round((i%4+1)*w/4)
        y=round((i//4)*h/rows);y2=round((i//4+1)*h/rows)
        tile=im.crop((x,y,x2,y2))
        bbox=tile.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
        if bbox is None: raise ValueError(f'Empty atlas region: {kind}/{i}')
        l=max(0,bbox[0]-3);t=max(0,bbox[1]-3)
        r=min(x2-x,bbox[2]+3);b=min(y2-y,bbox[3]+3)
        rects.append([x+l,y+t,r-l,b-t])
    result[kind]=rects
(root/'item-bounds.json').write_text(json.dumps(result,indent=2)+'\n')
