export class TitleScene {
  constructor(renderer, input, onStart) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this.input = input;
    this.onStart = onStart;
    this.elapsed = 0;
    this.selection = 0;
    this.logo = null;
    this.soldiers = null;
    this.loadAssets();
  }
  loadAssets() {
    const sheet = new Image();
    sheet.onload = () => {
      const crop = document.createElement("canvas");
      crop.width = 240; crop.height = 128;
      const ctx = crop.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(sheet, 20, 448, 240, 128, 0, 0, 240, 128);
      this.removeKeyColor(ctx, crop.width, crop.height);
      this.logo = crop;
    };
    sheet.src = "assets/miscellaneous/Miscellaneous%20-%20Title%20Screens.png";
    const soldiers = new Image();
    soldiers.onload = () => { this.soldiers = soldiers; };
    soldiers.src = "assets/characters/contra-title-soldiers.png";
  }
  removeKeyColor(ctx, width, height) {
    const image = ctx.getImageData(0, 0, width, height);
    const p = image.data, seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
    let read = 0, write = 0;
    const isKey = i => { const n=i*4; return p[n]>190 && p[n+2]>190 && p[n+1]<90; };
    const add = i => { if (!seen[i] && isKey(i)) { seen[i]=1; queue[write++]=i; } };
    for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
    for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
    while(read<write){
      const i=queue[read++],x=i%width,y=(i/width)|0;
      p[i*4+3]=0;
      if(x)add(i-1);if(x<width-1)add(i+1);if(y)add(i-width);if(y<height-1)add(i+width);
    }
    ctx.putImageData(image,0,0);
  }
  update(dt) {
    this.elapsed += dt;
    if(this.input.wasPressed("arrowup","w")) this.selection=0;
    if(this.input.wasPressed("arrowdown","s")) this.selection=1;
    if(this.input.wasPressed("enter","z"," ")) this.onStart(this.selection+1);
  }
  outlinedText(text,x,y,size,align="left") {
    const c=this.ctx;
    c.font=`${size}px "Press Start 2P", monospace`;
    c.textAlign=align;c.textBaseline="middle";
    c.fillStyle="#b50062";c.fillText(text,x+1,y+1);
    c.fillStyle="#dedede";c.fillText(text,x,y);
  }
  drawFlameV() {
    const c=this.ctx;
    const rows=[
      [0,0,22,4,"#e8e82c"],[2,4,18,4,"#e8e82c"],[4,8,14,4,"#f0c51d"],
      [6,12,10,4,"#ed8b16"],[8,16,6,4,"#e84b18"],[10,20,2,4,"#cf2524"]
    ];
    rows.forEach(([x,y,w,h,color])=>{c.fillStyle=color;c.fillRect(54+x,108+y,w,h);});
    c.fillStyle="#fff";c.fillRect(53,107,3,3);c.fillRect(75,107,3,3);
    c.fillStyle="#8d8d8d";c.fillRect(59,130,3,3);c.fillRect(69,130,3,3);
  }
  draw() {
    const r=this.renderer,c=this.ctx;
    r.clear("#000");
    if(this.logo)c.drawImage(this.logo,43,19,170,91);
    else this.outlinedText("CONTRA",128,67,25,"center");
    this.drawFlameV();
    this.outlinedText("IETNAM",83,130,10,"left");
    const blink=Math.floor(this.elapsed*3)%2===0;
    r.text("WYBÓR GRACZY",56,158,6,"#bdbdbd","left");
    ["1 GRACZ","2 GRACZY"].forEach((label,i)=>{
      const y=176+i*17;
      if(this.selection===i&&blink){
        r.rect(54,y-3,4,4,"#d9e923");r.rect(58,y-5,4,8,"#d9e923");r.rect(62,y-3,4,4,"#d9e923");
      }
      r.text(label,72,y,7,this.selection===i?"#eeeeee":"#b9b9b9","left");
    });
    if(this.soldiers)c.drawImage(this.soldiers,158,126,75,58);
    r.text("© 2026",128,207,5,"#bdbdbd","center");
    r.text("PROJEKT FANOWSKI",128,219,5,"#bdbdbd","center");
    r.text("BY J JAK JAMNIK",128,231,5,"#bdbdbd","center");
  }
}
