import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('search engines', () => {
  it.each([
    ['yahoo.js', 'parseYahoo', 'https://search.yahoo.com/search?p=rust', `
      <div id="main"><ol class="searchCenterTopAds"><li><a href="https://ad.example/"><h3>An ad</h3></a></li></ol>
      <div id="web"><ol>
        <li><div class="algo"><div class="compTitle"><a href="https://one.example/a"><span>one.example</span><h3>One</h3></a></div></div></li>
        <li><div class="AlsoTry"><a href="https://search.yahoo.com/search?p=rust+async">rust async</a></div></li>
        <li><div class="algo"><div class="compTitle"><a href="https://r.search.yahoo.com/_ylt=x/RV=2/RE=1/RO=10/RU=https%3a%2f%2ftwo.example%2fb/RK=2/RS=x-"><h3>Two</h3></a></div></div></li>
      </ol></div></div>`],
  ])('%s reads %s\'s page as a listing of its results, in order, leaving out its ads and its own pages', async (file, parser, url, body) => {
    visit(url, body)
    expect(await load(file, [parser])[parser]()).toEqual({
      listing: true,
      content: [],
      links: [
        { url: 'https://one.example/a', title: 'One', score: 1 },
        { url: 'https://two.example/b', title: 'Two', score: 1 / 1.1 },
      ],
    })
  })

  it.each([
    ['yahoo.js', 'parseYahoo', 'https://search.yahoo.com/search?p=rust&b=11', '<div id="web"><div class="algo"><div class="compTitle"><a href="https://one.example/"><h3>One</h3></a></div></div></div>'],
  ])('%s ranks a later page\'s results after those of the pages before it', async (file, parser, url, body) => {
    visit(url, body)
    expect((await load(file, [parser])[parser]()).links).toEqual([{ url: 'https://one.example/', title: 'One', score: 0.5 }])
  })

  it.each([
    ['yahoo.js', 'parseYahoo', 'https://www.yahoo.com/search'],
  ])('%s leaves a page that is no search to the default parse', async (file, parser, url) => {
    visit(url, '<p>Text</p>')
    expect(await load(file, [parser])[parser]()).toBeNull()
  })
})
