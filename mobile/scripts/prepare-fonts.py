"""Create reproducible static font weights with distinct iOS PostScript identities.

Requires fonttools. Original variable fonts and OFL licenses stay alongside outputs.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root=Path(__file__).resolve().parents[1]/'assets/fonts'
for family,weight in [('Alegreya',600),('Nunito',600),('Nunito',800)]:
    source=TTFont(root/(family+'.ttf'))
    assert all(ord(c) in source.getBestCmap() for c in 'ÇĞİÖŞÜçğıöşü0123456789')
    font=instantiateVariableFont(source,{'wght':weight},inplace=False)
    style='SemiBold' if weight==600 else 'ExtraBold'
    names={1:'Masterland '+family,2:style,3:'Masterland-'+family+'-'+str(weight),4:'Masterland '+family+' '+style,6:'Masterland'+family+'-'+style,16:'Masterland '+family,17:style}
    for record in font['name'].names:
        if record.nameID in names:
            font['name'].setName(names[record.nameID],record.nameID,record.platformID,record.platEncID,record.langID)
    font.save(root/f'{family}-{weight}.ttf')
    assert font['OS/2'].usWeightClass==weight
    print(font['name'].getDebugName(6),'Turkish and digits verified')
