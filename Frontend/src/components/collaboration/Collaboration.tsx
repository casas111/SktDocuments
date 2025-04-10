import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Badge,
  Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collaboration-tabpanel-${index}`}
      aria-labelledby={`collaboration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

interface CollaborationProps {
  workflowName: string;
}

const Collaboration: React.FC<CollaborationProps> = ({ workflowName }) => {
  const [tabValue, setTabValue] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('viewer');
  const [isPublic, setIsPublic] = useState(false);
  
  // Mock data for users and permissions
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'owner', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'editor', avatar: 'JS' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'viewer', avatar: 'BJ' },
  ]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenUserDialog = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('viewer');
    setUserDialogOpen(true);
  };
  
  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
  };
  
  const handleOpenShareDialog = () => {
    setShareEmail('');
    setSharePermission('viewer');
    setShareDialogOpen(true);
  };
  
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };
  
  const handleAddUser = () => {
    if (newUserName && newUserEmail) {
      const initials = newUserName.split(' ').map(n => n[0]).join('').toUpperCase();
      const newUser = {
        id: users.length + 1,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        avatar: initials
      };
      
      setUsers([...users, newUser]);
      setUserDialogOpen(false);
    }
  };
  
  const handleShareWorkflow = () => {
    // In a real application, this would send an invitation
    console.log('Sharing workflow with:', shareEmail, 'as', sharePermission);
    setShareDialogOpen(false);
    
    // Simulate sharing
    alert(`Invitation sent to ${shareEmail} with ${sharePermission} permissions!`);
  };
  
  const handleTogglePublic = () => {
    setIsPublic(!isPublic);
  };
  
  const handleRemoveUser = (userId: number) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  const handleChangeRole = (userId: number, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'success';
      case 'viewer':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <AdminPanelSettingsIcon />;
      case 'admin':
        return <LockIcon />;
      case 'editor':
        return <EditIcon />;
      case 'viewer':
        return <VisibilityIcon />;
      default:
        return <VisibilityOffIcon />;
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Collaboration & Permissions
        </Typography>
        <Box>
          <Tooltip title="Share Workflow">
            <Button 
              variant="contained" 
              startIcon={<ShareIcon />}
              onClick={handleOpenShareDialog}
              size="small"
              sx={{ mr: 1 }}
            >
              Share
            </Button>
          </Tooltip>
          <Tooltip title="Add User">
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleOpenUserDialog}
              size="small"
            >
              Add User
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper elevation={0} variant="outlined" sx={{ mb: 3 }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Workflow: {workflowName}
          </Typography>
          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={handleTogglePublic}
                  color="primary"
                />
              }
              label="Public Workflow"
            />
            <Chip 
              icon={isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
              label={isPublic ? "Anyone with the link can view" : "Private - Only invited users"}
              color={isPublic ? "success" : "default"}
              variant="outlined"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="collaboration tabs">
          <Tab label="Users & Permissions" />
          <Tab label="Access Logs" />
          <Tab 
            label={
              <Badge badgeContent="New" color="error">
                Collaboration Settings
              </Badge>
            } 
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          <Paper elevation={0} variant="outlined">
            <List>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    user.role !== 'owner' && (
                      <Box>
                        <Tooltip title="Change Role">
                          <IconButton edge="end" aria-label="change role" onClick={() => {
                            const newRole = user.role === 'viewer' ? 'editor' : user.role === 'editor' ? 'admin' : 'viewer';
                            handleChangeRole(user.id, newRole);
                          }}>
                            {getRoleIcon(user.role)}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove User">
                          <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveUser(user.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )
                  }
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>{user.avatar}</Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {user.email}
                        </Typography>
                        {" — "}
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={getRoleColor(user.role)}
                          variant="outlined"
                        />
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Stack>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Access Logs
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Avatar>JS</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Jane Smith edited the workflow"
                  secondary="Today, 10:23 AM"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar>BJ</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Bob Johnson viewed the workflow"
                  secondary="Yesterday, 3:45 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar>JD</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="John Doe added a new node"
                  secondary="Apr 7, 2025, 11:30 AM"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar>JS</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary="Jane Smith connected two nodes"
                  secondary="Apr 6, 2025, 2:15 PM"
                />
              </ListItem>
            </List>
          </Paper>
        </Stack>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box flex={1}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Team Collaboration</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable real-time collaboration"
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  Allow multiple users to edit the workflow simultaneously
                </Typography>
                
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Show user cursors"
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  Display other users' cursors when they are viewing the workflow
                </Typography>
                
                <FormControlLabel
                  control={<Switch />}
                  label="Require approval for changes"
                />
                <Typography variant="body2" color="text.secondary">
                  Changes made by editors require owner approval
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
          
          <Box flex={1}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LockIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enforce role-based access control"
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  Strictly enforce user permissions based on their roles
                </Typography>
                
                <FormControlLabel
                  control={<Switch />}
                  label="Enable workflow versioning"
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  Keep track of all changes with version history
                </Typography>
                
                <FormControlLabel
                  control={<Switch />}
                  label="Require authentication for API access"
                />
                <Typography variant="body2" color="text.secondary">
                  API keys required for programmatic access to workflows
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
        </Stack>
      </TabPanel>
      
      <Dialog open={userDialogOpen} onClose={handleCloseUserDialog}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permission Level
            </Typography>
            <Stack direction="row" spacing={1}>
              {['viewer', 'editor', 'admin'].map((role) => (
                <Chip
                  key={role}
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  onClick={() => setNewUserRole(role)}
                  color={newUserRole === role ? getRoleColor(role) : 'default'}
                  variant={newUserRole === role ? 'filled' : 'outlined'}
                  icon={getRoleIcon(role)}
                />
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Share Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="share-email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permission Level
            </Typography>
            <Stack direction="row" spacing={1}>
              {['viewer', 'editor', 'admin'].map((role) => (
                <Chip
                  key={role}
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  onClick={() => setSharePermission(role)}
                  color={sharePermission === role ? getRoleColor(role) : 'default'}
                  variant={sharePermission === role ? 'filled' : 'outlined'}
                  icon={getRoleIcon(role)}
                />
              ))}
            </Stack>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            An email invitation will be sent with access to this workflow.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button onClick={handleShareWorkflow} variant="contained" color="primary" startIcon={<ShareIcon />}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collaboration;
