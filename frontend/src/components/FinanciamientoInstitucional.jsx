import { useEffect, useState } from 'react';

function FinanciamientoInstitucional() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/universidad/financiamiento/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => setData(info))
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);

  if (!data) return <p className="text-center">Cargando financiamiento institucional...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-cash-coin"></i> Financiamiento institucional
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <strong>Ingresos Propios:</strong>
            <p>{data.ingresos_propios ?? "No disponible"}</p>
          </div>
          <div className="col-md-6">
            <strong>Subsidio Federal:</strong>
            <p>{data.subsidio_federal ?? "No disponible"}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <strong>Subsidio Estatal:</strong>
            <p>{data.subsidio_estatal ?? "No disponible"}</p>
          </div>
          <div className="col-md-6">
            <strong>Total:</strong>
            <p>{data.total ?? "No disponible"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanciamientoInstitucional;
