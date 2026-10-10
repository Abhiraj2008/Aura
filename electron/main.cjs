const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

let mainWindow;

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.m4a', '.wav', '.flac', '.ogg', '.oga',
  '.aac', '.opus', '.wma', '.aiff', '.aif', '.alac',
  '.webm', '.weba', '.m4b'
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0c0d11',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // allow playing local files smoothly
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const startUrl = isDev
    ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Helper to check if buffer is an image
function isImageBuffer(buf) {
  if (!buf || buf.length < 4) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  // WebP: RIFF ... WEBP
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return false;
}

// Extract rich metadata, embedded artwork, and companion .lrc/image files
async function extractTrackMetadata(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const rawBaseName = path.basename(filePath, path.extname(filePath));
  // Clean base name without download suffixes like (MP3_320K)
  const cleanBaseName = rawBaseName.replace(/\(MP3_\d+K\)/gi, '').trim();

  let title = rawBaseName;
  let artist = 'Unknown Artist';
  let album = path.basename(dir);
  let duration = 0;
  let bitrate = undefined;
  let sampleRate = undefined;
  let bitDepth = undefined;
  let channels = 'Stereo';
  let coverUrl = undefined;
  let lyrics = undefined;

  // 1. Try parsing audio metadata directly with music-metadata
  try {
    const meta = await mm.parseFile(filePath, { skipCovers: false });
    if (meta.common.title) title = meta.common.title;
    if (meta.common.artist) artist = meta.common.artist;
    if (meta.common.album) album = meta.common.album;
    if (meta.format.duration) duration = meta.format.duration;
    if (meta.format.bitrate) bitrate = `${Math.round(meta.format.bitrate / 1000)} kbps`;
    if (meta.format.sampleRate) sampleRate = `${(meta.format.sampleRate / 1000).toFixed(1)} kHz`;
    if (meta.format.bitsPerSample) bitDepth = `${meta.format.bitsPerSample}-bit`;
    if (meta.format.numberOfChannels) {
      channels = meta.format.numberOfChannels === 2 ? 'Stereo (2.0)' : meta.format.numberOfChannels === 1 ? 'Mono' : 'Multi-channel';
    }

    // Check embedded artwork
    if (meta.common.picture && meta.common.picture.length > 0) {
      const pic = meta.common.picture[0];
      const mime = pic.format || 'image/jpeg';
      coverUrl = `data:${mime};base64,${pic.data.toString('base64')}`;
    }
  } catch (err) {
    console.warn('Metadata parsing notice for file:', filePath, err.message);
  }

  // 2. Look for companion image files in the same directory if no embedded cover
  if (!coverUrl) {
    const candidateImages = [
      path.join(dir, `${rawBaseName}.jpg`),
      path.join(dir, `${rawBaseName}.jpeg`),
      path.join(dir, `${rawBaseName}.png`),
      path.join(dir, `${rawBaseName}.webp`),
      path.join(dir, `${cleanBaseName}.jpg`),
      path.join(dir, `${cleanBaseName}.jpeg`),
      path.join(dir, `${cleanBaseName}.png`),
      path.join(dir, `${cleanBaseName}.webp`),
      path.join(dir, 'cover.jpg'),
      path.join(dir, 'folder.jpg'),
      path.join(dir, 'album.jpg')
    ];

    for (const imgPath of candidateImages) {
      if (fs.existsSync(imgPath)) {
        try {
          const buf = fs.readFileSync(imgPath);
          const extName = path.extname(imgPath).toLowerCase();
          const mime = extName === '.png' ? 'image/png' : extName === '.webp' ? 'image/webp' : 'image/jpeg';
          coverUrl = `data:${mime};base64,${buf.toString('base64')}`;
          break;
        } catch (e) {
          console.warn('Error reading companion image:', e);
        }
      }
    }
  }

  // 3. Companion .lrc file handling (check both for lyrics and for misnamed images!)
  const candidateLrc = [
    path.join(dir, `${rawBaseName}.lrc`),
    path.join(dir, `${rawBaseName}_private.lrc`),
    path.join(dir, `${cleanBaseName}.lrc`),
    path.join(dir, `${cleanBaseName}_private.lrc`),
  ];

  for (const lrcPath of candidateLrc) {
    if (fs.existsSync(lrcPath)) {
      try {
        const fileBuffer = fs.readFileSync(lrcPath);
        const imageMime = isImageBuffer(fileBuffer);

        if (imageMime) {
          // The .lrc file is actually an image!
          if (!coverUrl) {
            coverUrl = `data:${imageMime};base64,${fileBuffer.toString('base64')}`;
          }
        } else {
          // It's a text lyrics file
          lyrics = fileBuffer.toString('utf-8');
        }
        break;
      } catch (e) {
        console.warn('Error reading .lrc file:', e);
      }
    }
  }

  const stats = fs.statSync(filePath);
  const sizeInMb = (stats.size / (1024 * 1024)).toFixed(1);

  const formatMap = {
    mp3: 'mp3',
    m4a: 'm4a',
    wav: 'wav',
    flac: 'flac',
    ogg: 'ogg',
    oga: 'ogg',
    aac: 'aac',
    opus: 'opus',
    wma: 'wma',
    aiff: 'aiff',
    aif: 'aiff',
    alac: 'alac',
    webm: 'webm',
    weba: 'webm',
    m4b: 'm4b'
  };
  const format = formatMap[ext] || ext;

  return {
    id: `local-${stats.ino || Math.random()}-${stats.mtimeMs}`,
    title,
    artist,
    album,
    duration: Math.round(duration) || 180,
    format,
    category: (title.toLowerCase().includes('podcast') || rawBaseName.toLowerCase().includes('podcast')) ? 'podcast' : 'music',
    src: `file://${filePath.replace(/\\/g, '/')}`,
    path: filePath,
    coverUrl,
    lyrics,
    isFavorite: false,
    metadata: {
      bitrate: bitrate || (format === 'flac' || format === 'alac' ? 'Lossless Studio' : '320 kbps'),
      sampleRate: sampleRate || '48.0 kHz',
      bitDepth: bitDepth || (format === 'flac' || format === 'wav' || format === 'aiff' ? '24-bit PCM' : '16-bit'),
      channels,
      fileSize: `${sizeInMb} MB`
    }
  };
}

