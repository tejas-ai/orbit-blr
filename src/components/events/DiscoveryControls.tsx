"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X, Check } from "lucide-react";
import { TYPES, PRICES, DATES, DEFAULT_ADVANCED, POPULAR_CITIES, normalizeCity, type AdvancedFilters } from "@/lib/discovery";

function AnchoredDialog({ open, onClose, anchor, label, children }: {
  open: boolean; onClose: () => void; anchor: React.RefObject<HTMLButtonElement | null>; label: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const trigger = anchor.current;
    const position = () => {
      if (!trigger || window.innerWidth < 640) { dialog.style.removeProperty("left"); dialog.style.removeProperty("top"); return; }
      const rect = trigger.getBoundingClientRect();
      dialog.style.left = `${Math.max(16, Math.min(rect.left, window.innerWidth - 396))}px`;
      dialog.style.top = `${Math.max(16, Math.min(rect.bottom + 10, window.innerHeight - dialog.offsetHeight - 16))}px`;
    };
    dialog.showModal(); position();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("resize", position);
      document.body.style.overflow = overflow;
      dialog.close(); trigger?.focus({ preventScroll: true });
    };
  }, [open, anchor]);
  return <dialog ref={ref} className="discovery-dialog" aria-label={label} onCancel={onClose} onClose={onClose} onClick={e => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
  }}>
    <div className="dialog-heading"><h2>{label}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={`Close ${label.toLowerCase()}`}><X size={19} /></button></div>
    {children}
  </dialog>;
}

export default function DiscoveryControls({ search, city, advanced, cities, onSearch, onCity, onAdvanced }: {
  search: string; city: string; advanced: AdvancedFilters; cities: string[];
  onSearch: (value: string) => void; onCity: (value: string) => void; onAdvanced: (value: AdvancedFilters) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [draft, setDraft] = useState(advanced);
  const [cityQuery, setCityQuery] = useState("");
  const filterButton = useRef<HTMLButtonElement>(null);
  const locationButton = useRef<HTMLButtonElement>(null);
  const activeCount = Object.values(advanced).filter(v => v !== "all").length;
  const options = Array.from(new Set([...POPULAR_CITIES, ...cities, ...(city !== "all" && city !== "online" ? [city] : [])])).sort((a,b) => a.localeCompare(b));
  const visibleCities = options.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase().trim()));
  const chooseCity = (value: string) => { onCity(value); setLocationOpen(false); };
  return <section className="discovery-controls" aria-label="Find events">
    <label className="discovery-search"><Search size={21} aria-hidden="true" /><span className="sr-only">Search events</span>
      <input type="search" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search events, hackathons, AI, workshops..." />
      <span className="search-hint" aria-hidden="true">Explore your interests</span>
    </label>
    <div className="discovery-toolbar">
      <button ref={locationButton} type="button" className="discovery-control location-control" aria-haspopup="dialog" aria-expanded={locationOpen} onClick={() => { setCityQuery(""); setLocationOpen(true); }}>
        <MapPin size={17} aria-hidden="true" /><span>{city === "all" ? "All India" : city === "online" ? "Online" : city}</span><ChevronDown size={15} aria-hidden="true" />
      </button>
      <button ref={filterButton} type="button" className={`discovery-control ${activeCount ? "has-filters" : ""}`} aria-haspopup="dialog" aria-expanded={filterOpen} aria-controls="advanced-filter-options" onClick={() => { setDraft(advanced); setFilterOpen(true); }}>
        <SlidersHorizontal size={17} aria-hidden="true" /><span>More Filters</span>{activeCount > 0 && <span className="filter-count" aria-label={`${activeCount} active filters`}>{activeCount}</span>}
      </button>
    </div>
    {filterOpen && <AnchoredDialog open={filterOpen} anchor={filterButton} label="More Filters" onClose={() => setFilterOpen(false)}>
      <div id="advanced-filter-options">
        {([{ key: "type", label: "Type", options: TYPES }, { key: "price", label: "Price", options: PRICES }, { key: "dateFilter", label: "When", options: DATES }] as const).map(group =>
          <fieldset key={group.key} className="filter-group"><legend>{group.label}</legend><div className="filter-pills">
            {group.options.map(option => <label key={option.value} className={`filter-pill ${draft[group.key] === option.value ? "selected" : ""}`}>
              <input type="radio" name={group.key} value={option.value} checked={draft[group.key] === option.value} onChange={() => setDraft({ ...draft, [group.key]: option.value })} />{option.label}
            </label>)}
          </div></fieldset>)}
      </div>
      <div className="filter-actions"><button type="button" className="primary-button" onClick={() => { onAdvanced(draft); setFilterOpen(false); }}>Apply Filters</button>
        <button type="button" className="reset-button" onClick={() => { setDraft(DEFAULT_ADVANCED); onAdvanced(DEFAULT_ADVANCED); }}>Reset</button></div>
    </AnchoredDialog>}
    {locationOpen && <AnchoredDialog open={locationOpen} anchor={locationButton} label="Choose location" onClose={() => setLocationOpen(false)}>
      <form onSubmit={e => { e.preventDefault(); if (cityQuery.trim()) chooseCity(normalizeCity(cityQuery)); }}>
        <label className="city-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search Indian cities</span><input autoFocus value={cityQuery} onChange={e => setCityQuery(e.target.value)} placeholder="Search any Indian city" maxLength={100} /></label>
        <div className="city-options">
          {!cityQuery && [["all", "All India"], ["online", "Online"]].map(([value, label]) => <button type="button" key={value} onClick={() => chooseCity(value)}>{label}{city === value && <Check size={17} />}</button>)}
          {visibleCities.map(c => <button type="button" key={c} onClick={() => chooseCity(c)}>{c}{city === c && <Check size={17} />}</button>)}
          {cityQuery.trim() && !visibleCities.some(c => c.toLowerCase() === cityQuery.trim().toLowerCase()) && <button type="submit">Search in “{cityQuery.trim()}”</button>}
        </div>
      </form>
    </AnchoredDialog>}
  </section>;
}
