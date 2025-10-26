'use client'
import { notFound } from 'next/navigation'
import ModelViewer from '../../components/ModelViewer'

const MAP: Record<string,string> = {
  diamond: '/models/diamond.glb',
  ring: '/models/ring.glb',
  carat: '/models/the_ring_1_carat.glb',
}

export default function ModelPage({ params }: { params: { name: string } }) {
  const key = (params.name || '').toLowerCase()
  const path = MAP[key]
  if (!path) return notFound()
  return (
    <main className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold capitalize">{key} Preview</h1>
      <ModelViewer path={path} />
    </main>
  )
}
