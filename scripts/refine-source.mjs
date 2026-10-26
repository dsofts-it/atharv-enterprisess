import fs from 'node:fs';
const css='client/src/styles.css';
const colors={
 '#174c46':'#145c72','#173d3d':'#143e54','#234440':'#193e50','#183f3e':'#133e55','#194f46':'#125d77','#173c3712':'#123f5612',
 '#fdfdf9':'#fbfdfe','#fffefa':'#ffffff','#f3f4ed':'#f2f7fa','#f2f4eb':'#f0f7fa','#e8eee1':'#e5f2f7','#ecf1e8':'#eaf4f8','#edf3ec':'#eaf4f8','#edf2e6':'#e9f4f9','#edf1e7':'#eef5f8','#eaf0e3':'#e7f3f9','#f1f4e9':'#edf6fa',
 '#627570':'#586f7d','#5a7761':'#3b7d91','#4e6c5a':'#376d82','#dce4da':'#d8e5eb','#0c3b33':'#10475d','#e8eee2':'#e4f1f6','#163d32':'#123f55','#5d6c62':'#5a707d','#173e36':'#10374d','#eaf0df':'#e8f4f9','#aabfaf':'#abc2ce','#b5c6b6':'#b5cbd6','#496452':'#3e6174','#a5baa8':'#a3bfce','#9cb09f':'#9eb8c5','#b7cfbd':'#b2d2df',
 '#e8efdf':'#e1f1f8','#f4f6ef':'#f0f5f8','#e9f0df':'#e3f1f8','#e5eddc':'#dceff8','#234e37':'#15556f','#163b3320':'#123f5520',
 '#dce3d4':'#dcebf2','#173e3a50':'#103e5750','#fdfdf7':'#fbfdfe','#e2e8d9':'#dcecf3','#e8eee0':'#e1f1f8','#f2f5eb':'#eef6fa','#eaf0e5':'#e4f3fa','#e8efec':'#e3f2f5','#f5f7ed':'#f4f9fb','#f4f6ee':'#f2f7fa'
};
let text=fs.readFileSync(css,'utf8');for(const [from,to] of Object.entries(colors))text=text.replaceAll(from,to);fs.writeFileSync(css,text);
for(const name of ['auth','admin','portal','workflows']){const file=`server/src/${name}.ts`;const source=fs.readFileSync(file,'utf8').replaceAll('new:true',"returnDocument:'after'");fs.writeFileSync(file,source);}
