const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('./src/app/dashboard'), ...walk('./src/app/actions')];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let old = c;
  c = c.replace(/\"\/beneficiaries/g, '"/dashboard/beneficiaries')
       .replace(/\"\/pigs/g, '"/dashboard/pigs')
       .replace(/\"\/litters/g, '"/dashboard/litters')
       .replace(/\"\/finance/g, '"/dashboard/finance')
       .replace(/\"\/visits/g, '"/dashboard/visits')
       .replace(/\"\/tasks/g, '"/dashboard/tasks')
       .replace(/\"\/veterinary/g, '"/dashboard/veterinary')
       .replace(/\`\/pigs/g, '`/dashboard/pigs')
       .replace(/\`\/beneficiaries/g, '`/dashboard/beneficiaries')
       .replace(/\`\/litters/g, '`/dashboard/litters');
  if (c !== old) fs.writeFileSync(f, c);
});
cd "C:\Users\IT MODERN LTD\Downloads\pig project\pig-project"
npm.cmd run dev