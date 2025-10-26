import ModelViewer from '../components/ModelViewer'
export default function Page(){
  return <main className="p-8 space-y-6">
    <h1 className="text-3xl font-bold">Diamond</h1>
    <ModelViewer path="/models/diamond.glb" />
  </main>
}
