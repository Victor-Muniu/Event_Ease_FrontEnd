import React from "react";
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Features from "../components/Features"
import HowItWorks from "../components/HowItWorks"
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer"
function LandingPage() {
  return (
    <div>
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
        <Footer />
      <style jsx>{`
        :root {
          --primary: #5d3fd3;
          --primary-dark: #4c33b0;
          --secondary: #ff7c00;
          --secondary-dark: #e66d00;
          --text-primary: #333333;
          --text-secondary: #666666;
          --background: #ffffff;
          --background-alt: #f5f7fa;
          --border: #eaeaea;
        }

        * {
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }

        html,
        body {
          max-width: 100vw;
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          color: var(--text-primary);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }

        html {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          html {
            font-size: 15px;
          }
        }

        @media (max-width: 576px) {
          html {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
