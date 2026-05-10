const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSpecificRpro() {
  const target = 'RPRO-260303-0312';
  console.log(`Searching for: [${target}]`);
  
  const { data, error } = await supabase
    .from('master_data')
    .select('\"RPRO 365\", Brand, Customer')
    .ilike('RPRO 365', `%${target}%`);

  if (error) {
    console.error('Search error:', error);
  } else {
    console.log(`Found ${data.length} matches:`, JSON.stringify(data, null, 2));
  }
}

checkSpecificRpro();
