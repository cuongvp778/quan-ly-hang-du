const ExcelJS = require('exceljs');

async function readSample() {
  const file = '../Data1.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  
  const worksheet = workbook.worksheets[0]; // first worksheet
  let rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 5) {
      rows.push(row.values);
    }
  });
  console.log('--- EXCEL HEADERS AND SAMPLE ---');
  console.log(JSON.stringify(rows, null, 2));
}

readSample().catch(console.error);
