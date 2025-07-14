export default function Footer() {
  return (
    <footer className="bg-white border-t py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} ZentroBus. All rights reserved.
      </div>
    </footer>
  );
} 