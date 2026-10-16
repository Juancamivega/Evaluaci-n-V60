# Sistema de Evaluación de Taza — SENA Barismo

**Centro de la Industria la Empresa y los Servicios (CIES)**  
**Técnico en Servicios de Barismo — Evaluación de Taza**

Sistema web interactivo para la evaluación y cata en vivo de preparaciones de café, con ponderación oficial, almacenamiento en Supabase, actualización en tiempo real y exportación directa a Excel.

---

## ☕ Estructura Oficial de Evaluación y Ponderaciones

Cada criterio se califica en una escala numérica de **1 a 5**:
- `1` = Deficiente / Desagradable
- `2` = Regular
- `3` = Aceptable
- `4` = Bueno
- `5` = Excelente

### 1. Presentación (Ponderación: 30%)
- Saludo (Establece conexión)
- Bienvenida Cálida
- Voz clara y tono pausado
- Genera Expectativa / Eleva la experiencia del café
> **Fórmula:** `Promedio Presentación = (Suma de los 4 criterios) / 4`

### 2. Aspectos Técnicos (Ponderación: 30%)
- Limpieza y orden de la estación
- Purga de equipos y utensilios
- Manejo y pesaje del café
- Claridad en el ratio
- Control de tiempos y cantidad de agua
- Técnica de Vertido
- Descripción sensorial
- Precalentamiento de tazas
- Tiempo de preparación
> **Fórmula:** `Promedio Aspectos Técnicos = (Suma de los 9 criterios) / 9`

### 3. Preparación / Evaluación Sensorial (Ponderación: 40%)
- Aroma (Intensidad, frescura, agrado)
- Acidez
- Dulzor
- Residual amargo
- Limpieza de Taza
- Cuerpo y textura (Aguado, inconsistente, sin cuerpo)
- Cuerpo y textura (Sedoso, redondo, agradable en boca)
> **Fórmula:** `Promedio Sensorial = (Suma de los 7 criterios) / 7`

### 🏆 Puntaje Total Ponderado
$$\text{Total Ponderado} = (\text{Promedio Presentación} \times 0.30) + (\text{Promedio Técnicos} \times 0.30) + (\text{Promedio Sensorial} \times 0.40)$$

---

## 👥 Parejas Oficiales Preconfiguradas

1. ANGEL Y SOFIA
2. J. CAMILO Y TATIANA
3. MAICOL Y JERSON
4. KELLY Y BARBARA
5. DIANA Z Y FRITZ
6. EDDY Y DIANA M
7. ADRIANA Y  EMILIANO
8. LAURA Y LILIANA
9. ZAHIRA Y LUIS ALBERTO
10. KEVIN Y RAMIRO
11. LORENA Y JESSICA
12. STIVEN Y KIMBERLY
13. BRAYAN Y JUAN JOSÉ

---

## 🚀 Rutas de la Aplicación en Vercel

- **`/` (Página de Inicio):** Formulario de evaluación directo sin tokens. Dropdown de parejas, campo de evaluador, método de extracción con desplegable y escala de 1 a 5 por criterio con cálculo ponderado en vivo.
- **`/resultados`:** Tabla de posiciones acumulada con promedios ponderados por pareja en tiempo real, desglose por categoría, detalle de cada evaluación y botón de descarga a Excel.
- **`/admin`:** Panel de administración para sembrar/gestionar parejas, reiniciar evaluaciones y trazabilidad.

---

## 🗄️ Configuración en Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com).
2. Ve al **SQL Editor** en el menú lateral.
3. Copia y pega el contenido del archivo [`supabase/schema.sql`](supabase/schema.sql).
4. Haz clic en **Run**. Esto creará las tablas `parejas` y `evaluaciones`, activará Realtime y precargará las 13 parejas oficiales.

---

## 📊 Exportación a Excel para Trazabilidad

Tienes 2 formas inmediatas de exportar la información:
1. **Directo desde la Aplicación Web:** En `/resultados` o `/admin`, presiona el botón verde **"Exportar a Excel (.xlsx)"**. Se descargará un libro con 2 hojas:
   - *Resumen General:* Ranking consolidado con número de evaluaciones, promedios de las 3 áreas y total ponderado.
   - *Evaluaciones Individuales:* Registro histórico de cada juez con fecha, hora, método y puntaje detallado de los 20 criterios.
2. **Directo desde Supabase:** En Supabase > **Table Editor** > tabla `evaluaciones` > botón **"Export to CSV"** en la esquina superior derecha.
