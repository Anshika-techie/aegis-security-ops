import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, SearchX } from 'lucide-react';
import { EmptyState, SearchInput } from './Primitives';

/* ------------------------------------------------------------------ */
/* Data table                                                          */
/* Columns: { key, header, sortable, render, sortValue, align, width }  */
/* ------------------------------------------------------------------ */

export default function DataTable({
  rows,
  columns,
  getSearchText,
  filters = [],
  searchPlaceholder = 'Search records…',
  pageSize = 8,
  onRowClick,
  onExport,
  toolbarExtra,
  emptyTitle = 'No records found',
  emptyText = 'Adjust your search or filters to see more results.',
  emptyIcon = SearchX,
  initialSort = null,
}) {
  const [query, setQuery] = useState('');
  const [filterState, setFilterState] = useState({});
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, filterState, sort]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !needle ||
        (getSearchText
          ? getSearchText(row).toLowerCase().includes(needle)
          : columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(needle)));
      if (!matchesQuery) return false;
      return filters.every((filter) => {
        const active = filterState[filter.key];
        return !active || String(row[filter.key]) === active;
      });
    });
  }, [rows, query, filterState, filters, getSearchText, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((item) => item.key === sort.key);
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const read = (row) =>
        column?.sortValue ? column.sortValue(row) : (row[sort.key] ?? '');
      const left = read(a);
      const right = read(b);
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction;
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  function toggleSort(key) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: 'desc' };
      if (current.direction === 'desc') return { key, direction: 'asc' };
      return null;
    });
  }

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let from = Math.max(1, safePage - Math.floor(windowSize / 2));
    const to = Math.min(pageCount, from + windowSize - 1);
    from = Math.max(1, to - windowSize + 1);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [safePage, pageCount]);

  const hasFilters = Boolean(query) || filters.some((filter) => filterState[filter.key]);

  return (
    <div className="table-shell">
      <div className="table-toolbar">
        <div className="table-toolbar__main">
          <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} className="table-toolbar__search" />
          {filters.map((filter) => (
            <label key={filter.key} className="select-wrap select-wrap--compact">
              <span className="sr-only">{filter.label}</span>
              <select
                className="select"
                value={filterState[filter.key] ?? ''}
                onChange={(event) =>
                  setFilterState((current) => ({ ...current, [filter.key]: event.target.value }))
                }
              >
                <option value="">{filter.label}: All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {filter.label}: {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {hasFilters ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setQuery('');
                setFilterState({});
              }}
            >
              Reset
            </button>
          ) : null}
        </div>
        <div className="table-toolbar__aside">
          {toolbarExtra}
          {onExport ? (
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => onExport(sorted)}>
              <Download size={13} strokeWidth={1.9} aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyText} />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => {
                    const active = sort?.key === column.key;
                    const Icon = !active ? ArrowUpDown : sort.direction === 'desc' ? ArrowDown : ArrowUp;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        style={column.width ? { width: column.width } : undefined}
                        className={column.align ? `align-${column.align}` : undefined}
                      >
                        {column.sortable === false ? (
                          column.header
                        ) : (
                          <button
                            type="button"
                            className={`th-sort ${active ? 'th-sort--active' : ''}`}
                            onClick={() => toggleSort(column.key)}
                            aria-label={`Sort by ${column.header}`}
                          >
                            {column.header}
                            <Icon size={11} strokeWidth={2} aria-hidden="true" />
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className={onRowClick ? 'row--interactive' : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={column.align ? `align-${column.align}` : undefined}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="table-count">
              Showing <strong>{start + 1}</strong>–<strong>{Math.min(start + pageSize, sorted.length)}</strong> of{' '}
              <strong>{sorted.length}</strong> records
            </p>
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`pagination__btn ${number === safePage ? 'pagination__btn--active' : ''}`.trim()}
                  onClick={() => setPage(number)}
                  aria-current={number === safePage ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(Math.min(pageCount, safePage + 1))}
                disabled={safePage === pageCount}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
