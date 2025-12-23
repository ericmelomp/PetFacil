echo "Dumping database..."
PGPASSWORD="petshop123" pg_dump -h 192.168.15.10 -p 5432 -U petshop -d petshop_db -F c -f db.dump
echo "Dump file created: db.dump"
echo "Restoring database..."
PGPASSWORD="petshop123" pg_restore -h 192.168.15.10 -p 5433 -U petshop -d petshop_db -c db.dump
echo "Database restored"
echo "Removing dump file..."
rm db.dump
echo "Done"