import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avphywyhlxajyhqudkts.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cGh5d3lobHhhanlocXVka3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTM1MDEsImV4cCI6MjA1MDQ2OTUwMX0.wwNFD49QaoTOc36E37MRpBtwptSYi5zrKmUSqPSLt04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);