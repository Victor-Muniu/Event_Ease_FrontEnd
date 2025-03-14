import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>
              Event<span>Ease</span>
            </h2>
            <p>Making event discovery and creation simple for everyone.</p>
            <div className="social-links">
              <Link href="#" aria-label="Facebook">
                <Facebook size={20} />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram size={20} />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>For Attendees</h3>
              <ul>
                <li>
                  <Link href="#">Browse Events</Link>
                </li>
                <li>
                  <Link href="#">How It Works</Link>
                </li>
                <li>
                  <Link href="#">Pricing</Link>
                </li>
                <li>
                  <Link href="#">FAQs</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>For Organizers</h3>
              <ul>
                <li>
                  <Link href="#">Create Events</Link>
                </li>
                <li>
                  <Link href="#">Venue Booking</Link>
                </li>
                <li>
                  <Link href="#">Organizer Tools</Link>
                </li>
                <li>
                  <Link href="#">Success Stories</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Company</h3>
              <ul>
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
                <li>
                  <Link href="#">Blog</Link>
                </li>
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>
              &copy; {new Date().getFullYear()} EventEase. All rights reserved.
            </p>
          </div>
          <div className="legal-links">
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Cookie Policy</Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .footer {
          background-color: #1a1a1a;
          color: #fff;
          padding: 4rem 2rem 2rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-brand h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .footer-brand span {
          color: #8b76e5;
        }

        .footer-brand p {
          color: #aaa;
          margin-bottom: 1.5rem;
          max-width: 300px;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: #fff;
          transition: all 0.3s ease;
        }

        .social-links a:hover {
          background: #5d3fd3;
          transform: translateY(-3px);
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-links-column h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        .footer-links-column ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links-column li {
          margin-bottom: 0.75rem;
        }

        .footer-links-column a {
          color: #aaa;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links-column a:hover {
          color: #8b76e5;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .copyright p {
          color: #aaa;
          font-size: 0.9rem;
        }

        .legal-links {
          display: flex;
          gap: 1.5rem;
        }

        .legal-links a {
          color: #aaa;
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .legal-links a:hover {
          color: #8b76e5;
        }

        @media (max-width: 992px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .footer-brand {
            text-align: center;
          }

          .footer-brand p {
            max-width: 100%;
          }

          .social-links {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .footer-links {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
