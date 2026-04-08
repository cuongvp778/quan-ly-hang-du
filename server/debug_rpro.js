const ExcelJS = require('exceljs');
const path = require('path');

async function debugRPRO() {
  const targetRPRO = 'RPRO-300203-0145'.toLowerCase();
  const file = path.join(__dirname, '../Data1.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const worksheet = workbook.worksheets[0];
  
  console.log('--- SEARCHING FOR RPRO ---');
  let foundCount = 0;
  worksheet.eachRow((row, rowNumber) => {
    const vals = row.values;
    // vals[4] là cột RPRO 365 dựa trên phân tích trước đó
    const rpro = vals[4] ? String(vals[4]).trim().toLowerCase() : '';
    if (rpro.includes(targetRPRO)) {
      foundCount++;
      console.log(`Row ${rowNumber} matches!`);
      console.log(JSON.stringify(vals, null, 2));
    }
  });
  
  if (foundCount === 0) {
    console.log('RPRO NOT FOUND IN EXCEL');
  }
}

debugRPRO().catch(console.error);
