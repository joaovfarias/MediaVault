export default function Header() {
  return (
    <header className="bg-[#345643] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">MediaVault</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="#" className="hover:text-[#a8c7b8]">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#a8c7b8]">
                Files
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#a8c7b8]">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
