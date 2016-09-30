import test from 'blue-tape'
import initFile from 'kitchenfile'
import concat from 'concat-stream'
import { RandomStream } from 'common-streams'
import { PassThrough } from 'stream'

import fileTypeStream from '../src'

const file = initFile(__dirname)
const cat = file('cat.gif')

test('without piping to write stream', (t) => {
  const rs = cat.rs()
  rs.pipe(fileTypeStream(({ ext, mime }) => {
    t.equal(ext, 'gif')
    t.equal(mime, 'image/gif')
    t.end()
  }))
})

test('without piping to write stream (large stream)', (t) => {
  const rand = new RandomStream(20 * 1024 * 1024)
  rand.pipe(fileTypeStream((type) => {
    t.equal(type, null)
    t.end()
  }))
})

test('piping to write stream', (t) => {
  const rs = cat.rs()
  rs.pipe(fileTypeStream(({ ext, mime }) => {
    t.equal(ext, 'gif')
    t.equal(mime, 'image/gif')
  })).pipe(concat((buf) => {
    t.deepEqual(buf, cat.buf)
    t.end()
  }))
})

test('piping to write stream', async (t) => {
  const rs = cat.rs()

  const through = new PassThrough()
  const type = await new Promise(resolve => {
    rs.pipe(fileTypeStream(resolve)).pipe(through)
  })
  const buf = await new Promise(resolve => through.pipe(concat(resolve)))

  t.deepEqual(buf, cat.buf)
  t.deepEqual(type, { ext: 'gif', mime: 'image/gif' })
})
