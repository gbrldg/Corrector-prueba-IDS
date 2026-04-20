# Corrector de Pruebas 

Aplicación web estática para corregir la primera prueba de 30 preguntas del curso **Ingeniería y Desarrollo Sustentable**.

## Características principales

- Ingreso rápido del nombre del alumno.
- Registro de respuestas pregunta por pregunta.
- Selección de alternativas con clic o teclado (`A`, `B`, `C`, `D`, `E`).
- Avance con `Enter` después de ingresar la respuesta.
- Validación para aceptar solo alternativas válidas (`A` a `E`).
- Cálculo del puntaje y la nota según la pauta oficial.
- Informe de errores con detalle de cada pregunta.
- Guardado automático de los registros en `localStorage`.
- Edición de registros existentes desde la tabla de resultados.
- Exportación a Excel con hojas separadas para:
  - Resumen de alumnos
  - Detalle de errores
  - Respuestas completas (fila por respuesta)

## Uso

1. Abre `index.html` en el navegador.
2. Ingresa el nombre del alumno y presiona **Comenzar corrección**.
3. Selecciona o escribe la respuesta de cada pregunta.
4. Presiona `Enter` para avanzar o utiliza el botón **Siguiente**.
5. Al completar las 30 preguntas, verás el resultado y el detalle de errores.
6. Revisa los registros acumulados en la tabla.
7. Si quieres corregir un registro previo, haz clic en **Editar**.
8. Descarga el resultado en Excel usando el botón **Descargar Excel**.

## Notas importantes

- Los datos se guardan localmente en el navegador.
- Cambiar de dispositivo o borrar el historial del navegador elimina los registros guardados.
- Usa la exportación a Excel para conservar los resultados fuera del navegador.
