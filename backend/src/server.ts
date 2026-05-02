import 'dotenv/config'
import { createApp } from './app'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001

const app = createApp()

app.listen(PORT, () => {
  console.warn(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
})
