import Navbar from "../../components/Navbar"

type Params = {
  params: Promise<{
    id: string
  }>
}

export default async function GarageDetail({ params }: Params) {
  const { id } = await params

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Garage Details</h1>
        <p className="text-gray-500 mb-8">Viewing garage ID: {id}</p>
      </main>
    </>
  )
}