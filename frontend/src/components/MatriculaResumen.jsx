import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function MatriculaHistorico() {
  const [historico, setHistorico] = useState([]);
  const canvasRef = useRef(null);
  const chartInst = useRef(null);

  // 1️⃣ Fetch de datos
  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const uni = decodeURIComponent(segments.at(-1));
    fetch(`${API}/historico/${encodeURIComponent(uni)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setHistorico(json.data || []))
      .catch(err => console.error('Error cargando histórico:', err));
  }, []);

  // 2️⃣ Montar / desmontar Chart.js
  useEffect(() => {
    if (!historico.length || !canvasRef.current) return;

    // destruir instancia previa
    if (chartInst.current) {
      chartInst.current.destroy();
    }

    const labels = historico[0].datos.map(d => d.PERIODO);
    const datasets = historico.map(item => ({
      label: item.campo_formacion,
      data: item.datos.map(d => d.MATRICULA),
      borderColor: `rgb(${item.color.R}, ${item.color.G}, ${item.color.B})`,
      backgroundColor: `rgba(${item.color.R}, ${item.color.G}, ${item.color.B}, 0.5)`,
      fill: false,
      tension: 0.2,
    }));

    chartInst.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
        },
        scales: {
          x: { title: { display: true, text: 'Período' } },
          y: {
            title: { display: true, text: 'Matrícula' },
            ticks: {
              callback: v => v.toLocaleString()
            }
          }
        }
      }
    });

    // al desmontar componente, destruyo el chart
    return () => {
      chartInst.current.destroy();
    };
  }, [historico]);

  if (!historico.length) {
    return (
      <div className="card m-3">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Matrícula - Histórico
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
        <i className="bi bi-mortarboard"></i> Matrícula - Histórico
      </div>
      <div className="card m-3">
        <div className="card-body p-3">
          <div id="matricula-chart-container" className="row g-0 justify-content-center">
            <div className="col-12">
              <canvas ref={canvasRef} height={300} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
