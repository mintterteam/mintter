import {Block} from '@mintter/shared'
import {describe, expect, test} from 'vitest'
import {editorBlockToServerBlock, extractContent} from '../editor-to-server'

describe('Editor to Server: ', () => {
  describe('Extract Content: ', () => {
    test('overlapping annotation', () => {
      const extracted = extractContent([
        {type: 'text', text: 'A', styles: {}},
        {type: 'text', text: 'B', styles: {bold: true}},
        {type: 'text', text: 'C', styles: {bold: true, italic: true}},
        {type: 'text', text: 'D', styles: {italic: true}},
        {type: 'text', text: 'E', styles: {}},
      ])
      expect(extracted).toEqual({
        text: 'ABCDE',
        annotations: [
          {
            type: 'strong',
            starts: [1],
            ends: [3],
          },
          {
            type: 'emphasis',
            starts: [2],
            ends: [4],
          },
        ],
      })
    })
    test('single annotation', () => {
      const extracted = extractContent([
        {type: 'text', text: 'Hello ', styles: {}},
        {type: 'text', text: 'world', styles: {bold: true}},
        {type: 'text', text: '!', styles: {}},
      ])
      expect(extracted).toEqual({
        text: 'Hello world!',
        annotations: [
          {
            type: 'strong',
            starts: [6],
            ends: [11],
          },
        ],
      })
    })
    test.only('simple marks kitchen sink', () => {
      const extracted = extractContent([
        {text: '0', type: 'text', styles: {bold: true}},
        {text: '1', type: 'text', styles: {italic: true}},
        {text: '2', type: 'text', styles: {underline: true}},
        {text: '3', type: 'text', styles: {strike: true}},
        {text: '4', type: 'text', styles: {code: true}},
      ])
      expect(extracted).toEqual({
        text: '01234',
        annotations: [
          {type: 'strong', starts: [0], ends: [1]},
          {type: 'emphasis', starts: [1], ends: [2]},
          {type: 'underline', starts: [2], ends: [3]},
          {type: 'strike', starts: [3], ends: [4]},
          {type: 'code', starts: [4], ends: [5]},
        ],
      })
    })
  })
  describe('Extract Links content: ', () => {
    test('single link', () => {
      const extracted = extractContent([
        {type: 'text', text: 'a', styles: {}},
        {
          type: 'link',
          content: [
            {type: 'text', text: 'good', styles: {bold: true}},
            {type: 'text', text: 'link', styles: {}},
          ],
          href: 'https://example.com',
        },
      ])
      expect(extracted).toEqual({
        text: 'agoodlink',
        annotations: [
          {
            type: 'strong',
            starts: [1],
            ends: [5],
          },
          {
            type: 'link',
            starts: [1],
            ends: [9],
            ref: 'https://example.com',
          },
        ],
      })
    })
  })
})
describe('editorBlockToServerBlock', () => {
  describe('Image block: ', () => {
    test('a image', () => {
      const eBlock = editorBlockToServerBlock({
        id: 'abc',
        type: 'image',
        children: [],
        content: [],
        props: {
          url: '123',
          alt: 'alt',
          // why is this garbage required for image props??:
          backgroundColor: 'default',
          textColor: 'default',
          textAlignment: 'left',
        },
      })
      expect(eBlock).toEqual(
        new Block({
          id: 'abc',
          type: 'image',
          attributes: {
            alt: 'alt',
          },
          ref: 'ipfs://123',
        }),
      )
    })
  })
})