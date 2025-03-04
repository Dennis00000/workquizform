-- Function to get all tables in the public schema
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (table_name text, table_schema text) AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text, t.table_schema::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all functions in the public schema
CREATE OR REPLACE FUNCTION get_functions()
RETURNS TABLE (name text, schema text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.proname::text, n.nspname::text
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute SQL (admin only)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 