import { Search, MapPin } from "lucide-react"

export default function SearchSection() {
  return (
    <section className="search-section">
      <div className="container">
        <h1 className="search-title">Find Your Next Event</h1>

        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input type="text" className="search-input" placeholder="Search events by name, location, or type" />
        </div>

        <div className="filters">
          <select className="filter-select">
            <option value="">Select Location</option>
            <option value="ny">New York</option>
            <option value="sf">San Francisco</option>
            <option value="ch">Chicago</option>
          </select>

          <select className="filter-select">
            <option value="">Event Type</option>
            <option value="music">Music</option>
            <option value="tech">Technology</option>
            <option value="food">Food & Drink</option>
          </select>

          <select className="filter-select">
            <option value="">Price Range</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <button className="location-button">
            <MapPin size={20} />
            Search Events Near Me
          </button>
        </div>
      </div>
    </section>
  )
}

