import { createFileFromPath } from 'node-taglib-sharp-extend'

const f = createFileFromPath('./public/test.ogg')

f.tag.lyrics = await Bun.file('./test.lrc').text()

f.save()
