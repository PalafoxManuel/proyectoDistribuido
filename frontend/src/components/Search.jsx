import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const buscar = () => {
    if (!query) return;

    fetch(`/busqueda/${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error en la búsqueda');
        return res.json();
      })
      .then((data) => {
        setResultados(data);
        setError(null);
      })
      .catch((err) => {
        setResultados([]);
        setError('No se encontraron resultados.');
      });
  };

  const irADetalle = (nombre) => {
    navigate(`/universidad/${encodeURIComponent(nombre)}`);
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
        <div className="card p-4">
          <div className="card-header text-center">
            <i className="bi bi-search"></i> Buscar Universidad
          </div>
          <div className="card-body">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la universidad"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" onClick={buscar}>
                Buscar
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {resultados.length > 0 && (
              <table className="table table-bordered mt-3">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Entidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((uni, i) => (
                    <tr key={i}>
                      <td>{uni.nombre}</td>
                      <td>{uni.entidad}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => irADetalle(uni.nombre)}
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
