import ModelViewer from '../components/ModelViewer'
export default function Page(){
  return <main className="p-8 space-y-6">
    <h1 className="text-3xl font-bold">1-Carat Ring</h1>
    <ModelViewer path="/models/the_ring_1_carat.glb" />
  </main>
}
