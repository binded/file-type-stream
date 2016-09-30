# file-type-stream

[![Build Status](https://travis-ci.org/blockai/file-type-stream.svg?branch=master)](https://travis-ci.org/blockai/file-type-stream)

Wrapper over [file-type](https://github.com/sindresorhus/file-type) that
makes using it with streams easier.

## Install

```bash
npm install --save file-type-stream
```

Requires Node v6+

## Usage

```
fileTypeStream(callback)
```

See [./test](./test) directory for usage examples.

```javascript
import fileTypeStream from 'file-type-stream'
import { PassThrough } from 'stream'

// ...
// s3Client = ....
// ...

const through = new PassThrough()
readStream.pipe(fileTypeStream((type) => {
  // since transform streams buffer up to 16kb which
  // is enough to detect the file type, we get
  // the file type even through through hasn't been piped
  // anywhere yet.

  console.log('ext', type.ext)
  console.log('mime', type.mime)

  // E.g.:
  // We can use that info to open a write stream on aws s3
  // with the correct content type
  client.upload({
    ContentType: type.mime,
    Bucket: 'some-bucket',
    Key: 'some-key',
    Body: through,
  }, null, (err) => {
    // Upload completed!
  })
})).pipe(through)
```

The code above can be written a bit more intuitively with async/await:

```javascript

import fileTypeStream from 'file-type-stream'
import { PassThrough } from 'stream'

// ...
// s3Client = ....
// ...

const upload = async (rs) => {
  const Body = new PassThrough()

  const { mime } = await new Promise(resolve => {
    rs.pipe(fileTypeStream(resolve)).pipe(Body)
  })
  const response = client.upload({
    Body,
    ContentType: mime,
    Bucket: 'some-bucket',
    Key: 'some-key',
  }).toPromise()

  console.log(response)
}
```