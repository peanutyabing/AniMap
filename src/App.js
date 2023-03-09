import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import MapFeed from "./Components/MapFeed.js";
import Post from "./Components/Post.js";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          {/* Navbar placeholder */}
          <Routes>
            <Route path="/" element={<MapFeed />}>
              <Route path="posts/:postId" element={<Post />} />
            </Route>
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
