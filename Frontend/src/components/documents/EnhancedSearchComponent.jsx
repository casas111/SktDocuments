import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  InputBase,
  IconButton,
  Divider,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Popover,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  List,
  ListItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  CalendarToday as DateIcon,
  Storage as SizeIcon,
  Description as TypeIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  History as HistoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fileService from '../../services/fileService';

// Styled components for enhanced UI
const SearchContainer = styled(Paper)(({ theme, focused }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: focused ? 
    '0 0 0 2px ' + theme.palette.primary.main : 
    '0 1px 3px rgba(0,0,0,0.12)',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  width: '100%',
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: '1rem',
  padding: theme.spacing(0.5, 1),
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '& .MuiChip-deleteIcon': {
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
}));

const FilterPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    padding: theme.spacing(2),
    width: 300,
  },
}));

const SearchResultItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  },
}));

const HighlightedText = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  padding: '0 2px',
  borderRadius: 2,
}));

/**
 * Enhanced Search Component with advanced filtering and results display
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Callback when search is performed
 * @param {Function} props.onResultClick - Callback when a search result is clicked
 * @param {Function} props.onClearSearch - Callback when search is cleared
 */
const EnhancedSearchComponent = ({
  onSearch,
  onResultClick,
  onClearSearch
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  
  // Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    types: [],
    dateRange: { from: null, to: null },
    sizeRange: { min: null, max: null },
    owner: null
  });
  const [sortOption, setSortOption] = useState('relevance'); // relevance, name, date, size
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc
  
  // Load recent and saved searches from localStorage
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem('recentSearches');
    if (savedRecentSearches) {
      try {
        setRecentSearches(JSON.parse(savedRecentSearches));
      } catch (e) {
        console.error('Error loading recent searches:', e);
        setRecentSearches([]);
      }
    }
    
    const savedSavedSearches = localStorage.getItem('savedSearches');
    if (savedSavedSearches) {
      try {
        setSavedSearches(JSON.parse(savedSavedSearches));
      } catch (e) {
        console.error('Error loading saved searches:', e);
        setSavedSearches([]);
      }
    }
  }, []);
  
  // Save recent searches to localStorage when changed
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);
  
  // Save saved searches to localStorage when changed
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query, filters, sort, direction) => {
      performSearch(query, filters, sort, direction);
    }, 300),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query, activeFilters, sortOption, sortDirection);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };
  
  // Handle search input blur
  const handleSearchBlur = () => {
    setSearchFocused(false);
    // Don't hide results immediately to allow clicking on them
    setTimeout(() => {
      if (!searchFocused) {
        setShowResults(false);
      }
    }, 200);
  };
  
  // Perform search
  const performSearch = async (query, filters, sort, direction) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Prepare search parameters
      const searchParams = {
        query,
        types: filters.types.length > 0 ? filters.types : undefined,
        dateFrom: filters.dateRange.from ? filters.dateRange.from.toISOString() : undefined,
        dateTo: filters.dateRange.to ? filters.dateRange.to.toISOString() : undefined,
        sizeMin: filters.sizeRange.min,
        sizeMax: filters.sizeRange.max,
        owner: filters.owner,
        sortBy: sort,
        sortDirection: direction
      };
      
      // Call search API
      const response = await fileService.searchFiles(searchParams);
      
      if (response.data && response.data.success) {
        setSearchResults(response.data.data || []);
        
        // Add to recent searches if not already there
        if (!recentSearches.includes(query)) {
          setRecentSearches(prev => [query, ...prev].slice(0, 10));
        }
        
        // Call onSearch callback
        onSearch && onSearch(response.data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setActiveFilters({
      types: [],
      dateRange: { from: null, to: null },
      sizeRange: { min: null, max: null },
      owner: null
    });
    setSortOption('relevance');
    setSortDirection('desc');
    onClearSearch && onClearSearch();
  };
  
  // Handle filter button click
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Handle sort button click
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  // Handle filter close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle sort close
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  // Apply filters
  const applyFilters = () => {
    handleFilterClose();
    if (searchQuery.trim()) {
      performSearch(searchQuery, activeFilters, sortOption, sortDirection);
    }
  };
  
  // Apply sort
  const applySortOption = (option) => {
    setSortOption(option);
    handleSortClose();
    if (searchQuery.trim()) {
      performSearch(searchQuery, activeFilters, option, sortDirection);
    }
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    if (searchQuery.trim()) {
      performSearch(searchQuery, activeFilters, sortOption, newDirection);
    }
  };
  
  // Add file type filter
  const toggleTypeFilter = (type) => {
    setActiveFilters(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return { ...prev, types };
    });
  };
  
  // Set date range filter
  const setDateFilter = (field, date) => {
    setActiveFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }));
  };
  
  // Set size range filter
  const setSizeFilter = (field, size) => {
    setActiveFilters(prev => ({
      ...prev,
      sizeRange: {
        ...prev.sizeRange,
        [field]: size
      }
    }));
  };
  
  // Set owner filter
  const setOwnerFilter = (owner) => {
    setActiveFilters(prev => ({
      ...prev,
      owner
    }));
  };
  
  // Remove filter
  const removeFilter = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'type') {
        newFilters.types = prev.types.filter(t => t !== value);
      } else if (filterType === 'dateFrom') {
        newFilters.dateRange = { ...prev.dateRange, from: null };
      } else if (filterType === 'dateTo') {
        newFilters.dateRange = { ...prev.dateRange, to: null };
      } else if (filterType === 'sizeMin') {
        newFilters.sizeRange = { ...prev.sizeRange, min: null };
      } else if (filterType === 'sizeMax') {
        newFilters.sizeRange = { ...prev.sizeRange, max: null };
      } else if (filterType === 'owner') {
        newFilters.owner = null;
      }
      
      return newFilters;
    });
    
    if (searchQuery.trim()) {
      performSearch(searchQuery, activeFilters, sortOption, sortDirection);
    }
  };
  
  // Save current search
  const saveCurrentSearch = () => {
    if (!searchQuery.trim()) return;
    
    const searchToSave = {
      query: searchQuery,
      filters: activeFilters,
      sort: sortOption,
      direction: sortDirection,
      timestamp: new Date().toISOString()
    };
    
    setSavedSearches(prev => [searchToSave, ...prev]);
  };
  
  // Apply saved search
  const applySavedSearch = (savedSearch) => {
    setSearchQuery(savedSearch.query);
    setActiveFilters(savedSearch.filters);
    setSortOption(savedSearch.sort);
    setSortDirection(savedSearch.direction);
    performSearch(
      savedSearch.query, 
      savedSearch.filters, 
      savedSearch.sort, 
      savedSearch.direction
    );
    setShowResults(true);
  };
  
  // Delete saved search
  const deleteSavedSearch = (index) => {
    setSavedSearches(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Highlight search terms in text
  const highlightSearchTerms = (text) => {
    if (!searchQuery.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
    );
  };
  
  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (activeFilters.types.length > 0) count += activeFilters.types.length;
    if (activeFilters.dateRange.from) count++;
    if (activeFilters.dateRange.to) count++;
    if (activeFilters.sizeRange.min) count++;
    if (activeFilters.sizeRange.max) count++;
    if (activeFilters.owner) count++;
    return count;
  };
  
  // Render active filters
  const renderActiveFilters = () => {
    if (countActiveFilters() === 0) return null;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
        {activeFilters.types.map(type => (
          <FilterChip
            key={`type-${type}`}
            label={`Type: ${type}`}
            onDelete={() => removeFilter('type', type)}
            size="small"
          />
        ))}
        
        {activeFilters.dateRange.from && (
          <FilterChip
            label={`From: ${formatDate(activeFilters.dateRange.from)}`}
            onDelete={() => removeFilter('dateFrom')}
            size="small"
          />
        )}
        
        {activeFilters.dateRange.to && (
          <FilterChip
            label={`To: ${formatDate(activeFilters.dateRange.to)}`}
            onDelete={() => removeFilter('dateTo')}
            size="small"
          />
        )}
        
        {activeFilters.sizeRange.min && (
          <FilterChip
            label={`Min size: ${formatFileSize(activeFilters.sizeRange.min)}`}
            onDelete={() => removeFilter('sizeMin')}
            size="small"
          />
        )}
        
        {activeFilters.sizeRange.max && (
          <FilterChip
            label={`Max size: ${formatFileSize(activeFilters.sizeRange.max)}`}
            onDelete={() => removeFilter('sizeMax')}
            size="small"
          />
        )}
        
        {activeFilters.owner && (
          <FilterChip
            label={`Owner: ${activeFilters.owner}`}
            onDelete={() => removeFilter('owner')}
            size="small"
          />
        )}
      </Box>
    );
  };
  
  return (
    <Box>
      {/* Search Input */}
      <SearchContainer focused={searchFocused}>
        <SearchIcon sx={{ color: 'text.secondary', mx: 1 }} />
        <SearchInput
          placeholder="Search files and folders..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        
        {isSearching && <CircularProgress size={20} sx={{ mx: 1 }} />}
        
        {searchQuery && (
          <IconButton size="small" onClick={clearSearch}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
        
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        
        <Tooltip title="Filter">
          <IconButton 
            size="small" 
            onClick={handleFilterClick}
            color={countActiveFilters() > 0 ? 'primary' : 'default'}
          >
            <FilterIcon fontSize="small" />
            {countActiveFilters() > 0 && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {countActiveFilters()}
              </Typography>
            )}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Sort">
          <IconButton size="small" onClick={handleSortClick}>
            <SortIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </SearchContainer>
      
      {/* Active Filters */}
      {renderActiveFilters()}
      
      {/* Search Results */}
      <Collapse in={showResults && searchResults.length > 0}>
        <Paper
          sx={{
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
            <Typography variant="subtitle2">
              {searchResults.length} results for "{searchQuery}"
            </Typography>
            
            <Button
              size="small"
              startIcon={<StarIcon fontSize="small" />}
              onClick={saveCurrentSearch}
            >
              Save Search
            </Button>
          </Box>
          
          <List>
            {searchResults.map((result, index) => (
              <SearchResultItem
                key={index}
                button
                onClick={() => onResultClick && onResultClick(result)}
              >
                <ListItemIcon>
                  {result.isDirectory ? 
                    <FolderIcon color="primary" /> : 
                    <FileIcon />
                  }
                </ListItemIcon>
                
                <ListItemText
                  primary={highlightSearchTerms(result.name)}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {result.path} • {result.isDirectory ? 'Folder' : formatFileSize(result.size)}
                      </Typography>
                      {result.matchContext && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {highlightSearchTerms(result.matchContext)}
                        </Typography>
                      )}
                    </>
                  }
                />
              </SearchResultItem>
            ))}
          </List>
        </Paper>
      </Collapse>
      
      {/* No Results Message */}
      <Collapse in={showResults && searchQuery && searchResults.length === 0 && !isSearching}>
        <Paper
          sx={{
            mt: 1,
            p: 2,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography>No results found for "{searchQuery}"</Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or adjust your filters
          </Typography>
        </Paper>
      </Collapse>
      
      {/* Recent and Saved Searches */}
      <Collapse in={searchFocused && !searchQuery && (recentSearches.length > 0 || savedSearches.length > 0)}>
        <Paper
          sx={{
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
          }}
        >
          {recentSearches.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ px: 1, py: 0.5 }}>
                Recent Searches
              </Typography>
              
              <List dense>
                {recentSearches.map((search, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      setSearchQuery(search);
                      performSearch(search, activeFilters, sortOption, sortDirection);
                      setShowResults(true);
                    }}
                  >
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 1 }} />
            </>
          )}
          
          {savedSearches.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ px: 1, py: 0.5 }}>
                Saved Searches
              </Typography>
              
              <List dense>
                {savedSearches.map((savedSearch, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => applySavedSearch(savedSearch)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedSearch(index);
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <StarIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={savedSearch.query}
                      secondary={`${countFilters(savedSearch.filters)} filters • ${formatDate(savedSearch.timestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Collapse>
      
      {/* Filter Popover */}
      <FilterPopover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Filter Options
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          File Type
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {['document', 'image', 'video', 'audio', 'archive', 'folder'].map(type => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={activeFilters.types.includes(type)}
                  onChange={() => toggleTypeFilter(type)}
                  size="small"
                />
              }
              label={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Date Range
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <DatePicker
                label="From"
                value={activeFilters.dateRange.from}
                onChange={(date) => setDateFilter('from', date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              
              <DatePicker
                label="To"
                value={activeFilters.dateRange.to}
                onChange={(date) => setDateFilter('to', date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </Box>
          </LocalizationProvider>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          File Size
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="Min Size (KB)"
              type="number"
              size="small"
              value={activeFilters.sizeRange.min ? activeFilters.sizeRange.min / 1024 : ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) * 1024 : null;
                setSizeFilter('min', value);
              }}
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <TextField
              label="Max Size (KB)"
              type="number"
              size="small"
              value={activeFilters.sizeRange.max ? activeFilters.sizeRange.max / 1024 : ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) * 1024 : null;
                setSizeFilter('max', value);
              }}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Owner
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Owner"
            size="small"
            fullWidth
            value={activeFilters.owner || ''}
            onChange={(e) => setOwnerFilter(e.target.value || null)}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={handleFilterClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Box>
      </FilterPopover>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem
          selected={sortOption === 'relevance'}
          onClick={() => applySortOption('relevance')}
        >
          <ListItemText>Relevance</ListItemText>
        </MenuItem>
        
        <MenuItem
          selected={sortOption === 'name'}
          onClick={() => applySortOption('name')}
        >
          <ListItemText>Name</ListItemText>
        </MenuItem>
        
        <MenuItem
          selected={sortOption === 'date'}
          onClick={() => applySortOption('date')}
        >
          <ListItemText>Date Modified</ListItemText>
        </MenuItem>
        
        <MenuItem
          selected={sortOption === 'size'}
          onClick={() => applySortOption('size')}
        >
          <ListItemText>Size</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={toggleSortDirection}>
          <ListItemIcon>
            {sortDirection === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </ListItemIcon>
          <ListItemText>
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Helper function to count filters in a saved search
function countFilters(filters) {
  let count = 0;
  if (filters.types.length > 0) count += filters.types.length;
  if (filters.dateRange.from) count++;
  if (filters.dateRange.to) count++;
  if (filters.sizeRange.min) count++;
  if (filters.sizeRange.max) count++;
  if (filters.owner) count++;
  return count;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export default EnhancedSearchComponent;
