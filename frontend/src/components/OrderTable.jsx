import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../api/axios';
import StatusBadge from './StatusBadge';

const DEBOUNCE_MS = 400;

const BASE_COLUMNS = [
  { id: 'title',     label: 'Title',   sortable: false },
  { id: 'status',    label: 'Status',  sortable: true  },
  { id: 'items',     label: 'Items',   sortable: false },
  { id: 'expiresAt', label: 'Expires', sortable: true  },
  { id: 'createdAt', label: 'Created', sortable: true  },
];

const PURCHASER_COLUMN = { id: 'createdBy', label: 'Created By', sortable: false };

export default function OrderTable({ role, onRowClick = () => {} }) {
  const [page, setPage]                     = useState(0);
  const [rowsPerPage, setRowsPerPage]       = useState(10);
  const [sortField, setSortField]           = useState('createdAt');
  const [sortDir, setSortDir]               = useState('desc');
  const [titleFilter, setTitleFilter]       = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');
  const [rows, setRows]                     = useState([]);
  const [totalElements, setTotalElements]   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  // Debounce: wait 400ms after the user stops typing, then update debouncedTitle and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(titleFilter);
      setPage(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [titleFilter]);

  // Fetch on pagination, sort, or debounced title change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const params = { page, size: rowsPerPage, sort: `${sortField},${sortDir}` };
    if (debouncedTitle) params.title = debouncedTitle;

    api.get('/orders', { params, signal: controller.signal })
      .then(({ data }) => {
        setRows(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') setError('Failed to load orders');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, rowsPerPage, sortField, sortDir, debouncedTitle]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const columns = role === 'PURCHASER'
    ? [...BASE_COLUMNS, PURCHASER_COLUMN]
    : BASE_COLUMNS;

  const skeletonCount = Math.min(rowsPerPage, 5);

  return (
    <Paper elevation={1} sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          size="small"
          placeholder="Search by title…"
          value={titleFilter}
          onChange={e => setTitleFilter(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 280 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 1 }}>{error}</Alert>}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id} sx={{ fontWeight: 600 }}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortField === col.id ? sortDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col.id}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No orders found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(order => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => onRowClick(order.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{order.title}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell>{order.items?.length ?? 0}</TableCell>
                  <TableCell>{order.expiresAt ?? '—'}</TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  {role === 'PURCHASER' && <TableCell>{order.createdBy}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
}
