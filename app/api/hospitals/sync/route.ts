import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * SYNC HOSPITAL: Ensures hospital exists in registered_users table
 * This is a critical fix for the department/slot workflow
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      hospitalId, 
      hospitalName, 
      email, 
      phone 
    } = body;

    console.log('[syncHospital] Syncing hospital:', hospitalId);

    if (!hospitalId || !hospitalName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing hospitalId or hospitalName' 
      }, { status: 400 });
    }

    // Check if hospital already exists
    const { data: existing, error: checkError } = await supabase
      .from('registered_users')
      .select('id')
      .eq('id', hospitalId)
      .single();

    if (existing) {
      console.log('[syncHospital] Hospital already exists:', hospitalId);
      return NextResponse.json({ 
        success: true, 
        message: 'Hospital already exists',
        hospital: existing 
      });
    }

    // Hospital doesn't exist, create it
    console.log('[syncHospital] Creating new hospital record');
    const { data: created, error: createError } = await supabase
      .from('registered_users')
      .insert([{
        id: hospitalId,
        hospital_name: hospitalName,
        email: email || `${hospitalName.toLowerCase().replace(/\s+/g, '')}@hospital.local`,
        phone: phone || '',
        role: 'hospital',
        isApproved: true, // Assuming approved since they're logged in
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('[syncHospital] Error creating hospital:', createError.message);
      return NextResponse.json({ 
        success: false, 
        error: createError.message 
      }, { status: 500 });
    }

    console.log('[syncHospital] Hospital created successfully:', created.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Hospital synced successfully',
      hospital: created
    });
  } catch (error: any) {
    console.error('[syncHospital] Exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
