import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — list files for a discipline
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const discipline = searchParams.get('discipline')

  if (!discipline) {
    return NextResponse.json({ error: 'discipline is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('rulebook_files')
    .select('*')
    .eq('discipline', discipline)
    .order('uploaded_at', { ascending: false })

  if (error) throw error

  return NextResponse.json({ files: data || [] })
}

// DELETE — remove a file and its chunks
export async function DELETE(request: NextRequest) {
  try {
    const { fileId, discipline, originalName, fileName } = await request.json()

    // Delete chunks from this file
    await supabase
      .from('rulebook_chunks')
      .delete()
      .eq('discipline', discipline)
      .eq('source_file', originalName)

    // Delete from storage
    await supabase.storage
      .from('rulebook')
      .remove([fileName])

    // Delete file record
    await supabase
      .from('rulebook_files')
      .delete()
      .eq('id', fileId)

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}