import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-dark text-neutral py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        {/* Company Info Section */}
        <div>
          <h3 className="text-2xl font-extrabold text-secondary mb-6">The Great Wok</h3>
          <p className="text-base text-neutral-300 leading-relaxed">
            Experience authentic Asian cuisine in a cozy and modern atmosphere. We use the freshest ingredients to serve our customers the best dining experience.
          </p>
        </div>

        {/* Quick Links Section */}
        <div>
          <h3 className="text-2xl font-extrabold text-secondary mb-6">Quick Links</h3>
          <ul className="space-y-3">
            <li className="transition-colors duration-200 hover:text-primary">
              <Link href="/">Home</Link>
            </li>
            <li className="transition-colors duration-200 hover:text-primary">
              <Link href="/menu">Menu</Link>
            </li>
            <li className="transition-colors duration-200 hover:text-primary">
              <Link href="/about">About Us</Link>
            </li>
            <li className="transition-colors duration-200 hover:text-primary">
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div>
          <h3 className="text-2xl font-extrabold text-secondary mb-6">Contact Us</h3>
          <p className="text-base text-neutral-300 mb-2">123 Foodie Street, Flavor Town</p>
          <p className="text-base text-neutral-300 mb-2">Phone: (123) 456-7890</p>
          <p className="text-base text-neutral-300 mb-6">Email: contact@thegreatwok.com</p>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="text-center pt-10 text-neutral-400 text-sm border-t border-secondary mt-12">
        &copy; {new Date().getFullYear()} Harvey Abantao. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
