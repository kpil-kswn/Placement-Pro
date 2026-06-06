import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Placement Pro",
  description: "Placement Pro, Now confirm your placement...!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="grow">{children}</div>
      </body>
    </html>
  );
}
