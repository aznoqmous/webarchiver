import archiver from "archiver"
import fs from "fs"
import process from "process"

export default defineEventHandler(async()=>{
    return await new Promise(resolve => {
        const targetFile = process.cwd() + "/public/archive.zip"
        const sourceDirectory = process.cwd() + "/static/archive"
        const output = fs.createWriteStream(targetFile)
        const archive = archiver('zip')
        archive.pipe(output)
        archive.directory(sourceDirectory, false)
        archive.finalize()
        output.on('close', ()=> resolve("/archive.zip"))
    })
})