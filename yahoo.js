// A Yahoo search's page of results (search.yahoo.com/search?p=…, b=<the first result's place> on later pages), read
// as a listing of what it found (see searchResultsOf): each result is a #web .algo, linking to its page from its
// .compTitle, its title that link's <h3> (the link also holds the site's name and address). The ads are outside #web,
// and its other boxes ("People also ask", "Also try") are no .algo. A result Yahoo sends through its own redirect
// (r.search.yahoo.com/…/RU=<the result's URL>/RK=…) is read as where it leads.
function parseYahoo() {
  if (location.hostname !== 'search.yahoo.com' || !location.pathname.startsWith('/search')) {
    return null
  }
  const results = Array.from(document.querySelectorAll('#web .algo .compTitle a[href]'), a => ({
    url: yahooTarget(a.href),
    title: (a.querySelector('h3') || a).textContent,
  }))
  return searchResultsOf('Yahoo', results, Math.max(0, queryNumber('b', 1) - 1))
}

// Where a result's link leads: the link itself, unless it is Yahoo's redirect, which names it in its path (/RU=<url>/).
function yahooTarget(href) {
  if (new URL(href).hostname !== 'r.search.yahoo.com') {
    return href
  }
  const named = /\/RU=([^/]+)\//.exec(href)
  try {
    return named ? decodeURIComponent(named[1]) : null
  } catch {
    return null
  }
}

// The parser a scrape calls.
registerParser(parseYahoo)
