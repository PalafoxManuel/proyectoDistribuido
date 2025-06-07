// src/components/FinanciamientoInstitucional.jsx
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Registramos los componentes que usa Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ADEUDO_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function FinanciamientoInstitucional() {
  const [fin, setFin] = useState(null);
  const [adeudos, setAdeudos] = useState([]);

  useEffect(() => {
    const nombre = decodeURIComponent(
      window.location.pathname.split('/').at(-1)
    );

    // 1) Fetch financiamiento
    fetch(`${API}/finanzas/${encodeURIComponent(nombre)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        const d = json.data;
        setFin(Array.isArray(d) ? d[0] : d);
      })
      .catch(() =>
        setFin(null) // en error dejamos fin = null
      );

    // 2) Fetch adeudos
    fetch(`${API}/adeudos/${encodeURIComponent(nombre)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ data }) => setAdeudos(data ?? []))
      .catch(() => setAdeudos([]));
  }, []);

  // Preparamos datos sólo si fin != null
  let doughnutData, barData, adeudoMap, hayAdeudo;
  if (fin) {
    const porcFed = parseFloat(fin.porcentaje_federal) || 0;
    const porcEst = parseFloat(fin.porcentaje_estatal) || 0;
    doughnutData = {
      labels: [
        `Federal: ${porcFed.toFixed(1)}%`,
        `Estatal: ${porcEst.toFixed(1)}%`
      ],
      datasets: [{
        data: [porcFed, porcEst],
        backgroundColor: ['rgba(255,64,105,0.8)', 'rgba(255,144,32,0.8)']
      }]
    };

    adeudoMap = ADEUDO_YEARS.reduce((acc, y) => {
      acc[y] = 0;
      return acc;
    }, {});
    adeudos.forEach(rec => {
      const [[key, val]] = Object.entries(rec);
      const yr = parseInt(key.replace('ADEUDO_', ''), 10);
      if (ADEUDO_YEARS.includes(yr)) adeudoMap[yr] = parseFloat(val) || 0;
    });
    barData = {
      labels: ADEUDO_YEARS.map(String),
      datasets: [{
        label: 'Adeudo Estatal',
        data: ADEUDO_YEARS.map(y => adeudoMap[y]),
        backgroundColor: 'rgba(64,64,64,0.8)'
      }]
    };
    hayAdeudo = Object.values(adeudoMap).some(v => v > 0);
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <i className="bi bi-currency-dollar"></i> Financiamiento Institucional Ordinario
      </div>
      <div className="card m-3">
        <div className="card-body p-3" id="card-fn">

          {/* Si no hay datos para fin, mostramos mensaje central */}
          {!fin && (
            <div className="text-center text-muted">
              Información no disponible.
            </div>
          )}

          {/* Si sí hay datos, renderizamos TODO como antes */}
          {fin && (
            <>
              <div className="row">
                {/* Subsidios */}
                <div className="col-md-4">
                  <table className="table">
                    <thead className="table-active text-center">
                      <tr>
                        <th className="titulo-subsidio">
                          <i className="bi bi-book"></i> Subsidio público U006 - {fin.anio}:
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">
                          <h3 style={{ color: 'rgba(255,64,105)' }}>
                            ${parseFloat(fin.sub_federal).toLocaleString()}
                          </h3>
                          <p>Subsidio público <b>Federal</b></p>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <h3 style={{ color: 'rgba(255,144,32)' }}>
                            ${parseFloat(fin.sub_estatal).toLocaleString()}
                          </h3>
                          <p>Subsidio público <b>Estatal</b></p>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <h3>
                            ${parseFloat(fin.sub_total).toLocaleString()}
                          </h3>
                          <p>Subsidio público <b>Total</b></p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Gráfica Doughnut */}
                <div className="col-md-4 d-flex justify-content-center align-items-center">
                  <div style={{ width: 200, height: 200 }}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        plugins: { legend: { position: 'bottom' } },
                        maintainAspectRatio: false
                      }}
                    />
                  </div>
                </div>

                {/* Inversión por alumno */}
                <div className="col-md-4">
                  <table className="table">
                    <thead className="table-active text-center">
                      <tr>
                        <th className="titulo-inversion">
                          <i className="bi bi-book"></i> Inversión ordinaria por alumno U006 - {fin.anio_inversion}:
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">
                          <h3 style={{ color: 'rgba(255,64,105)' }}>
                            <i className="bi bi-person"></i> ${parseFloat(fin.inv_fed_alumno).toLocaleString()}
                          </h3>
                          <p>Inversión <b>Federal</b> ordinaria por alumno</p>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <h3 style={{ color: 'rgba(255,144,32)' }}>
                            <i className="bi bi-person"></i> ${parseFloat(fin.inv_est_alumno).toLocaleString()}
                          </h3>
                          <p>Inversión <b>Estatal</b> ordinaria por alumno</p>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">
                          <h3>
                            <i className="bi bi-person"></i> ${parseFloat(fin.inv_pub_alumno).toLocaleString()}
                          </h3>
                          <p>Inversión <b>Pública</b> ordinaria por alumno</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adeudos */}
              <p id="adeudoText" className="text-center mt-4">
                {!hayAdeudo ? 'Ningún adeudo en los últimos años.' : ''}
              </p>

              {hayAdeudo && (
                <>
                  <div className="row">
                    <div className="col">
                      <Bar
                        data={barData}
                        options={{
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { callback: (v) => `$${v.toLocaleString()}` }
                            }
                          },
                          plugins: { legend: { display: false } },
                          maintainAspectRatio: false
                        }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                    {ADEUDO_YEARS.map((anio) => (
                      <button key={anio} className="btn btn-light mx-1">
                        {anio}{' '}
                        <span className="badge text-bg-secondary">
                          ${adeudoMap[anio].toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanciamientoInstitucional;
