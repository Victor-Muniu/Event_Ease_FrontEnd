import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import FeaturedEvents from "../components/FeaturedEvents";

import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";

function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
      <style jsx>{`
        :root {
          --primary: #4169e1;
          --text-primary: #1a1a1a;
          --text-secondary: #666;
          --background: #fff;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          line-height: 1.5;
          color: var(--text-primary);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Navigation */
        .navbar {
          padding: 1rem 0;
          background: var(--background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          color: var(--primary);
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: var(--text-primary);
        }

        .sign-in {
          color: var(--primary);
        }

        /* Hero Section */
        .hero {
          height: 600px;
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.5),
              rgba(0, 0, 0, 0.5)
            ),
            url("https://cdn.pixabay.com/photo/2016/12/28/20/30/wedding-1937022_1280.jpg");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          text-align: center;
          color: white;
        }

        .hero-content {
          width: 100%;
        }

        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .hero p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
        }

        .button-primary {
          background: var(--primary);
          color: white;
        }

        .button-outline {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        /* Featured Events */
        .featured-events {
          padding: 4rem 0;
        }

        .section-title {
          text-align: center;
          margin-bottom: 3rem;
          font-size: 2rem;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .event-card {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .event-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .event-content {
          padding: 1.5rem;
        }

        .event-content h3 {
          margin-bottom: 0.5rem;
        }

        /* Special Offer */
        .special-offer {
          background: #f8f9fa;
          padding: 2rem 0;
          text-align: center;
        }

        .special-offer h3 {
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        /* Why Choose Us */
        .why-choose-us {
          padding: 4rem 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .feature-card {
          padding: 2rem;
        }

        .feature-icon {
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        /* Testimonials */
        .testimonials {
          background: #f8f9fa;
          padding: 4rem 0;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .testimonial-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        /* Footer */
        .footer {
          background: #1a1a1a;
          color: white;
          padding: 4rem 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-links h4 {
          margin-bottom: 1rem;
        }

        .footer-links a {
          color: #999;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #333;
          color: #999;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .button-group {
            flex-direction: column;
          }

          .nav-links {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

export default Home;
