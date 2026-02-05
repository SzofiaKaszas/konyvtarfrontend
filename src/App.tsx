import { useEffect, useState, type SubmitEvent } from "react";
import 'bootstrap/dist/css/bootstrap.css'
import "./App.css";
import type { Book } from "./interfaces";

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState("");
  const [rentError, setRentError] = useState("");
  const [rentSuccess, setRentSuccess] = useState("");

  async function getData() {
    const res = await fetch("http://localhost:3000/api/books", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Failed to load user data");
      return undefined;
    }
    const books = (await res.json()) as Book[];
    setBooks(books);
  }

  useEffect(() => {
    getData();
  }, []);

  async function hadleSubmit(e:SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget);

    const data = {
      title: form.get("title"),
      author: form.get("author"),
      publish_year: Number(form.get("releaseYear")),
      page_count: Number(form.get("pages"))
    } 

    const res = await fetch("http://localhost:3000/api/books", {
      method: "POST",
      headers:{
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if(res.status === 400){
      const errorObj = await res.json();
      const errors = errorObj.message as string[];
      setError(errors.join("; "))
      return;
    }

    getData();
    setError("");
    e.target.reset();
  }

  async function rent(id:number) {
    const res = await fetch(`http://localhost:3000/api/books/${id}/rent`, {
      method: "POST",
      headers:{
        'Content-type': 'application/json'
      },
    })

    if(res.status === 400){
      const errorObj = await res.json();
      setRentError(errorObj.message)
      setRentSuccess("");
      return;
    }
    else{
      setRentError("")
      setRentSuccess("Sikeres");
    }
  }

  return (
    <>
    <header>
      <h1>Petrik Könyvtár Nyilvántartó</h1>
      <nav className="navbar">
        <a href="#ujkonyv"></a>
        <a href="https://petrik.hu"></a>
      </nav>
    </header>
      <main className="container-fluid">
        {rentError ? <p className="alert alert-danger">{rentError}</p> : <></>}
        {rentSuccess ? <p className="primary">{rentSuccess}</p> : <></>}
        <div className="row row-cols-sm-1 row-cols-md-2 row-cols-lg-3">
        {books.map((book) => (
          <div>
          <h2>{book.title}</h2>
          <h3>{book.author}</h3>
          <p>Kiadási év: {book.publish_year}</p>
          <p>Hossz: {book.page_count}</p>
          <img src={`/konyvtarfrontend/src/img/${book.author}.jpg`}></img>
          <button onClick={() => rent(book.id)}>Kölcsönzés</button>
          </div>
        ))}
        </div>
        <form onSubmit={(e) => hadleSubmit(e)} id="ujkonyv">
          {error ? <p className="alert alert-danger">{error}</p> : <></>}
          <div>
            <label>Title:</label>
            <input type="text" name="title" required></input>
          </div>
          <div>
            <label>Author:</label>
            <input type="text" name="author" required></input>
          </div>
          <div>
            <label>Release Year:</label>
            <input type="number" name="releaseYear" required></input>
          </div>
          <div>
            <label>Page:</label>
            <input type="number" name="pages" required></input>
          </div>
        </form>
      </main>
      <footer></footer>
    </>
  );
}

export default App;
