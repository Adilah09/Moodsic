import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Moodsic. All rights reserved.</p>
      <p className="footer-subtext">Made with ❤️ by the Moodsic team</p>
    </footer>
  );
}
