import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { performanceMonitor } from '../../utils/performance';
import adminService from '../../services/adminService';
import UserList from './UserList';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { SearchIcon, FilterIcon } from '@heroicons/react/outline';

/**
 * UserManagement Component
 * Admin interface for managing users
 */
const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const perfKey = performanceMonitor.startPageLoad('UserManagement');
      
      try {
        setIsLoading(true);
        
        const { page, limit } = pagination;
        const response = await adminService.getUsers({
          page,
          limit,
          ...filters
        });
        
        setUsers(response.users);
        setPagination(prev => ({
          ...prev,
          total: response.total
        }));
        
        performanceMonitor.endPageLoad(perfKey, true);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(t('admin.fetchUsersError'));
        performanceMonitor.endPageLoad(perfKey, false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [pagination.page, pagination.limit, filters, t]);
  
  // Handle search input
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page on new search
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    setFilters(prev => {
      if (prev.sortBy === field) {
        // Toggle sort order if clicking the same field
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // Default to descending for new sort field
        return {
          ...prev,
          sortBy: field,
          sortOrder: 'desc'
        };
      }
    });
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Open user modal for editing
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setShowUserModal(true);
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  // Handle user form changes
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save user changes
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    const perfKey = performanceMonitor.startInteraction('save_user');
    
    try {
      if (selectedUser) {
        // Update existing user
        await adminService.updateUser(selectedUser.id, userForm);
        toast.success(t('admin.userUpdated'));
        
        // Update user in the list
        setUsers(prev => 
          prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, ...userForm } 
              : user
          )
        );
      }
      
      setShowUserModal(false);
      performanceMonitor.endInteraction(perfKey, true);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(t('admin.userSaveError'));
      performanceMonitor.endInteraction(perfKey, false);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const perfKey = performanceMonitor.startInteraction('delete_user');
    
    try {
      await adminService.deleteUser(selectedUser.id);
      
      // Remove user from the list
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      // Update total count
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
      
      toast.success(t('admin.userDeleted'));
      setShowDeleteModal(false);
      performanceMonitor.endInteraction(perfKey, true);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('admin.userDeleteError'));
      performanceMonitor.endInteraction(perfKey, false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.userManagement')}</h1>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder={t('common.searchUsers')}
                className="form-input pl-10 w-full"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="form-input pr-8 appearance-none"
              >
                <option value="">{t('admin.allRoles')}</option>
                <option value="admin">{t('admin.adminRole')}</option>
                <option value="user">{t('admin.userRole')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <FilterIcon className="h-4 w-4" />
              </div>
            </div>
            
            <Button 
              variant="secondary"
              onClick={() => {
                setFilters({
                  search: '',
                  role: '',
                  sortBy: 'created_at',
                  sortOrder: 'desc'
                });
              }}
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* User list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <UserList
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteClick}
          onSort={handleSortChange}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Edit User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={t('admin.editUser')}
      >
        <form onSubmit={handleSaveUser} className="p-6">
          <div className="mb-4">
            <label htmlFor="name" className="form-label">
              {t('profile.nameLabel')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={userForm.name}
              onChange={handleUserFormChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              {t('profile.emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={userForm.email}
              onChange={handleUserFormChange}
              required
              className="form-input"
              disabled // Email changes should be handled separately for security
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('admin.emailChangeNotice')}
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="form-label">
              {t('admin.roleLabel')}
            </label>
            <select
              id="role"
              name="role"
              value={userForm.role}
              onChange={handleUserFormChange}
              className="form-input"
            >
              <option value="user">{t('admin.userRole')}</option>
              <option value="admin">{t('admin.adminRole')}</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowUserModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('admin.deleteUser')}
      >
        <div className="p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {t('admin.deleteUserConfirm', { name: selectedUser?.name })}
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteUser}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement; 