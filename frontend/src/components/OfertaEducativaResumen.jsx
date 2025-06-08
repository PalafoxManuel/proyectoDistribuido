import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function OfertaEducativaHistorico() {
  const [historico, setHistorico] = useState([]);
  const chartRefs = useRef([]);      // refs para cada <canvas>
  const charts    = useRef([]);      // instancias de Chart.js

  // 1) Carga de datos
  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const uni      = decodeURIComponent(segments.at(-1));
    fetch(`${API}/historico/${encodeURIComponent(uni)}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(json => setHistorico(json.data || []))
      .catch(err => console.error(err));
  }, []);

  // 2) Crear / destruir gráficos
  useEffect(() => {
    // Destruyo cualquier instancia previa
    charts.current.forEach(c => c.destroy());
    charts.current = [];

    // Si no hay datos, nada que hacer
    if (!historico.length) return;

    historico.forEach((item, i) => {
      const canvas = chartRefs.current[i];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: item.datos.map(d => d.PERIODO),
          datasets: [{
            label: item.campo_formacion,
            data: item.datos.map(d => d.MATRICULA),
            backgroundColor: `rgba(${item.color.R}, ${item.color.G}, ${item.color.B}, 0.4)`,
            borderColor:     `rgb(${item.color.R}, ${item.color.G}, ${item.color.B})`,
            fill: true,
            tension: 0.2,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top' },
          },
          scales: {
            y: {
              title: { display: true, text: 'Matrícula' },
              ticks: { callback: v => v.toLocaleString() }
            }
          }
        }
      });

      // Guardo la instancia para destruirla luego
      charts.current[i] = chart;
    });

    // Al desmontar, destruyo todo
    return () => {
      charts.current.forEach(c => c.destroy());
    };
  }, [historico]);

  if (!historico.length) {
    return (
      <div className="card m-3">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Oferta educativa - Histórico
        </div>
        <div className="card-body text-center">
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-mortarboard"></i> Oferta educativa - Histórico
      </div>
      <div className="card-body">
        <div className="row g-3">
          {historico.map((_, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <div className="p-2 border rounded">
                <canvas
                  ref={el => chartRefs.current[i] = el}
                  width={400}
                  height={250}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
