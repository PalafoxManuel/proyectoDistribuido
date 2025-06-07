// src/components/Search.jsx
import { useState, useEffect } from 'react';
import UniversidadCard from './UniversidadCard';

/*  URL base del backend.  Se lee de .env →  REACT_APP_API_URL=http://localhost:3000  */
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Search() {
  const [query,          setQuery]          = useState('');
  const [universidades,  setUniversidades]  = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [page,           setPage]           = useState(1);
  const [pages,          setPages]          = useState(1);

  /* ────────────────────────────────────────────────────────── */
  const fetchUniversidades = async (texto = '', pageNum = 1, append = false) => {
    try {
      setLoading(true);

      /* URL absoluta (sin proxy) */
      const url = texto.trim() === ''
        ? `${API}/busqueda-visibles`
        : `${API}/busqueda/${encodeURIComponent(texto.trim())}/${pageNum}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);           // no sigas si no es 2xx

      const data = await res.json();
      if (!data || !data.universidades) return;

      setUniversidades(prev =>
        append ? [...prev, ...data.universidades] : data.universidades
      );

      const totalPages = data.pages ?? 1;
      setPages(totalPages);
    } catch (err) {
      console.error('Error en la solicitud Fetch:', err.message);
    } finally {
      setLoading(false);
    }
  };
  /* ────────────────────────────────────────────────────────── */

  /* Al montar → carga visibles */
  useEffect(() => {
    fetchUniversidades();
  }, []);

  /* Búsqueda con debounce */
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      fetchUniversidades(query, 1);
    }, 400);
    return () => clearTimeout(id);
  }, [query]);

  /* Handlers ------------------------------------------------- */
  const handleSearch    = () => { setPage(1); fetchUniversidades(query, 1); };
  const handleLoadMore  = () => {
    const next = page + 1;
    setPage(next);
    fetchUniversidades(query, next, true);
  };

  /* Render --------------------------------------------------- */
  return (
    <div style={{ backgroundColor: '#D6DBDF', minHeight: '100vh' }}>
      {/* barra superior */}
      <header data-bs-theme="dark">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand d-flex align-items-center" href="/">
              <img src="https://uabcs.net/anuies/partidos/logo.png" alt="ANUIESLOGO" width="40" height="40" />
              <strong className="mx-1">A N U I E S</strong>
            </a>
          </div>
        </nav>
      </header>

      {/* buscador */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <h2><b>Panel de búsqueda</b></h2>
            <div className="input-group">
              <input
                className="form-control"
                placeholder="Búsqueda..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button className="btn btn-dark" onClick={handleSearch}>
                <i className="bi bi-search" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* spinner */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-dark" style={{ width:'3rem', height:'3rem' }} />
        </div>
      )}

      {/* resultados */}
      <div className="container mt-4">
        <div className="row">
          {universidades.map((u, i) => (
            <UniversidadCard key={i} universidad={u} />
          ))}
        </div>

        {!loading && universidades.length === 0 && (
          <p className="text-center">
            No se encontraron resultados para "{query}".
          </p>
        )}

        {page < pages && (
          <div className="text-center mt-3">
            <button className="btn btn-dark" onClick={handleLoadMore}>
              Cargar más
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
