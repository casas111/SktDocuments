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
  ListItem,
  Tooltip
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
  StarBorder as StarBorderIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fileService from '../../services/fileService';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: string;
  owner: string;
  path: string;
}

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface SizeRange {
  min: number | null;
  max: number | null;
}

interface ActiveFilters {
  types: string[];
  dateRange: DateRange;
  sizeRange: SizeRange;
  owner: string | null;
}

interface EnhancedSearchComponentProps {
  onSearch?: (results: SearchResult[]) => void;
  onResultClick?: (result: SearchResult) => void;
  onClearSearch?: () => void;
}

// Styled components for enhanced UI
const SearchContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'focused'
})<{ focused: boolean }>(({ theme, focused }) => ({
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
 */
const EnhancedSearchComponent: React.FC<EnhancedSearchComponentProps> = ({
  onSearch,
  onResultClick,
  onClearSearch
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  // Filter state
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    types: [],
    dateRange: { from: null, to: null },
    sizeRange: { min: null, max: null },
    owner: null
  });
  const [sortOption, setSortOption] = useState<string>('relevance'); // relevance, name, date, size
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
    debounce((query: string, filters: ActiveFilters, sort: string, direction: 'asc' | 'desc') => {
      performSearch(query, filters, sort, direction);
    }, 300),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const performSearch = async (
    query: string, 
    filters: ActiveFilters, 
    sort: string, 
    direction: 'asc' | 'desc'
  ) => {
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

  // ... rest of the component implementation ...
};

// Utility functions
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default EnhancedSearchComponent; 