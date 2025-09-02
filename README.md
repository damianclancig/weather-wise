
# WeatherWise - Pronóstico del Tiempo en Tiempo Real con IA

[![Captura de Pantalla de WeatherWise](public/assets/screenshot.png)](https://clima.clancig.com.ar)

### 🚀 [Ver Demo en Vivo](https://clima.clancig.com.ar) 🚀

**WeatherWise** es una aplicación web moderna y elegante que proporciona pronósticos del tiempo en tiempo real para cualquier ciudad del mundo. Construida con tecnologías de vanguardia, ofrece una experiencia de usuario rápida, receptiva e inmersiva, destacando por sus **fondos de pantalla dinámicos generados por Inteligencia Artificial** que reflejan el clima actual de la ciudad consultada.

La aplicación detecta automáticamente la ubicación del usuario para proporcionar un pronóstico local instantáneo. La interfaz está diseñada para ser limpia e informativa, con iconos animados y un diseño futurista tipo "tarjeta de cristal".

---

## ✨ Características

- **Fondos Generados por IA:** Imágenes de fondo espectaculares y únicas, creadas en tiempo real por Google Gemini, que representan visualmente el clima y la ubicación buscada.
- **Datos Meteorológicos en Tiempo Real:** Obtén información actualizada al minuto sobre temperatura, sensación térmica, humedad, velocidad y dirección del viento, y probabilidad de precipitación.
- **Geolocalización:** Obtiene automáticamente el clima de tu ubicación actual al cargar la página.
- **Búsqueda Multilingüe con Autocompletado:** Encuentra fácilmente cualquier ciudad del mundo. Puedes buscar "London", "Londres" o "Londra" y la aplicación entenderá tu búsqueda gracias a la detección de idioma.
- **Pronóstico a 6 Días:** Planifica con antelación con un pronóstico detallado. Al seleccionar un día, la tarjeta principal se actualiza con la información completa de esa fecha.
- **Pronóstico por Horas:** Visualiza el pronóstico para las próximas horas en un carrusel interactivo dentro de la tarjeta principal.
- **Fases de la Luna:** Consulta la fase lunar actual, su porcentaje de iluminación y las fechas de las próximas fases principales, con un icono que se ajusta al hemisferio norte o sur.
- **Dirección del Viento:** Un indicador visual muestra la dirección del viento con una flecha y la abreviatura cardinal localizada (N, SO, E, etc.).
- **Diseño Receptivo:** Una interfaz totalmente receptiva que se ve genial en computadoras de escritorio, tabletas y dispositivos móviles.
- **Interfaz de Usuario Dinámica:** Incluye iconos meteorológicos animados para cada condición climática y un moderno diseño de "tarjeta de cristal".
- **Soporte Multilingüe:** Interfaz disponible en inglés, español y portugués, que se adapta al idioma del navegador.
- **Huevo de Pascua Oculto:** ¡Descubre una función secreta para una experiencia más inmersiva!

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con un stack tecnológico moderno y listo para producción:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [ShadCN UI](https://ui.shadcn.com/)
- **Iconos:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/) a través de [Genkit](https://firebase.google.com/docs/genkit) para la generación de imágenes.

---

## 🔌 APIs

- **[API de Open-Meteo](https://open-meteo.com/):** Utilizada para obtener datos del tiempo actual y pronósticos. ¡Es gratuita y no requiere API Key!
- **[Google AI (Gemini)](https://ai.google.dev/):** Para la generación de imágenes de fondo dinámicas.
- **[BigDataCloud Reverse Geocoding](https://www.bigdatacloud.com/):** Para obtener el nombre de la ciudad a partir de coordenadas.

---

## 🚀 Cómo Empezar

Sigue estas instrucciones para obtener una copia local del proyecto y ponerla en funcionamiento.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/damianclancig/weather-wise.git
    cd weather-wise
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo llamado `.env.local` en la raíz de tu proyecto. Necesitarás una API Key de Google AI para la generación de imágenes. Puedes obtenerla gratis en [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```.env.local
    # Clave de API de Google AI Studio para Gemini
    GEMINI_API_KEY=tu_api_key_aqui

    # URL de tu aplicación (opcional para desarrollo, recomendado para producción)
    # Por defecto, se usará http://localhost:9002 si no se especifica.
    # Para producción, cámbiala a tu dominio. Ejemplo:
    # APP_URL=https://clima.clancig.com.ar
    ```

### Ejecutar la Aplicación

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador para ver el resultado.

---

## 📄 Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.

---

## 👨‍💻 Autor

- **Clancig** - [Sitio Web](https://clancig.com.ar) | [GitHub](https://github.com/damianclancig)
