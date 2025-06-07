// src/components/MatriculaGeneral.jsx
import { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function MatriculaGeneral() {
  const [matricula, setMatricula] = useState(null);
  const [emsData, setEmsData]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const nombre   = decodeURIComponent(segments.at(-1));

    setLoading(true);
    setError(null);

    Promise.allSettled([
      // 1) Matrícula
      fetch(`${API}/matricula/${encodeURIComponent(nombre)}`)
        .then(res => {
          if (!res.ok) throw new Error(`Matrícula HTTP ${res.status}`);
          return res.json();
        }),
      // 2) EMS
      fetch(`${API}/ems/${encodeURIComponent(nombre)}`)
        .then(res => {
          if (!res.ok) throw new Error(`EMS HTTP ${res.status}`);
          return res.json();
        })
    ])
    .then(([matResult, emsResult]) => {
      if (matResult.status === 'fulfilled') {
        setMatricula(matResult.value);
      } else {
        setError('Información de matrícula no disponible.');
        console.error('Error al cargar matrícula:', matResult.reason);
      }

      if (emsResult.status === 'fulfilled') {
        setEmsData(emsResult.value.data ?? emsResult.value);
      } else {
        console.warn('Datos EMS no disponibles:', emsResult.reason);
        setEmsData(null);
      }
    })
    .catch(err => {
      setError('Error interno al cargar los datos.');
      console.error('Error en Promise.allSettled:', err);
    })
    .finally(() => setLoading(false));
  }, []);

  // Muestra la card completa con mensaje de loading
  if (loading) {
    return (
      <div className="card mb-4">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Matrícula general
        </div>
        <div className="card-body text-center">
          Cargando matrícula general...
        </div>
      </div>
    );
  }

  // Muestra la card completa con mensaje de error / sin datos
  if (error) {
    return (
      <div className="card mb-4">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Matrícula general
        </div>
        <div className="card-body text-center text-muted">
          {error}
        </div>
      </div>
    );
  }

  const resumen = matricula?.tablasEMSyLugarEntidad;
  if (!resumen) {
    return (
      <div className="card mb-4">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Matrícula general
        </div>
        <div className="card-body text-center text-muted">
          Información de matrícula no disponible.
        </div>
      </div>
    );
  }

  // Si hay datos, renderizamos la card completa con tablas...
  // (el resto de tu renderizado habitual)
  const licData = matricula.datosTablaTSUyLic || [];
  const posData = matricula.datosTablaPos     || [];
  const totData = matricula.datosTablaEduSup  || [];
  const matriculaEMS = emsData?.matricula?.toLocaleString() ?? 'No Aplica';

  const renderTable = (title, data, rankKey, matKey, badgeClass) => {
    const nombreUni = decodeURIComponent(window.location.pathname.split('/').at(-1)).toUpperCase();
    return (
      <div className="my-3">
        <table className="table table-bordered table-sm table-responsive">
          <thead className="table-dark">
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">
                Lugar en la entidad respecto a su matrícula de {title}
              </th>
              <th className="text-center">
                <i className="bi bi-person"></i> Matrícula
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const isCurrent = item.NOMBRE_INSTITUCION.toUpperCase() === nombreUni;
              return (
                <tr key={idx} className={isCurrent ? badgeClass : ''}>
                  <td className="text-center">
                    {isCurrent
                      ? <b>{item[rankKey]}</b>
                      : item[rankKey]}
                  </td>
                  <td className="text-start">
                    {isCurrent
                      ? <b>{item.NOMBRE_INSTITUCION}</b>
                      : item.NOMBRE_INSTITUCION}
                  </td>
                  <td className="text-center">
                    {isCurrent
                      ? <b>{item[matKey].toLocaleString()}</b>
                      : item[matKey].toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header text-center" id="card-periodo">
        <i className="bi bi-mortarboard"></i> Matrícula general: Periodo {resumen.PERIODO}
      </div>
      <div className="container my-3" id="card-matricula">
        {/* Tabla de resumen */}
        <table
          className="table table-bordered text-center table-responsive"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <thead className="table-active">
            <tr>
              <th style={{ width: '25%' }}>EMS</th>
              <th style={{ width: '25%' }}>TSU y licenciatura</th>
              <th style={{ width: '25%' }}>Posgrado</th>
              <th style={{ width: '25%' }}>Total educación superior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <h2><i className="bi bi-person"></i> {matriculaEMS}</h2>
              </td>
              <td>
                <h2>
                  <span className="badge rounded-pill text-bg-primary">
                    <i className="bi bi-person"></i> {resumen.MAT_LIC.toLocaleString()}
                  </span>
                </h2>
              </td>
              <td>
                <h2>
                  <span className="badge rounded-pill text-bg-warning">
                    <i className="bi bi-person"></i> {resumen.MAT_POS.toLocaleString()}
                  </span>
                </h2>
              </td>
              <td>
                <h2>
                  <span className="badge rounded-pill text-bg-secondary">
                    <i className="bi bi-person"></i> {resumen.MAT_TOT.toLocaleString()}
                  </span>
                </h2>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Tabla de lugares */}
        <table
          className="table table-bordered text-center table-responsive"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <thead className="table-active">
            <tr>
              <th style={{ width: '25%' }}>Lugar EMS</th>
              <th style={{ width: '25%' }}>Lugar TSU/Lic</th>
              <th style={{ width: '25%' }}>Lugar Posgrado</th>
              <th style={{ width: '25%' }}>Lugar Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><h2>—</h2></td>
              <td><h2><span className="badge text-bg-primary">#{resumen.RANK_LIC}</span></h2></td>
              <td><h2><span className="badge text-bg-warning">#{resumen.RANK_POS}</span></h2></td>
              <td><h2><span className="badge text-bg-secondary">#{resumen.RANK_TOT}</span></h2></td>
            </tr>
          </tbody>
        </table>

        {/* Sub-tablas */}
        {renderTable('TSU y licenciatura', licData, 'RANK_LIC', 'MAT_LIC', 'table-primary text-dark')}
        {renderTable('Posgrado',              posData, 'RANK_POS', 'MAT_POS', 'table-warning text-dark')}
        {renderTable('Educación Superior',    totData, 'RANK_TOT', 'MAT_TOT', 'table-secondary text-dark')}
      </div>
    </div>
  );
}

export default MatriculaGeneral;
