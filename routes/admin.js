const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    manageAbout, 
    updateAbout,
    uploadAvatar,
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

// Project management
router.get('/projects', manageProjects);
router.get('/projects/new', addProject);
router.post('/projects', createProject);
router.get('/projects/:id/edit', editProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Certificate management
router.get('/certificates', manageCertificates);
router.post('/certificates', uploadCertificate, addCertificate);
router.delete('/certificates/:id', deleteCertificate);

// Post management
router.get('/posts', managePosts);
router.get('/posts/new', addPost);
router.post('/posts', uploadPostImage, createPost);
router.get('/posts/:id/edit', editPost);
router.put('/posts/:id', uploadPostImage, updatePost);
router.delete('/posts/:id', deletePost);
router.post('/posts/upload-image', uploadEditorImage, uploadEditorImageHandler);

// Media library
router.get('/media', manageMedia);
router.post('/media', uploadMedia, addMedia);
router.delete('/media/:id', deleteMedia);

// Messages
router.get('/messages', getMessages);

// Tasks
router.get('/tasks', manageTasks);
router.get('/tasks/new', addTask);
router.post('/tasks', createTask);
router.get('/tasks/:id/edit', editTask);
router.put('/tasks/:id', updateTask);
router.patch('/tasks/:id/toggle', toggleTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;


