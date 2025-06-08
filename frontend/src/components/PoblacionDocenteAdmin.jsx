// src/components/PoblacionDocenteAdmin.jsx
import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const API = process.env.REACT_APP_API_URL

export default function PoblacionDocenteAdmin() {
  const [pob, setPob] = useState(null);
  const docCanvas = useRef(null);
  const admCanvas = useRef(null);
  const docChart  = useRef(null);
  const admChart  = useRef(null);

  // Plugin para escribir número debajo de cada barra
  const numberBelowBar = {
    id: 'numberBelowBar',
    afterDraw: chart => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      chart.data.datasets.forEach((ds, i) => {
        chart.getDatasetMeta(i).data.forEach((bar, idx) => {
          const val = ds.data[idx];
          const x   = bar.x;
          const y   = chart.scales.y.getPixelForValue(0) + 15;
          ctx.fillText(val.toLocaleString('en-US'), x, y);
        });
      });
      ctx.restore();
    }
  };

  // 1️⃣  Fetch de la población
  useEffect(() => {
    const uni = decodeURIComponent(
      window.location.pathname.split('/').pop()
    );
    fetch(`${API}/poblacion/${encodeURIComponent(uni)}`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(json => setPob(json))
      .catch(err => {
        console.error('Error al cargar población:', err);
        setPob(null);
      });
  }, []);

  // 2️⃣  Cuando llegan datos, genero los Chart.js
  useEffect(() => {
    if (!pob) return;

    // destruyo anteriores si existen
    docChart.current?.destroy();
    admChart.current?.destroy();

    // — Docente —
    const docenteData = {
      labels: ['Tiempo Completo','Tres Cuartos','Medio Tiempo','Por Horas'],
      datasets: [{
        label: 'Personal Docente',
        data: [
          pob.docente_tc,
          pob.docente_3_4,
          pob.docente_mt,
          pob.docente_horas
        ],
        backgroundColor: ['#ADD8E6','#5A9BD4','#003366','#85C1E9']
      }]
    };
    docChart.current = new Chart(
      docCanvas.current.getContext('2d'),
      {
        type: 'bar',
        data: docenteData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ctx.parsed.y.toLocaleString('en-US')
              }
            }
          },
          scales: {
            x: { ticks: { padding: 25, font: { size: 12 } } },
            y: {
              beginAtZero: true,
              ticks: { callback: v => v.toLocaleString('en-US') }
            }
          }
        },
        plugins: [numberBelowBar]
      }
    );

    // — Administrativo —
    const adminData = {
      labels: ['Directivo','Administrativo','Otros'],
      datasets: [{
        label: 'Personal Administrativo',
        data: [pob.directivo, pob.administrativo, pob.otros],
        backgroundColor: ['#7DCEA0','#2ECC71','#28B463']
      }]
    };
    admChart.current = new Chart(
      admCanvas.current.getContext('2d'),
      {
        type: 'bar',
        data: adminData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ctx.parsed.y.toLocaleString('en-US')
              }
            }
          },
          scales: {
            x: { ticks: { padding: 25, font: { size: 12 } } },
            y: {
              beginAtZero: true,
              ticks: { callback: v => v.toLocaleString('en-US') }
            }
          }
        },
        plugins: [numberBelowBar]
      }
    );

    return () => {
      docChart.current?.destroy();
      admChart.current?.destroy();
    };
  }, [pob]);

  // 3️⃣  Estado loading
  if (pob === null) {
    return (
      <div className="card m-3">
        <div className="card-header text-center">
          <i className="bi bi-bar-chart"></i> Población Docente y Administrativa
        </div>
        <div className="card-body text-center">
          Cargando población docente y administrativa...
        </div>
      </div>
    );
  }

  // 4️⃣  Calcular relaciones
  const rDocAdmin = (
    pob.docente_total / pob.admin_total
  ).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const rMatDoc = (
    pob.matricula_es / pob.docente_total
  ).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const rMatAdm = (
    pob.matricula_es / pob.admin_total
  ).toLocaleString('en-US', { maximumFractionDigits: 3 });

  // 5️⃣  Render final
  return (
    <div className="card m-3">
      <div className="card-header text-center" id="card-poblacion">
        <i className="bi bi-bar-chart"></i> Población Docente y Administrativa
      </div>
      <div className="container my-3">
        <div className="card-body">
          <h4 className="text-center mb-4">
            Población Docente y Administrativa
          </h4>

          <div className="row mb-5">
            <div className="col-md-6 text-center">
              <h5>Población Docente</h5>
              <p className="text-left">Número de personal docente</p>
              <canvas ref={docCanvas} style={{ maxHeight: 300 }} />
              <h6 className="mt-2">
                Medio Tiempo, Asignatura, Tiempo Completo
              </h6>
              <h5 className="fw-bold mt-3">
                Total = {pob.docente_total.toLocaleString('en-US')}
              </h5>
            </div>
            <div className="col-md-6 text-center">
              <h5>Población Administrativa</h5>
              <p className="text-left">Número de personal administrativo</p>
              <canvas ref={admCanvas} style={{ maxHeight: 300 }} />
              <h6 className="mt-2">Directivo, Administrativo, Otros</h6>
              <h5 className="fw-bold mt-3">
                Total = {pob.admin_total.toLocaleString('en-US')}
              </h5>
            </div>
          </div>

          <hr />

          <div className="row text-center">
            <div className="col-md-4">
              <h3 className="display-4 fw-bold">{rDocAdmin}</h3>
              <p>Relación Docente/Administrativo</p>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-person-fill me-2"
                  style={{ color: '#007bff' }}
                ></i>
                <strong style={{ color: '#007bff' }}>Docentes:</strong>&nbsp;
                {pob.docente_total}
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-person-fill me-2"
                  style={{ color: '#28a745' }}
                ></i>
                <strong style={{ color: '#28a745' }}>
                  Administrativos:
                </strong>
                &nbsp;{pob.admin_total}
              </div>
            </div>

            <div className="col-md-4">
              <h3 className="display-4 fw-bold">{rMatDoc}</h3>
              <p>Relación Matrícula/Docentes</p>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-person-fill me-2"
                  style={{ color: '#007bff' }}
                ></i>
                <strong style={{ color: '#007bff' }}>Docentes:</strong>&nbsp;
                {pob.docente_total}
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-bar-chart me-2"
                  style={{ color: '#ffc107' }}
                ></i>
                <strong style={{ color: '#ffc107' }}>Matrícula:</strong>&nbsp;
                {pob.matricula_es.toLocaleString('en-US')}
              </div>
            </div>

            <div className="col-md-4">
              <h3 className="display-4 fw-bold">{rMatAdm}</h3>
              <p>Relación Matrícula/Administrativo</p>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-person-fill me-2"
                  style={{ color: '#28a745' }}
                ></i>
                <strong style={{ color: '#28a745' }}>Administrativos:</strong>&nbsp;
                {pob.admin_total}
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <i
                  className="bi bi-bar-chart me-2"
                  style={{ color: '#ffc107' }}
                ></i>
                <strong style={{ color: '#ffc107' }}>Matrícula:</strong>&nbsp;
                {pob.matricula_es.toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
