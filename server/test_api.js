const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testQuery() {
  const searchString = 'RPRO-260303-0312';
  try {
    const { data: masterHits, error: masterError } = await supabase
      .from('master_data')
      .select('rpro:"RPRO 365", vai:Cloth, pu:PU, bom:"BOM SKU 365", so_luong_don:"PO Q\'TY"')
      .ilike('RPRO 365', `%${searchString}%`)
      .limit(5);

    if (masterError) {
      console.error('LỖI SUPABASE:', masterError);
    } else {
      console.log('THÀNH CÔNG:', masterHits);
    }
  } catch (err) {
    console.error('CATCH ERROR:', err);
  }
}

testQuery();
