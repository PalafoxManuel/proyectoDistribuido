import { useEffect, useState } from 'react';

function OfertaEducativaResumen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/historico/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => setData(info))
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  if (!data || data.length === 0) return <p className="text-center">Cargando resumen de oferta educativa...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-graph-up"></i> Oferta educativa - Resumen
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Año</th>
              <th>Campo de Formación</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((registro, index) => (
              <tr key={index}>
                <td>{registro.anio ?? "No disponible"}</td>
                <td>{registro.campo_formacion ?? "No disponible"}</td>
                <td>{registro.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfertaEducativaResumen;
