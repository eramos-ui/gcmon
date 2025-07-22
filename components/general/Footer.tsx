const version='0.2-ípsilon';
export const Footer = () => (
    <footer className="text-center text-gray-400 text-sm py-2 border-t">
      © {new Date().getFullYear()}  version {version}
    </footer>
);