const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');

const urlProv = "https://apis.datos.gob.ar/georef/api/provincias?orden=nombre&max=1000";
const urlLoc = "https://apis.datos.gob.ar/georef/api/localidades";

async function fetchData() {
    try {
        const responseProv = await axios.get(urlProv);
        const provinces = responseProv.data.provincias;
        const allLocalidades = [];

        for (const province of provinces) {
            try {
                const responseLoc = await axios.get(`${urlLoc}?provincia=${province.nombre}&orden=nombre&max=5000`);
                const localidades = responseLoc.data.localidades;

                localidades.forEach(localidad => {
                    const nombreLocalidad = localidad.nombre;
                    const idLocalidad = localidad.id;
                    const nombreProvincia = localidad.provincia.nombre;
                    const idProvincia = localidad.provincia.id;
                    const localidadData = { nombreLocalidad, idLocalidad, nombreProvincia, idProvincia };

                    // Guardar la localidad en el array total
                    allLocalidades.push(localidadData);
                });
            } catch (error) {
                console.log(`Error al obtener localidades de la provincia ${province.nombre}: ${error}`);
            }
        }

        // Escribir en un archivo JSON
        fs.writeFileSync('localidades.json', JSON.stringify(allLocalidades, null, 2));

        // Convertir los datos a Excel
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(allLocalidades);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Localidades');
        xlsx.writeFile(workbook, 'localidades.xlsx');

        console.log('Archivos JSON y Excel generados correctamente.');

    } catch (error) {
        console.log(`Error al obtener las provincias: ${error}`);
    }
}

// Ejecutar la función para obtener los datos y generar archivos
fetchData();
