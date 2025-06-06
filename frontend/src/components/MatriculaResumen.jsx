import { useEffect, useState } from 'react';

function MatriculaResumen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/ems/${encodeURIComponent(nombreUniversidad)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => {
        if (info && Array.isArray(info.data)) {
          setData(info.data);
        } else if (info && typeof info.data === 'object') {
          setData([info.data]); // lo convertimos en arreglo
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error('Error al cargar datos:', err);
        setData(null);
      });
  }, []);



  if (!data || data.length === 0) return <p className="text-center">Cargando resumen de matrícula EMS...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-bar-chart-line-fill"></i> Matrícula - Resumen EMS
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Disciplina</th>
              <th>Modalidad</th>
              <th>Plantel</th>
              <th>Matricula Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((registro, index) => (
              <tr key={index}>
                <td>{registro.disciplina ?? "No disponible"}</td>
                <td>{registro.modalidad ?? "No disponible"}</td>
                <td>{registro.plantel ?? "No disponible"}</td>
                <td>{registro.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatriculaResumen;
