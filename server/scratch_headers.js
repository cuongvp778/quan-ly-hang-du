const ExcelJS = require('exceljs');
const path = require('path');

async function readSample() {
  const file = path.join(__dirname, '..', 'Data1.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  
  const worksheet = workbook.worksheets[0];
  const headers = worksheet.getRow(1).values;
  console.log('--- HEADERS ---');
  console.log(JSON.stringify(headers));
}

readSample().catch(console.error);
