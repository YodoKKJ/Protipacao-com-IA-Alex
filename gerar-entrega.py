from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from PIL import Image as PILImage
from xml.sax.saxutils import escape
import pypdfium2 as pdfium
root=Path(__file__).resolve().parent
out=root/'entrega-aula1'
style=ParagraphStyle('body',fontName='Helvetica',fontSize=9.5,leading=13,spaceAfter=5)
h=ParagraphStyle('heading',parent=style,fontName='Helvetica-Bold',fontSize=11,leading=14,spaceBefore=7,spaceAfter=4)
t=ParagraphStyle('title',parent=style,fontName='Helvetica-Bold',fontSize=21,leading=25,spaceAfter=10)
def footer(c,d):
 c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#555555'));c.drawString(38,24,'Reencontra | Prototipação com IA e UI/UX | Aula 1');c.drawRightString(A4[0]-38,24,str(d.page))
story=[]
for line in (out/'documento.md').read_text(encoding='utf-8-sig').splitlines():
 if not line.strip():continue
 s=t if line.startswith('# ') else h if line.startswith('## ') else style
 text=line[2:] if line.startswith('# ') else line[3:] if line.startswith('## ') else line
 story.append(Paragraph(escape(text),s))
SimpleDocTemplate(str(out/'SeuNome_Aula1_Reencontra.pdf'),pagesize=A4,rightMargin=38,leftMargin=38,topMargin=32,bottomMargin=38).build(story,onFirstPage=footer,onLaterPages=footer)
story=[]
entries=[('01-mural.jpg','Tela 1 - Lista e busca','Tarefa principal: procurar um objeto e abrir seus detalhes.'),('02-detalhes.jpg','Tela 2 - Detalhes do objeto','Consultar descrição e local de retirada. Voltar à lista pelo link.'),('03-cadastro.jpg','Tela 3 - Cadastro simples','Preencher nome, local e descrição. A confirmação aparece na lista.')]
for i,(file,title,caption) in enumerate(entries):
 if i:story.append(PageBreak())
 story.extend([Paragraph(title,t),Paragraph(caption,style),Spacer(1,10)])
 path=out/'telas'/file
 with PILImage.open(path) as im:
  # Remove only blank outer margins; preserve the full prototype content.
  gray=im.convert('RGB'); import PIL.ImageChops
  box=PIL.ImageChops.difference(gray,PILImage.new('RGB',gray.size,'white')).getbbox()
  if box:
   l,top,r,bottom=box; cropped=im.crop((max(0,l-12),max(0,top-12),min(im.width,r+12),min(im.height,bottom+12)))
  else:cropped=im.copy()
  dest=out/'telas'/('recorte-'+file);cropped.save(dest,quality=95)
  w,hh=cropped.size
  factor=min(515/w,660/hh)
  story.append(Image(str(dest),width=w*factor,height=hh*factor))
SimpleDocTemplate(str(out/'SeuNome_Aula1_Reencontra_Telas.pdf'),pagesize=A4,rightMargin=38,leftMargin=38,topMargin=32,bottomMargin=38).build(story,onFirstPage=footer,onLaterPages=footer)
qa=root/'tmp'/'pdfs';qa.mkdir(exist_ok=True,parents=True)
for name in ['SeuNome_Aula1_Reencontra','SeuNome_Aula1_Reencontra_Telas']:
 pdf=pdfium.PdfDocument(str(out/(name+'.pdf')))
 print(name,len(pdf))
 for i in range(len(pdf)):
  pdf[i].render(scale=1.1).to_pil().save(qa/(name+'-'+str(i+1)+'.png'))
