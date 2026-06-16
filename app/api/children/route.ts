import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('children')
    .select('*, activities(*)')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, color } = body

  const { data, error } = await supabase
    .from('children')
    .insert({ name, color })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
