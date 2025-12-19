const version='0.3-xi';
export const Footer = () => (
    <footer className="text-center text-gray-400 text-sm py-2 border-t">
      © {new Date().getFullYear()}  version {version}
    </footer>
);