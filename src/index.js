import fileType from 'file-type'
import { Transform } from 'stream'

const fileTypeChunkSize = 262

class FileTypeStream extends Transform {
  constructor(callback) {
    super({
      highWaterMark: 10,
    })

    this.filetypeState = {
      callback,
      bufferedChunks: [],
      bufferedSize: 0,
    }
  }

  // See https://github.com/nodejs/node/issues/8855
  _transform(chunk, encoding, cb) {
    if (!this.filetypeState) return cb(null, chunk)
    const state = this.filetypeState
    state.bufferedChunks.push(chunk)
    state.bufferedSize += chunk.length

    if (state.bufferedSize >= fileTypeChunkSize) {
      const buf = Buffer.concat(state.bufferedChunks)
      this.filetypeState = null
      state.callback(fileType(buf))
    }
    cb(null, chunk)
  }
}

export default (fn) => new FileTypeStream(fn)
