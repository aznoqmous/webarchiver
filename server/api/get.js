export default defineEventHandler(async(event)=>{
    const body = await readBody(event)
    return await $fetch(body.url)
})