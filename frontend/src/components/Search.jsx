import { useState, useEffect } from 'react';
import UniversidadCard from './UniversidadCard';

function Search() {
  const [searchingUniversidad, setSearchingUniversidad] = useState('');
  const [universidades, setUniversidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const fetchUniversidades = (query = '', page = 1, append = false) => {
    setLoading(true);
    const fetchUrl = query.trim() === '' ? `/busqueda-visibles` : `/busqueda/${encodeURIComponent(query.trim())}/${page}`;

    if (!append) setUniversidades([]); // Reset if not append

    fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.universidades) {
          setUniversidades((prev) => (append ? [...prev, ...data.universidades] : data.universidades));
          setTotalPages(data.pages || totalPages); // Update totalPages if present in response
          setShowLoadMore(page < totalPages);
        }
      })
      .catch((error) => console.error('Error en la solicitud Fetch:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUniversidades(); // Fetch universidades visibles on load
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchUniversidades(searchingUniversidad, 1);
    }, 400); // Espera 400ms después de dejar de escribir

    return () => clearTimeout(delayDebounce); // Limpia timeout si el usuario sigue escribiendo
  }, [searchingUniversidad]);


  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    fetchUniversidades(searchingUniversidad, 1);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
    fetchUniversidades(searchingUniversidad, currentPage + 1, true); // Fetch next page and append
  };

  return (
    <div style={{ backgroundColor: '#D6DBDF', minHeight: '100vh' }}>
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

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <h2><b>Panel de búsqueda</b></h2>
            <div className="input-group">
              <input
                type="text"
                id="searchBar"
                className="form-control"
                placeholder="Búsqueda..."
                aria-label="Buscar universidad"
                value={searchingUniversidad}
                onChange={(e) => setSearchingUniversidad(e.target.value)}
              />
              <button className="btn btn-dark" id="searchButton" type="button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="loadingSpinner" className={`d-${loading ? 'block' : 'none'} text-center my-5`}>
        <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row" id="universidadesContainer">
          {universidades.length > 0 ? (
            universidades.map((universidad, index) => (
              <UniversidadCard key={index} universidad={universidad} />
            ))
          ) : (
            <p className="text-center">No se encontraron resultados para "{searchingUniversidad}".</p>
          )}
        </div>
        {/* <div className="text-center mt-3">
          {showLoadMore && (
            <button id="loadMoreButton" className="btn btn-dark btn-block d-none my-4" onClick={handleLoadMore}>
              Cargar más
            </button>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default Search;
