import http from "http"
import https from "https"
import fs from "fs"
import process from "process"
import path from "path"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const url = new URL(body.url)
    const filePath = body.name ? `/${body.name}` : url.pathname  
    const targetFile = process.cwd() + "/static/archive" + decodeURI(filePath)
    console.log(`[RUNNING] Downloading ${body.url} --> ${targetFile}`)
    return await new Promise(res => {
        fs.mkdir(path.dirname(targetFile), {recursive: true }, (e)=>{
            const file = fs.createWriteStream(targetFile)
            const handler = url.protocol == "https:" ? https : http
            handler.get(url.href, (response)=>{
                response.pipe(file)
                file.on('finish', async ()=>{
                    file.close()
                    console.log(`[COMPLETED] Downloading ${body.url} --> ${targetFile}`)
                    const stats = await fs.statSync(targetFile)
                    stats.path = targetFile
                    res(stats)
                })
            })
        })
    })
})