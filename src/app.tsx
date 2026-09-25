import { Banner } from "./components/Banner/Banner.tsx";
import { Explanation } from "./components/Explanation/Explanation.tsx";
import { Navbar } from "./components/Navbar/Navbar.tsx";
import { SearchBar } from "./components/SearchBar/SearchBar.tsx";
import "./app.css";

export function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="page-shell stack">
        <section className="call-to-action" aria-label="kanji meaning search bar">
          <Banner />
          <SearchBar />
        </section>
        <Explanation />
      </main>
    </div>
  );
}
