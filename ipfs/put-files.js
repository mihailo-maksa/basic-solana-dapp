const process = require('process')
const minimist = require('minimist')
const { Web3Storage, getFilesFromPath } = require('web3.storage')

async function main() {
  try {
    const args = minimist(process.argv.slice(2))
    const token = args.token

    if (!token) {
      throw new Error('Token is required')
    }

    if (args._.length < 1) {
      throw new Error('Path is required')
    }

    const storage = new Web3Storage({ token })
    const files = []

    for (const path of args._) {
      const pathFiles = await getFilesFromPath(path)
      files.push(...pathFiles)
    }

    console.log(`Uploading ${files.length} files...`)
    const cid = await storage.put(files)
    console.log(`Content uploaded with the CID of ${cid}`)
  } catch (error) {
    console.error(error)
  }
}

main()

// node put-files.js --token=WEB3_STORAGE_TOKEN file1.ext file2.ext

// https://dweb.link/ipfs/YOUR_CID
