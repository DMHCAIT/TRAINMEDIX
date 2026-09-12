#!/bin/bash
# This script helps diagnose the department fetching issue
# Run in Supabase SQL Editor

echo "=== TRAINNEEDIX DEPARTMENT DEBUG ==="
echo ""
echo "1. Check what departments exist:"
echo "SELECT id, hospital_id, department_name FROM hospital_departments ORDER BY created_at DESC;"
echo ""
echo "2. Check what hospitals exist:"
echo "SELECT id, hospital_name, role FROM registered_users WHERE role = 'hospital' LIMIT 10;"
echo ""
echo "3. Check if your hospital_id exists in registered_users:"
echo "SELECT id, hospital_name FROM registered_users WHERE id = 'usr-1789026093174';"
echo ""
echo "4. If hospital doesn't exist, you need to create it or use the correct ID"
echo "5. Check RLS policies on hospital_departments:"
echo "SELECT * FROM pg_policies WHERE tablename = 'hospital_departments';"
echo ""
echo "If you still can't see departments after these checks,"
echo "the issue might be:"
echo "- RLS policies blocking the read"
echo "- Wrong hospital_id in AppContext"
echo "- Hospital record not properly created"
