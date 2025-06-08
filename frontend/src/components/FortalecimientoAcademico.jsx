import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

export default function FortalecimientoAcademico() {
  const [rankingData, setRankingData] = useState([]);
  const [entidad, setEntidad]         = useState('');
  const [sniiData, setSniiData]       = useState(null);
  const chartRef  = useRef(null);
  const chartInst = useRef(null);

  // 1️⃣ Traer ranking-snii y snii
  useEffect(() => {
    const uni = decodeURIComponent(window.location.pathname.split('/').pop());

    // ranking-snii (igual que antes)
    fetch(`${API}/ranking-snii/${encodeURIComponent(uni)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => {
        setEntidad(j.entidad || '');
        setRankingData(j.data || []);
      })
      .catch(console.error);

    // snii, AHORA usando json.data OR json directamente
    fetch(`${API}/snii/${encodeURIComponent(uni)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => {
        const d = json.data ?? json;
        setSniiData(d);
      })
      .catch(console.error);
  }, []);

  // 2️⃣ Montar / desmontar Chart.js
  useEffect(() => {
    if (!sniiData || !chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();

    const ctx    = chartRef.current.getContext('2d');
    const labels = ['Candidato','Nivel 1','Nivel 2','Nivel 3','Emérito'];
    const datos  = [
      sniiData.CANDIDATO,
      sniiData.NIVEL_1,
      sniiData.NIVEL_2,
      sniiData.NIVEL_3,
      sniiData.EMERITO
    ];

    chartInst.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Investigadores',
          data: datos,
          backgroundColor: [
            'rgba(255,99,132,1)',
            'rgba(54,162,235,1)',
            'rgba(255,205,86,1)',
            'rgba(75,192,192,1)',
            'rgba(33,153,107,1)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54,162,235,1)',
            'rgba(255,205,86,1)',
            'rgba(75,192,192,1)',
            'rgba(33,153,107,1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Distribución de Investigadores por Nivel'
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.data[ctx.dataIndex]} investigadores`
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { weight: 'bold', size: 14 } }
          },
          y: { beginAtZero: true }
        }
      }
    });

    return () => chartInst.current.destroy();
  }, [sniiData]);

  // 3️⃣ Renderizado
  // Mientras no tengamos NINGÚN dato…
  if (!rankingData.length && !sniiData) {
    return (
      <div className="card m-3">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Fortalecimiento académico
        </div>
        <div className="card-body text-center">
          Cargando fortalecimiento académico...
        </div>
      </div>
    );
  }

  // Fecha dinámica en español
  const ahora = new Date();
  const tituloFecha = `${MESES[ahora.getMonth()]} ${ahora.getFullYear()}`;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-mortarboard"></i> Fortalecimiento académico
      </div>
      <div className="card-body p-3">

        {/* ==== GRÁFICO y DISTRIBUCIÓN ==== */}
        {sniiData && (
          <div id="div-chart-snii" className="mb-4">
            <h5 className="text-center">
              Investigadores adscritos al Sistema Nacional de Investigadoras e Investigadores (SNII)
            </h5>
            <h6 className="text-center">{tituloFecha}</h6>

            <div className="d-flex justify-content-center my-3">
              <div style={{ width: '80%', height: 300 }}>
                <canvas ref={chartRef} />
              </div>
            </div>

            <table className="w-100 text-center mb-3" id="distribucionSnii">
              <tbody>
                <tr>
                  <td><i className="bi bi-person"></i></td>
                  <td><h4>{sniiData.CANDIDATO}</h4></td>
                  <td><h4>{sniiData.NIVEL_1}</h4></td>
                  <td><h4>{sniiData.NIVEL_2}</h4></td>
                  <td><h4>{sniiData.NIVEL_3}</h4></td>
                  <td><h4>{sniiData.EMERITO}</h4></td>
                </tr>
              </tbody>
            </table>
            <hr />
          </div>
        )}

        {/* ==== TOP INSTITUCIONES ==== */}
        <figure className="text-center mb-4">
          <blockquote className="blockquote">
            <p><i className="bi bi-star"></i> Principales Instituciones de Educación Superior — SNII</p>
          </blockquote>
          <figcaption className="blockquote-footer">
            — {entidad.toUpperCase() || 'No disponible'}
          </figcaption>
        </figure>

        {/* ==== TABLA RANKING ==== */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-active text-center">
              <tr>
                <th>#</th>
                <th>Institución</th>
                <th>Candidatos</th>
                <th>Nivel 1</th>
                <th>Nivel 2</th>
                <th>Nivel 3</th>
                <th>Emérito</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((ins, i) => {
                const isSelf = ins.NOMBRE_INSTITUCION.toUpperCase() === 
                               decodeURIComponent(window.location.pathname.split('/').pop()).toUpperCase();
                return (
                  <tr key={i} className={isSelf ? 'fw-bold table-light' : ''}>
                    <td className="text-center">{i+1}</td>
                    <td>{ins.NOMBRE_INSTITUCION}</td>
                    <td className="text-center">{ins.CANDIDATO}</td>
                    <td className="text-center">{ins.NIVEL_1}</td>
                    <td className="text-center">{ins.NIVEL_2}</td>
                    <td className="text-center">{ins.NIVEL_3}</td>
                    <td className="text-center">{ins.EMERITO}</td>
                    <td className="text-center">{ins.TOTAL}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
