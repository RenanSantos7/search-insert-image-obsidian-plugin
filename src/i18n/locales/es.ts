import type en from './en';

const es: Partial<typeof en> = {
	// Commands and menus
	commandOpenSearch: 'Buscar e insertar imagen',
	ribbonTooltip: 'Buscar e insertar imagen',
	noticeOpenMarkdownFirst: 'Abre una nota de Markdown para buscar imágenes.',
	menuItemSearchImage: 'Buscar imagen…',

	// Modal
	modalTitle: 'Buscar imagen',
	searchPlaceholder: 'Escribe el término y presiona Enter',
	buttonLoadMore: 'Cargar más',
	statusSearching: 'Buscando imágenes…',
	statusLoadingMore: 'Buscando más imágenes…',
	statusNoResults: 'No se encontraron imágenes.',
	statusDownloading: 'Descargando imagen…',
	ariaLabelImage: 'Imagen',
	buttonInsertLink: '🔗 Enlace',
	ariaLabelInsertLink: 'Insertar como enlace',
	buttonDownload: '⬇ Descargar',
	ariaLabelDownload: 'Descargar e insertar',
	hintClickToLink: 'Haz clic en la imagen para insertar como enlace. Shift+clic para descargar e insertar.',
	hintClickToDownload: 'Haz clic en la imagen para descargar e insertar. Shift+clic para insertar como enlace.',
	noticeGoogleNotConfigured:
		'Para buscar con Google, configura tu clave de API y el ID del motor de búsqueda en los ajustes del plugin.',
	buttonRetryGoogle: 'Intentar con Google',

	// Errors
	errorGoogleConfig:
		'Google rechazó la clave de API o el ID del motor de búsqueda. Revisa los ajustes del plugin.',
	errorGoogleRateLimit:
		'Se agotó la cuota de la API de Google (100 búsquedas gratuitas al día). Inténtalo de nuevo más tarde.',
	errorDuckDuckGoRateLimit:
		'DuckDuckGo limitó las solicitudes, inténtalo de nuevo en unos minutos.',
	errorProviderGeneric:
		'No se pudieron buscar imágenes en {provider}. Inténtalo de nuevo más tarde.',

	// Insert notices
	noticeDownloadFailed:
		'No se pudo descargar la imagen. Prueba con otra imagen o insértala como enlace.',
	noticeNotAnImage:
		'La URL elegida no es una imagen. Prueba con otra imagen.',
	noticeSaveFailed:
		'No se pudo guardar la imagen en la bóveda.',

	// Settings - Search and insertion
	settingsHeadingSearchAndInsert: 'Búsqueda e inserción',
	settingDefaultProviderName: 'Buscador predeterminado',
	settingDefaultProviderDesc:
		'Buscador seleccionado al abrir la ventana de búsqueda. También se puede cambiar en la propia ventana.',
	settingDefaultInsertModeName: 'Modo de inserción predeterminado',
	settingDefaultInsertModeDesc:
		'Se utiliza al hacer clic en la imagen. Shift+clic usa el otro modo.',
	settingInsertModeLink: 'Insertar como enlace',
	settingInsertModeDownload: 'Descargar e insertar como wikilink',
	settingDownloadFolderName: 'Carpeta de descargas',
	settingDownloadFolderDesc:
		'Carpeta de la bóveda donde se guardan las imágenes descargadas. Déjalo vacío para usar la carpeta de adjuntos de Obsidian. La carpeta se creará si no existe.',
	settingDownloadFolderPlaceholder: 'Carpeta de adjuntos de Obsidian',
	settingImageWidthName: 'Ancho de la imagen',
	settingImageWidthDesc:
		'Ancho en píxeles añadido a la imagen insertada (ej.: |700). Déjalo vacío o en 0 para no restringir el ancho.',
	settingImageWidthValidation: 'Introduce un número entero mayor o igual a cero.',
	settingSafeSearchName: 'Búsqueda segura',
	settingSafeSearchDesc: 'Filtra el contenido explícito de los resultados.',

	// Settings - Google
	settingsHeadingGoogle: 'Búsqueda en Google',
	settingGoogleConfigName: 'Configuración',
	settingGoogleConfigDesc:
		'La búsqueda en Google requiere una clave de API y un ID de motor de búsqueda. El uso gratuito está limitado a 100 búsquedas por día.',
	settingGoogleApiKeyName: 'Clave de API',
	settingGoogleApiKeyDesc:
		'Crea la clave en la consola de Google Cloud y activa la API Custom Search.',
	settingGoogleApiKeyPlaceholder: 'Clave de API de Google',
	settingGoogleCxName: 'ID del motor de búsqueda',
	settingGoogleCxDesc:
		'Crea un motor de búsqueda programable de Google con la búsqueda de imágenes activada.',
	settingGoogleCxPlaceholder: 'ID del motor de búsqueda',
};

export default es;
