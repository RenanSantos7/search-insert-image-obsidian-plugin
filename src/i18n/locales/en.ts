const en = {
	// Commands and menus
	commandOpenSearch: 'Search and insert image',
	ribbonTooltip: 'Search and insert image',
	noticeOpenMarkdownFirst: 'Open a Markdown note to search for images.',
	menuItemSearchImage: 'Search image…',

	// Modal
	modalTitle: 'Search image',
	searchPlaceholder: 'Type search term and press Enter',
	buttonLoadMore: 'Load more',
	statusSearching: 'Searching images…',
	statusLoadingMore: 'Loading more images…',
	statusNoResults: 'No images found.',
	statusDownloading: 'Downloading image…',
	ariaLabelImage: 'Image',
	buttonInsertLink: '🔗 Link',
	ariaLabelInsertLink: 'Insert as link',
	buttonDownload: '⬇ Download',
	ariaLabelDownload: 'Download and insert',
	hintClickToLink: 'Click image to insert as link. Shift+click to download and insert.',
	hintClickToDownload: 'Click image to download and insert. Shift+click to insert as link.',
	noticeGoogleNotConfigured:
		'To search with Google, configure your API key and search engine ID in plugin settings.',
	buttonRetryGoogle: 'Try with Google',

	// Errors
	errorGoogleConfig:
		'Google rejected the API key or search engine ID. Check plugin settings.',
	errorGoogleRateLimit:
		'Google API quota exceeded (100 free searches per day). Try again later.',
	errorDuckDuckGoRateLimit:
		'DuckDuckGo rate limit reached, try again in a few minutes.',
	errorProviderGeneric:
		'Could not search images with {provider}. Try again later.',

	// Insert notices
	noticeDownloadFailed:
		'Could not download image. Try another image or insert as link.',
	noticeNotAnImage:
		'The chosen URL is not an image. Try another image.',
	noticeSaveFailed:
		'Could not save image to vault.',

	// Settings - Search and insertion
	settingsHeadingSearchAndInsert: 'Search and insertion',
	settingDefaultProviderName: 'Default search provider',
	settingDefaultProviderDesc:
		'Provider selected when opening the search modal. It can also be changed in the modal itself.',
	settingDefaultInsertModeName: 'Default insert mode',
	settingDefaultInsertModeDesc:
		'Used when clicking on an image. Shift+click uses the other mode.',
	settingInsertModeLink: 'Insert as link',
	settingInsertModeDownload: 'Download and insert as wikilink',
	settingDownloadFolderName: 'Download folder',
	settingDownloadFolderDesc:
		'Vault folder where downloaded images are saved. Leave empty to use Obsidian\'s attachment folder. The folder is created if it does not exist.',
	settingDownloadFolderPlaceholder: 'Obsidian attachment folder',
	settingImageWidthName: 'Image width',
	settingImageWidthDesc:
		'Width in pixels added to the inserted image (e.g. |700). Leave empty or 0 for no width constraint.',
	settingImageWidthValidation: 'Enter an integer greater than or equal to zero.',
	settingSafeSearchName: 'Safe search',
	settingSafeSearchDesc: 'Filters explicit content from search results.',

	// Settings - Google
	settingsHeadingGoogle: 'Google search',
	settingGoogleConfigName: 'Configuration',
	settingGoogleConfigDesc:
		'Google search requires an API key and a search engine ID. Free usage is limited to 100 queries per day.',
	settingGoogleApiKeyName: 'API key',
	settingGoogleApiKeyDesc:
		'Create the key in Google Cloud Console and enable Custom Search API.',
	settingGoogleApiKeyPlaceholder: 'Google API key',
	settingGoogleCxName: 'Search engine ID',
	settingGoogleCxDesc:
		'Create a Google Programmable Search Engine with image search enabled.',
	settingGoogleCxPlaceholder: 'Search engine ID',
};

export default en;
