import ModelViewer from '../components/ModelViewer'
export default function Page(){
  return <main className="p-8 space-y-6">
    <h1 className="text-3xl font-bold">Ring</h1>
    <ModelViewer path="/models/ring.glb" />
  </main>
}
