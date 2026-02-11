const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/roleAuth');
const { 
    getDashboard, 
    manageAbout, 
    updateAbout,
    uploadAvatar,
    manageHomeSettings,
    updateHomeSettings,
    manageFooterSettings,
    updateFooterSettings,
    manageSeoSettings,
    updateSeoSettings,
    manageNavigationSettings,
    updateNavigationSettings,
    manageContactSettings,
    updateContactSettings,
    manageBackups,
    exportBackup,
    exportBackupPackage,
    importBackup,
    importBackupPackage,
    uploadBackup,
    uploadBackupZip,
    manageProjects, 
    addProject, 
    createProject,
    editProject,
    updateProject,
    deleteProject,
    manageCertificates,
    uploadCertificate,
    addCertificate,
    deleteCertificate,
    managePosts,
    addPost,
    createPost,
    editPost,
    updatePost,
    deletePost,
    uploadPostImage,
    uploadEditorImage,
    uploadEditorImageHandler,
    getMessages,
    getAuditLogs,
    manageUsers,
    createUser,
    updateUserRole,
    resetUserPassword,
    deleteUser,
    manageTasks,
    addTask,
    createTask,
    editTask,
    updateTask,
    toggleTask,
    deleteTask,
    manageMedia,
    uploadMedia,
    addMedia,
    deleteMedia
} = require('../controllers/adminController');

// Dashboard
router.get('/', getDashboard);

// About management
router.get('/about', manageAbout);
router.put('/about', uploadAvatar, updateAbout);
router.get('/home', requireAdmin, manageHomeSettings);
router.put('/home', requireAdmin, updateHomeSettings);
router.get('/footer', requireAdmin, manageFooterSettings);
router.put('/footer', requireAdmin, updateFooterSettings);
router.get('/seo', requireAdmin, manageSeoSettings);
router.put('/seo', requireAdmin, updateSeoSettings);
router.get('/navigation', requireAdmin, manageNavigationSettings);
router.put('/navigation', requireAdmin, updateNavigationSettings);
router.get('/contact-page', requireAdmin, manageContactSettings);
router.put('/contact-page', requireAdmin, updateContactSettings);
router.get('/backups', requireAdmin, manageBackups);
router.get('/backups/export', requireAdmin, exportBackup);
router.get('/backups/export-package', requireAdmin, exportBackupPackage);
router.post('/backups/import', requireAdmin, uploadBackup, importBackup);
router.post('/backups/import-package', requireAdmin, uploadBackupZip, importBackupPackage);

// Project management
router.get('/projects', manageProjects);
router.get('/projects/new', addProject);
router.post('/projects', createProject);
router.get('/projects/:id/edit', editProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', requireAdmin, deleteProject);

// Certificate management
router.get('/certificates', manageCertificates);
router.post('/certificates', uploadCertificate, addCertificate);
router.delete('/certificates/:id', requireAdmin, deleteCertificate);

// Post management
router.get('/posts', managePosts);
router.get('/posts/new', addPost);
router.post('/posts', uploadPostImage, createPost);
router.get('/posts/:id/edit', editPost);
router.put('/posts/:id', uploadPostImage, updatePost);
router.delete('/posts/:id', requireAdmin, deletePost);
router.post('/posts/upload-image', uploadEditorImage, uploadEditorImageHandler);

// Media library
router.get('/media', manageMedia);
router.post('/media', uploadMedia, addMedia);
router.delete('/media/:id', requireAdmin, deleteMedia);

// Messages
router.get('/messages', requireAdmin, getMessages);
router.get('/audit', requireAdmin, getAuditLogs);
router.get('/users', requireAdmin, manageUsers);
router.post('/users', requireAdmin, createUser);
router.put('/users/:id/role', requireAdmin, updateUserRole);
router.put('/users/:id/password', requireAdmin, resetUserPassword);
router.delete('/users/:id', requireAdmin, deleteUser);

// Tasks
router.get('/tasks', manageTasks);
router.get('/tasks/new', addTask);
router.post('/tasks', createTask);
router.get('/tasks/:id/edit', editTask);
router.put('/tasks/:id', updateTask);
router.patch('/tasks/:id/toggle', toggleTask);
router.delete('/tasks/:id', requireAdmin, deleteTask);

module.exports = router;


