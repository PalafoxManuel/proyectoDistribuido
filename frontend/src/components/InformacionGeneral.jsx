// src/components/InformacionGeneral.jsx
import { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL;

function InformacionGeneral() {
  const [data, setData]     = useState(null);
  const [logoSrc, setLogoSrc] = useState('/img/default.png');

  useEffect(() => {
    // 1) Extraigo el nombre de la URL
    const segments = window.location.pathname.split('/');
    const nombreUniversidad = segments[segments.length - 1];

    // 2) Construyo la URL absoluta al backend
    const url = `${API}/universidad/${encodeURIComponent(nombreUniversidad)}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        // 3) Backend envía { data: { …campos… } }
        const uni = json.data ?? json; // por si decides volver a objeto directo
        setData(uni);

        // 4) Si tiene imagen, ajusta la ruta
        if (uni.imagen) {
          setLogoSrc(`/img/logos/${uni.imagen}`);
        }
      })
      .catch((err) =>
        console.error('Error al cargar datos de la universidad:', err)
      );
  }, []);

  if (!data) {
    return <p className="text-center">Cargando información...</p>;
  }

  // Formatea fechas si tu objeto las trae
  const formatDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="card mb-4">
      <div className="card-header text-center">
        <i className="bi bi-info-circle"></i> Información general
      </div>
      <div className="card-body">
        <div className="row g-0">
          <div className="col-md-3 text-center p-3">
            <img
              className="img-fluid rounded"
              src={logoSrc}
              alt="Logo de la universidad"
            />
          </div>
          <div className="col-md-9">
            <h2 className="text-center">
              <b>{data.nombre_institucion || 'No disponible'}</b>
            </h2>
            <hr />
            <h4>
              <b>{data.puesto || 'No disponible'}</b>{' '}
              {data.grado || 'No disponible'} {data.rector || '—'}
            </h4>
            <h5>
              Gestión:{' '}
              <small className="text-muted">
                Inicio: {formatDate(data.fecha_inicio)} — Término:{' '}
                {formatDate(data.fecha_termino)}
              </small>
            </h5>
            <div className="progress my-3">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${data.gestion || 0}%` }}
                aria-valuenow={data.gestion || 0}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {data.gestion || 0}%
              </div>
            </div>
            <table className="table table-bordered">
              <thead className="table-active">
                <tr>
                  <th>Órgano colegiado</th>
                  <th>Subsistema</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{data.organo_colegiado || 'No disponible'}</td>
                  <td>{data.subsistema || 'No disponible'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InformacionGeneral;
