import { expect, test, describe } from 'bun:test'
import { parseLyric } from './parse-lyric'

describe('parseLyric', () => {
  test('parses basic LRC format with timestamps', () => {
    const lrc = `[00:12.34]First line
[00:25.67]Second line
[00:38.90]Third line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      index: 0,
      time: 12.34,
      rawContent: 'First line',
      transContent: '',
    })
    expect(result[1]).toEqual({
      index: 1,
      time: 25.67,
      rawContent: 'Second line',
      transContent: '',
    })
    expect(result[2]).toEqual({
      index: 2,
      time: 38.9,
      rawContent: 'Third line',
      transContent: '',
    })
  })

  test('parses LRC with milliseconds (3 digits)', () => {
    const lrc = `[00:12.345]Line with milliseconds
[01:23.678]Another line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    expect(result[0].time).toBe(12.345)
    expect(result[1].time).toBe(83.678) // 1*60 + 23.678
  })

  test('parses LRC with centiseconds (2 digits)', () => {
    const lrc = `[00:12.34]Line with centiseconds
[01:23.56]Another line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    expect(result[0].time).toBe(12.34)
    expect(result[1].time).toBe(83.56) // 1*60 + 23.56
  })

  test('handles bilingual lyrics with same timestamps', () => {
    const lrc = `[00:12.34]Original line
[00:12.34]Translation line
[00:25.67]Second original
[00:25.67]Second translation`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      index: 0,
      time: 12.34,
      rawContent: 'Original line',
      transContent: 'Translation line',
    })
    expect(result[1]).toEqual({
      index: 1,
      time: 25.67,
      rawContent: 'Second original',
      transContent: 'Second translation',
    })
  })

  test('handles multiple timestamps on same line', () => {
    const lrc = `[00:12.34][00:15.67]Repeated line
[00:25.89]Normal line`

    const result = parseLyric(lrc)

    // Multiple leading timestamps are all used
    expect(result).toHaveLength(3)
    expect(result[0].time).toBe(12.34)
    expect(result[0].rawContent).toBe('Repeated line')
    expect(result[1].time).toBe(15.67)
    expect(result[1].rawContent).toBe('Repeated line')
    expect(result[2].time).toBe(25.89)
    expect(result[2].rawContent).toBe('Normal line')
  })

  test('removes karaoke tags from content', () => {
    const lrc = `[00:12.34]Hello <00:13.00>world <00:14.00>test
[00:25.67]Normal line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    expect(result[0].rawContent).toBe('Hello world test')
    expect(result[1].rawContent).toBe('Normal line')
  })

  test('removes various timestamp formats from content', () => {
    const lrc = `[00:12.34]Start [00:13.45] middle <00:14.56> end [00:15.67]
[00:25.67]Text with <01:23.45> karaoke <02:34.56> tags
[00:35.78]Mixed [00:36.89] and <00:37.90> formats [00:38.01]`

    const result = parseLyric(lrc)

    // Only leading timestamps are used, timestamps after content are ignored
    expect(result).toHaveLength(3)
    expect(result[0].rawContent).toBe('Start  middle  end')
    expect(result[1].rawContent).toBe('Text with  karaoke  tags')
    expect(result[2].rawContent).toBe('Mixed  and  formats')
  })

  test('handles content with only timestamp tags', () => {
    const lrc = `[00:12.34][00:13.45]<00:14.56>[00:15.67]
[00:25.67]<01:23.45><02:34.56>
[00:35.78]Some text [00:36.89]<00:37.90>`

    const result = parseLyric(lrc)

    // First line: only consecutive leading timestamps [00:12.34][00:13.45] are used
    // [00:15.67] comes after <00:14.56> so it's not leading
    // Second line: has leading timestamp [00:25.67]
    // Third line: has leading timestamp [00:35.78] with content
    expect(result).toHaveLength(4)
    expect(result[0].rawContent).toBe('')
    expect(result[1].rawContent).toBe('')
    expect(result[2].rawContent).toBe('')
    expect(result[3].rawContent).toBe('Some text')
  })

  test('preserves content without timestamp tags', () => {
    const lrc = `[00:12.34]Regular text without any tags
[00:25.67]Another normal line
[00:35.78]Text with (parentheses) and {braces}`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0].rawContent).toBe('Regular text without any tags')
    expect(result[1].rawContent).toBe('Another normal line')
    expect(result[2].rawContent).toBe('Text with (parentheses) and {braces}')
  })

  test('handles edge cases in timestamp tag removal', () => {
    const lrc = `[00:12.34]Text with [incomplete tag
[00:25.67]Text with <incomplete tag
[00:35.78]Text with [00:36.89 missing bracket
[00:45.90]Text with <00:46.01 missing bracket
[00:55.12]Normal [00:56.23] and <00:57.34> tags`

    const result = parseLyric(lrc)

    // Each line with content only uses the first timestamp
    expect(result).toHaveLength(5)
    expect(result[0].rawContent).toBe('Text with [incomplete tag')
    expect(result[1].rawContent).toBe('Text with <incomplete tag')
    expect(result[2].rawContent).toBe('Text with [00:36.89 missing bracket')
    expect(result[3].rawContent).toBe('Text with <00:46.01 missing bracket')
    expect(result[4].rawContent).toBe('Normal  and  tags')
  })

  test('skips empty lines and lines without timestamps', () => {
    const lrc = `[00:12.34]First line

This line has no timestamp
[00:25.67]Second line

[00:38.90]Third line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0].rawContent).toBe('First line')
    expect(result[1].rawContent).toBe('Second line')
    expect(result[2].rawContent).toBe('Third line')
  })

  test('sorts lyrics by timestamp', () => {
    const lrc = `[00:25.67]Second line
[00:12.34]First line
[00:38.90]Third line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0].time).toBe(12.34)
    expect(result[1].time).toBe(25.67)
    expect(result[2].time).toBe(38.9)
  })

  test('handles empty input', () => {
    const result = parseLyric('')
    expect(result).toEqual([])
  })

  test('handles single line without timestamps as fallback', () => {
    const lrc = 'Just a single line of text'

    const result = parseLyric(lrc)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      index: 0,
      time: 0,
      rawContent: 'Just a single line of text',
      transContent: '',
    })
  })

  test('handles multiple lines without timestamps as fallback', () => {
    const lrc = `First line without timestamp
Second line without timestamp
Third line without timestamp`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      index: -1,
      time: -1,
      rawContent: 'First line without timestamp',
      transContent: '',
    })
    expect(result[1]).toEqual({
      index: -1,
      time: -1,
      rawContent: 'Second line without timestamp',
      transContent: '',
    })
    expect(result[2]).toEqual({
      index: -1,
      time: -1,
      rawContent: 'Third line without timestamp',
      transContent: '',
    })
  })

  test('handles mixed line endings (CRLF and LF)', () => {
    const lrc = '[00:12.34]First line\r\n[00:25.67]Second line\n[00:38.90]Third line'

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0].rawContent).toBe('First line')
    expect(result[1].rawContent).toBe('Second line')
    expect(result[2].rawContent).toBe('Third line')
  })

  test('handles large minute values within regex limits', () => {
    const lrc = `[99:59.99]Large minute value
[10:00.00]Ten minutes`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    // Results are sorted by time, so 10:00.00 (600s) comes before 99:59.99 (5999.99s)
    expect(result[0].time).toBe(10 * 60) // 600
    expect(result[0].rawContent).toBe('Ten minutes')
    expect(result[1].time).toBe(99 * 60 + 59.99) // 5999.99
    expect(result[1].rawContent).toBe('Large minute value')
  })

  test('ignores timestamps with more than 2 minute digits', () => {
    const lrc = `[99:59.99]Valid timestamp
[100:00.00]Invalid timestamp - too many minute digits
[01:30.00]Another valid timestamp`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    // Results are sorted by time, so 01:30.00 (90s) comes before 99:59.99 (5999.99s)
    expect(result[0].time).toBe(90) // 1*60 + 30
    expect(result[0].rawContent).toBe('Another valid timestamp')
    expect(result[1].time).toBe(99 * 60 + 59.99)
    expect(result[1].rawContent).toBe('Valid timestamp')
  })

  test('trims whitespace from content', () => {
    const lrc = `[00:12.34]   First line with spaces   
[00:25.67]	Second line with tabs	`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(2)
    expect(result[0].rawContent).toBe('First line with spaces')
    expect(result[1].rawContent).toBe('Second line with tabs')
  })

  test('handles lines with only timestamps (empty content)', () => {
    const lrc = `[00:12.34]First line
[00:25.67]
[00:38.90]Third line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(3)
    expect(result[0].rawContent).toBe('First line')
    expect(result[1].rawContent).toBe('')
    expect(result[2].rawContent).toBe('Third line')
  })

  test('maintains correct index sequence', () => {
    const lrc = `[00:12.34]First
[00:25.67]
[00:38.90]Second
[00:45.00]Third`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(4)
    expect(result[0].index).toBe(0)
    expect(result[1].index).toBe(1)
    expect(result[2].index).toBe(2)
    expect(result[3].index).toBe(3)
  })

  test('uses leading timestamps and ignores timestamps after content', () => {
    const lrc = `[00:12.34][00:13.45]Line with content
[00:25.67][00:26.78][00:27.89]
[00:35.90]Another [00:36.01] line`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(6)
    // First line: multiple leading timestamps, both used
    expect(result[0].time).toBe(12.34)
    expect(result[0].rawContent).toBe('Line with content')
    expect(result[1].time).toBe(13.45)
    expect(result[1].rawContent).toBe('Line with content')
    // Second line: no content, uses all leading timestamps
    expect(result[2].time).toBe(25.67)
    expect(result[2].rawContent).toBe('')
    expect(result[3].time).toBe(26.78)
    expect(result[3].rawContent).toBe('')
    expect(result[4].time).toBe(27.89)
    expect(result[4].rawContent).toBe('')
    // Third line: only leading timestamp used, [00:36.01] after content is ignored
    expect(result[5].time).toBe(35.9)
    expect(result[5].rawContent).toBe('Another  line')
  })

  test('ignores timestamps and karaoke tags after lyric content', () => {
    const lrc = `[00:35.78]Some text [00:36.89]<00:37.90>
[01:12.34]Hello [01:13.45] world <01:14.56>
[02:25.67][02:26.78]Multiple leading [02:27.89] timestamps`

    const result = parseLyric(lrc)

    expect(result).toHaveLength(4)
    // Only leading timestamps are used, everything after content is ignored
    expect(result[0].time).toBe(35.78)
    expect(result[0].rawContent).toBe('Some text')
    expect(result[1].time).toBe(72.34) // 1*60 + 12.34
    expect(result[1].rawContent).toBe('Hello  world')
    // Third line has two leading timestamps, both used
    expect(result[2].time).toBe(145.67) // 2*60 + 25.67
    expect(result[2].rawContent).toBe('Multiple leading  timestamps')
    expect(result[3].time).toBe(146.78) // 2*60 + 26.78
    expect(result[3].rawContent).toBe('Multiple leading  timestamps')
  })
})
