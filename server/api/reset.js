import fs from "fs"
import process from "process"

export default defineEventHandler(async()=>{
    const sourceDirectory = process.cwd() + "/static/archive"
    if(!fs.existsSync(sourceDirectory)) return;
    await fs.rmdirSync(sourceDirectory, {recursive: true, force: true})
})