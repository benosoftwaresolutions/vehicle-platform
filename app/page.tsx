function GarageCard({name, location, rating,services, }: {name:string, location:string, rating: string, services: string,}) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Location: {location}</p>
      <p>Rating: {rating}/5 </p>
      <p>Services: {services} </p>
    </div>
  )
}
export default function Home() {
  return (
    <main>
      <h1>Vehicle Platform</h1>
      <p>Find and book a garage near you</p>
      <GarageCard  name="Bens Garage" location="Manchester" rating="4.5" services="MOT, Full Service" />
      <GarageCard  name="City Motors" location="Birmingham" rating="3.8" services="MOT, Full Service" />
      <GarageCard  name="Quick Fix" location="London" rating="4.9" services="MOT, Full Service" />
    </main>
  )
}