// Recursively scan folder for audio files
async function scanDirectoryForAudio(dirPath, fileList = []) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scanDirectoryForAudio(fullPath, fileList);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) {
          const track = await extractTrackMetadata(fullPath);
          fileList.push(track);
        }
      }
    }
  } catch (err) {
    console.error('Error scanning folder:', err);
  }
  return fileList;
}

// File Dialogues
ipcMain.handle('dialog-open-files', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Audio Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'All Supported Audio (MP3, M4A, WAV, FLAC, OGG, AAC, OPUS, WMA, AIFF, WebM, M4B)',
        extensions: ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'oga', 'aac', 'opus', 'wma', 'aiff', 'aif', 'alac', 'webm', 'weba', 'm4b']
      },
      { name: 'MP3 & AAC Audio', extensions: ['mp3', 'aac', 'm4a', 'm4b'] },
      { name: 'Lossless Masters (FLAC, WAV, AIFF, ALAC)', extensions: ['flac', 'wav', 'aiff', 'aif', 'alac'] },
      { name: 'OGG & OPUS & WebM Audio', extensions: ['ogg', 'oga', 'opus', 'webm', 'weba'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths.length) return [];

  const tracks = [];
  for (const filePath of result.filePaths) {
    const track = await extractTrackMetadata(filePath);
    tracks.push(track);
  }
  return tracks;
});

ipcMain.handle('dialog-open-folder', async () => {
  if (!mainWindow) return { folderPath: null, files: [] };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Music or Podcast Folder',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return { folderPath: null, files: [] };
  }

  const folderPath = result.filePaths[0];
  const files = await scanDirectoryForAudio(folderPath);
  return { folderPath, files };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
