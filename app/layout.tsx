import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import Footer component
import { ReactNode } from "react";

export const metadata = {
  title: "The Great Wok",
  description: "Best Asian Cuisine in Town",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer /> {/* Add Footer below all content */}
      </body>
    </html>
  );
}
