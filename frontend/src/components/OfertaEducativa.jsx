import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

function OfertaEducativa() {
  const [data, setData] = useState(null);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/oferta/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => {
        console.log("Colores recibidos:", info.colores);
        setData(info);
      })
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  useEffect(() => {
    if (!data || data.total === 0 || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: data.etiquetas,
        datasets: [{
          data: data.matriculas,
          backgroundColor: data.colores.map(color => `rgb(${color.R}, ${color.G}, ${color.B})`),
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const index = tooltipItem.dataIndex;
                const porcentaje = parseFloat(data.porcentaje[index]).toFixed(1);
                return `${data.etiquetas[index]}: ${data.matriculas[index].toLocaleString()} (${porcentaje}%)`;
              },
            },
          },
        },
      },
    });
  }, [data]);

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
                  <tbody style={{ textAlign: 'left' }}>
                    {data && data.etiquetas.map((campo, index) => (
                      <tr key={index}>
                        <td><i className="bi bi-record-fill" style={{ color: `rgb(${data.colores[index].R}, ${data.colores[index].G}, ${data.colores[index].B})` }}></i> {campo}</td>
                        <td style={{ textAlign: 'center' }}><b>{data.matriculas[index].toLocaleString()}</b></td>
                        <td style={{ textAlign: 'center' }}>{parseFloat(data.porcentaje[index]).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><b>Total matrícula:</b></td>
                      <td style={{ textAlign: 'center' }}><strong>{data ? data.total.toLocaleString() : 0}</strong></td>
                      <td style={{ textAlign: 'center' }}><b>100%</b></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="col-md-6 d-flex justify-content-center align-items-center">
                {data && data.total > 0 ? (
                  <canvas ref={canvasRef} width={400} height={400}></canvas>
                ) : (
                  <p className="text-center">No hay datos disponibles para generar la gráfica.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfertaEducativa;
