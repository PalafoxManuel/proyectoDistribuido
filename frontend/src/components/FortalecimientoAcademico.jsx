import { useEffect, useState } from 'react';

function FortalecimientoAcademico() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const path = window.location.pathname;
    const segments = path.split('/');
    const nombreUniversidad = decodeURIComponent(segments[segments.length - 1]);

    fetch(`/ranking-snii/${nombreUniversidad}`)
      .then((response) => {
        if (!response.ok) throw new Error('Error en la solicitud');
        return response.json();
      })
      .then((info) => {
        // console.log('Respuesta de fortalecimiento:', info);
        setData(info.data || []);
      })
      .catch((err) => console.error('Error al cargar datos:', err));
  }, []);


  if (!data || data.length === 0) return <p className="text-center">Cargando fortalecimiento académico...</p>;

  return (
    <div className="card m-3">
      <div className="card-header text-center">
        <i className="bi bi-mortarboard"></i> Fortalecimiento académico
      </div>
      <div className="card-body table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Disciplina</th>
              <th>Área</th>
              <th>Año de ingreso</th>
              <th>SNI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((investigador, index) => (
              <tr key={index}>
                <td>{investigador.nombre ?? "No disponible"}</td>
                <td>{investigador.nivel ?? "No disponible"}</td>
                <td>{investigador.disciplina ?? "No disponible"}</td>
                <td>{investigador.area ?? "No disponible"}</td>
                <td>{investigador.anio_ingreso ?? "No disponible"}</td>
                <td>{investigador.sni ?? "No disponible"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FortalecimientoAcademico;
