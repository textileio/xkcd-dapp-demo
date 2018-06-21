import 'babel-polyfill'
import getIpfs from 'window.ipfs-fallback'

var ipfs
const xkcdRoot = '/ipfs/QmS74HhZt3ZekqUDqdttSgMsHwYQ6miDLwGUHy6pp4qLyD'

const fetchAndReplaceComic = async comicNumber => {
  try {
    const files = await ipfs.files.get(`${xkcdRoot}/${comicNumber}`)
    for (let file of files) {
      const content = String.fromCharCode.apply(null, file.content)
      const image = document.getElementById('image')
      if (file.name.endsWith('.png')) {
        // Extract image data as base64 encoded string
        const encoded = btoa(content)
        // Update comic image
        image.setAttribute('src', `data:image/png;base64,${encoded}`)
        // Update original permalink
        document.getElementById('permalink')
          .textContent = comicNumber
        // Update IPFS hotlink
        document.getElementById('hotlink')
          .textContent = `${xkcdRoot}/${file.path}`
      } else if (file.name.endsWith('alt.txt')) {
        // Update comic title (hover)
        image.setAttribute('title', content)
        // Update comic title
        const title = file.name.slice(file.name.indexOf('- ') + 2, -10)
        document.getElementById('ctitle').textContent = title
        // Update comic image alt text
        image.setAttribute('alt', title)
      } else if (file.name.endsWith('alt.txt')) {
        document.getElementById('transcript')
          .textContent = content
      }
    }
  } catch(err) {
    console.log(err)
  }
}

const setup = async () => {
  try {
    // Create new ipfs peer instance (or use browser-based peer)
    ipfs = await getIpfs()
    // Connect to public peer pinning xkcd comics (normally not needed)
    const addr = '/dns4/ipfs.carsonfarmer.com/tcp/4002/wss/ipfs/Qmf6Wp6McAKm5oRYUPndLaAs5tnADASyJJZ3HkhzPmJJvY'
    await ipfs.swarm.connect(addr)
    // Add button event listeners
    for (let element of document.getElementsByClassName('first')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        fetchAndReplaceComic(1)
      }, true)
    }
    for (let element of document.getElementsByClassName('last')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        fetchAndReplaceComic(2003)
      }, true)
    }
    for (let element of document.getElementsByClassName('random')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        fetchAndReplaceComic(Math.floor(Math.random() * 2003) + 1)
      }, true)
    }
    for (let element of document.getElementsByClassName('prev')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        const current = parseInt(
          document.getElementById('permalink').textContent
        )
        if (current > 1) {
          fetchAndReplaceComic(current - 1)
        }
      }, true)
    }
    for (let element of document.getElementsByClassName('next')) {
      element.addEventListener('click', (event) => {
        event.preventDefault()
        const current = parseInt(
          document.getElementById('permalink').textContent
        )
        if (current < 2002) {
          fetchAndReplaceComic(current + 1)
        }
      }, true)
    }
  } catch(err) {
    console.log(err)
  }
  // Choose random comic (we have the first 2003 available right now)
  await fetchAndReplaceComic(Math.floor(Math.random() * 2003) + 1)
  document.getElementById('loading').style.visibility = "hidden"
  document.getElementById('middleContainer').style.visibility = "visible"
}
setup()
