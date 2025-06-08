import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function OfertaEducativa() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const nombreUniversidad = decodeURIComponent(segments.at(-1));

    setLoading(true);
    setError(null);

    fetch(`${API}/oferta/${encodeURIComponent(nombreUniversidad)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Oferta educativa HTTP ${res.status}`);
        return res.json();
      })
      .then(info => {
        setData(info.data);
      })
      .catch(err => {
        setError('Información de oferta educativa no disponible.');
        console.error('Error al cargar datos:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data || data.total === 0 || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const backgroundColors = data.colores.map(c => `rgba(${c.R}, ${c.G}, ${c.B}, 0.9)`);

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: data.etiquetas,
        datasets: [{
          data: data.matriculas,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(c => c.replace('rgba', 'rgb').replace(', 0.9', '')),
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const idx = tooltipItem.dataIndex;
                return `${data.etiquetas[idx]}: ${data.matriculas[idx].toLocaleString()} (${parseFloat(data.porcentaje[idx]).toFixed(1)}%)`;
              },
            },
          },
        },
      },
    });
  }, [data]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Oferta educativa
        </div>
        <div className="card-body text-center">
          Cargando oferta educativa...
        </div>
      </div>
    );
  }

  if (error || !data || data.total === 0) {
    return (
      <div className="card">
        <div className="card-header text-center">
          <i className="bi bi-mortarboard"></i> Oferta educativa
        </div>
        <div className="card-body text-center text-muted">
          {error || 'No hay datos disponibles para generar la gráfica.'}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header" id="title-card">
        <i className="bi bi-mortarboard"></i> Oferta educativa
      </div>
      <div className="card m-3">
        <div className="card-body p-3">
          <div className="mb-3">
            <div className="row g-0">
              <div className="col-md-6">
                <table className="table table-striped">
                  <thead>
                    <tr className="table-active">
                      <th colSpan="3" style={{ textAlign: 'center' }}>TSU y Licenciatura</th>
                    </tr>
                    <tr>
                      <th><i className="bi bi-book"></i> Campo de formación</th>
                      <th style={{ textAlign: 'center' }}><i className="bi bi-person"></i> Matrícula</th>
                      <th style={{ textAlign: 'center' }}><i className="bi bi-percent"></i> Por.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.etiquetas.map((campo, idx) => (
                      <tr key={idx}>
                        <td>
                          <i className="bi bi-record-fill" style={{ color: `rgb(${data.colores[idx].R},${data.colores[idx].G},${data.colores[idx].B})` }}></i> {campo}
                        </td>
                        <td style={{ textAlign: 'center' }}><b>{data.matriculas[idx].toLocaleString()}</b></td>
                        <td style={{ textAlign: 'center' }}>{parseFloat(data.porcentaje[idx]).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><b>Total matrícula:</b></td>
                      <td style={{ textAlign: 'center' }}><strong>{data.total.toLocaleString()}</strong></td>
                      <td style={{ textAlign: 'center' }}><b>100%</b></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="col-md-6 d-flex justify-content-center align-items-center">
                <canvas ref={canvasRef} width={400} height={400}></canvas>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfertaEducativa;
