import fs from "fs"
import process from "process"

export default defineEventHandler(async()=>{
    const sourceDirectory = process.cwd() + "/static/archive"
    await fs.rmdirSync(sourceDirectory, {recursive: true, force: true})
})