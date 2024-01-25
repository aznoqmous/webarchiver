<template>
  <div>
    <title>WebArchiver</title>
    <h1>Web<span>Archiver</span></h1>
    <div>
      <form class="flex" @submit.prevent="submit">
        <input type="text" id="url" ref="input" placeholder="Enter an URL">
        <div v-if="assets.length"><a class="button" v-if="archivePath" :href="archivePath" download="Archive">Download archive</a></div>
        <div v-else><button class="button">Archive !</button></div>
      </form>
    </div>
    <div v-if="assets.length">
      <div v-if="assets.some(asset => !asset.done)">
        <progress :value="assets.filter(asset => asset.done).length" :max="assets.length"></progress>
        &nbsp;
        <em>{{ assets.filter(asset => asset.done).length }} / {{ assets.length }}</em>
      </div>
      <table>
        <tr v-for="asset in assets">
          <td><small>{{ asset.full }}</small></td>
          <td><small>{{ asset.status }}</small></td>
        </tr>
      </table>
    </div>
  </div>
</template>
<style lang="scss">
  h1 {}
</style>
<script setup>
  const assets = ref([])
  const localIndexPath = ref(null)
  const archivePath = ref(null)
  const input = ref(null)
  const submit = async(e)=>{
    try {
      await reset()
      const url = input.value.value
      let html = await getUrlAsText(url)
      assets.value = getAssets(url, html)

      await Promise.allSettled(assets.value.map(async asset => {
        asset.status = "Downloading..."
        const stats = await download(asset.full)
        asset.status = "Done"
        asset.size = stats.size
        asset.done = true
        html = html.replace(asset.match, `.${encodeURI(asset.pathname)}`)
      }))
     
      const indexStats = await writeFile("index.html", html)
      localIndexPath.value = indexStats.path

      archivePath.value = await createArchive()
    }
    catch(e){
      console.error(e)
    }
  }
  const getUrlAsText = async(url)=>{
    return await $fetch(`/api/get`, {method: "POST", body: JSON.stringify({url})})
  }
  const getAssets = (url, html)=>{
    const origin = new URL(url).origin
    return [...html.matchAll(/(src|href)=["|']([^"']*?)["|']/g)]
    .map(element => ({
      match: element[2],
      url: new URL(element[2], origin)
    }))
    //.filter(asset => asset.url.origin == origin)
    .filter(asset => ['css', 'svg', 'png', 'jpeg', 'jpg', 'gif', 'ttf', 'woff2', 'js'].includes(asset.url.pathname.match(/(?:\.([^.]+))?$/)[1]))
    .map(asset => {
      return({
      url: `${origin}${asset.url.pathname}`,
      pathname: asset.url.pathname,
      match: asset.match,
      full: asset.url.href,
      status: "",
      size: ""
    })
    })
  }
  const reset = async()=>{
    await $fetch("/api/reset")
  }
  const download = async (url, name=null)=>{
    return await $fetch(`/api/download`, {method: "POST", body: JSON.stringify({url, name})})
  }
  const writeFile = async(name, content)=>{
    return await $fetch(`/api/fileWrite`, {method: "POST", body: JSON.stringify({name, content})})
  }
  const createArchive = async()=>{
    return await $fetch("/api/createArchive", {method: "POST" })
  }
</script>