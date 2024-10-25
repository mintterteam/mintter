import {defaultRoute} from '@mintter/app/utils/routes'
import {
  API_HTTP_URL,
  ELECTRON_HTTP_PORT,
  IS_PROD_DESKTOP,
} from '@mintter/shared'
import * as Sentry from '@sentry/electron/main'
import {
  BrowserWindow,
  Menu,
  app,
  dialog,
  globalShortcut,
  ipcMain,
  nativeTheme,
  net,
  shell,
} from 'electron'
import contextMenu from 'electron-context-menu'
import log from 'electron-log/main'
import squirrelStartup from 'electron-squirrel-startup'
import fs from 'fs'
import mime from 'mime'
import path from 'node:path'
import {
  handleSecondInstance,
  handleUrlOpen,
  openInitialWindows,
  trpc,
} from './app-api'
import {createAppMenu} from './app-menu'
import {startMetricsServer} from './app-metrics'
import {initPaths} from './app-paths'
import {APP_AUTO_UPDATE_PREFERENCE} from './app-settings'
import {appStore} from './app-store'
import autoUpdate from './auto-update'
import {startMainDaemon} from './daemon'
import {saveCidAsFile} from './save-cid-as-file'
import {saveMarkdownFile} from './save-markdown-file'

const OS_REGISTER_SCHEME = 'hm'

initPaths()

contextMenu({
  showInspectElement: !IS_PROD_DESKTOP,
})

const metricsServer = startMetricsServer(ELECTRON_HTTP_PORT)
app.on('quit', async () => {
  await metricsServer.close()
})

if (IS_PROD_DESKTOP) {
  if (squirrelStartup) {
    app.quit()
  }

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(OS_REGISTER_SCHEME, process.execPath, [
        path.resolve(process.argv[1]!),
      ])
    }
  } else {
    app.setAsDefaultProtocolClient(OS_REGISTER_SCHEME)
  }

  Sentry.init({
    debug: false,
    release: import.meta.env.VITE_VERSION,
    environment: import.meta.env.MODE,
    dsn: import.meta.env.VITE_DESKTOP_SENTRY_DSN,
    transportOptions: {
      // The maximum number of days to keep an event in the queue.
      maxQueueAgeDays: 30,
      // The maximum number of events to keep in the queue.
      maxQueueCount: 30,
      // Called every time the number of requests in the queue changes.
      queuedLengthChanged: (length) => {
        log.debug('[MAIN]: Sentry queue changed', length)
      },
      // Called before attempting to send an event to Sentry. Used to override queuing behavior.
      //
      // Return 'send' to attempt to send the event.
      // Return 'queue' to queue and persist the event for sending later.
      // Return 'drop' to drop the event.
      // beforeSend: (request) => (isOnline() ? 'send' : 'queue'),
    },
  })
}

startMainDaemon()

Menu.setApplicationMenu(createAppMenu())
let shouldAutoUpdate = appStore.get(APP_AUTO_UPDATE_PREFERENCE) || 'true'

if (shouldAutoUpdate == 'true') {
  autoUpdate()
} else {
  console.log('Auto-Update is set to OFF')
}

//Simple logging module Electron/Node.js/NW.js application. No dependencies. No complicated configuration.
log.initialize({
  preload: true,
  // It makes a renderer logger available trough a global electronLog instance
  spyRendererConsole: true,
})

app.on('did-become-active', () => {
  log.debug('[MAIN]: Mintter active')
  if (BrowserWindow.getAllWindows().length === 0) {
    log.debug('[MAIN]: will open the home window')
    trpc.createAppWindow({
      routes: [defaultRoute],
    })
  }
})
app.on('did-resign-active', () => {
  log.debug('[MAIN]: Mintter no longer active')
})

// dark mode support: https://www.electronjs.org/docs/latest/tutorial/dark-mode
ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})

ipcMain.on('save-file', saveCidAsFile)

ipcMain.on('export-document', saveMarkdownFile)

