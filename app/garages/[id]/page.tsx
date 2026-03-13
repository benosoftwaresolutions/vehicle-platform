import Navbar from "@/app/components/Navbar"
import BookingForm from "@/app/components/BookingForm"

type Params = {
  params: Promise<{
    id: string
  }>
}

async function getGarage(id: string) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  const data = await res.json()
  return data
}

export default async function GarageDetail({ params }: Params) {
  const { id } = await params
  const garage = await getGarage(id)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <div className="border rounded-lg p-6 shadow-md">
          <h1 className="text-4xl font-bold mb-2">{garage.name}</h1>
          <p className="text-gray-500 mb-1">📍 {garage.address.city}, {garage.address.street}</p>
          <p className="text-gray-500 mb-1">📞 {garage.phone}</p>
          <p className="text-gray-500 mb-4">🌐 {garage.website}</p>
          <div className="border-t pt-4">
            <h2 className="text-xl font-bold mb-2">Services Offered</h2>
            <div className="flex gap-2 flex-wrap">
              {["MOT", "Full Service", "Oil Change", "Tyres", "Brakes"].map((service) => (
                <span key={service} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h2 className="text-xl font-bold mb-2">About</h2>
            <p className="text-gray-600">A trusted local garage offering a wide range of vehicle services. Fully qualified technicians with years of experience.</p>
          </div>
          <BookingForm garageId={id} />
        </div>
      </main>
    </>
  )
}