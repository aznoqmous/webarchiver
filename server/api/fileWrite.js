import fs from "fs"
import process from "process"
import path from "path"

export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    const name = body.name
    const content = body.content
    const targetFile = process.cwd() + "/static/archive/" + name
    return await new Promise(res => {
        fs.mkdir(path.dirname(targetFile), {recursive: true }, async(e)=>{
            await fs.writeFileSync(targetFile, content)
            const stats = await fs.statSync(targetFile)
            stats.path = targetFile
            res(stats)
        })
    })
})