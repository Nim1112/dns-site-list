import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Search, X, Phone, ExternalLink, Sun, Moon } from 'lucide-react'
import sites from './data/sites.json'
import logo from './Dialog_Axiata_logo.svg.webp'

const value = (v) => v && String(v).trim() && v !== '#N/A' ? String(v).trim() : 'N/A'
const fields = [
  ['Region', 'New_Region'], ['District', 'District'], ['Depot', 'Depot'], ['Depot officer', 'Depot_officer'], ['Depot contact', 'Depot_Contact'], ['Coordinates', 'Latitude', (s) => `${value(s.Latitude)}, ${value(s.Longitude)}`], ['Address', 'Additional_data-Site_Address'], ['Tower', 'Tower_Category', (s) => `${value(s.Tower_Category)} · ${value(s.Tower_Type)}`], ['Height', 'Tower_Height'], ['Cabin type', 'Site_Cabin_Type'], ['Tower owner', 'Tower_Owner'], ['Access status', 'Time_Restrictions_final'], ['Restriction reason', 'Time_restricted_reason'], ['Weekday access', 'Week_Days_Access_Restricted_time'], ['Weekend / holiday access', 'Week_ends/Holydays_Access_Restricted_time'], ['Vehicle type', 'Vehicle_Type'], ['Transport notes', 'Manual transport Detail/Remarks'], ['Footpath (m)', 'Manual_Transport_Foot_path(m)'], ['Floors', 'Manual_Transport_Floors(Nos)'], ['PVC installation', 'PVC Required site'],
]
const display = (s, [label, key, format]) => [label, value(format ? format(s) : s[key])]
const depots = [...new Set(sites.map(s => value(s.Depot)).filter(v => v !== 'N/A'))].sort()
const modes = [
  ['id', 'Site ID', s => s.Site_ID],
  ['name', 'Site Name', s => s.Site_Name],
  ['officer', 'Depot Officer', s => `${s.Depot_officer || ''} ${s.Depot || ''}`],
]
const normalize = v => String(v || '').trim().toLocaleLowerCase()

export default function App() {
  const [queries, setQueries] = useState({ id: '', name: '', officer: '' })
  const [selected, setSelected] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sites-theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const hasQuery = Object.values(queries).some(query => query.trim())
  const dialog = useRef(null)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('sites-theme', theme) } catch {}
  }, [theme])
  const filtered = useMemo(() => sites.filter(site => modes.every(([key, , get]) => {
    const query = normalize(queries[key])
    return !query || normalize(get(site)).includes(query)
  })), [queries])
  const setQuery = (key, text) => setQueries(current => ({ ...current, [key]: text }))
  const toggleTheme = () => setTheme(current => {
    const next = current === 'light' ? 'dark' : 'light'
    return next
  })
  const open = site => { setSelected(site); dialog.current?.showModal() }
  const nav = selected?.Latitude && selected?.Longitude && selected.Latitude !== 'N/A' && selected.Longitude !== 'N/A' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.Latitude},${selected.Longitude}`)}` : null
  return <main className="page" data-theme={theme}>
    <header className="header"><a className="logo" href="#top" aria-label="Sites home"><img src={logo} alt=""/><span>Sites</span></a><div className="header-tools">{hasQuery && <span className="header-count">{sites.length.toLocaleString()} sites</span>}<button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={19}/> : <Sun size={19}/>}</button></div></header>
    <section className="content" id="top"><h1>DNS Operational Site List</h1><p className="intro">Find a site by its ID or name, or locate sites assigned to a depot officer.</p>
      <div className="search-grid">{modes.map(([key, label]) => <label className="search-field" key={key}><span>{label}</span><div className="search"><Search size={19}/><input value={queries[key]} onChange={e => setQuery(key, e.target.value)} list={hasQuery ? `suggestions-${key}` : undefined} placeholder={`Search ${label.toLowerCase()}`} aria-label={label}/>{hasQuery && <datalist id={`suggestions-${key}`}>{[...new Set(sites.map(s => key === 'officer' ? s.Depot_officer : s[key === 'id' ? 'Site_ID' : 'Site_Name']).filter(Boolean))].slice(0, 500).map(item => <option key={item} value={item}/>)}</datalist>}{queries[key] && <button type="button" aria-label={`Clear ${label}`} onClick={() => setQuery(key, '')}><X size={18}/></button>}</div></label>)}</div>
      {hasQuery && <><div className="list-summary" aria-live="polite"><strong>{filtered.length.toLocaleString()} {filtered.length === 1 ? 'site' : 'sites'} found</strong><span>{depots.length} depots</span></div>
      {filtered.length > 0 ? <div className="site-list" role="list">{filtered.slice(0, 150).map((site, i) => <button className="site-row" key={`${site.Site_ID}-${i}`} role="listitem" onClick={() => open(site)}><span className="site-copy"><strong>{value(site.Site_Name)}</strong><span>{value(site.Site_ID)} <i>·</i> {value(site.Depot)}</span></span><span className="officer">{value(site.Depot_officer)}</span><span className="row-chevron" aria-hidden="true">›</span></button>)}</div> : <p className="empty">No sites match these searches. Clear or change a search to try again.</p>}
      {filtered.length > 150 && <p className="limit">Showing 150 of {filtered.length.toLocaleString()} matches. Refine your search to narrow the list.</p>}</>}
    </section>
    <dialog ref={dialog} className="site-dialog" onClick={e => { if (e.target === dialog.current) dialog.current.close() }}>
      {selected && <><div className="dialog-head"><div><p className="dialog-label">SITE DETAILS</p><h2>{value(selected.Site_Name)}</h2><p className="site-id">{value(selected.Site_ID)} · {value(selected.Depot)}</p></div><button className="close" aria-label="Close details" onClick={() => dialog.current.close()}><X size={23}/></button></div>
        <div className="details">{fields.map(field => { const [label, val] = display(selected, field); return <div className="detail" key={label}><span>{label}</span><strong>{val}</strong></div> })}</div>
        <div className="dialog-actions">{selected.Depot_Contact && selected.Depot_Contact !== 'N/A' && <a href={`tel:${value(selected.Depot_Contact)}`}><Phone size={18}/> Call depot officer</a>}{nav && <a className="secondary" href={nav} target="_blank" rel="noreferrer"><MapPin size={18}/> Open in Maps <ExternalLink size={16}/></a>}</div>
      </>}
    </dialog>
  </main>
}
