import { Banner } from "./components/Banner/Banner.tsx";
import { Explanation } from "./components/Explanation/Explanation.tsx";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { SearchBar } from "./components/SearchBar/SearchBar.tsx";
import "./app.css";

export function App() {
  return (
    <>
      <Navbar />
      <main className="page-shell stack">
        <Banner />
        <SearchBar />
        <Explanation />
      </main>
    </>
  );
}