ipcMain.on(
  'export-multiple-documents',
  async (
    event,
    documents: {
      title: string
      markdown: {
        markdownContent: string
        mediaFiles: {url: string; filename: string; placeholder: string}[]
      }
    }[],
  ) => {
    const {debug, error} = console

    // Open a dialog to select a directory
    const {filePaths} = await dialog.showOpenDialog({
      title: 'Select Export Directory',
      defaultPath: app.getPath('documents'),
      properties: ['openDirectory'],
    })

    if (filePaths && filePaths.length > 0) {
      const exportDir = path.join(filePaths[0], 'Mintter Documents')
      const mediaDir = path.join(exportDir, 'media')

      // Create the Mintter Documents folder and the shared media folder
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir)
      }
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir)
      }

      // Track duplicate titles
      const titleCounter: {[key: string]: number} = {}
      let success: {success: boolean; message: string} = {
        success: true,
        message: exportDir,
      }

      for (const {title, markdown} of documents) {
        const {markdownContent, mediaFiles} = markdown

        // Generate a camelCase filename for the markdown document
        const camelTitle = title
          .split(' ')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join('')
          .replace(/[\/\\|]/g, '-') // Remove invalid characters: / \ |
          .replace(/\s+/g, '') // Remove all whitespace for camel case

        // Initialize counter for the title if not present
        if (!titleCounter[camelTitle]) {
          titleCounter[camelTitle] = 0
        }

        let markdownFilePath = path.join(exportDir, `${camelTitle}.md`)

        // Check if file with the same name already exists and add a counter to the file name
        while (fs.existsSync(markdownFilePath)) {
          titleCounter[camelTitle] += 1
          markdownFilePath = path.join(
            exportDir,
            `${camelTitle}-${titleCounter[camelTitle]}.md`,
          )
        }

        let updatedMarkdownContent = markdownContent

        const uploadMediaFile = async ({
          url,
          filename,
          placeholder,
        }: {
          url: string
          filename: string
          placeholder: string
        }) => {
          return new Promise<void>((resolve, reject) => {
            const regex = /ipfs:\/\/(.+)/
            const match = url.match(regex)
            if (match) {
              const cid = match[1]
              const request = net.request(`${API_HTTP_URL}/ipfs/${cid}`)

              request.on('response', (response) => {
                const mimeType = response.headers['content-type']
                const extension = Array.isArray(mimeType)
                  ? mime.extension(mimeType[0])
                  : mime.extension(mimeType)
                const filenameWithExt = `${filename}.${extension}`

                if (response.statusCode === 200) {
                  const chunks: Buffer[] = []

                  response.on('data', (chunk) => {
                    chunks.push(chunk)
                  })

                  response.on('end', () => {
                    const data = Buffer.concat(chunks)
                    if (!data || data.length === 0) {
                      reject(`Error: No data received for ${filenameWithExt}`)
                      return
                    }

                    const mediaFilePath = path.join(mediaDir, filenameWithExt)
                    try {
                      fs.writeFileSync(mediaFilePath, data)
                      debug(`Media file successfully saved: ${mediaFilePath}`)
                      // Update the markdown content with the correct file name
                      updatedMarkdownContent = updatedMarkdownContent.replace(
                        placeholder,
                        filenameWithExt,
                      )
                      resolve()
                    } catch (e) {
                      reject(e)
                    }
                  })
                } else {
                  reject(`Error: Invalid status code ${response.statusCode}`)
                }
              })

              request.on('error', (err) => {
                reject(err.message)
              })

              request.end()
            }
          })
        }

        // Handle all media files for the current document
        await Promise.all(mediaFiles.map(uploadMediaFile))

        // Save the updated markdown file
        try {
          fs.writeFileSync(markdownFilePath, updatedMarkdownContent)
          debug(`Markdown file successfully saved: ${markdownFilePath}`)
        } catch (e) {
          error(`Error saving markdown file: ${markdownFilePath}`, e)
          success = {
            success: false,
            message: `Error saving document: ${title}`,
          }
        }
      }

      if (success.success) {
        event.sender.send('export-completed', {
          success: true,
          message: success.message,
        })
      } else {
        event.sender.send('export-completed', {
          success: false,
          message: success.message,
        })
      }
    } else {
      event.sender.send('export-completed', {
        success: false,
        message: 'Export has been cancelled.',
      })
    }
  },
)

ipcMain.on('open-directory', (_event, directory: string) => {
  shell.openPath(directory)
})
ipcMain.on('open-external-link', (_event, linkUrl) => {
  shell.openExternal(linkUrl)
})

ipcMain.on('quit_app', () => {
  app.quit()
})

ipcMain.on('open_path', (event, path) => {
  shell.openPath(path)
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  log.debug('[MAIN]: Another Mintter already running. Quitting..')
  app.quit()
} else {
  app.on('ready', () => {
    log.debug('[MAIN]: Mintter ready')
    openInitialWindows()
  })
  app.on('second-instance', handleSecondInstance)

  app.on('window-all-closed', () => {
    log.debug('[MAIN]: window-all-closed')
    globalShortcut.unregisterAll()
    if (process.platform != 'darwin') {
      log.debug('[MAIN]: will quit the app')
      app.quit()
    }
  })
  app.on('open-url', (_event, url) => {
    handleUrlOpen(url)
  })
  app.on('activate', () => {
    log.debug('[MAIN]: Mintter Active')
    if (BrowserWindow.getAllWindows().length === 0) {
      log.debug('[MAIN]: will open the home window')
      trpc.createAppWindow({
        routes: [defaultRoute],
      })
    }
  })
}
