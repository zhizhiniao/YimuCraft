import sys, time, json
from pathlib import Path
sys.path.insert(0, str(Path('work/fixture-python').resolve()))
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
name = 'YimuCraftValidation' + str(int(time.time()*1000))
root = Path('work/font-install-' + name).resolve()
root.mkdir(parents=True)
font = FontBuilder(1000, isTTF=True)
font.setupGlyphOrder(['.notdef', 'A'])
font.setupCharacterMap({65: 'A'})
glyphs = {}
for glyph in ['.notdef', 'A']:
    pen = TTGlyphPen(None)
    if glyph == 'A':
        pen.moveTo((40, 0)); pen.lineTo((300, 700)); pen.lineTo((560, 0)); pen.closePath()
    glyphs[glyph] = pen.glyph()
font.setupGlyf(glyphs)
font.setupHorizontalMetrics({g:(600, 0) for g in glyphs})
font.setupHorizontalHeader(ascent=800, descent=-200)
font.setupNameTable({'familyName': name, 'styleName':'Regular', 'uniqueFontIdentifier':name,
                    'fullName':name, 'psName':name, 'version':'Version 1.0'})
font.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
font.setupPost(); font.setupMaxp()
file = root / (name+'.ttf'); font.save(file)
Path('work/font-fixture.json').write_text(json.dumps({'name':name,'file':str(file),'root':str(root)}), encoding='utf-8')
print(file)
