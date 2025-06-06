import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Search from './components/Search';
import InformacionGeneral from './components/InformacionGeneral';
import FinanciamientoInstitucional from './components/FinanciamientoInstitucional';
import MatriculaGeneral from './components/MatriculaGeneral';
import OfertaEducativa from './components/OfertaEducativa';
import OfertaEducativaResumen from './components/OfertaEducativaResumen';
import MatriculaResumen from './components/MatriculaResumen';
import FortalecimientoAcademico from './components/FortalecimientoAcademico';
import PoblacionDocenteAdmin from './components/PoblacionDocenteAdmin';

function UniversidadDetalle() {
  return (
    <div style={{ backgroundColor: '#D6DBDF', minHeight: '100vh' }}>
      <header data-bs-theme="dark">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand d-flex align-items-center" href="/">
              <img src="https://uabcs.net/anuies/partidos/logo.png" alt="ANUIESLOGO" width="40" height="40" />
              <strong className="mx-1">A N U I E S</strong>
            </a>
            <div className="d-flex ms-auto">
              <button className="btn btn-outline-light btn-sm me-2" onClick={() => window.history.back()}>
                <i className="bi bi-arrow-left"></i> Regresar
              </button>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
            <div id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="https://anuies.net/inicio.php" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="text-center container mt-0 pt-0">
        <br />
        <div className="container mt-4">
          <InformacionGeneral />
          <br />
          <FinanciamientoInstitucional />
          <br />
          <MatriculaGeneral />
          <br />
          <OfertaEducativa />
          <br />
          <OfertaEducativaResumen />
          <br />
          <MatriculaResumen />
          <br />
          <FortalecimientoAcademico />
          <br />
          <PoblacionDocenteAdmin />
          <br />
        </div>
      </div>

    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/universidad/:nombre" element={<UniversidadDetalle />} />
      </Routes>
    </Router>
  );
}

export default App;
