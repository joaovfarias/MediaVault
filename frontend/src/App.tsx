import Header from "./Components/Header";

export default function App() {
  return (
    // Center in the middle of screen
    <div className="flex flex-col items-center justify-center min-h-screen text-4xl font-bold text-[#345643]">
      <Header />
      Welcome to MediaVault!
    </div>
  );
}
